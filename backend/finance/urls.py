from django.urls import path
from .views import FinanceOverviewAPIView

app_name = 'finance'

urlpatterns = [
    path('overview/', FinanceOverviewAPIView.as_view(), name='finance_overview'),
]
