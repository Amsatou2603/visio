from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import User, SellerProfile
from .serializers import (
    RegisterSerializer, RegisterSellerSerializer,
    UserSerializer, SellerProfileSerializer,
    SellerStatsSerializer, ChangePasswordSerializer
)
from products.models import Product
from orders.models import Order, OrderItem


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': {'refresh': str(refresh), 'access': str(refresh.access_token)},
        }, status=status.HTTP_201_CREATED)


class RegisterSellerView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSellerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': {'refresh': str(refresh), 'access': str(refresh.access_token)},
            'message': 'Compte vendeur créé. En attente de validation.'
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class SellerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = SellerProfile.objects.get_or_create(user=self.request.user)
        return profile


class SellerListView(generics.ListAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return SellerProfile.objects.filter(status='approved').select_related('user')


class SellerDetailView(generics.RetrieveAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'shop_slug'
    queryset = SellerProfile.objects.filter(status='approved')


class SellerStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ['seller', 'admin'] and not user.is_staff:
            return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

        products = Product.objects.filter(seller=user)
        orders = Order.objects.filter(items__product__seller=user).distinct()

        now = timezone.now()
        monthly_orders = orders.filter(
            created_at__year=now.year,
            created_at__month=now.month
        )
        monthly_revenue = sum(
            item.total_price
            for order in monthly_orders
            for item in order.items.filter(product__seller=user)
            if order.status in ['confirmed', 'delivered']
        )
        total_revenue = sum(
            item.total_price
            for order in orders
            for item in order.items.filter(product__seller=user)
            if order.status in ['confirmed', 'delivered']
        )

        data = {
            'total_products': products.count(),
            'active_products': products.filter(is_active=True).count(),
            'total_orders': orders.count(),
            'pending_orders': orders.filter(status='pending').count(),
            'total_revenue': total_revenue,
            'monthly_revenue': monthly_revenue,
        }
        return Response(data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Mot de passe incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Mot de passe modifié avec succès.'})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
            return Response({'detail': 'Déconnexion réussie.'})
        except Exception:
            return Response({'detail': 'Token invalide.'}, status=status.HTTP_400_BAD_REQUEST)