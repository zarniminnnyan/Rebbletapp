from rest_framework import serializers
from .models import NewsModel

"Using Basic Serializer to explore working with APIs"

class PostSerializer(serializers.ModelSerializer): 
    author_name=serializers.CharField(source="author.username",read_only=True)
    class Meta: 
        model=NewsModel
        fields=["title","post","author_name","created_at"]