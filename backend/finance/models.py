from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class Income(models.Model):
    """
    Tracks all student income sources including pocket money,
    scholarships, freelance gigs, and part-time jobs.
    """
    CATEGORY_CHOICES = [
        ('POCKET_MONEY', 'Pocket Money'),
        ('SCHOLARSHIP', 'Scholarship'),
        ('FREELANCE', 'Freelance'),
        ('PART_TIME', 'Part-time Job'),
        ('ALLOWANCE', 'Allowance'),
        ('GIFTS', 'Gifts'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='incomes'
    )
    title = models.CharField(max_length=150, help_text="Short label e.g., Monthly Pocket Money")
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.CharField(
        max_length=40,
        choices=CATEGORY_CHOICES,
        default='POCKET_MONEY'
    )
    date = models.DateField(help_text="Date income was received")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.get_category_display()})"


class Expense(models.Model):
    """
    Daily student expense transactions categorized by type and payment method.
    """
    CATEGORY_CHOICES = [
        ('FOOD', 'Food & Dining'),
        ('TRAVEL', 'Travel & Transport'),
        ('SHOPPING', 'Shopping'),
        ('EDUCATION', 'Education & Books'),
        ('ENTERTAINMENT', 'Entertainment'),
        ('BILLS', 'Bills & Utilities'),
        ('MISCELLANEOUS', 'Miscellaneous'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('UPI', 'UPI (Google Pay, PhonePe, Paytm)'),
        ('CASH', 'Cash'),
        ('DEBIT_CARD', 'Debit Card'),
        ('CREDIT_CARD', 'Credit Card'),
        ('NET_BANKING', 'Net Banking'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    title = models.CharField(max_length=150, help_text="Short description e.g., Campus Cafeteria Lunch")
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.CharField(
        max_length=40,
        choices=CATEGORY_CHOICES,
        default='FOOD'
    )
    payment_method = models.CharField(
        max_length=30,
        choices=PAYMENT_METHOD_CHOICES,
        default='UPI'
    )
    date = models.DateField(help_text="Date expense occurred")
    notes = models.TextField(blank=True, null=True, help_text="Optional remarks or receipt details")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.get_category_display()})"


class Budget(models.Model):
    """
    Category-wise monthly budget allocations to help students avoid overspending.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.CharField(
        max_length=40,
        choices=Expense.CATEGORY_CHOICES,
        help_text="Expense category being budgeted"
    )
    amount_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Maximum budget allocation for the month"
    )
    month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text="Month number (1 to 12)"
    )
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2020), MaxValueValidator(2100)],
        help_text="Calendar year"
    )
    alert_threshold_percentage = models.PositiveSmallIntegerField(
        default=80,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Send warning notification when spending crosses this percentage"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-month', 'category']
        unique_together = ('user', 'category', 'month', 'year')

    def __str__(self):
        return f"{self.user.username} - {self.get_category_display()} ({self.month}/{self.year}): {self.amount_limit}"


class SavingsGoal(models.Model):
    """
    Student savings goals (e.g. New Laptop Fund, Japan Trip, Emergency Fund)
    with progress tracking and target deadlines.
    """
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('ACHIEVED', 'Goal Achieved'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='savings_goals'
    )
    title = models.CharField(max_length=150, help_text="Goal name e.g., New Laptop Fund")
    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    current_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    target_date = models.DateField(blank=True, null=True, help_text="Target completion date")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='IN_PROGRESS'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.current_amount}/{self.target_amount})"

    @property
    def progress_percentage(self):
        if self.target_amount <= 0:
            return 0
        percent = (self.current_amount / self.target_amount) * 100
        return min(round(float(percent), 2), 100.0)


class Notification(models.Model):
    """
    In-app alerts for budget limits, savings reminders, and monthly summaries.
    """
    NOTIFICATION_TYPES = [
        ('BUDGET_ALERT', 'Budget Limit Alert'),
        ('SAVINGS_REMINDER', 'Savings Reminder'),
        ('GOAL_MILESTONE', 'Goal Milestone'),
        ('MONTHLY_REPORT', 'Monthly Report'),
        ('GENERAL', 'General Notification'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES,
        default='GENERAL'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.title} -> {self.user.username}"


class Report(models.Model):
    """
    Generated monthly and periodic financial summaries for student review & export.
    """
    REPORT_TYPES = [
        ('MONTHLY', 'Monthly Summary'),
        ('CATEGORY_WISE', 'Category-wise Analysis'),
        ('ANNUAL', 'Annual Overview'),
        ('CUSTOM', 'Custom Range'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    title = models.CharField(max_length=150)
    report_type = models.CharField(
        max_length=30,
        choices=REPORT_TYPES,
        default='MONTHLY'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_income = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_expense = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_savings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    summary_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Detailed category aggregations and spending breakdowns"
    )
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.title} ({self.start_date} to {self.end_date})"
