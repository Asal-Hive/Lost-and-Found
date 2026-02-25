from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from accounts.models import OTPCode

User = get_user_model()


class OTPCodeModelTest(TestCase):
    """Test cases for OTPCode model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        self.expires_at = timezone.now() + timedelta(minutes=5)
        self.otp = OTPCode.objects.create(
            user=self.user,
            code='123456',
            purpose='activation',
            expires_at=self.expires_at
        )
    
    def test_otp_creation(self):
        """Test OTP code is created with correct attributes"""
        self.assertEqual(self.otp.user, self.user)
        self.assertEqual(self.otp.code, '123456')
        self.assertEqual(self.otp.purpose, 'activation')
        self.assertFalse(self.otp.is_used)
        self.assertIsNotNone(self.otp.created_at)
        self.assertEqual(self.otp.expires_at, self.expires_at)
    
    def test_is_valid_unused_not_expired(self):
        """Test is_valid returns True for unused, non-expired OTP"""
        self.assertTrue(self.otp.is_valid())
    
    def test_is_valid_used(self):
        """Test is_valid returns False for used OTP"""
        self.otp.is_used = True
        self.otp.save()
        self.assertFalse(self.otp.is_valid())
    
    def test_is_valid_expired(self):
        """Test is_valid returns False for expired OTP"""
        self.otp.expires_at = timezone.now() - timedelta(minutes=1)
        self.otp.save()
        self.assertFalse(self.otp.is_valid())
    
    def test_string_representation(self):
        """Test the string representation of OTP code"""
        expected = f"OTP({self.user.email}, 123456, activation)"
        self.assertEqual(str(self.otp), expected)
    
    def test_otp_purpose_choices(self):
        """Test OTP purpose choices are correct"""
        choices = dict(OTPCode.PURPOSE_CHOICES)
        self.assertEqual(choices['activation'], 'Activation')
        self.assertEqual(choices['login'], 'Login')
        self.assertEqual(choices['reset'], 'Reset')
    
    def test_otp_default_purpose(self):
        """Test default purpose is activation"""
        otp = OTPCode.objects.create(
            user=self.user,
            code='789012',
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        self.assertEqual(otp.purpose, 'activation')
