from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'user', 'method', 'status', 'amount', 'currency', 'initiated_at']
    list_filter = ['method', 'status', 'currency']
    search_fields = ['order__reference', 'user__email', 'transaction_id']
    readonly_fields = ['initiated_at', 'completed_at', 'provider_response']