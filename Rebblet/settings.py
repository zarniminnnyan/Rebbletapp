from pathlib import Path
from dotenv  import load_dotenv
import dj_database_url
import os 
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
DEBUG = os.getenv("DEBUG_METHOD", "False") == "True"

PRODUCTION=os.getenv("PRODUCTION","False")=="True"

ALLOWED_HOSTS = ["localhost","127.0.0.1","rebblet.up.railway.app"]

CSRF_TRUSTED_ORIGINS=["https://rebblet.up.railway.app"]

# Application definition

INSTALLED_APPS = [
    "unfold.contrib.guardian",
    "unfold",
    "guardian",
     "rest_framework",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
     "cloudinary_storage",
    "cloudinary",
    "rebbletapp",
    "django_celery_results",
]

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv("CLOUDINARY_CLOUD_NAME"),
    'API_KEY': os.getenv("CLOUDINARY_API_KEY"),
    'API_SECRET': os.getenv("CLOUDINARY_API_SECRET"), 
    'SECURE': True,
}


REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 5,
}


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = f"{os.getenv("PROJECT_NAME")}.urls"

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',  
    'guardian.backends.ObjectPermissionBackend',
)

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = f"{os.getenv("PROJECT_NAME")}.wsgi.application"

if PRODUCTION:
        DATABASES={}
        DATABASES["default"]=dj_database_url.config(
                default=os.getenv("DATABASE_URL"),
                conn_max_age=600,
                conn_health_checks=True,
            )
else:
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  
        }
    }
        

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
     {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },

    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

if PRODUCTION:
    # This storage is the most flexible for Images and Videos
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.CloudinaryStorage'
    CLOUDINARY_STORAGE.update({
        'RESOURCE_TYPE': 'auto' 
    })
else:
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'staticfiles'


# Default primary key field type

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST")   
EMAIL_PORT = 587             
EMAIL_USE_TLS = True               
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER 

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")
CELERY_RESULT_BACKEND = 'django-db'