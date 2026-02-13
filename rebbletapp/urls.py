from django.urls import path
from . import views
from .views import Rebblet

# Application URL patterns
urlpatterns = [
    # User authentication and registration
    path("user/", views.login_and_register_form, name="userauth"),

    # User login
    path("user-login/", views.authenticated_user, name="user-login"),

    # Logout
    path("", views.logout_view, name="logout"),

    # Articles
    path("article/", views.view_articles, name="article"),
    path("post-articles/", views.post_news, name="newpost"),
    path("editpost/<int:pk>/", views.edit_post, name="editpost"),
    path("delete/<int:pk>/", views.delete_post, name="delete"),

    # Comments & Replies
    path("comment/<int:post_id>/", views.comment_section, name="commenturl"),
    path("reply/<int:comment_id>/", views.reply_section, name="reply"),
    path("comment-delete/<int:comment_id>/", views.delete_comment, name="delete_comment"),
    path("reply-delete/<int:reply_id>/", views.delete_reply, name="delete_reply"),

    # Media
    path("media/<int:post_id>/", views.upload_media, name="media"),

    # Search & Results
    path("search/", views.search, name="search"),
    path("results/<int:pk>/", views.get_results, name="results"),

    # Likes
    path("likepost/", views.likePost, name="likepost"),

    # API
    path("articles/api/", Rebblet.as_view(), name="rest_framework_api"),
    
    #Reset password
   path("resetpassword/",views.reset_password,name="resetpassword"),
    
    #Verify password
path("verify/<int:user_id>/", views.verify_OTP, name="verify_otp")
]

