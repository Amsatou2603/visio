import os
from pathlib import Path
from datetime import timedelta
import logging
# pyrefly: ignore [missing-import]
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file manually if it exists (avoids dependency on python-dotenv)
env_path = BASE_DIR / '.env'
if env_path.exists():
    try:
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    val = val.strip().strip("'").strip('"')
                    os.environ[key.strip()] = val
    except Exception as e:
        pass


SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-123')

DJANGO_ENV = os.environ.get('DJANGO_ENV', 'development')
DEBUG = DJANGO_ENV != 'production'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# ALLOWED_HOSTS
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'visio-backend-sp1h.onrender.com']
if os.environ.get('ALLOWED_HOSTS'):
    ALLOWED_HOSTS += os.environ.get('ALLOWED_HOSTS', '').split(',')

# Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'cloudinary_storage',
    'cloudinary',
    'users',
    'products',
    'orders',
    'payments',
    'reviews',
    'notifications',
    'chatbot',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'core.wsgi.application'

# Base de données
if DJANGO_ENV == 'production':
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Dakar'
USE_I18N = True
USE_TZ = True

# Fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Fichiers media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Cloudinary
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', ''),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', ''),
}

# En production — Cloudinary pour les médias
if DJANGO_ENV == 'production':
    # Only use Cloudinary if credentials are provided
    if all([
        os.environ.get('CLOUDINARY_CLOUD_NAME'),
        os.environ.get('CLOUDINARY_API_KEY'),
        os.environ.get('CLOUDINARY_API_SECRET')
    ]):
        DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    else:
        # Fallback to local storage if Cloudinary not configured
        logging.warning('Cloudinary credentials not found, using local media storage')
    
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = False  # Render handles SSL

# DRF
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
if os.environ.get('CORS_ALLOWED_ORIGINS'):
    # Nettoyer les URLs (enlever les slashes finaux et espaces)
    origins = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
    CORS_ALLOWED_ORIGINS += [origin.strip().rstrip('/') for origin in origins if origin.strip()]

# Allow Flutter web app during development
if DJANGO_ENV == 'development':
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_CREDENTIALS = True

# PayTech (paiement mobile money)
PAYTECH_API_URL = os.environ.get('PAYTECH_API_URL', 'https://paytech.sn/api')
PAYTECH_API_KEY = os.environ.get('PAYTECH_API_KEY', '')
PAYTECH_API_SECRET = os.environ.get('PAYTECH_API_SECRET', '')
PAYTECH_ENV = os.environ.get('PAYTECH_ENV', 'sandbox')

# URLs externes
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
BACKEND_URL = os.environ.get('BACKEND_URL', 'http://127.0.0.1:8000')

# Gemini API Key for Chatbot
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Configuration de logging pour débugger les paiements
if DEBUG:
    LOGGING['loggers']['payments'] = {
        'handlers': ['console'],
        'level': 'DEBUG',
        'propagate': False,
    }