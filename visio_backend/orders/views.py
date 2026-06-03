# pyrefly: ignore [missing-import]
from rest_framework import generics, permissions, status
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from products.models import Product
from users.permissions import IsOwnerOrAdmin


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(buyer=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        subtotal = 0
        order_items_data = []

        for item_data in data['items']:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
            except Product.DoesNotExist:
                return Response(
                    {'error': f"Produit {item_data['product_id']} introuvable."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if product.stock < item_data['quantity']:
                return Response(
                    {'error': f"Stock insuffisant pour {product.name}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            line_total = product.price * item_data['quantity']
            subtotal += line_total
            primary_image = product.images.filter(is_primary=True).first() or product.images.first()
            image_url = ''
            if primary_image:
                image_url = request.build_absolute_uri(primary_image.image.url)
            order_items_data.append({
                'product': product,
                'product_name': product.name,
                'product_image': image_url,
                'quantity': item_data['quantity'],
                'unit_price': product.price,
                'total_price': line_total,
            })

        shipping_cost = 2000
        total = subtotal + shipping_cost

        order = Order.objects.create(
            buyer=request.user,
            shipping_name=data['shipping_name'],
            shipping_phone=data['shipping_phone'],
            shipping_address=data['shipping_address'],
            shipping_city=data['shipping_city'],
            shipping_country=data.get('shipping_country', 'Sénégal'),
            notes=data.get('notes', ''),
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            currency='XOF',
        )

        for item_data in order_items_data:
            product = item_data.pop('product')
            OrderItem.objects.create(order=order, product=product, **item_data)
            product.stock -= item_data['quantity']
            product.save(update_fields=['stock'])

        return Response(
            OrderSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(buyer=self.request.user)