from django.contrib.auth import authenticate, get_user_model, password_validation
from django.contrib.auth.models import AbstractBaseUser, Group
from django.db import IntegrityError, transaction
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(max_length=128, trim_whitespace=False, write_only=True)

    def validate(self, attrs: dict[str, object]) -> dict[str, object]:
        request = self.context["request"]
        user = authenticate(
            request=request,
            username=str(attrs["username"]),
            password=str(attrs["password"]),
        )
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs

    def authenticated_user(self) -> AbstractBaseUser:
        return self.validated_data["user"]


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(max_length=128, trim_whitespace=False, write_only=True)

    def validate_username(self, value: str) -> str:
        if get_user_model().objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This User ID is already registered.")
        return value

    def validate_password(self, value: str) -> str:
        if not any(character.isdigit() for character in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not any(not character.isalnum() and not character.isspace() for character in value):
            raise serializers.ValidationError(
                "Password must contain at least one special character."
            )
        password_validation.validate_password(value)
        return value

    def create(self, validated_data: dict[str, str]) -> AbstractBaseUser:
        user_model = get_user_model()
        try:
            with transaction.atomic():
                user = user_model.objects.create_user(**validated_data)
                viewer_group, _ = Group.objects.get_or_create(name="Viewer")
                user.groups.add(viewer_group)
        except IntegrityError as error:
            raise serializers.ValidationError(
                {"username": ["This User ID is already registered."]}
            ) from error
        return user


class CurrentUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    displayName = serializers.CharField(source="get_full_name")  # noqa: N815
    roles = serializers.ListField(child=serializers.CharField())
    isAdministrator = serializers.BooleanField()  # noqa: N815
