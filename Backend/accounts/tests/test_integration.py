from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from accounts.models import OTPCode

User = get_user_model()


class FullAuthenticationFlowTest(TestCase):
    """Integration tests for complete authentication flow"""
    
    def setUp(self):
        self.client = APIClient()
    
    @patch('accounts.views.send_otp_email')
    def test_complete_registration_flow(self, mock_send_otp):
        """Test complete user registration without password"""
        # Step 1: Register
        register_data = {'email': 'newuser@example.com'}
        register_response = self.client.post(
            reverse('api-register'), 
            register_data, 
            format='json'
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        # Get user and OTP
        user = User.objects.get(email='newuser@example.com')
        self.assertFalse(user.is_active)
        
        otp = OTPCode.objects.get(user=user, purpose='activation')
        
        # Step 2: Verify OTP
        verify_data = {
            'email': 'newuser@example.com',
            'code': otp.code
        }
        verify_response = self.client.post(
            reverse('api-verify-otp'),
            verify_data,
            format='json'
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        
        # Check user is now active
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        
        # Step 3: Set password
        set_password_data = {
            'email': 'newuser@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!'
        }
        set_password_response = self.client.post(
            reverse('api-set-password'),
            set_password_data,
            format='json'
        )
        self.assertEqual(set_password_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', set_password_response.data)
        
        # Check password was set
        user.refresh_from_db()
        self.assertTrue(user.check_password('StrongPass123!'))
    
    @patch('accounts.views.send_otp_email')
    def test_password_reset_flow(self, mock_send_otp):
        """Test complete password reset flow"""
        # Create user
        user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='oldpass123',
            is_active=True
        )
        
        # Step 1: Request password reset
        forgot_data = {'email': 'test@example.com'}
        forgot_response = self.client.post(
            reverse('api-forgot-password'),
            forgot_data,
            format='json'
        )
        self.assertEqual(forgot_response.status_code, status.HTTP_200_OK)
        
        # Get reset OTP
        otp = OTPCode.objects.get(user=user, purpose='reset')
        
        # Step 2: Verify OTP
        verify_data = {
            'email': 'test@example.com',
            'code': otp.code
        }
        verify_response = self.client.post(
            reverse('api-reset-password'),
            verify_data,
            format='json'
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        
        # Step 3: Reset password
        reset_data = {
            'email': 'test@example.com',
            'code': otp.code,
            'password': 'newstrongpass123!',
            'password_confirm': 'newstrongpass123!'
        }
        reset_response = self.client.post(
            reverse('api-reset-password'),
            reset_data,
            format='json'
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        
        # Check password was changed
        user.refresh_from_db()
        self.assertTrue(user.check_password('newstrongpass123!'))
    
    def test_login_with_jwt(self):
        """Test JWT token generation and authentication"""
        # Create active user
        user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123',
            is_active=True
        )
        
        # Get token
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        # Authenticate with token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Access protected endpoint (my_items)
        response = self.client.get('/api/items/my_items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)