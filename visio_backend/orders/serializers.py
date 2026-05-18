from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['product_name', 'product_image', 'total_price']


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.ReadOnlyField(source='buyer.full_name')
    status_display = serializers.ReadOnlyField(source='get_status_display')

    class Meta:
        model = Order
        fields = [
            'id', 'reference', 'status', 'status_display', 'buyer_name',
            'shipping_name', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_country',
            'subtotal', 'shipping_cost', 'total', 'currency',
            'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['reference', 'subtotal', 'total', 'status']


class OrderCreateSerializer(serializers.Serializer):
    shipping_name = serializers.CharField(max_length=200)
    shipping_phone = serializers.CharField(max_length=20)
    shipping_address = serializers.CharField()
    shipping_city = serializers.CharField(max_length=100)
    shipping_country = serializers.CharField(max_length=100, default='Sénégal')
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('La commande doit contenir au moins un article.')
        return items