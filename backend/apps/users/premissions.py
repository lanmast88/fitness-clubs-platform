from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Доступ только для пользователей с ролью Admin."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.ADMIN
        )


class IsTrainer(BasePermission):
    """Доступ только для пользователей с ролью Trainer."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.TRAINER
        )


class IsClient(BasePermission):
    """Доступ только для пользователей с ролью Client."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.CLIENT
        )


class IsAdminOrTrainer(BasePermission):
    """Доступ для Admin или Trainer."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in (
                request.user.Role.ADMIN,
                request.user.Role.TRAINER,
            )
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Доступ к объекту если пользователь является его владельцем или админом.
    Требует что объект имеет поле user или client.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == request.user.Role.ADMIN:
            return True

        # поддерживаем модели с разными полями владельца
        owner = getattr(obj, 'user', None) or getattr(obj, 'client', None)
        return owner == request.user