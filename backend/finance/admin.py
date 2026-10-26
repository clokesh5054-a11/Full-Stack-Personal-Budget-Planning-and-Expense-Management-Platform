from django.contrib import admin
from .models import Income, Expense, Budget, SavingsGoal, Notification, Report

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'amount', 'category', 'date', 'created_at')
    list_filter = ('category', 'date')
    search_fields = ('title', 'user__username', 'description')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'amount', 'category', 'payment_method', 'date', 'created_at')
    list_filter = ('category', 'payment_method', 'date')
    search_fields = ('title', 'user__username', 'notes')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'amount_limit', 'month', 'year', 'alert_threshold_percentage')
    list_filter = ('month', 'year', 'category')
    search_fields = ('user__username',)

@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'target_amount', 'current_amount', 'status', 'target_date')
    list_filter = ('status', 'target_date')
    search_fields = ('title', 'user__username')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('title', 'user__username', 'message')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'report_type', 'start_date', 'end_date', 'total_income', 'total_expense', 'net_savings')
    list_filter = ('report_type', 'generated_at')
    search_fields = ('title', 'user__username')
