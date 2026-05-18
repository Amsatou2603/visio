from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, SellerProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2', 'phone', 'country', 'city']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class RegisterSellerSerializer(serializers.Serializer):
    # Infos compte
    email = serializers.EmailField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, default='Sénégal')
    city = serializers.CharField(required=False, allow_blank=True)
    # Infos boutique
    shop_name = serializers.CharField()
    shop_description = serializers.CharField(required=False, allow_blank=True)
    category_focus = serializers.CharField(required=False, allow_blank=True)
    whatsapp = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Cet email est déjà utilisé.')
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Ce nom d\'utilisateur est déjà pris.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def create(self, validated_data):
        shop_fields = ['shop_name', 'shop_description', 'category_focus', 'whatsapp']
        shop_data = {k: validated_data.pop(k, '') for k in shop_fields}
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(**validated_data, role='seller')
        user.set_password(password)
        user.save()

        SellerProfile.objects.create(user=user, **shop_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    has_seller_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone', 'avatar', 'role', 'country',
            'city', 'address', 'is_verified', 'has_seller_profile', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'created_at']

    def get_has_seller_profile(self, obj):
        return hasattr(obj, 'seller_profile')


class SellerProfileSerializer(serializers.ModelSerializer):
    seller_name = serializers.ReadOnlyField(source='user.full_name')
    seller_email = serializers.ReadOnlyField(source='user.email')
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = SellerProfile
        fields = [
            'id', 'seller_name', 'seller_email',
            'shop_name', 'shop_slug', 'shop_description',
            'shop_logo', 'shop_banner', 'category_focus',
            'whatsapp', 'website', 'status',
            'total_sales', 'total_revenue', 'rating',
            'is_featured', 'products_count', 'created_at'
        ]
        read_only_fields = ['shop_slug', 'total_sales', 'total_revenue', 'rating', 'status']

    def get_products_count(self, obj):
        return obj.user.products.filter(is_active=True).count()


class SellerStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    active_products = serializers.IntegerField()
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=0)
    monthly_revenue = serializers.DecimalField(max_digits=14, decimal_places=0)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': 'Les mots de passe ne correspondent pas.'})
        return attrs