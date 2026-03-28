from rest_framework.routers import DefaultRouter

from .views import MembershipPlanViewSet, MembershipViewSet

router = DefaultRouter()
router.register(r'membership-plans', MembershipPlanViewSet, basename='membership-plan')
router.register(r'memberships',      MembershipViewSet,     basename='membership')

urlpatterns = router.urls