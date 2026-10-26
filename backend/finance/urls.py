from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IncomeViewSet,
    ExpenseViewSet,
    BudgetViewSet,
    TransactionHistoryAPIView,
    DashboardSummaryAPIView,
    FinanceOverviewAPIView,
)

app_name = 'finance'

router = DefaultRouter()
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
    path('transactions/', TransactionHistoryAPIView.as_view(), name='transactions'),
    path('stats/', DashboardSummaryAPIView.as_view(), name='dashboard_stats'),
    path('overview/', FinanceOverviewAPIView.as_view(), name='finance_overview'),
    path('', include(router.urls)),
]
