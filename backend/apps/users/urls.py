from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import ChangePasswordView, LogoutView, MeView, RegisterView

urlpatterns = [
    # Аутентификация
    path('auth/register/',       RegisterView.as_view(),        name='auth-register'),
    path('auth/login/',          TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/',        TokenRefreshView.as_view(),    name='auth-refresh'),
    path('auth/logout/',         LogoutView.as_view(),          name='auth-logout'),

    # Профиль
    path('users/me/',                    MeView.as_view(),           name='users-me'),
    path('users/me/change-password/',    ChangePasswordView.as_view(), name='users-change-password'),
]