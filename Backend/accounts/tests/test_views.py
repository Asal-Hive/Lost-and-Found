from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from accounts.models import OTPCode

User = get_user_model()


class RegisterViewTest(TestCase):
    """Test cases for RegisterView"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('api-register')
    
    @patch('accounts.views.send_otp_email')
    def test_successful_registration(self, mock_send_otp):
        """Test successful user registration"""
        data = {
            'email': 'newuser@example.com'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['detail'], 'کاربر ایجاد شد، کد تایید ارسال شد.')
        
        # Check user was created
        user = User.objects.get(email='newuser@example.com')
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())
        
        # Check OTP was created
        otp = OTPCode.objects.filter(user=user, purpose='activation').first()
        self.assertIsNotNone(otp)
        self.assertFalse(otp.is_used)
        
        # Check email was sent
        mock_send_otp.assert_called_once()
    
    @patch('accounts.views.send_otp_email')
    def test_registration_with_password(self, mock_send_otp):
        """Test registration with password (immediate activation)"""
        data = {
            'email': 'newuser@example.com',
            'password': 'StrongPass123!'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check user was created and activated
        user = User.objects.get(email='newuser@example.com')
        self.assertTrue(user.is_active)
        self.assertTrue(user.check_password('StrongPass123!'))
        
        # Check OTP was still created
        otp = OTPCode.objects.filter(user=user, purpose='activation').first()
        self.assertIsNotNone(otp)
    
    def test_duplicate_email_registration(self):
        """Test registration with existing email"""
        User.objects.create_user(
            username='existing@example.com',
            email='existing@example.com'
        )
        
        data = {
            'email': 'existing@example.com'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
    
    def test_invalid_email_format(self):
        """Test registration with invalid email"""
        data = {
            'email': 'not-an-email'
        }
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


class VerifyOTPViewTest(TestCase):
    """Test cases for VerifyOTPView"""
    
    def setUp(self):
        self.client = APIClient()
        self.verify_url = reverse('api-verify-otp')
        
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            is_active=False
        )
        
        self.otp = OTPCode.objects.create(
            user=self.user,
            code='123456',
            purpose='activation',
            expires_at=timezone.now() + timedelta(minutes=5)
        )
    
    def test_successful_verification(self):
        """Test successful OTP verification"""
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'ایمیل تایید شد.')
        
        # Check user is now active
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        
        # Check OTP is used
        self.otp.refresh_from_db()
        self.assertTrue(self.otp.is_used)
    
    def test_invalid_code(self):
        """Test verification with invalid code"""
        data = {
            'email': 'test@example.com',
            'code': '999999'
        }
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Check user is still inactive
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
    
    def test_expired_code(self):
        """Test verification with expired code"""
        self.otp.expires_at = timezone.now() - timedelta(minutes=1)
        self.otp.save()
        
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        response = self.client.post(self.verify_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SetPasswordViewTest(TestCase):
    """Test cases for SetPasswordView"""
    
    def setUp(self):
        self.client = APIClient()
        self.set_password_url = reverse('api-set-password')
        
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            is_active=False
        )
        
        # Create a used OTP within valid window
        self.otp = OTPCode.objects.create(
            user=self.user,
            code='123456',
            purpose='activation',
            expires_at=timezone.now() + timedelta(minutes=5),
            is_used=True,
            created_at=timezone.now() - timedelta(minutes=2)
        )
    
    def test_successful_password_set(self):
        """Test successful password setting"""
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        response = self.client.post(self.set_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # Check password was set
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewStrongPass123!'))
    
    def test_no_recent_otp(self):
        """Test password set without recent OTP"""
        # Delete the OTP
        self.otp.delete()
        
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        response = self.client.post(self.set_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_password_mismatch(self):
        """Test password set with mismatched passwords"""
        data = {
            'email': 'test@example.com',
            'password': 'NewStrongPass123!',
            'password_confirm': 'DifferentPass123!'
        }
        response = self.client.post(self.set_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data)


class ForgotPasswordViewTest(TestCase):
    """Test cases for ForgotPasswordView"""
    
    def setUp(self):
        self.client = APIClient()
        self.forgot_url = reverse('api-forgot-password')
        
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
    
    @patch('accounts.views.send_otp_email')
    def test_successful_forgot_password(self, mock_send_otp):
        """Test successful password reset request"""
        data = {'email': 'test@example.com'}
        response = self.client.post(self.forgot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check OTP was created
        otp = OTPCode.objects.filter(user=self.user, purpose='reset').first()
        self.assertIsNotNone(otp)
        
        # Check email was sent
        mock_send_otp.assert_called_once()
    
    def test_nonexistent_email(self):
        """Test forgot password with non-existent email"""
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.forgot_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ResetPasswordViewTest(TestCase):
    """Test cases for ResetPasswordView"""
    
    def setUp(self):
        self.client = APIClient()
        self.reset_url = reverse('api-reset-password')
        
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
        
        self.otp = OTPCode.objects.create(
            user=self.user,
            code='123456',
            purpose='reset',
            expires_at=timezone.now() + timedelta(minutes=5)
        )
    
    def test_verify_otp_only(self):
        """Test OTP verification without password"""
        data = {
            'email': 'test@example.com',
            'code': '123456'
        }
        response = self.client.post(self.reset_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['detail'], 'کد معتبر است.')
    
    def test_reset_with_password(self):
        """Test complete password reset"""
        data = {
            'email': 'test@example.com',
            'code': '123456',
            'password': 'NewStrongPass123!',
            'password_confirm': 'NewStrongPass123!'
        }
        response = self.client.post(self.reset_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewStrongPass123!'))
        
        # Check OTP is used
        self.otp.refresh_from_db()
        self.assertTrue(self.otp.is_used)
    
    def test_invalid_otp(self):
        """Test reset with invalid OTP"""
        data = {
            'email': 'test@example.com',
            'code': '999999'
        }
        response = self.client.post(self.reset_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)