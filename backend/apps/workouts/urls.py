from rest_framework.routers import DefaultRouter

from .views import (
    BookingViewSet,
    PersonalTrainingViewSet,
    WorkoutSessionViewSet,
    WorkoutTypeViewSet,
)

router = DefaultRouter()
router.register(r'workout-types',      WorkoutTypeViewSet,      basename='workout-type')
router.register(r'sessions',           WorkoutSessionViewSet,   basename='session')
router.register(r'bookings',           BookingViewSet,          basename='booking')
router.register(r'personal-trainings', PersonalTrainingViewSet, basename='personal-training')

urlpatterns = router.urls