from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import User, Profile

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('authentication:register')
        self.login_url = reverse('authentication:login')
        self.profile_url = reverse('authentication:user_profile')
        self.current_user_url = reverse('authentication:current_user')

        self.user_data = {
            "username": "student_test",
            "email": "student@test.com",
            "password": "Password@123",
            "confirm_password": "Password@123",
            "first_name": "Test",
            "last_name": "User",
            "role": User.ROLE_STUDENT,
            "phone_number": "9123456780"
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['username'], 'student_test')
        self.assertEqual(response.data['user']['role'], 'STUDENT')
        
        # Verify Profile was auto-created by signal
        user = User.objects.get(username='student_test')
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.currency, 'INR')

    def test_registration_password_mismatch(self):
        bad_data = self.user_data.copy()
        bad_data['confirm_password'] = 'WrongPassword'
        response = self.client.post(self.register_url, bad_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)

    def test_user_login_success(self):
        # Register first
        self.client.post(self.register_url, self.user_data, format='json')

        # Login with username
        login_payload = {
            "username_or_email": "student_test",
            "password": "Password@123"
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['user']['email'], "student@test.com")

    def test_user_login_with_email(self):
        self.client.post(self.register_url, self.user_data, format='json')
        login_payload = {
            "username_or_email": "student@test.com",
            "password": "Password@123"
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['tokens'])

    def test_profile_update(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        token = reg_resp.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        update_data = {
            "monthly_income": 12500.00,
            "currency": "INR",
            "financial_goals_note": "Save for semester laptop"
        }
        response = self.client.put(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['profile']['monthly_income']), 12500.00)
        self.assertEqual(response.data['profile']['financial_goals_note'], "Save for semester laptop")
