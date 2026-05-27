# pyrefly: ignore [missing-import]
from django.db import models
from users.models import User


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('order', 'Commande'),
        ('payment', 'Paiement'),
        ('product', 'Produit'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f'{self.title} — {self.user.email} — {"Lu" if self.is_read else "Non lu"}'
