# pyrefly: ignore [missing-import]
from django.db.models.signals import post_save
# pyrefly: ignore [missing-import]
from django.dispatch import receiver
from orders.models import Order, OrderItem
from payments.models import Payment
from reviews.models import Review
from .models import Notification


@receiver(post_save, sender=Order)
def order_notifications(sender, instance, created, **kwargs):
    if created:
        # 1. Notify buyer
        Notification.objects.create(
            user=instance.buyer,
            title="Commande enregistrée",
            message=f"Votre commande {instance.reference} a été enregistrée avec succès. Total: {instance.total} {instance.currency}. En attente de paiement.",
            type="order"
        )
    else:
        # Order status updated
        # 1. Notify buyer
        Notification.objects.create(
            user=instance.buyer,
            title=f"Statut de commande : {instance.get_status_display()}",
            message=f"Le statut de votre commande {instance.reference} a changé pour : {instance.get_status_display()}.",
            type="order"
        )
        
        # If order is confirmed, also notify sellers to prepare the products
        if instance.status == 'confirmed':
            for item in instance.items.all():
                if item.product and item.product.seller:
                    Notification.objects.create(
                        user=item.product.seller,
                        title="Paiement validé — Préparez la commande",
                        message=f"Le paiement pour la commande {instance.reference} contenant votre produit '{item.product_name}' a été validé. Vous pouvez procéder à sa préparation.",
                        type="payment"
                    )


@receiver(post_save, sender=OrderItem)
def order_item_notifications(sender, instance, created, **kwargs):
    if created:
        # Notify the seller of the product
        product = instance.product
        if product and product.seller:
            Notification.objects.create(
                user=product.seller,
                title="Nouvelle commande reçue",
                message=f"Votre produit '{product.name}' a été commandé par {instance.order.buyer.full_name} (Quantité: {instance.quantity}). Commande {instance.order.reference} en attente de paiement.",
                type="order"
            )


@receiver(post_save, sender=Payment)
def payment_notifications(sender, instance, created, **kwargs):
    if created:
        if instance.status == 'completed':
            Notification.objects.create(
                user=instance.user,
                title="Paiement complété",
                message=f"Votre paiement de {instance.amount} {instance.currency} pour la commande {instance.order.reference} a été traité avec succès.",
                type="payment"
            )
    else:
        # Payment updated
        if instance.status == 'completed':
            # Check if this notification was already created to avoid duplication
            # (though normally in our webhook we'll just check/create if status is completed)
            Notification.objects.get_or_create(
                user=instance.user,
                title="Paiement complété",
                message=f"Votre paiement de {instance.amount} {instance.currency} pour la commande {instance.order.reference} a été validé avec succès.",
                type="payment"
            )


@receiver(post_save, sender=Review)
def review_notifications(sender, instance, created, **kwargs):
    if created:
        product = instance.product
        if product and product.seller:
            Notification.objects.create(
                user=product.seller,
                title="Nouvel avis client",
                message=f"Un client a laissé un avis ({instance.rating}/5) sur votre produit '{product.name}'.",
                type="product"
            )
