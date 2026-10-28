from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers  

from .models import User


class NormalizePhoneMixin:
    """
    Приводит пустой телефон к NULL.

    Телефон необязателен и при этом уникален. DRF для CharField на пустой
    строке делает ранний выход из run_validation и не запускает валидаторы
    поля — UniqueValidator не срабатывает, и второй пользователь с phone=''
    доходит до БД и падает с IntegrityError (500 вместо 400).

    Пустое значение означает «телефон не указан», поэтому сохраняем NULL:
    он не конфликтует с unique-ограничением.
    """

    def validate_phone(self, value):
        return value or None


class RegisterSerializer(NormalizePhoneMixin, serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
        )

    class Meta:
        model = User
        fields = ['email', 'password', 'phone']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(NormalizePhoneMixin, serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'role', 'created_at']
        read_only_fields = ['id', 'email', 'role', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Неверный старый пароль')
        return value
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()