from django.test import TestCase
from django.contrib.auth import get_user_model

User = User = get_user_model()


class SimpleTest(TestCase):
    """Simple test to verify test setup is working."""
    
    def test_user_creation(self):
        """Test creating a user works."""
        user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_math(self):
        """Simple math test."""
        self.assertEqual(1 + 1, 2)