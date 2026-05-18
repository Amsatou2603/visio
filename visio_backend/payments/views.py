import uuid
from django.utils import timezone
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

        # Simulation paiement (webhook-ready)
        transaction_id = f'VIS-PAY-{uuid.uuid4().hex[:10].upper()}'
        payment.transaction_id = transaction_id
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