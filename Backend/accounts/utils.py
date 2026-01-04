import random
from datetime import timedelta
from django.core.mail import send_mail


def generate_numeric_otp(length: int = 6) -> str:
    return ''.join(str(random.randint(0, 9)) for _ in range(length))


def send_otp_email(to_email: str, code: str, purpose: str = 'activation') -> None:
    subject = 'کد تایید شما'
    message = f'کد تایید برای {purpose} شما: {code}'
    # Print the OTP to terminal for development convenience
    try:
        print(f"[OTP] {purpose} for {to_email}: {code}")
    except Exception:
        pass
    try:
        import sys
        sys.stdout.flush()
    except Exception:
        pass
    send_mail(subject, message, None, [to_email])


def default_expiry_minutes() -> int:
    return 10
