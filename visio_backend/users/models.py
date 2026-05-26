from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('buyer', 'Acheteur'),
        ('seller', 'Vendeur'),
        ('admin', 'Administrateur'),
    ]

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    country = models.CharField(max_length=100, blank=True, default='Sénégal')
    city = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email})'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip() or self.username


class SellerProfile(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('suspended', 'Suspendu'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    shop_name = models.CharField(max_length=200)
    shop_slug = models.SlugField(unique=True, blank=True)
    shop_description = models.TextField(blank=True)
    shop_logo = models.ImageField(upload_to='shops/', blank=True, null=True)
    shop_banner = models.ImageField(upload_to='shop_banners/', blank=True, null=True)
    category_focus = models.CharField(max_length=200, blank=True, help_text='Type de produits vendus')
    whatsapp = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    total_sales = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=14, decimal_places=0, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Profil Vendeur'
        verbose_name_plural = 'Profils Vendeurs'
        ordering = ['-is_featured', '-total_sales']

    def save(self, *args, **kwargs):
        if not self.shop_slug:
            from django.utils.text import slugify
            base = slugify(self.shop_name)
            slug = base
            counter = 1
            while SellerProfile.objects.filter(shop_slug=slug).exists():
                slug = f'{base}-{counter}'
                counter += 1
            self.shop_slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.shop_name} ({self.user.email})'

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} → {self.product.name}'