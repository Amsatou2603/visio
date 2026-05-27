from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import User, SellerProfile, Wishlist
from .serializers import (
    RegisterSerializer, RegisterSellerSerializer,
    UserSerializer, SellerProfileSerializer,
    SellerStatsSerializer, ChangePasswordSerializer
)
from products.models import Product
from products.serializers import ProductListSerializer
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


class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist = Wishlist.objects.filter(user=request.user).select_related('product')
        products = [w.product for w in wishlist]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user, product=product
        )
        if not created:
            wishlist_item.delete()
            return Response({'status': 'removed', 'message': 'Retiré de la wishlist.'})
        return Response({'status': 'added', 'message': 'Ajouté à la wishlist.'})

class SellerAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ['seller', 'admin'] and not user.is_staff:
            return Response({'error': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

        from django.utils import timezone
        from datetime import timedelta
        from orders.models import Order, OrderItem

        now = timezone.now()

        # Revenus des 6 derniers mois
        monthly_data = []
        for i in range(5, -1, -1):
            month_start = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            revenue = sum(
                item.total_price
                for order in Order.objects.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end,
                    status__in=['confirmed', 'delivered']
                )
                for item in order.items.filter(product__seller=user)
            )
            orders_count = Order.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end,
                items__product__seller=user
            ).distinct().count()
            monthly_data.append({
                'month': month_start.strftime('%b %Y'),
                'revenue': float(revenue),
                'orders': orders_count,
            })

        # Top produits par vues
        top_products = list(
            Product.objects.filter(seller=user, is_active=True)
            .order_by('-views_count')[:5]
            .values('name', 'views_count', 'average_rating', 'stock', 'price')
        )
        for p in top_products:
            p['price'] = float(p['price'])
            p['average_rating'] = float(p['average_rating'])
            p['name'] = p['name'][:25] + ('...' if len(p['name']) > 25 else '')

        # Répartition par statut de commandes
        all_orders = Order.objects.filter(items__product__seller=user).distinct()
        status_data = []
        status_labels = {
            'pending': 'En attente',
            'confirmed': 'Confirmées',
            'processing': 'En traitement',
            'shipped': 'Expédiées',
            'delivered': 'Livrées',
            'cancelled': 'Annulées',
        }
        for status_key, label in status_labels.items():
            count = all_orders.filter(status=status_key).count()
            if count > 0:
                status_data.append({'name': label, 'value': count, 'status': status_key})

        # KPIs
        total_revenue = sum(
            item.total_price
            for order in all_orders.filter(status__in=['confirmed', 'delivered'])
            for item in order.items.filter(product__seller=user)
        )
        this_month_revenue = sum(
            item.total_price
            for order in all_orders.filter(
                created_at__month=now.month,
                created_at__year=now.year,
                status__in=['confirmed', 'delivered']
            )
            for item in order.items.filter(product__seller=user)
        )
        last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
        last_month_revenue = sum(
            item.total_price
            for order in all_orders.filter(
                created_at__month=last_month_start.month,
                created_at__year=last_month_start.year,
                status__in=['confirmed', 'delivered']
            )
            for item in order.items.filter(product__seller=user)
        )
        growth = 0
        if last_month_revenue > 0:
            growth = round(((float(this_month_revenue) - float(last_month_revenue)) / float(last_month_revenue)) * 100, 1)

        return Response({
            'monthly_data': monthly_data,
            'top_products': top_products,
            'status_data': status_data,
            'kpis': {
                'total_revenue': float(total_revenue),
                'this_month_revenue': float(this_month_revenue),
                'last_month_revenue': float(last_month_revenue),
                'growth_percent': growth,
                'total_orders': all_orders.count(),
                'pending_orders': all_orders.filter(status='pending').count(),
                'total_products': Product.objects.filter(seller=user).count(),
                'active_products': Product.objects.filter(seller=user, is_active=True).count(),
            }
        })