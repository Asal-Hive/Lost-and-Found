from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class Item(models.Model):
    """Items that can be lost or found"""
    
    class Status(models.TextChoices):
        LOST = 'lost', 'Lost'
        FOUND = 'found', 'Found'
    
    class Category(models.TextChoices):
        BAG = 'bag', 'Bag'
        CLOTHES = 'clothes', 'Clothes'
        ELECTRONICS = 'electronics', 'Electronics'
        BANK_CARD = 'bank_card', 'Bank Card'
        STUDENT_ID = 'student_id', 'Student ID'
        KEYS = 'keys', 'Keys'
        BOOK = 'book', 'Book'
        WALLET = 'wallet', 'Wallet'
        PHONE = 'phone', 'Phone'
        ACCESSORIES = 'accessories', 'Accessories'
        OTHER = 'other', 'Other'
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='items/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=Status.choices)
    categories = models.JSONField(default=list)
    
    # Location (latitude, longitude)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_name = models.CharField(max_length=200, blank=True)
    
    # Relations
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Moderation
    report_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = 'Item'
        verbose_name_plural = 'Items'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
    def clean(self):
        if not self.categories or len(self.categories) == 0:
            raise ValidationError('At least one category must be selected.')
        valid_categories = [choice[0] for choice in self.Category.choices]
        for cat in self.categories:
            if cat not in valid_categories:
                raise ValidationError(f'Invalid category: {cat}')


class ItemReport(models.Model):
    """Reports for inappropriate items"""
    
    class Reason(models.TextChoices):
        INAPPROPRIATE = 'inappropriate', 'Inappropriate Content'
        SPAM = 'spam', 'Spam'
        DUPLICATE = 'duplicate', 'Duplicate'
        FAKE = 'fake', 'Fake'
        OTHER = 'other', 'Other'
    
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='item_reports')
    reason = models.CharField(max_length=20, choices=Reason.choices)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Item Report'
        verbose_name_plural = 'Item Reports'
        unique_together = ['item', 'reporter']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report for {self.item.title} by {self.reporter.email}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.item.report_count = self.item.reports.count()
        if self.item.report_count >= 5:
            self.item.is_active = False
        self.item.save()


