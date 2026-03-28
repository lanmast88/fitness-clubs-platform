from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Booking, PersonalTraining, WorkoutSession, WorkoutType
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    PersonalTrainingCreateSerializer,
    PersonalTrainingSerializer,
    WorkoutSessionSerializer,
    WorkoutTypeSerializer,
)


class WorkoutTypeViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Типы тренировок — только чтение для всех.

    list:     GET /api/v1/workout-types/
    retrieve: GET /api/v1/workout-types/{id}/
    """
    queryset           = WorkoutType.objects.all()
    serializer_class   = WorkoutTypeSerializer
    permission_classes = [AllowAny]


class WorkoutSessionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Тренировочные сессии.

    list:        GET  /api/v1/sessions/
    retrieve:    GET  /api/v1/sessions/{id}/
    book:        POST /api/v1/sessions/{id}/book/
    cancel_book: POST /api/v1/sessions/{id}/cancel-book/
    """
    serializer_class   = WorkoutSessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            WorkoutSession.objects
            .select_related('workout_type', 'trainer', 'room', 'club')
            .prefetch_related('bookings')
            .exclude(status=WorkoutSession.Status.CANCELLED)
            .order_by('start_ts')
        )

    @action(
    detail=True,
    methods=['post'],
    url_path='book',
    permission_classes=[IsAuthenticated],
    )
    def book(self, request, pk=None):
        session = get_object_or_404(WorkoutSession, pk=pk)  # ← без фильтра статуса

        serializer = BookingCreateSerializer(
            data={'session': session.id},
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='cancel-book',
        permission_classes=[IsAuthenticated],
    )
    def cancel_book(self, request, pk=None):
        """
        POST /api/v1/sessions/{id}/cancel-book/
        Отменить запись на тренировку.
        """
        session = self.get_object()

        booking = Booking.objects.filter(
            session=session,
            user=request.user,
        ).exclude(status=Booking.Status.CANCELLED).first()

        if not booking:
            return Response(
                {'detail': 'Вы не записаны на эту тренировку'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status'])

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_200_OK,
        )


class BookingViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Бронирования текущего пользователя — только чтение.

    list: GET /api/v1/bookings/
    """
    serializer_class   = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects
            .filter(user=self.request.user)
            .select_related('session__workout_type', 'session__trainer', 'session__room')
            .order_by('-created_at')
        )


class PersonalTrainingViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """
    Персональные тренировки текущего пользователя.

    list:     GET  /api/v1/personal-trainings/
    retrieve: GET  /api/v1/personal-trainings/{id}/
    create:   POST /api/v1/personal-trainings/
    cancel:   POST /api/v1/personal-trainings/{id}/cancel/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            PersonalTraining.objects
            .filter(client=self.request.user)
            .select_related('trainer')
            .order_by('-start_ts')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return PersonalTrainingCreateSerializer
        return PersonalTrainingSerializer

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        POST /api/v1/personal-trainings/{id}/cancel/
        Отменить персональную тренировку.
        """
        pt = self.get_object()

        if pt.status == PersonalTraining.Status.CANCELLED:
            return Response(
                {'detail': 'Тренировка уже отменена'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if pt.status == PersonalTraining.Status.COMPLETED:
            return Response(
                {'detail': 'Нельзя отменить завершённую тренировку'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pt.status = PersonalTraining.Status.CANCELLED
        pt.save(update_fields=['status'])

        return Response(
            PersonalTrainingSerializer(pt).data,
            status=status.HTTP_200_OK,
        )