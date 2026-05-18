from rest_framework import serializers
from .models import Review
from users.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'user_name', 'user_avatar',
            'rating', 'title', 'comment',
            'is_verified_purchase', 'is_approved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_verified_purchase', 'is_approved', 'created_at', 'updated_at']

    def get_user_avatar(self, obj):
        if obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
        return None

    def validate_product(self, product):
        request = self.context.get('request')
        if Review.objects.filter(product=product, user=request.user).exists():
            raise serializers.ValidationError('Vous avez déjà laissé un avis sur ce produit.')
        return product