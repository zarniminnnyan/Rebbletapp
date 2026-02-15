from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect,ensure_csrf_cookie
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.http import HttpResponseRedirect,JsonResponse
from .models import NewsModel, Comments,MediaModel,Reply,Likes,OTPcode
from django.db.models import Q
from guardian.shortcuts import assign_perm
from .forms import MediaForm,PostEditForm
from rest_framework import generics
from .serializers import PostSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model 
from django.conf import settings
from rebbletapp.tasks import send_email
import cloudinary
import string 
import secrets


ACTIVE_USER=get_user_model()

def generate_otp_code(length=6):
    return "".join(secrets.choice(string.digits) for _ in range(length))

def reset_password(request):
    if request.method == "POST":
        username_input = request.POST.get("username")
        password1 = request.POST.get("password1")
        password2 = request.POST.get("password2")

        try:
            user = ACTIVE_USER.objects.get(username=username_input)
        except ACTIVE_USER.DoesNotExist:
            messages.error(request, "User does not exist")
            return HttpResponseRedirect(reverse("resetpassword"))

        if password1 and password2:
            if password1 == password2:
                # Store password temporarily in session
                request.session["new_password"] = password1

                # Generate and send OTP
                otp_code = generate_otp_code()
                # print(f"Generated OT: {otp_code}")
                # print(f"user.email: {user.email}")
                
                OTPcode.objects.create(user=user, otp_code=otp_code)
                send_email.delay(user.email, otp_code)

                # Redirect to OTP verification page
                return HttpResponseRedirect(reverse("verify_otp", args=[user.id]))
            else:
                messages.error(request, "Passwords don't match")
        else:
            messages.error(request, "Provide the full information")

        return HttpResponseRedirect(reverse("resetpassword"))

    return render(request, "resetpassword.html")

  
def verify_OTP(request, user_id):
    user = ACTIVE_USER.objects.get(id=user_id)

    if request.method == "POST":
        entered_code = request.POST.get("otp")
        try:
            otp_obj = OTPcode.objects.filter(user=user).latest("created_at")
        except OTPcode.DoesNotExist:
            messages.error(request, "No OTP found for this user")
            return render(request, "verification.html")

        if otp_obj.otp_code == entered_code:
            new_password = request.session.get("new_password")
            if new_password:
                user.set_password(new_password)
                user.save()
                messages.success(request, "Password reset successfully")
                return HttpResponseRedirect(reverse("user-login"))
            else:
                messages.error(request, "No password found in session")
        else:
            messages.error(request, "Invalid OTP, please try again")

    return render(request, "verification.html",{"user_id": user.id})

