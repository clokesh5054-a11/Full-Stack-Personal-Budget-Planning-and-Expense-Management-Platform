from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ProfileSerializer,
)

def get_tokens_for_user(user):
    """
    Utility helper to generate JWT access and refresh token pair for a user.
    """
    refresh = RefreshToken.for_user(user)
    # Add custom claims into token payload
    refresh['username'] = user.username
    refresh['role'] = user.role
    refresh['email'] = user.email

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterAPIView(APIView):
    """
    Endpoint for new user registration.
    Accessible to anyone. Automatically creates a linked student profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return Response(
                {
                    "message": "User registered successfully.",
                    "tokens": tokens,
                    "user": user_data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    """
    Endpoint to authenticate users using username or email + password.
    Returns JWT access & refresh tokens along with user and profile data.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            return Response(
                {
                    "message": "Login successful.",
                    "tokens": tokens,
                    "user": user_data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserAPIView(APIView):
    """
    Endpoint to retrieve the current authenticated user's details.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileAPIView(APIView):
    """
    Endpoint to view and update the user's financial profile
    (e.g., monthly baseline income, currency preference, savings goals note).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Profile updated successfully.",
                    "profile": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        return self.put(request)


class LogoutAPIView(APIView):
    """
    Endpoint to logout. Can blacklist the refresh token if provided.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # Token might already be blacklisted or invalid
                pass
        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK
        )
