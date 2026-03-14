from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import User

REGISTER_URL   = reverse('auth-register')
LOGIN_URL      = reverse('auth-login')
REFRESH_URL    = reverse('auth-refresh')
LOGOUT_URL     = reverse('auth-logout')
ME_URL         = reverse('users-me')
CHANGE_PWD_URL = reverse('users-change-password')

TEST_PASSWORD = 'TestPass123!'


def create_user(**kwargs):
    defaults = {
        'email':    'test@test.com',
        'password': TEST_PASSWORD,
        'phone':    '+1234567890',
    }
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def login(client, email='test@test.com', password=TEST_PASSWORD):
    response = client.post(LOGIN_URL, {'email': email, 'password': password}, format='json')
    return response.data


class RegisterTests(APITestCase):

    def test_register_success(self):
        payload = {
            'email':    'new@test.com',
            'password': TEST_PASSWORD,
            'phone':    '+1234567890',
        }
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], payload['email'])
        self.assertEqual(response.data['user']['phone'], payload['phone'])

    def test_register_no_phone(self):
        payload = {'email': 'nophone@test.com', 'password': TEST_PASSWORD}
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_duplicate_email(self):
        create_user()
        payload = {'email': 'test@test.com', 'password': TEST_PASSWORD}
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        payload = {'email': 'weak@test.com', 'password': '123'}
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_email(self):
        payload = {'password': TEST_PASSWORD}
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_password(self):
        payload = {'email': 'test@test.com'}
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_phone(self):
        create_user(email='first@test.com', phone='+79991234567')
        payload = {
            'email':    'second@test.com',
            'password': TEST_PASSWORD,
            'phone':    '+79991234567',
        }
        response = self.client.post(REGISTER_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):

    def setUp(self):
        self.user = create_user()

    def test_login_success(self):
        response = self.client.post(
            LOGIN_URL,
            {'email': 'test@test.com', 'password': TEST_PASSWORD},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        response = self.client.post(
            LOGIN_URL,
            {'email': 'test@test.com', 'password': 'WrongPass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_wrong_email(self):
        response = self.client.post(
            LOGIN_URL,
            {'email': 'wrong@test.com', 'password': TEST_PASSWORD},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        response = self.client.post(
            LOGIN_URL,
            {'email': 'test@test.com', 'password': TEST_PASSWORD},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RefreshTests(APITestCase):

    def setUp(self):
        create_user()
        tokens = login(self.client)
        self.refresh_token = tokens['refresh']

    def test_refresh_success(self):
        response = self.client.post(REFRESH_URL, {'refresh': self.refresh_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_invalid_token(self):
        response = self.client.post(REFRESH_URL, {'refresh': 'invalidtoken'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTests(APITestCase):

    def setUp(self):
        create_user()
        tokens = login(self.client)
        self.access_token  = tokens['access']
        self.refresh_token = tokens['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_logout_success(self):
        response = self.client.post(LOGOUT_URL, {'refresh': self.refresh_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_logout_token_blacklisted(self):
        self.client.post(LOGOUT_URL, {'refresh': self.refresh_token}, format='json')
        response = self.client.post(REFRESH_URL, {'refresh': self.refresh_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_unauthenticated(self):
        self.client.credentials()
        response = self.client.post(LOGOUT_URL, {'refresh': self.refresh_token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeTests(APITestCase):

    def setUp(self):
        create_user()
        tokens = login(self.client)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

    def test_get_me_success(self):
        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@test.com')
        self.assertNotIn('password', response.data)

    def test_get_me_unauthenticated(self):
        self.client.credentials()
        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_phone(self):
        response = self.client.patch(ME_URL, {'phone': '+70000000000'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '+70000000000')

    def test_cannot_update_email(self):
        response = self.client.patch(ME_URL, {'email': 'new@test.com'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@test.com')

    def test_cannot_update_role(self):
        response = self.client.patch(ME_URL, {'role': 'admin'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'client')


class ChangePasswordTests(APITestCase):

    def setUp(self):
        create_user()
        tokens = login(self.client)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

    def test_change_password_success(self):
        payload = {'old_password': TEST_PASSWORD, 'new_password': 'NewTestPass456!'}
        response = self.client.post(CHANGE_PWD_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        login_response = self.client.post(
            LOGIN_URL,
            {'email': 'test@test.com', 'password': 'NewTestPass456!'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_change_password_wrong_old(self):
        payload = {'old_password': 'WrongPass123!', 'new_password': 'NewTestPass456!'}
        response = self.client.post(CHANGE_PWD_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_weak_new(self):
        payload = {'old_password': TEST_PASSWORD, 'new_password': '123'}
        response = self.client.post(CHANGE_PWD_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_unauthenticated(self):
        self.client.credentials()
        payload = {'old_password': TEST_PASSWORD, 'new_password': 'NewTestPass456!'}
        response = self.client.post(CHANGE_PWD_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)