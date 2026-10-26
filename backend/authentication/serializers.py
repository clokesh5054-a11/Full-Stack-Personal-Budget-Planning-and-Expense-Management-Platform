from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id',
            'monthly_income',
            'currency',
            'financial_goals_note',
            'bio',
            'avatar_url',
            'notification_preferences',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'profile',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'confirm_password',
            'first_name',
            'last_name',
            'role',
            'phone_number',
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')

        # Create user with properly hashed password
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', User.ROLE_STUDENT),
            phone_number=validated_data.get('phone_number', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        login_input = attrs.get('username_or_email', '').strip()
        password = attrs.get('password', '')

        if not login_input or not password:
            raise serializers.ValidationError("Please provide both username/email and password.")

        # Check if user entered email or username
        user = None
        if '@' in login_input:
            try:
                user_obj = User.objects.get(email__iexact=login_input)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=login_input, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials. Please verify your details.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is currently deactivated.")

        attrs['user'] = user
        return attrs
