import os
from pathlib import Path
from .settings import *  # Import all base settings

# Override settings for tests
DEBUG = True
SECRET_KEY = 'django-insecure-test-key-123456789'

# Use in-memory SQLite for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable password hashing for faster tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Use console email backend for tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Disable S3 storage for tests
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    }
}

# Create test media directory
TEST_MEDIA_ROOT = BASE_DIR / 'test_media'
TEST_MEDIA_ROOT.mkdir(exist_ok=True)
MEDIA_ROOT = str(TEST_MEDIA_ROOT)
MEDIA_URL = '/media/'

# Disable security features for tests
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Override any config settings that might cause issues
# This ensures we don't rely on the conf object for tests
if 'conf' in locals():
    # Just ignore conf for tests
    pass