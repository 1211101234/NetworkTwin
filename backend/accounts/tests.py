from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


class AuthenticationViewTests(APITestCase):
    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="operator.one",
            password="test-password-123",
            first_name="Operator",
            last_name="One",
        )
        self.user.groups.add(Group.objects.get(name="Operator"))

    def test_login_requires_csrf_and_returns_the_user_role(self) -> None:
        client = APIClient(enforce_csrf_checks=True)
        csrf_response = client.get(reverse("auth-csrf"))
        csrf_token = csrf_response.json()["csrfToken"]

        response = client.post(
            reverse("auth-login"),
            {"username": "operator.one", "password": "test-password-123"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["displayName"], "Operator One")
        self.assertEqual(response.json()["roles"], ["Operator"])
        self.assertFalse(response.json()["isAdministrator"])

    def test_login_without_csrf_is_rejected(self) -> None:
        client = APIClient(enforce_csrf_checks=True)
        response = client.post(
            reverse("auth-login"),
            {"username": "operator.one", "password": "test-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_current_user_and_logout_follow_the_session_lifecycle(self) -> None:
        self.client.force_login(self.user)

        current_user = self.client.get(reverse("auth-current-user"))
        logout_response = self.client.post(reverse("auth-logout"))
        after_logout = self.client.get(reverse("auth-current-user"))

        self.assertEqual(current_user.status_code, status.HTTP_200_OK)
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(after_logout.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_credentials_do_not_reveal_which_field_failed(self) -> None:
        response = self.client.post(
            reverse("auth-login"),
            {"username": "operator.one", "password": "wrong-password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid username or password.", str(response.json()))

    def test_registration_hashes_password_and_assigns_viewer_role(self) -> None:
        client = APIClient(enforce_csrf_checks=True)
        csrf_token = client.get(reverse("auth-csrf")).json()["csrfToken"]

        response = client.post(
            reverse("auth-register"),
            {"username": "new.viewer", "password": "SafePass!9"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = get_user_model().objects.get(username="new.viewer")
        self.assertTrue(created_user.check_password("SafePass!9"))
        self.assertNotEqual(created_user.password, "SafePass!9")
        self.assertEqual(
            list(created_user.groups.values_list("name", flat=True)),
            ["Viewer"],
        )

    def test_registration_rejects_duplicate_user_id_case_insensitively(self) -> None:
        response = self.client.post(
            reverse("auth-register"),
            {"username": "Operator.One", "password": "SafePass!9"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already registered", str(response.json()))

    def test_registration_enforces_password_requirements(self) -> None:
        invalid_passwords = ("NoNumber!", "NoSpecial9", "Short!9")

        for index, password in enumerate(invalid_passwords):
            with self.subTest(password=password):
                response = self.client.post(
                    reverse("auth-register"),
                    {"username": f"new-user-{index}", "password": password},
                    format="json",
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn("password", response.json())

    def test_registration_without_csrf_is_rejected(self) -> None:
        client = APIClient(enforce_csrf_checks=True)

        response = client.post(
            reverse("auth-register"),
            {"username": "new.viewer", "password": "SafePass!9"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
