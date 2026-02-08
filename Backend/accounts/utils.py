import random
from django.core.mail import send_mail
from django.conf import settings
from .messages import (
    EMAIL_VERIFICATION_SUBJECT,
    EMAIL_VERIFICATION_BODY,
    PASSWORD_RESET_SUBJECT,
    PASSWORD_RESET_BODY,
    DEFAULT_OTP_SUBJECT,
    DEFAULT_OTP_BODY,
)


def generate_numeric_otp(length: int = 6) -> str:
    """Generate a random numeric OTP code."""
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def send_otp_email(to_email: str, code: str, purpose: str = 'activation') -> None:
    """
    Send OTP code via email.
    
    Args:
        to_email: Recipient email address
        code: The OTP code to send
        purpose: Either 'activation' for email verification or 'reset' for password reset
    """
    # Get subject and message based on purpose
    if purpose == 'activation':
        subject = EMAIL_VERIFICATION_SUBJECT
        message = EMAIL_VERIFICATION_BODY.format(code=code)
    elif purpose == 'reset':
        subject = PASSWORD_RESET_SUBJECT
        message = PASSWORD_RESET_BODY.format(code=code)
    else:
        subject = DEFAULT_OTP_SUBJECT
        message = DEFAULT_OTP_BODY.format(code=code)
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[to_email],
        fail_silently=False,
    )


def default_expiry_minutes() -> int:
    """Return the default OTP expiry time in minutes."""
    return 10
