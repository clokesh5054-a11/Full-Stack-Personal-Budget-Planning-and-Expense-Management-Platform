from django.core.management.base import BaseCommand
from authentication.models import User, Profile
from decimal import Decimal

class Command(BaseCommand):
    help = "Seeds initial demo users for Student, Premium User, and Admin roles."

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
            # Update profile defaults
            profile = student_user.profile
            profile.monthly_income = Decimal('8000.00')
            profile.currency = 'INR'
            profile.financial_goals_note = "Save for campus trip and new semester textbooks"
            profile.save()
            self.stdout.write(self.style.SUCCESS("Created student demo user: rahul_student / Student@123"))
        else:
            self.stdout.write("Student user already exists.")

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

        self.stdout.write(self.style.SUCCESS("Successfully completed seeding demo users."))
