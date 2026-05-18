from django.urls import path
from .views import ReviewListCreateView, ReviewDeleteView

urlpatterns = [
    path('product/<int:product_id>/', ReviewListCreateView.as_view(), name='review_list_create'),
    path('<int:pk>/delete/', ReviewDeleteView.as_view(), name='review_delete'),
]