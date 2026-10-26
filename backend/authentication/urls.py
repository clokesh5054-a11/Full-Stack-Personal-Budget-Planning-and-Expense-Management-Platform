from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterAPIView,
    LoginAPIView,
    CurrentUserAPIView,
    UserProfileAPIView,
    LogoutAPIView,
)

app_name = 'authentication'

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserAPIView.as_view(), name='current_user'),
    path('profile/', UserProfileAPIView.as_view(), name='user_profile'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
]
