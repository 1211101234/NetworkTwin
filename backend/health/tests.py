from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class HealthViewTests(APITestCase):
    def test_health_endpoint_reports_application_and_database_status(self) -> None:
        response = self.client.get(reverse("health"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok", "database": "ok"})
