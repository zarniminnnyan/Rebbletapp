web: python manage.py migrate && gunicorn Rebblet.wsgi:application --timeout 120
worker: celery -A Rebblet worker -l info