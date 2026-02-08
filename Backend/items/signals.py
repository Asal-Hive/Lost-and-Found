from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Comment, Notification, Item

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    """
    Create notifications when someone comments on an item or replies to a comment
    """
    if created:
        # Don't notify if user comments on their own item
        if instance.author != instance.item.owner:
            Notification.objects.create(
                recipient=instance.item.owner,
                sender=instance.author,
                item=instance.item,
                comment=instance,
                notification_type=Notification.Type.COMMENT,
                message=f"{instance.author.username or instance.author.email} روی آیتم «{instance.item.title}» شما کامنت گذاشت."
            )
        
        # Notify parent comment author if this is a reply
        if instance.parent and instance.author != instance.parent.author:
            Notification.objects.create(
                recipient=instance.parent.author,
                sender=instance.author,
                item=instance.item,
                comment=instance,
                notification_type=Notification.Type.REPLY,
                message=f"{instance.author.username or instance.author.email} به کامنت شما پاسخ داد."
            )

@receiver(post_save, sender=Item)
def create_item_match_notifications(sender, instance, created, **kwargs):
    """
    Create notifications for similar items (simplified version)
    In a real app, you'd compare with existing items
    """
    if created:
        # This is a simplified example - you'd add logic to find similar items
        pass