from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, SellerProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'role', 'country', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active', 'country']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profil Visio', {
            'fields': ('phone', 'avatar', 'role', 'country', 'city', 'address', 'is_verified')
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ['shop_name', 'user', 'status', 'category_focus', 'total_sales', 'is_featured', 'created_at']
    list_filter = ['status', 'is_featured']
    search_fields = ['shop_name', 'user__email', 'category_focus']
    list_editable = ['status', 'is_featured']
    readonly_fields = ['shop_slug', 'total_sales', 'total_revenue', 'rating', 'created_at']
    actions = ['approve_sellers', 'suspend_sellers']

    def approve_sellers(self, request, queryset):
        queryset.update(status='approved')
        for profile in queryset:
            profile.user.is_verified = True
            profile.user.save(update_fields=['is_verified'])
        self.message_user(request, f'{queryset.count()} vendeur(s) approuvé(s).')
    approve_sellers.short_description = 'Approuver les vendeurs sélectionnés'

    def suspend_sellers(self, request, queryset):
        queryset.update(status='suspended')
        self.message_user(request, f'{queryset.count()} vendeur(s) suspendu(s).')
    suspend_sellers.short_description = 'Suspendre les vendeurs sélectionnés'