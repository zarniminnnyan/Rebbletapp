from .models  import MediaModel,NewsModel
from django import forms 
#Create a form for uploading media
class MediaForm(forms.ModelForm): 
    class Meta: 
        model=MediaModel 
        fields=["media"]

class  PostEditForm(forms.ModelForm): 
    class Meta: 
        model=NewsModel 
        fields=["title","post"]