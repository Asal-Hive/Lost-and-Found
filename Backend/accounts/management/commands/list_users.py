from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import OTPCode

class Command(BaseCommand):
    help = 'List all user accounts with basic info'

    def add_arguments(self, parser):
        parser.add_argument('--active-only', action='store_true', help='Show only active users')

    def handle(self, *args, **options):
        User = get_user_model()
        qs = User.objects.all()
        if options.get('active_only'):
            qs = qs.filter(is_active=True)
        if not qs.exists():
            self.stdout.write('No users found')
            return
        for u in qs.order_by('id'):
            otps = OTPCode.objects.filter(user=u).order_by('-created_at')[:3]
            otp_str = ', '.join([f"{o.code}(used={o.is_used})" for o in otps]) if otps else '—'
            self.stdout.write(f"id={u.id} email={u.email!s} username={u.username!s} active={u.is_active} has_pw={u.has_usable_password()} otp_recent=[{otp_str}]")
