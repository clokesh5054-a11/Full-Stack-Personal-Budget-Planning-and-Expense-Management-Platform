from django.core.management.base import BaseCommand
from authentication.models import User, Profile
from finance.models import Income, Expense, Budget
from decimal import Decimal
from datetime import date

class Command(BaseCommand):
    help = "Seeds initial demo users and transactions for student accounts."

    def handle(self, *args, **options):
        # 1. Admin User
        admin_user, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@budgetbuddy.local",
                "first_name": "System",
                "last_name": "Admin",
                "role": User.ROLE_ADMIN,
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            admin_user.set_password("Admin@12345")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin / Admin@12345"))
        else:
            self.stdout.write("Admin user already exists.")

        # 2. Student User
        student_user, created = User.objects.get_or_create(
            username="rahul_student",
            defaults={
                "email": "rahul.student@college.edu",
                "first_name": "Rahul",
                "last_name": "Sharma",
                "role": User.ROLE_STUDENT,
                "phone_number": "9876543210",
            }
        )
        if created:
            student_user.set_password("Student@123")
            student_user.save()
            profile = student_user.profile
            profile.monthly_income = Decimal('8000.00')
            profile.currency = 'INR'
            profile.financial_goals_note = "Save for campus trip and new semester textbooks"
            profile.save()
            self.stdout.write(self.style.SUCCESS("Created student demo user: rahul_student / Student@123"))
        else:
            self.stdout.write("Student user already exists.")

        # Seed sample incomes for Rahul if not present
        if not Income.objects.filter(user=student_user).exists():
            Income.objects.create(
                user=student_user,
                title="Monthly Pocket Money",
                amount=Decimal('8000.00'),
                category='POCKET_MONEY',
                date=date(2026, 10, 1),
                description="Monthly allowance sent from home"
            )
            Income.objects.create(
                user=student_user,
                title="Department Merit Scholarship",
                amount=Decimal('3500.00'),
                category='SCHOLARSHIP',
                date=date(2026, 10, 5),
                description="Merit stipend for semester GPA"
            )
            Income.objects.create(
                user=student_user,
                title="Freelance Website UI Design",
                amount=Decimal('2200.00'),
                category='FREELANCE',
                date=date(2026, 10, 15),
                description="Designed landing page for college festival"
            )
            self.stdout.write(self.style.SUCCESS("Seeded sample incomes for rahul_student."))

        # Seed sample expenses for Rahul if not present
        if not Expense.objects.filter(user=student_user).exists():
            today = date.today()
            Expense.objects.create(
                user=student_user,
                title="College Canteen Lunch & Tea",
                amount=Decimal('180.00'),
                category='FOOD',
                payment_method='UPI',
                date=date(2026, 10, 2),
                notes="Lunch with study group"
            )
            Expense.objects.create(
                user=student_user,
                title="Monthly Metro & Bus Pass",
                amount=Decimal('650.00'),
                category='TRAVEL',
                payment_method='UPI',
                date=date(2026, 10, 3),
                notes="Campus transit recharge"
            )
            Expense.objects.create(
                user=student_user,
                title="Data Structures Lab Notebook & Xerox",
                amount=Decimal('340.00'),
                category='EDUCATION',
                payment_method='CASH',
                date=date(2026, 10, 8),
                notes="Lab manual printing"
            )
            Expense.objects.create(
                user=student_user,
                title="Weekend Pizza & Cafe Treat",
                amount=Decimal('520.00'),
                category='FOOD',
                payment_method='UPI',
                date=date(2026, 10, 12),
                notes="Birthday treat with hostel friends"
            )
            Expense.objects.create(
                user=student_user,
                title="Movie Tickets & Popcorn",
                amount=Decimal('380.00'),
                category='ENTERTAINMENT',
                payment_method='DEBIT_CARD',
                date=date(2026, 10, 18),
                notes="Weekend sci-fi movie"
            )
            Expense.objects.create(
                user=student_user,
                title="College Hoodie & T-shirt",
                amount=Decimal('890.00'),
                category='SHOPPING',
                payment_method='UPI',
                date=date(2026, 10, 20),
                notes="Campus store merchandise"
            )
            self.stdout.write(self.style.SUCCESS("Seeded sample expenses for rahul_student."))

        # Seed sample budgets for Rahul if not present
        if not Budget.objects.filter(user=student_user).exists():
            Budget.objects.create(
                user=student_user,
                category='FOOD',
                amount_limit=Decimal('2500.00'),
                month=10,
                year=2026,
                alert_threshold_percentage=80
            )
            Budget.objects.create(
                user=student_user,
                category='TRAVEL',
                amount_limit=Decimal('1200.00'),
                month=10,
                year=2026,
                alert_threshold_percentage=80
            )
            Budget.objects.create(
                user=student_user,
                category='EDUCATION',
                amount_limit=Decimal('1500.00'),
                month=10,
                year=2026,
                alert_threshold_percentage=75
            )
            Budget.objects.create(
                user=student_user,
                category='ENTERTAINMENT',
                amount_limit=Decimal('1000.00'),
                month=10,
                year=2026,
                alert_threshold_percentage=80
            )
            self.stdout.write(self.style.SUCCESS("Seeded sample monthly budgets for rahul_student."))

        # 3. Premium User
        premium_user, created = User.objects.get_or_create(
            username="ananya_pro",
            defaults={
                "email": "ananya.premium@domain.com",
                "first_name": "Ananya",
                "last_name": "Verma",
                "role": User.ROLE_PREMIUM,
                "phone_number": "9898989898",
            }
        )
        if created:
            premium_user.set_password("Premium@123")
            premium_user.save()
            profile = premium_user.profile
            profile.monthly_income = Decimal('25000.00')
            profile.currency = 'INR'
            profile.financial_goals_note = "Building investment portfolio & Japan Travel Fund"
            profile.save()
            self.stdout.write(self.style.SUCCESS("Created premium demo user: ananya_pro / Premium@123"))
        else:
            self.stdout.write("Premium user already exists.")

        self.stdout.write(self.style.SUCCESS("Successfully completed seeding demo data."))
