"""
Email message templates for the accounts app.
"""

# Email verification messages
EMAIL_VERIFICATION_SUBJECT = 'کد تایید ایمیل'
EMAIL_VERIFICATION_BODY = """سلام،

کد تایید ایمیل شما: {code}

این کد تا ۱۰ دقیقه معتبر است.

اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.

با تشکر"""

# Password reset messages
PASSWORD_RESET_SUBJECT = 'کد بازیابی رمز عبور'
PASSWORD_RESET_BODY = """سلام،

کد بازیابی رمز عبور شما: {code}

این کد تا ۱۰ دقیقه معتبر است.

اگر شما درخواست بازیابی رمز نداده‌اید، این ایمیل را نادیده بگیرید و رمز عبورتان تغییری نخواهد کرد.

با تشکر"""

# Default/fallback messages
DEFAULT_OTP_SUBJECT = 'کد تایید'
DEFAULT_OTP_BODY = 'کد تایید شما: {code}'
