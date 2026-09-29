from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    authentication_classes: list[type] = []
    permission_classes: list[type] = []

    @extend_schema(
        responses={
            200: {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "ok"},
                    "database": {"type": "string", "example": "ok"},
                },
                "required": ["status", "database"],
            }
        }
    )
    def get(self, request: Request) -> Response:
        del request
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        return Response({"status": "ok", "database": "ok"})
