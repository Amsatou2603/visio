from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSellerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and (
            request.user.role in ['seller', 'admin'] or request.user.is_staff
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.seller == request.user or request.user.is_staff


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'buyer'):
            return obj.buyer == request.user or request.user.is_staff
        if hasattr(obj, 'seller'):
            return obj.seller == request.user or request.user.is_staff
        return request.user.is_staff