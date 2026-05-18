from django.db import models
from orders.models import Order
from users.models import User


class Payment(models.Model):
    METHOD_CHOICES = [
        ('wave', 'Wave'),
        ('orange_money', 'Orange Money'),
        ('free_money', 'Free Money'),
        ('card', 'Carte bancaire'),
        ('cash', 'Paiement à la livraison'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('completed', 'Complété'),
        ('failed', 'Échoué'),
        ('refunded', 'Remboursé'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    amount = models.DecimalField(max_digits=12, decimal_places=0)
    currency = models.CharField(max_length=5, default='XOF')

    transaction_id = models.CharField(max_length=200, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    provider_reference = models.CharField(max_length=200, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)

    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-initiated_at']

    def __str__(self):
        return f'Paiement {self.method} — {self.order.reference} — {self.status}'