from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom User model extending Django AbstractUser to support
    role-based access control (Student, Premium User, Admin).
    """
    ROLE_STUDENT = 'STUDENT'
    ROLE_PREMIUM = 'PREMIUM'
    ROLE_ADMIN = 'ADMIN'

    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_PREMIUM, 'Premium User'),
        (ROLE_ADMIN, 'Admin'),
    ]

    email = models.EmailField(unique=True, help_text="User's primary email address")
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
        help_text="Role determining platform permissions"
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == self.ROLE_STUDENT

    @property
    def is_premium(self):
        return self.role == self.ROLE_PREMIUM

    @property
    def is_admin_user(self):
        return self.role == self.ROLE_ADMIN or self.is_staff or self.is_superuser


class Profile(models.Model):
    """
    User Profile storing financial baseline, preferences,
    and student budget settings.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text="Expected monthly baseline income/pocket money"
    )
    currency = models.CharField(
        max_length=10,
        default='INR',
        help_text="Preferred currency symbol or code (e.g., INR, USD, EUR)"
    )
    financial_goals_note = models.TextField(
        blank=True,
        null=True,
        help_text="Personal savings goals and target aspirations"
    )
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Optional profile photo link or avatar key"
    )
    notification_preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="User alert preferences for budget limits and reminders"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.username}"

    def save(self, *args, **kwargs):
        # Default notification preferences if empty
        if not self.notification_preferences:
            self.notification_preferences = {
                "budget_alert_threshold": 80,
                "email_notifications": True,
                "savings_reminders": True,
                "monthly_summary_report": True
            }
        super().save(*args, **kwargs)
