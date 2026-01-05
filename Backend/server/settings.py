from pathlib import Path
from datetime import timedelta
from deployconfigs import DjangoConfigs

CODE_ROOT = Path(__file__).parent
BASE_DIR = CODE_ROOT.parent

# Initialize configuration with default.conf (committed) and local.conf (gitignored, overrides defaults)
conf = DjangoConfigs(
    default_conf_file=CODE_ROOT / 'default.conf',
    extra_conf_file=BASE_DIR / 'local.conf'
)

DATA_ROOT = conf.get_path('DATA_ROOT', BASE_DIR / 'data').resolve()

SECRET_KEY = conf.get('SECRET_KEY')
DEBUG = conf.get_bool('DEBUG', False)
ALLOWED_HOSTS = conf.get_list('ALLOWED_HOSTS', ['127.0.0.1', 'localhost'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'accounts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'accounts.middleware.ExemptAPIFromCSRFMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': conf.get('DATABASE_ENGINE'),
        'NAME': BASE_DIR / conf.get('DATABASE_NAME'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/stable/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = conf.get('LANGUAGE_CODE', 'fa')
TIME_ZONE = conf.get('TIME_ZONE', 'UTC')
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email Configuration
email_backend = conf.get('EMAIL_BACKEND')
EMAIL_BACKEND = email_backend

if email_backend != 'django.core.mail.backends.console.EmailBackend':
    EMAIL_HOST = conf.get('EMAIL_HOST')
    EMAIL_PORT = conf.get_int('EMAIL_PORT', 587)
    EMAIL_HOST_USER = conf.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = conf.get('EMAIL_HOST_PASSWORD', '')
    EMAIL_USE_TLS = conf.get_bool('EMAIL_USE_TLS', True)
    DEFAULT_FROM_EMAIL = conf.get('DEFAULT_FROM_EMAIL')

CORS_ALLOWED_ORIGINS = conf.get_list('CORS_ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
])

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=conf.get_int('ACCESS_TOKEN_LIFETIME_MINUTES', 60)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=conf.get_int('REFRESH_TOKEN_LIFETIME_DAYS', 1)),
}
