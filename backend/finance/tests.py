from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import date
from authentication.models import User
from finance.models import Income, Expense, Budget, SavingsGoal, Notification, Report

class Milestone2FinanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="student_user",
            email="student@campus.edu",
            password="Password@123",
            role=User.ROLE_STUDENT
        )
        self.client.force_authenticate(user=self.user)

        self.income_list_url = reverse('finance:income-list')
        self.expense_list_url = reverse('finance:expense-list')
        self.budget_list_url = reverse('finance:budget-list')
        self.transactions_url = reverse('finance:transactions')
        self.stats_url = reverse('finance:dashboard_stats')

    def test_create_and_list_income(self):
        payload = {
            "title": "Monthly Pocket Money",
            "amount": "6000.00",
            "category": "POCKET_MONEY",
            "date": "2026-10-01",
            "description": "Parents allowance for October"
        }
        create_res = self.client.post(self.income_list_url, payload, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_res.data['title'], "Monthly Pocket Money")
        self.assertEqual(float(create_res.data['amount']), 6000.00)

        # List incomes
        list_res = self.client.get(self.income_list_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        # Handle paginated or unpaginated response
        results = list_res.data.get('results', list_res.data)
        self.assertEqual(len(results), 1)

    def test_create_and_update_expense(self):
        payload = {
            "title": "Textbooks & Stationeries",
            "amount": "850.00",
            "category": "EDUCATION",
            "payment_method": "UPI",
            "date": "2026-10-05",
            "notes": "Bought operating systems guide"
        }
        res = self.client.post(self.expense_list_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        expense_id = res.data['id']

        # Update expense
        detail_url = reverse('finance:expense-detail', kwargs={'pk': expense_id})
        update_res = self.client.patch(detail_url, {"amount": "900.00"}, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.assertEqual(float(update_res.data['amount']), 900.00)

    def test_budget_creation_and_utilization(self):
        # Create an expense in FOOD
        Expense.objects.create(
            user=self.user,
            title="Canteen Lunch",
            amount=Decimal('500.00'),
            category='FOOD',
            date=date(2026, 10, 10)
        )

        # Create a budget for FOOD in October 2026 with limit 2000
        budget_payload = {
            "category": "FOOD",
            "amount_limit": "2000.00",
            "month": 10,
            "year": 2026,
            "alert_threshold_percentage": 80
        }
        res = self.client.post(self.budget_list_url, budget_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        
        # Verify calculated fields
        self.assertEqual(res.data['spent_amount'], 500.00)
        self.assertEqual(res.data['remaining_amount'], 1500.00)
        self.assertEqual(res.data['utilization_percentage'], 25.0)
        self.assertFalse(res.data['is_over_budget'])
        self.assertFalse(res.data['is_near_limit'])

    def test_unified_transactions_feed(self):
        Income.objects.create(
            user=self.user,
            title="Scholarship Disbursal",
            amount=Decimal('4000.00'),
            category='SCHOLARSHIP',
            date=date(2026, 10, 2)
        )
        Expense.objects.create(
            user=self.user,
            title="Campus Bus Pass",
            amount=Decimal('600.00'),
            category='TRAVEL',
            date=date(2026, 10, 3)
        )

        res = self.client.get(self.transactions_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)
        tx_types = [tx['type'] for tx in res.data['results']]
        self.assertIn('income', tx_types)
        self.assertIn('expense', tx_types)

    def test_dashboard_stats_api(self):
        Income.objects.create(
            user=self.user,
            title="Pocket Money",
            amount=Decimal('5000.00'),
            category='POCKET_MONEY',
            date=date(2026, 10, 1)
        )
        Expense.objects.create(
            user=self.user,
            title="Dining Out",
            amount=Decimal('1200.00'),
            category='FOOD',
            date=date(2026, 10, 4)
        )

        res = self.client.get(f"{self.stats_url}?month=10&year=2026")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['monthly_income'], 5000.00)
        self.assertEqual(res.data['monthly_expense'], 1200.00)
        self.assertEqual(res.data['monthly_balance'], 3800.00)
        self.assertEqual(len(res.data['category_expenses']), 1)
