# pyrefly: ignore [missing-import]
from django.contrib import admin
from .models import ChatLog


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'message_snippet', 'reply_snippet', 'ip_address', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('message', 'reply', 'ip_address')
    readonly_fields = ('user', 'message', 'reply', 'ip_address', 'created_at')

    def message_snippet(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_snippet.short_description = 'Message utilisateur'

    def reply_snippet(self, obj):
        return obj.reply[:50] + '...' if len(obj.reply) > 50 else obj.reply
    reply_snippet.short_description = 'Réponse VisioBot'
