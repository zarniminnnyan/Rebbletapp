from celery import Celery 
import os 
from dotenv import load_dotenv
load_dotenv()

#tell celery where the setting is
os.environ.setdefault("DJANGO_SETTINGS_MODULE",f"{os.getenv('PROJECT_NAME')}.settings")

#define celery app
app=Celery("celery_app")

#let celery find the name start with CELERY in django setting

app.config_from_object("django.conf:settings",namespace="CELERY")
#let celery app finds the tasks from django apps 
app.autodiscover_tasks()