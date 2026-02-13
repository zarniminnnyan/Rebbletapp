from django.db import models
import os
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField

IMG_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
VD_EXT  = [".mov", ".avi", ".mp4", ".webm", ".mkv", ".wmv", ".flv"]

IMG_MAX_SIZE = 20 * 1024 * 1024      # 20 MB
VD_MAX_SIZE  = 50 * 1024 * 1024     # 50 MB

def validate_media_size(value):
    ext = os.path.splitext(value.name)[1].lower()
    if ext in IMG_EXT and value.size > IMG_MAX_SIZE:
        raise ValidationError("Image max size is 20 MB.")
    if ext in VD_EXT and value.size > VD_MAX_SIZE:
        raise ValidationError("Video max size is 50 MB.")


"Articles Model"

class NewsModel(models.Model):
    """
    Model representing a news post.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(
        verbose_name="News Title",
        max_length=250,
        help_text="Enter the news title"
    )
    post = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        """
        Return the title of the news post.
        """
        return self.title

class OTPcode(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name="user_name")
    otp_code=models.CharField(max_length=6,null=True)
    created_at=models.DateTimeField(auto_now_add=True,null=True)
    
    def __str__(self):
        return f"{self.user}'s OTP code  {self.otp_code}"
    

class Comments(models.Model):
    """
    Model representing comments on news posts.
    """
    users = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    posts = models.ForeignKey(NewsModel, on_delete=models.CASCADE, related_name="commented_post",null=True)
    comments = models.TextField(max_length=400, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        """
        Return a readable representation of the comment.
        """
        return f'Comment by {self.users.username} on "{self.posts.title}"'


class Likes(models.Model):
    """
    Model representing likes on news posts.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    post=models.ForeignKey(NewsModel,on_delete=models.CASCADE,null=True,related_name="likes")
    
    
    def __str__(self):
        return f"liked! {self.post} by {self.user}"
    
    
class Reply(models.Model): 
    """
    Representing the Comment Reply 
    """
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    comment=models.ForeignKey(Comments,on_delete=models.CASCADE)
    reply= models.TextField(max_length=400, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    
    def __str__(self): 
        return f"{self.reply} by {self.user} at {self.created_at}"
    

"Media Model for Uploading Images and Videos"

class MediaModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(NewsModel, on_delete=models.CASCADE)

    media = CloudinaryField(  'media', 
        resource_type='auto', 
        folder='uploads/',
        validators=[validate_media_size],
        null=True, 
        blank=True
    )
    media_url=models.URLField(max_length=1000,unique=True,blank=True)
    media_type_field=models.CharField(max_length=20,blank=True)
    
    @property
    def media_type(self):
        return self.media_type_field or "none"