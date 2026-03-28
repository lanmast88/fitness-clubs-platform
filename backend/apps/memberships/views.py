from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Membership, MembershipPlan
from .serializers import (
    MembershipCreateSerializer,
    MembershipFreezeSerializer,
    MembershipPlanSerializer,
    MembershipSerializer,
)


class MembershipPlanViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Тарифные планы — только чтение для всех пользователей.

    list:     GET /api/v1/membership-plans/
    retrieve: GET /api/v1/membership-plans/{id}/
    """
    queryset           = MembershipPlan.objects.all()
    serializer_class   = MembershipPlanSerializer
    permission_classes = [AllowAny]


class MembershipViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Абонементы текущего пользователя.

    list:     GET  /api/v1/memberships/
    retrieve: GET  /api/v1/memberships/{id}/
    create:   POST /api/v1/memberships/
    freeze:   POST /api/v1/memberships/{id}/freeze/
    cancel:   POST /api/v1/memberships/{id}/cancel/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Membership.objects
            .filter(user=self.request.user)
            .select_related('plan', 'club')
            .prefetch_related('freezes')
            .order_by('-start_date')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return MembershipCreateSerializer
        return MembershipSerializer

    @action(detail=True, methods=['post'], url_path='freeze')
    def freeze(self, request, pk=None):
        """
        POST /api/v1/memberships/{id}/freeze/
        Заморозить абонемент на указанный период.

        Body: { "from_date": "YYYY-MM-DD", "to_date": "YYYY-MM-DD" }
        """
        membership = self.get_object()

        serializer = MembershipFreezeSerializer(
            data=request.data,
            context={'membership': membership},
        )
        serializer.is_valid(raise_exception=True)
        freeze = serializer.save()

        membership.status = Membership.Status.FROZEN
        membership.save(update_fields=['status'])

        return Response(
            MembershipFreezeSerializer(freeze).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        POST /api/v1/memberships/{id}/cancel/
        Отменить абонемент.
        """
        membership = self.get_object()

        if membership.status == Membership.Status.CANCELLED:
            return Response(
                {'detail': 'Абонемент уже отменён'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if membership.status == Membership.Status.EXPIRED:
            return Response(
                {'detail': 'Нельзя отменить истёкший абонемент'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership.status = Membership.Status.CANCELLED
        membership.save(update_fields=['status'])

        return Response(
            MembershipSerializer(membership).data,
            status=status.HTTP_200_OK,
        )