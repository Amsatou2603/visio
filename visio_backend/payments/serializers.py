from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.ReadOnlyField(source='get_method_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')

    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'method', 'method_display',
            'status', 'status_display', 'amount', 'currency',
            'transaction_id', 'phone_number',
            'initiated_at', 'completed_at'
        ]
        read_only_fields = ['status', 'transaction_id', 'initiated_at', 'completed_at']


class InitiatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=['wave', 'orange_money', 'free_money', 'card', 'cash'])
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)