from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from decimal import Decimal
from datetime import datetime

from .models import Income, Expense, Budget
from .serializers import (
    IncomeSerializer,
    ExpenseSerializer,
    BudgetSerializer,
)

class IncomeViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for student income and allowance entries.
    Scattered entries are strictly scoped to the requesting user.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Income.objects.filter(user=self.request.user)
        
        category = self.request.query_params.get('category')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for daily student expenses.
    Categorized by food, travel, shopping, education, and entertainment.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        category = self.request.query_params.get('category')
        payment_method = self.request.query_params.get('payment_method')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        search = self.request.query_params.get('search')

        if category:
            queryset = queryset.filter(category=category)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(notes__icontains=search)
            )

        return queryset


class BudgetViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for category-wise monthly budget allocations.
    Automatically calculates spent amounts and utilization thresholds.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        category = self.request.query_params.get('category')

        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        if category:
            queryset = queryset.filter(category=category)

        return queryset


class TransactionHistoryAPIView(APIView):
    """
    Unified transaction feed combining both incomes and expenses.
    Sorted chronologically for the transaction dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tx_type = request.query_params.get('type', 'all').lower()
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        category = request.query_params.get('category')
        search = request.query_params.get('search')

        transactions = []

        # 1. Fetch Incomes if requested
        if tx_type in ['all', 'income']:
            incomes_qs = Income.objects.filter(user=user)
            if month:
                incomes_qs = incomes_qs.filter(date__month=month)
            if year:
                incomes_qs = incomes_qs.filter(date__year=year)
            if category:
                incomes_qs = incomes_qs.filter(category=category)
            if search:
                incomes_qs = incomes_qs.filter(
                    Q(title__icontains=search) | Q(description__icontains=search)
                )

            for inc in incomes_qs:
                transactions.append({
                    'id': f"income-{inc.id}",
                    'raw_id': inc.id,
                    'type': 'income',
                    'title': inc.title,
                    'amount': float(inc.amount),
                    'category': inc.category,
                    'category_display': inc.get_category_display(),
                    'payment_method': 'N/A',
                    'date': inc.date.isoformat(),
                    'notes': inc.description or '',
                    'created_at': inc.created_at.isoformat(),
                })

        # 2. Fetch Expenses if requested
        if tx_type in ['all', 'expense']:
            expenses_qs = Expense.objects.filter(user=user)
            if month:
                expenses_qs = expenses_qs.filter(date__month=month)
            if year:
                expenses_qs = expenses_qs.filter(date__year=year)
            if category:
                expenses_qs = expenses_qs.filter(category=category)
            if search:
                expenses_qs = expenses_qs.filter(
                    Q(title__icontains=search) | Q(notes__icontains=search)
                )

            for exp in expenses_qs:
                transactions.append({
                    'id': f"expense-{exp.id}",
                    'raw_id': exp.id,
                    'type': 'expense',
                    'title': exp.title,
                    'amount': float(exp.amount),
                    'category': exp.category,
                    'category_display': exp.get_category_display(),
                    'payment_method': exp.get_payment_method_display(),
                    'date': exp.date.isoformat(),
                    'notes': exp.notes or '',
                    'created_at': exp.created_at.isoformat(),
                })

        # Sort combined transactions by date (descending), then created_at
        transactions.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)

        return Response({
            'count': len(transactions),
            'results': transactions
        }, status=status.HTTP_200_OK)


class DashboardSummaryAPIView(APIView):
    """
    Returns real-time financial stats for the student dashboard:
    - Monthly total income, expense, and remaining balance
    - Category-wise expense breakdown
    - Recent transactions list
    - Active monthly budgets utilization
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        current_month = int(request.query_params.get('month', now.month))
        current_year = int(request.query_params.get('year', now.year))

        # Monthly Income Total
        monthly_income_agg = Income.objects.filter(
            user=user,
            date__year=current_year,
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Monthly Expense Total
        monthly_expense_agg = Expense.objects.filter(
            user=user,
            date__year=current_year,
            date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        monthly_income = float(monthly_income_agg)
        monthly_expense = float(monthly_expense_agg)
        monthly_balance = monthly_income - monthly_expense

        # Baseline pocket money from Profile
        baseline_income = 0.00
        currency = 'INR'
        if hasattr(user, 'profile'):
            baseline_income = float(user.profile.monthly_income or 0.00)
            currency = user.profile.currency or 'INR'

        # All-time aggregations
        total_income_all = float(Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0.00)
        total_expense_all = float(Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0.00)
        all_time_balance = total_income_all - total_expense_all

        # Category-wise expense distribution for current month
        category_breakdown_qs = Expense.objects.filter(
            user=user,
            date__year=current_year,
            date__month=current_month
        ).values('category').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        category_expenses = []
        for item in category_breakdown_qs:
            cat_code = item['category']
            cat_display = dict(Expense.CATEGORY_CHOICES).get(cat_code, cat_code)
            cat_total = float(item['total'])
            percentage = round((cat_total / monthly_expense * 100), 1) if monthly_expense > 0 else 0
            category_expenses.append({
                'category': cat_code,
                'category_display': cat_display,
                'total': cat_total,
                'count': item['count'],
                'percentage': percentage
            })

        # Recent 5 transactions
        latest_incomes = list(Income.objects.filter(user=user).order_by('-date', '-created_at')[:5])
        latest_expenses = list(Expense.objects.filter(user=user).order_by('-date', '-created_at')[:5])

        recent_txs = []
        for inc in latest_incomes:
            recent_txs.append({
                'id': f"income-{inc.id}",
                'type': 'income',
                'title': inc.title,
                'amount': float(inc.amount),
                'category_display': inc.get_category_display(),
                'date': inc.date.isoformat(),
            })
        for exp in latest_expenses:
            recent_txs.append({
                'id': f"expense-{exp.id}",
                'type': 'expense',
                'title': exp.title,
                'amount': float(exp.amount),
                'category_display': exp.get_category_display(),
                'date': exp.date.isoformat(),
            })
        recent_txs.sort(key=lambda x: x['date'], reverse=True)
        recent_txs = recent_txs[:5]

        # Active Budgets for the month
        active_budgets_qs = Budget.objects.filter(
            user=user,
            month=current_month,
            year=current_year
        )
        budgets_data = BudgetSerializer(active_budgets_qs, many=True, context={'request': request}).data

        return Response({
            'period': {
                'month': current_month,
                'year': current_year,
            },
            'currency': currency,
            'baseline_income': baseline_income,
            'monthly_income': monthly_income,
            'monthly_expense': monthly_expense,
            'monthly_balance': monthly_balance,
            'total_income_all': total_income_all,
            'total_expense_all': total_expense_all,
            'all_time_balance': all_time_balance,
            'category_expenses': category_expenses,
            'recent_transactions': recent_txs,
            'active_budgets': budgets_data,
        }, status=status.HTTP_200_OK)


class FinanceOverviewAPIView(APIView):
    """
    Overview endpoint returning financial service status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "BudgetBuddy Financial Services are active.",
            "user": request.user.username,
            "role": request.user.role,
            "modules": [
                "Income Management",
                "Expense Tracking",
                "Monthly Budgets",
                "Savings Goals",
                "Notification Alerts",
                "Financial Reports"
            ]
        }, status=status.HTTP_200_OK)