@ensure_csrf_cookie
def login_and_register_form(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password1")
        con_password = request.POST.get("password2")

        if password != con_password:
            messages.error(request, "Passwords don't match")
            return HttpResponseRedirect(reverse("userauth"))

        if len(password) < 8:
            messages.error(
                request,
                "Account creation failed. Password must be at least 8 characters long"
            )
            return HttpResponseRedirect(reverse("userauth"))

        if ACTIVE_USER.objects.filter(username__iexact=username).exists():
            messages.error(request, "User with this name is already taken")
            return HttpResponseRedirect(reverse("userauth"))
        
        ACTIVE_USER.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        messages.success(request, "User is created")
        return HttpResponseRedirect(reverse("userauth"))

    return render(request, "authentication.html")


@ensure_csrf_cookie
def authenticated_user(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            return HttpResponseRedirect(reverse("article"))
        else:
            messages.error(request, "invalid user data")
    
    return render(request, "authentication.html")


@login_required
def view_articles(request):
    user = request.user
    form = MediaForm()
    media=MediaModel.objects.all()
    article = NewsModel.objects.all().order_by("-created_at")
    posts = NewsModel.objects.filter(author=request.user).order_by("-created_at")
    liked_posts=Likes.objects.filter(user=request.user).values_list("post_id",flat=True)
    comment = Comments.objects.all()
    reply=Reply.objects.all()
    
    return render(
        request,
        "article.html",
        {
            "articles": article,
            "posts": posts,
            "user": user,
            "mycomment": comment,
            "form": form,
            "mymedia":media,
            "replies":reply,
            "liked_posts":liked_posts,
        }
    )

@login_required
@ensure_csrf_cookie
def post_news(request):
    if request.method == "POST":
        my_title = request.POST["title"]
        my_post = request.POST["post"]
        
        if not NewsModel.objects.filter(Q(title=my_title) & Q(post=my_post)).exists():
            article = NewsModel.objects.create(
                author=request.user,
                title=my_title,
                post=my_post
            )
            article.save()
            
            assign_perm("change_newsmodel", request.user, article)
            assign_perm("delete_newsmodel", request.user, article)
            assign_perm("view_newsmodel", request.user, article)
            
            return HttpResponseRedirect(reverse("article"))
        else:
            messages.error(request, "Article already exists")
    
    return HttpResponseRedirect(reverse("article"))


@login_required
@ensure_csrf_cookie
def comment_section(request, post_id):
    if request.method == "POST":
        get_comment = request.POST.get("comment")
        if get_comment:
            post = get_object_or_404(NewsModel, pk=post_id)
            comment = Comments.objects.create(
                users=request.user,
                posts=post,
                comments=get_comment
            )
            comment.save()

            return JsonResponse({
                "user_name": request.user.get_full_name() or request.user.username,
                "user_handle": request.user.username,
                "user_initials": request.user.username[0].upper(),
            })
    return HttpResponseRedirect(reverse("article"))


@login_required
@ensure_csrf_cookie
def reply_section(request, comment_id):
    if request.method == "POST":
        get_reply = request.POST.get("reply")
        if get_reply:
            comment = get_object_or_404(Comments, pk=comment_id)
            reply = Reply.objects.create(
                user=request.user,
                comment=comment,
                reply=get_reply
            )
            reply.save()
            return JsonResponse({
                    "user_name": request.user.get_full_name() or request.user.username,
                    "user_handle": request.user.username,
                    "user_initials": request.user.username[0].upper(),
                    "reply_id": reply.id,
                    "comment_id": comment_id,
                })
    return HttpResponseRedirect(reverse("article"))

@login_required
def edit_post(request,pk): 
    context={}
    obj=get_object_or_404(NewsModel,pk=pk) 
    if request.method == "POST":
        form=PostEditForm(request.POST, instance=obj)
        if form.is_valid(): 
            form.save()
            return HttpResponseRedirect(reverse("article"))
    else: 
        form=PostEditForm(instance=obj)
    context["form"]=form
    print(context)
    return render(request,"edit.html", context)
    

@login_required
@ensure_csrf_cookie
def upload_media(request, post_id):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        if request.method == "POST":
            form = MediaForm(request.POST, request.FILES)
            post_instance = get_object_or_404(NewsModel, pk=post_id)
            uploaded_media=request.FILES["media"]
             
            if uploaded_media.size >50*1024*1024:
                return JsonResponse({
                    "success":False,
                    "error":"File size exceeds 50MB limit."
                })
                
            if MediaModel.objects.filter(post=post_instance,user=request.user).count()>=1:
                return JsonResponse({
                    "success":False,
                    "error":"Only one media file allowed per post."
                })
                
            if form.is_valid():
                cloudinary_upload=cloudinary.uploader.upload(
                    request.FILES["media"],resource_type="auto"
                )
                media = form.save(commit=False)
                media.user = request.user
                media.post = post_instance 
                media.media_url = cloudinary_upload["secure_url"]
                media.media_type_field = cloudinary_upload["resource_type"]
                media.save()
                return JsonResponse({
    "success": True,
    "redirect_url": reverse("article")
    })
            return JsonResponse({
                "success":False
            })
            
            
#Delete Post 
@csrf_protect
@login_required
def delete_post(request, pk):
    is_ajax=request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        if request.method  in ["DELETE","POST"]:
            del_post = get_object_or_404(
                NewsModel,
                pk=pk,
                author=request.user
            )
            
            del_post.delete()
            return JsonResponse({"success": True, "message": "Post deleted"})
        return HttpResponseRedirect(reverse("article"))


#Delete Comments
@login_required
def delete_comment(request,comment_id):
    is_ajax=request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        if request.method  in ["DELETE","POST"]:
            del_comment= get_object_or_404(
                Comments,
                pk=comment_id,
                users=request.user,
            )
            
            del_comment.delete()
            return JsonResponse({"success": True, "message": "Comment deleted"})
        return HttpResponseRedirect(reverse("article"))

#Delete Replies
@login_required
def delete_reply(request,reply_id):
    is_ajax=request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if is_ajax:
        if request.method  in ["DELETE","POST"]:
            del_reply= get_object_or_404(
                Reply,
                pk=reply_id,
                user=request.user,
            )
            
            del_reply.delete()
            return JsonResponse({"success": True, "message": "Reply  deleted"})
        return HttpResponseRedirect(reverse("article"))
    
    
    

def logout_view(request):
    logout(request)
    return render(request,"home.html")
    
@login_required
def search(request): 
    if request.method == "GET": 
        try: 
            q = request.GET['q']
            results = NewsModel.objects.filter(
                Q(title__icontains=q) |
                Q(post__icontains=q)
            ).distinct()  
            
            return render(request, "search.html", {
                "results": results, 
                "query": q
            })
        except KeyError: 
            return HttpResponseRedirect(reverse("article"))
    else: 
        messages.error(request, "Invalid request")
        return HttpResponseRedirect(reverse("article"))
    
@login_required 
def get_results(request,pk): 
    obj=get_object_or_404(NewsModel,pk=pk)
    media=MediaModel.objects.all()
    comment = Comments.objects.all()
    reply=Reply.objects.all()
    
    return render(request,"results.html",{"result":obj,"mymedia":media,"mycomment":comment,"replies":reply})

@login_required
def likePost(request):
    if request.method == "POST":
        post_id = request.POST.get("post_id")
        liked_post = get_object_or_404(NewsModel, pk=post_id)

        like, created = Likes.objects.get_or_create(post=liked_post, user=request.user)
        if not created:
            like.delete()
            liked = False
        else:
            liked = True
        like_count = liked_post.likes.count()

        return JsonResponse({
            "success": True,
            "liked": liked,
            "post_id": post_id,
            "username": request.user.username,
            "like_count": like_count,
        })

    return JsonResponse({"success": False, "error": "Invalid request method."})


class Rebblet (generics.ListAPIView): 
    queryset=NewsModel.objects.all().order_by("created_at")
    serializer_class=PostSerializer
    permission_classes=[IsAuthenticated]
