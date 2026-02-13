from .celery import app as celery_app
""" Make celery app expose to all apps from django """
__all__=("celery_app",)