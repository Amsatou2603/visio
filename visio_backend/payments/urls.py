from django.urls import path
from .views import InitiatePaymentView, PaymentDetailView, PaytechIPNView

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment_initiate'),
    path('order/<int:order_id>/', PaymentDetailView.as_view(), name='payment_detail'),
    path('webhook/', PaytechIPNView.as_view(), name='payment_webhook'),
]