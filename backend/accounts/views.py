from django.contrib.auth import login, logout
from django.contrib.auth.models import AbstractBaseUser
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from accounts.serializers import CurrentUserSerializer, LoginSerializer, RegisterSerializer


def _user_data(user: AbstractBaseUser) -> dict[str, object]:
    group_names = list(user.groups.order_by("name").values_list("name", flat=True))
    return {
        "id": user.pk,
        "username": user.get_username(),
        "get_full_name": user.get_full_name() or user.get_username(),
        "roles": ["Administrator"] if user.is_superuser else group_names,
        "isAdministrator": user.is_superuser or "Administrator" in group_names,
    }


class CsrfView(APIView):
    authentication_classes: list[type] = []
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    @extend_schema(
        responses={
            200: {
                "type": "object",
                "properties": {"csrfToken": {"type": "string"}},
            }
        }
    )
    def get(self, request: Request) -> Response:
        return Response({"csrfToken": get_token(request)})


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    authentication_classes: list[type] = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @extend_schema(request=LoginSerializer, responses={200: CurrentUserSerializer})
    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.authenticated_user()
        login(request, user)
        return Response(CurrentUserSerializer(_user_data(user)).data)


@method_decorator(csrf_protect, name="dispatch")
class RegisterView(APIView):
    authentication_classes: list[type] = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "registration"

    @extend_schema(request=RegisterSerializer, responses={201: None})
    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={200: CurrentUserSerializer, 401: dict})
    def get(self, request: Request) -> Response:
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(CurrentUserSerializer(_user_data(request.user)).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={204: None})
    def post(self, request: Request) -> Response:
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
