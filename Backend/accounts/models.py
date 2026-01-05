from django.conf import settings
from django.db import models
from django.utils import timezone


class OTPCode(models.Model):
    PURPOSE_CHOICES = [
        ('activation', 'Activation'),
        ('login', 'Login'),
        ('reset', 'Reset'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='activation')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return (not self.is_used) and (self.expires_at >= timezone.now())

    def __str__(self):
        return f"OTP({self.user.email}, {self.code}, {self.purpose})"
