from rest_framework import serializers

from apps.users.models import User
from .models import Booking, PersonalTraining, WorkoutSession, WorkoutType


class WorkoutTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkoutType
        fields = ['id', 'title', 'description', 'default_duration']
        read_only_fields = ['id']


class TrainerSerializer(serializers.ModelSerializer):
    """Облегчённое представление тренера внутри сессии."""
    class Meta:
        model  = User
        fields = ['id', 'email', 'phone']
        read_only_fields = ['id', 'email', 'phone']


class WorkoutSessionSerializer(serializers.ModelSerializer):
    workout_type   = WorkoutTypeSerializer(read_only=True)
    trainer        = TrainerSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    spots_left     = serializers.SerializerMethodField()
    duration       = serializers.SerializerMethodField()

    class Meta:
        model  = WorkoutSession
        fields = [
            'id', 'club', 'room', 'workout_type', 'trainer',
            'start_ts', 'end_ts', 'duration', 'capacity', 'spots_left',
            'status', 'status_display',
        ]
        read_only_fields = ['id', 'status']

    def get_spots_left(self, obj):
        confirmed = obj.bookings.exclude(status=Booking.Status.CANCELLED).count()
        return max(obj.capacity - confirmed, 0)

    def get_duration(self, obj):
        delta = obj.end_ts - obj.start_ts
        return int(delta.total_seconds() // 60)


class BookingSerializer(serializers.ModelSerializer):
    session        = WorkoutSessionSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = Booking
        fields = ['id', 'session', 'status', 'status_display', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания бронирования.
    Пользователь передаёт только session_id.
    """
    class Meta:
        model  = Booking
        fields = ['session']

    def validate_session(self, session):
        user = self.context['request'].user

        if session.status == WorkoutSession.Status.CANCELLED:
            raise serializers.ValidationError('Нельзя записаться на отменённую тренировку')

        if session.status == WorkoutSession.Status.COMPLETED:
            raise serializers.ValidationError('Нельзя записаться на завершённую тренировку')

        if session.trainer_id == user.id:
            raise serializers.ValidationError('Тренер не может записаться на своё занятие')

        already_booked = Booking.objects.filter(
            session=session,
            user=user,
        ).exclude(status=Booking.Status.CANCELLED).exists()
        if already_booked:
            raise serializers.ValidationError('Вы уже записаны на эту тренировку')

        confirmed = session.bookings.exclude(status=Booking.Status.CANCELLED).count()
        if confirmed >= session.capacity:
            raise serializers.ValidationError('Нет свободных мест на эту тренировку')

        return session

    def create(self, validated_data):
        return Booking.objects.create(
            user=self.context['request'].user,
            session=validated_data['session'],
            status=Booking.Status.CONFIRMED,
        )


class PersonalTrainingSerializer(serializers.ModelSerializer):
    trainer        = TrainerSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model  = PersonalTraining
        fields = [
            'id', 'trainer', 'client', 'start_ts',
            'duration_minutes', 'status', 'status_display',
        ]
        read_only_fields = ['id', 'client', 'status']


class PersonalTrainingCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания персональной тренировки.
    Клиент выбирает тренера, время и длительность.
    """
    class Meta:
        model  = PersonalTraining
        fields = ['trainer', 'start_ts', 'duration_minutes']

    def validate_trainer(self, trainer):
        if not trainer.is_trainer:
            raise serializers.ValidationError('Выбранный пользователь не является тренером')
        return trainer

    def validate(self, attrs):
        user    = self.context['request'].user
        trainer = attrs['trainer']

        if trainer.id == user.id:
            raise serializers.ValidationError(
                {'trainer': 'Нельзя записаться к себе на тренировку'}
            )

        return attrs

    def create(self, validated_data):
        return PersonalTraining.objects.create(
            client=self.context['request'].user,
            **validated_data,
        )