import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')
    brand = django_filters.CharFilter(field_name='brand__slug', lookup_expr='exact')
    condition = django_filters.CharFilter(field_name='condition', lookup_expr='exact')
    in_stock = django_filters.BooleanFilter(field_name='stock', method='filter_in_stock')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    seller_slug = django_filters.CharFilter(field_name='seller__seller_profile__shop_slug', lookup_expr='exact')

    class Meta:
        model = Product
        fields = ['min_price', 'max_price', 'category', 'brand', 'condition', 'in_stock', 'is_featured', 'seller_slug']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)