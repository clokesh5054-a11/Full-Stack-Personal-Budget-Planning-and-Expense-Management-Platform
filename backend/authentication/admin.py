from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Financial Profile'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'phone_number', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('-date_joined',)
    inlines = (ProfileInline,)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('BudgetBuddy Role & Info', {'fields': ('role', 'phone_number')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('BudgetBuddy Role & Info', {'fields': ('email', 'role', 'phone_number')}),
    )

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'monthly_income', 'currency', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('currency',)
