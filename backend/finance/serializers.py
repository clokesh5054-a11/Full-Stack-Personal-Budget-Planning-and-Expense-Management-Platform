from rest_framework import serializers
from decimal import Decimal
from django.db.models import Sum
from .models import Income, Expense, Budget

class IncomeSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Income
        fields = [
            'id',
            'title',
            'amount',
            'category',
            'category_display',
            'date',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically associate with current logged-in user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id',
            'title',
            'amount',
            'category',
            'category_display',
            'payment_method',
            'payment_method_display',
            'date',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    is_over_budget = serializers.SerializerMethodField()
    is_near_limit = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_display',
            'amount_limit',
            'month',
            'year',
            'alert_threshold_percentage',
            'spent_amount',
            'remaining_amount',
            'utilization_percentage',
            'is_over_budget',
            'is_near_limit',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_spent_amount(self, obj):
        # Aggregate expenses matching user, category, month, and year
        spent = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            date__year=obj.year,
            date__month=obj.month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return float(spent)

    def get_remaining_amount(self, obj):
        spent = Decimal(str(self.get_spent_amount(obj)))
        limit = Decimal(str(obj.amount_limit))
        remaining = limit - spent
        return float(max(remaining, Decimal('0.00')))

    def get_utilization_percentage(self, obj):
        spent = Decimal(str(self.get_spent_amount(obj)))
        limit = Decimal(str(obj.amount_limit))
        if limit <= Decimal('0.00'):
            return 0.0
        percent = (spent / limit) * 100
        return round(float(percent), 1)

    def get_is_over_budget(self, obj):
        spent = Decimal(str(self.get_spent_amount(obj)))
        limit = Decimal(str(obj.amount_limit))
        return spent > limit

    def get_is_near_limit(self, obj):
        utilization = self.get_utilization_percentage(obj)
        return utilization >= obj.alert_threshold_percentage

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
