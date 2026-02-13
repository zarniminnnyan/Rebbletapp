from django.contrib import admin
from guardian.admin import GuardedModelAdmin
from unfold.admin import ModelAdmin
from .models import NewsModel,Comments,Likes,MediaModel,Reply,OTPcode


class PostAdmin(GuardedModelAdmin,ModelAdmin):
    pass
    
admin.site.register(NewsModel,PostAdmin)
admin.site.register(Comments,PostAdmin)
admin.site.register(Likes,PostAdmin)
admin.site.register( MediaModel,PostAdmin)
admin.site.register(Reply,PostAdmin)
admin.site.register(OTPcode,PostAdmin)
