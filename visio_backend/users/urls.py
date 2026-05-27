from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, RegisterSellerView, ProfileView,
    SellerProfileView, SellerListView, SellerDetailView,
    SellerStatsView, ChangePasswordView, LogoutView, WishlistView, SellerAnalyticsView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register-seller/', RegisterSellerView.as_view(), name='register_seller'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('seller/profile/', SellerProfileView.as_view(), name='seller_profile'),
    path('seller/stats/', SellerStatsView.as_view(), name='seller_stats'),
    path('seller/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('sellers/', SellerListView.as_view(), name='seller_list'),
    path('sellers/<slug:shop_slug>/', SellerDetailView.as_view(), name='seller_detail'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('seller/analytics/', SellerAnalyticsView.as_view(), name='seller_analytics'),
]