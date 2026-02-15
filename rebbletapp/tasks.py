from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

@shared_task(bind=True,max_retries=3)
def send_email(self,recipient_email, your_code):
    try:
        my_email=send_mail(
            "Your Rabblet Verification Code",
            f"Your verification code is {your_code}",
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
            fail_silently=False,
        )
        return my_email 
    except Exception as e:
        raise self.retry(exc=e,countdown=60)
    
