from datetime import date

from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Club, Room
from .serializers import (
    ClubListSerializer,
    ClubSerializer,
    RoomSerializer,
    ScheduleSessionSerializer,
)

class ClubViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Клубы сети — только чтение для всех пользователей.
 
    list:     GET /api/v1/clubs/
    retrieve: GET /api/v1/clubs/{id}/
    schedule: GET /api/v1/clubs/{id}/schedule/?date=2026-03-15
    """

    queryset = Club.objects.prefetch_related('rooms').order_by('name')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return ClubListSerializer
        return ClubSerializer
    
    @action(detail=True, methods=['get'], url_path='schedule')
    def schedule(self, request, pk=None):
        """
        Расписание тренировок клуба на конкретный день.
 
        Query params:
            date (str): дата в формате YYYY-MM-DD, по умолчанию сегодня
 
        Returns:
            Список сессий отсортированных по времени начала.
        """
        club = self.get_object()
        date_param = request.query_params.get('date', str(date.today()))

        try:
            parsed_date = date.fromisoformat(date_param)
        except ValueError:
            return Response(
                {'error': 'Неверный формат даты. Ожидается YYYY-MM-DD.'},
                status=400
            )
        
        sessions = (
            club.workout_sessions
            .filter(start_ts__date=parsed_date)
            .exclude(status='cancelled')
            .select_related('workout_type', 'trainer', 'room')
            .prefetch_related('bookings')
            .order_by('start_ts')
        )

        serializer = ScheduleSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
class RoomViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Залы клуба — только чтение.
 
    list:     GET /api/v1/clubs/{club_pk}/rooms/
    retrieve: GET /api/v1/clubs/{club_pk}/rooms/{id}/
    """

    serializer_class = RoomSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        club = get_object_or_404(Club, pk=self.kwargs['club_pk'])
        return Room.objects.filter(club=club).order_by('name')