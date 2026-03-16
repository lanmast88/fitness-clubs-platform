from rest_framework_nested import routers

from .views import ClubViewSet, RoomViewSet

router = routers.DefaultRouter()
router.register(r'clubs', ClubViewSet, basename='club')

clubs_router = routers.NestedDefaultRouter(router, r'clubs', lookup='club')
clubs_router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = router.urls + clubs_router.urls