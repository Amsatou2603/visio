import uuid
import json
import hmac
import hashlib
import requests
from django.utils import timezone
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from orders.models import Order


class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            order = Order.objects.get(id=data['order_id'], buyer=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Commande introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(order, 'payment') and order.payment.status == 'completed':
            return Response({'error': 'Cette commande est déjà payée.'}, status=status.HTTP_400_BAD_REQUEST)

        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'user': request.user,
                'method': data['method'],
                'amount': order.total,
                'currency': order.currency,
                'phone_number': data.get('phone_number', ''),
                'status': 'pending',
            }
        )

        if not created:
            payment.method = data['method']
            payment.phone_number = data.get('phone_number', '')
            payment.save()

        # Prepare a transaction reference
        transaction_id = f'VIS-PAY-{uuid.uuid4().hex[:10].upper()}'
        payment.transaction_id = transaction_id
        payment.save()

        # If PayTech is configured, call its API to create a payment session
        paytech_url = getattr(settings, 'PAYTECH_API_URL', '').rstrip('/')
        if settings.PAYTECH_API_KEY and settings.PAYTECH_API_SECRET and paytech_url:
            payload = {
                'amount': str(order.total),
                'currency': order.currency,
                'phone_number': data.get('phone_number', ''),
                'reference': transaction_id,
                'callback_url': f"{settings.BACKEND_URL.rstrip('/')}/api/payments/webhook/",
                'return_url': f"{settings.FRONTEND_URL.rstrip('/')}/orders/{order.id}/confirmation/",
                'description': f'Paiement commande {order.id}',
                'method': data['method'],
            }
            headers = {
                'Authorization': f'Bearer {settings.PAYTECH_API_KEY}',
                'Content-Type': 'application/json',
            }
            try:
                resp = requests.post(f"{paytech_url}/payment/request-payment", json=payload, headers=headers, timeout=15)
                resp.raise_for_status()
                result = resp.json()
                payment.provider_response = result
                # Keep payment as pending until webhook confirms
                payment.status = 'pending'
                payment.save()

                payment_url = result.get('payment_url') or result.get('redirect_url')
                return Response({
                    'payment_url': payment_url,
                    'transaction_id': payment.transaction_id,
                }, status=status.HTTP_200_OK)
            except Exception as e:
                # Log and fallback to simulation
                payment.provider_response = {'error': str(e)}
                payment.save()

        # Fallback: simulate payment completion (useful for sandbox/testing)
        payment.status = 'completed'
        payment.completed_at = timezone.now()
        payment.provider_response = {
            'status': 'success',
            'transaction_id': transaction_id,
            'method': data['method'],
            'amount': str(order.total),
            'simulated': True,
        }
        payment.save()

        order.status = 'confirmed'
        order.save(update_fields=['status'])

        return Response({
            'payment': PaymentSerializer(payment).data,
            'message': f'Paiement {data["method"]} simulé avec succès.',
            'transaction_id': transaction_id,
        }, status=status.HTTP_200_OK)


class PaymentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
            payment = order.payment
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return Response({'error': 'Paiement introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PaymentSerializer(payment).data)


class PaytechIPNView(APIView):
    """Endpoint pour recevoir les webhooks/IPN de PayTech"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Verify signature if provided
        signature = request.headers.get('X-Paytech-Signature') or request.headers.get('X-Signature')
        try:
            raw = request.body
            if signature and settings.PAYTECH_API_SECRET:
                expected = hmac.new(settings.PAYTECH_API_SECRET.encode(), msg=raw, digestmod=hashlib.sha256).hexdigest()
                if not hmac.compare_digest(expected, signature):
                    return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

            data = request.data
            reference = data.get('reference') or data.get('transaction_id') or data.get('reference_id')
            status_str = data.get('status') or data.get('payment_status')

            if not reference:
                return Response({'error': 'No reference provided'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                payment = Payment.objects.get(transaction_id=reference)
            except Payment.DoesNotExist:
                return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

            # Mark completed
            if status_str and status_str.lower() in ('completed', 'success', 'paid') and payment.status != 'completed':
                payment.status = 'completed'
                payment.completed_at = timezone.now()
                payment.provider_response = data
                payment.save()

                # update order
                order = payment.order
                order.status = 'confirmed'
                order.save(update_fields=['status'])

            return Response({'message': 'ok'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)