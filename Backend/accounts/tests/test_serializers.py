from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError
from accounts.serializers import (
    RegisterSerializer, VerifyOTPSerializer, SetPasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, TokenObtainPairSerializer
)
from accounts.models import OTPCode
from accounts.utils import default_expiry_minutes

User = get_user_model()


class RegisterSerializerTest(TestCase):
    """Test cases for RegisterSerializer"""
    
    def test_valid_registration(self):
        """Test valid registration data"""
        data = {
            'email': 'newuser@example.com',
            'password': 'StrongPass123!'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_invalid_email_duplicate(self):
        """Test duplicate email validation"""
        User.objects.create_user(
            username='existing@example.com',
            email='existing@example.com',
            password='testpass123'
        )
        data = {
            'email': 'existing@example.com',
            'password': 'StrongPass123!'
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_weak_password_validation(self):
        """Test password strength validation"""
        data = {
            'email': 'newuser@example.com',
            'password': 'weak'  # Too short
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_empty_password_allowed(self):
        """Test empty password is allowed (for OTP flow)"""
        data = {
            'email': 'newuser@example.com',
            'password': ''
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_create_user_without_password(self):
        """Test user creation without password (inactive)"""
        data = {
            'email': 'newuser@example.com',
            'password': ''
        }
        serializer = RegisterSerializer(data=data)
        serializer.is_valid()
        user = serializer.save()
        
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertEqual(user.username, 'newuser@example.com')
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())
    
    def test_create_user_with_password(self):
        """Test user creation with password (active)"""
        data = {
            'email': 'newuser@example.com',
            'password': 'StrongPass123!'
        }
        serializer = RegisterSerializer(data=data)
        serializer.is_valid()
        user = serializer.save()
        
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertTrue(user.is_active)
        self.assertTrue(user.check_password('StrongPass123!'))


class VerifyOTPSerializerTest(TestCase):
    """Test cases for VerifyOTPSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            is_active=False
        )
        self.expires_at = timezone.now() + timedelta(minutes=5)
        self.otp = OTPCode.objects.create(
            user=self.user,
            code='123456',
            purpose='activation',
            expires_at=self.expires_at
        )
    
    def test_valid_otp(self):
        """Test valid OTP verification"""
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        serializer = VerifyOTPSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['_user'], self.user)
        self.assertEqual(serializer.validated_data['_otp'], self.otp)
    
    def test_invalid_email(self):
        """Test invalid email"""
        data = {
            'email': 'wrong@example.com',
            'code': '123456'
        }
        serializer = VerifyOTPSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_invalid_code(self):
        """Test invalid code"""
        data = {
            'email': 'test@example.com',
            'code': '999999'
        }
        serializer = VerifyOTPSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_expired_otp(self):
        """Test expired OTP"""
        self.otp.expires_at = timezone.now() - timedelta(minutes=1)
        self.otp.save()
        
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        serializer = VerifyOTPSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_used_otp(self):
        """Test already used OTP"""
        self.otp.is_used = True
        self.otp.save()
        
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        serializer = VerifyOTPSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_password_validation(self):
        """Test password validation in OTP serializer"""
        data = {
            'email': 'test@example.com',
            'code': '123456',
            'password': 'weak'
        }
        serializer = VerifyOTPSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class SetPasswordSerializerTest(TestCase):
    """Test cases for SetPasswordSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            is_active=False
        )
        # Create a used OTP within the valid time window
        self.otp = OTPCode.objects.create(
            user=self.user,
            code='123456',
            purpose='activation',
            expires_at=timezone.now() + timedelta(minutes=5),
            is_used=True,
            created_at=timezone.now() - timedelta(minutes=2)  # Recent
        )
    
    def test_valid_password_set(self):
        """Test valid password set with recent OTP"""
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        serializer = SetPasswordSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['_user'], self.user)
    
    def test_password_mismatch(self):
        """Test password mismatch validation"""
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'DifferentPass123!'
        }
        serializer = SetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)
    
    def test_no_recent_otp(self):
        """Test failure when no recent OTP verification"""
        # Delete the OTP
        self.otp.delete()
        
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        serializer = SetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_otp_too_old(self):
        """Test OTP outside valid time window"""
        self.otp.created_at = timezone.now() - timedelta(minutes=default_expiry_minutes() + 1)
        self.otp.save()
        
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        serializer = SetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_weak_password(self):
        """Test weak password validation"""
        data = {
            'email': 'test@example.com',
            'password': 'weak',
            'password_confirm': 'weak'
        }
        serializer = SetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class ForgotPasswordSerializerTest(TestCase):
    """Test cases for ForgotPasswordSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_valid_email(self):
        """Test valid email for password reset"""
        data = {'email': 'test@example.com'}
        serializer = ForgotPasswordSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['_user'], self.user)
    
    def test_invalid_email(self):
        """Test invalid email"""
        data = {'email': 'nonexistent@example.com'}
        serializer = ForgotPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)


class ResetPasswordSerializerTest(TestCase):
    """Test cases for ResetPasswordSerializer"""
    
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
            purpose='reset',
            expires_at=self.expires_at
        )
    
    def test_valid_otp_only(self):
        """Test OTP validation without password"""
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        serializer = ResetPasswordSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['_user'], self.user)
        self.assertEqual(serializer.validated_data['_otp'], self.otp)
    
    def test_valid_with_password(self):
        """Test OTP validation with new password"""
        data = {
            'email': 'test@example.com',
            'code': '123456',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        serializer = ResetPasswordSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_password_mismatch(self):
        """Test password mismatch in reset"""
        data = {
            'email': 'test@example.com',
            'code': '123456',
            'password': 'NewStrongPass123!',
            'password_confirm': 'DifferentPass123!'
        }
        serializer = ResetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)
    
    def test_invalid_otp(self):
        """Test invalid OTP in reset"""
        data = {
            'email': 'test@example.com',
            'code': '999999'
        }
        serializer = ResetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_expired_otp(self):
        """Test expired OTP in reset"""
        self.otp.expires_at = timezone.now() - timedelta(minutes=1)
        self.otp.save()
        
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        serializer = ResetPasswordSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)


class TokenObtainPairSerializerTest(TestCase):
    """Test cases for TokenObtainPairSerializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
    
    def test_login_with_email(self):
        """Test login with email instead of username"""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        serializer = TokenObtainPairSerializer(data=data)
        # We need to patch the parent's validate method or test through view
        # This is a basic structure test
        self.assertTrue(serializer.is_valid())
    
    def test_login_missing_credentials(self):
        """Test login with missing credentials"""
        data = {}
        serializer = TokenObtainPairSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)