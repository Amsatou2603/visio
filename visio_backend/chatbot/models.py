# pyrefly: ignore [missing-import]
from django.db import models
# pyrefly: ignore [missing-import]
from django.conf import settings


class ChatLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_logs'
    )
    message = models.TextField()
    reply = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Log de Chat'
        verbose_name_plural = 'Logs de Chat'
        ordering = ['-created_at']

    def __str__(self):
        user_str = self.user.email if self.user else "Anonyme"
        return f'Chat par {user_str} le {self.created_at.strftime("%d/%m/%Y %H:%M")}'
