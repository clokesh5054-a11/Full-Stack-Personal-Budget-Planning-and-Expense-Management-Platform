from django.test import TestCase
from decimal import Decimal
from datetime import date
from authentication.models import User
from finance.models import Income, Expense, Budget, SavingsGoal, Notification, Report

class FinanceModelsSchemaTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student_rahul",
            email="rahul@college.edu",
            password="Password@123",
            role=User.ROLE_STUDENT
        )

    def test_income_creation(self):
        income = Income.objects.create(
            user=self.user,
            title="Monthly Pocket Money",
            amount=Decimal('5000.00'),
            category='POCKET_MONEY',
            date=date.today(),
            description="Allowance received from parents"
        )
        self.assertEqual(income.user, self.user)
        self.assertEqual(income.amount, Decimal('5000.00'))
        self.assertEqual(income.category, 'POCKET_MONEY')

    def test_expense_creation(self):
        expense = Expense.objects.create(
            user=self.user,
            title="College Canteen Lunch",
            amount=Decimal('120.00'),
            category='FOOD',
            payment_method='UPI',
            date=date.today()
        )
        self.assertEqual(expense.amount, Decimal('120.00'))
        self.assertEqual(expense.category, 'FOOD')
        self.assertEqual(expense.payment_method, 'UPI')

    def test_budget_creation(self):
        budget = Budget.objects.create(
            user=self.user,
            category='FOOD',
            amount_limit=Decimal('2500.00'),
            month=10,
            year=2026,
            alert_threshold_percentage=80
        )
        self.assertEqual(budget.amount_limit, Decimal('2500.00'))
        self.assertEqual(budget.alert_threshold_percentage, 80)

    def test_savings_goal_creation(self):
        goal = SavingsGoal.objects.create(
            user=self.user,
            title="New Laptop Fund",
            target_amount=Decimal('60000.00'),
            current_amount=Decimal('15000.00'),
            target_date=date(2027, 3, 31),
            status='IN_PROGRESS'
        )
        self.assertEqual(goal.progress_percentage, 25.0)

    def test_notification_creation(self):
        notif = Notification.objects.create(
            user=self.user,
            title="Budget Alert",
            message="You have spent 85% of your food budget.",
            notification_type='BUDGET_ALERT'
        )
        self.assertFalse(notif.is_read)
        self.assertEqual(notif.notification_type, 'BUDGET_ALERT')

    def test_report_creation(self):
        report = Report.objects.create(
            user=self.user,
            title="October 2026 Financial Summary",
            report_type='MONTHLY',
            start_date=date(2026, 10, 1),
            end_date=date(2026, 10, 31),
            total_income=Decimal('8000.00'),
            total_expense=Decimal('4500.00'),
            net_savings=Decimal('3500.00'),
            summary_data={"food": 2000, "travel": 1500, "shopping": 1000}
        )
        self.assertEqual(report.net_savings, Decimal('3500.00'))
