from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        if not password:
            raise ValueError('Пароль обязателен')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser должен иметь is_staff=True')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser должен иметь is_superuser=True')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CLIENT  = 'client',  'Client'
        TRAINER = 'trainer', 'Trainer'
        ADMIN   = 'admin',   'Admin'

    email      = models.EmailField(unique=True, verbose_name='Email')
    phone      = models.CharField(max_length=50, blank=True, verbose_name='Телефон')
    role       = models.CharField(
        max_length=50, choices=Role.choices, default=Role.CLIENT, verbose_name='Роль'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата регистрации')

    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table            = 'user'
        verbose_name        = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering            = ['email']

    def __str__(self):
        return f'{self.email} ({self.get_role_display()})'

    @property
    def is_trainer(self):
        return self.role == self.Role.TRAINER

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT