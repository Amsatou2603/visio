from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['reference', 'buyer', 'status', 'total', 'currency', 'created_at']
    list_filter = ['status', 'currency', 'shipping_country']
    search_fields = ['reference', 'buyer__email', 'shipping_name']
    readonly_fields = ['reference', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    list_editable = ['status']