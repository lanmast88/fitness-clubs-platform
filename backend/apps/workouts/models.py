from datetime import timedelta

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.clubs.models import Club, Room
from apps.users.models import User


class WorkoutType(models.Model):
    title            = models.CharField(max_length=255, verbose_name='Название')
    description      = models.TextField(blank=True, verbose_name='Описание')
    default_duration = models.PositiveIntegerField(help_text='Длительность в минутах', verbose_name='Длительность (мин.)')

    class Meta:
        db_table            = 'workout_type'
        verbose_name        = 'Тип тренировки'
        verbose_name_plural = 'Типы тренировок'
        ordering            = ['title']

    def clean(self):
        if self.default_duration == 0:
            raise ValidationError({'default_duration': 'Длительность должна быть больше нуля'})

    def __str__(self):
        return f'{self.title} ({self.default_duration} мин.)'


class WorkoutSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Запланирована'
        ONGOING   = 'ongoing',   'Идёт'
        COMPLETED = 'completed', 'Завершена'
        CANCELLED = 'cancelled', 'Отменена'

    club         = models.ForeignKey(Club,        on_delete=models.CASCADE,  related_name='workout_sessions', verbose_name='Клуб')
    room         = models.ForeignKey(Room,        on_delete=models.CASCADE,  related_name='workout_sessions', verbose_name='Зал')
    trainer      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='trainer_sessions',
        limit_choices_to={'role': User.Role.TRAINER},
        verbose_name='Тренер',
    )
    workout_type = models.ForeignKey(WorkoutType, on_delete=models.PROTECT,  related_name='sessions', verbose_name='Тип тренировки')
    start_ts     = models.DateTimeField(verbose_name='Начало')
    end_ts       = models.DateTimeField(verbose_name='Конец')
    capacity     = models.PositiveIntegerField(verbose_name='Вместимость')
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED, verbose_name='Статус')

    class Meta:
        db_table            = 'workout_session'
        verbose_name        = 'Тренировка'
        verbose_name_plural = 'Тренировки'
        ordering            = ['-start_ts']

    def clean(self):
        errors = {}

        if self.start_ts and self.end_ts:
            if self.end_ts <= self.start_ts:
                errors['end_ts'] = 'Время окончания должно быть позже времени начала'

        if self.room_id and self.capacity:
            try:
                if self.capacity > self.room.capacity:
                    errors['capacity'] = (
                        f'Вместимость сессии ({self.capacity}) '
                        f'превышает вместимость зала ({self.room.capacity})'
                    )
            except Room.DoesNotExist:
                pass

        if self.room_id and self.club_id:
            try:
                if self.room.club_id != self.club_id:
                    errors['room'] = 'Выбранный зал не принадлежит указанному клубу'
            except Room.DoesNotExist:
                pass

        if self.trainer_id and self.start_ts and self.end_ts:
            overlapping = WorkoutSession.objects.filter(
                trainer_id=self.trainer_id,
                start_ts__lt=self.end_ts,
                end_ts__gt=self.start_ts,
            ).exclude(status=self.Status.CANCELLED)
            if self.pk:
                overlapping = overlapping.exclude(pk=self.pk)
            if overlapping.exists():
                errors['trainer'] = 'У тренера уже есть тренировка в это время'

        if self.room_id and self.start_ts and self.end_ts:
            overlapping = WorkoutSession.objects.filter(
                room_id=self.room_id,
                start_ts__lt=self.end_ts,
                end_ts__gt=self.start_ts,
            ).exclude(status=self.Status.CANCELLED)
            if self.pk:
                overlapping = overlapping.exclude(pk=self.pk)
            if overlapping.exists():
                errors['room'] = 'Зал уже занят в это время'

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'{self.workout_type} — {self.start_ts:%d.%m.%Y %H:%M} ({self.get_status_display()})'

    @property
    def spots_available(self):
        confirmed = self.bookings.exclude(status=Booking.Status.CANCELLED).count()
        return self.capacity - confirmed


class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Подтверждена'
        CANCELLED = 'cancelled', 'Отменена'
        ATTENDED  = 'attended',  'Посещена'

    session    = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='bookings', verbose_name='Тренировка')
    user       = models.ForeignKey(User,           on_delete=models.CASCADE, related_name='bookings', verbose_name='Пользователь')
    status     = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED, verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата записи')

    class Meta:
        db_table            = 'booking'
        verbose_name        = 'Запись'
        verbose_name_plural = 'Записи'
        unique_together     = ('session', 'user')
        ordering            = ['-created_at']

    def clean(self):
        errors = {}

        if self.session_id and self.user_id:
            try:
                if self.session.trainer_id == self.user_id:
                    errors['user'] = 'Тренер не может записаться на своё занятие'

                if self.session.status == WorkoutSession.Status.CANCELLED:
                    errors['session'] = 'Нельзя записаться на отменённую тренировку'

                if self.session.status == WorkoutSession.Status.COMPLETED:
                    errors['session'] = 'Нельзя записаться на завершённую тренировку'

                if not self.pk and self.status == self.Status.CONFIRMED:
                    confirmed = self.session.bookings.exclude(
                        status=self.Status.CANCELLED
                    ).count()
                    if confirmed >= self.session.capacity:
                        errors['session'] = 'Нет свободных мест на эту тренировку'

            except WorkoutSession.DoesNotExist:
                pass

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'{self.user} → {self.session} ({self.get_status_display()})'


class PersonalTraining(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Запланирована'
        COMPLETED = 'completed', 'Завершена'
        CANCELLED = 'cancelled', 'Отменена'

    trainer          = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='pt_as_trainer',
        limit_choices_to={'role': User.Role.TRAINER},
        verbose_name='Тренер',
    )
    client           = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='pt_as_client',
        verbose_name='Клиент',
    )
    start_ts         = models.DateTimeField(verbose_name='Начало')
    duration_minutes = models.PositiveIntegerField(verbose_name='Длительность (мин.)')
    status           = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED, verbose_name='Статус')

    class Meta:
        db_table            = 'personal_training'
        verbose_name        = 'Персональная тренировка'
        verbose_name_plural = 'Персональные тренировки'
        ordering            = ['-start_ts']

    def clean(self):
        errors = {}

        if self.trainer_id and self.client_id:
            if self.trainer_id == self.client_id:
                errors['client'] = 'Тренер и клиент не могут быть одним человеком'

        if self.duration_minutes == 0:
            errors['duration_minutes'] = 'Длительность должна быть больше нуля'

        if not self.pk and self.start_ts:
            if self.start_ts < timezone.now():
                errors['start_ts'] = 'Нельзя назначить тренировку в прошлом'

        if self.trainer_id and self.start_ts and self.duration_minutes:
            end_ts = self.start_ts + timedelta(minutes=self.duration_minutes)
            overlapping = PersonalTraining.objects.filter(
                trainer_id=self.trainer_id,
                start_ts__lt=end_ts,
            ).exclude(status=self.Status.CANCELLED)
            if self.pk:
                overlapping = overlapping.exclude(pk=self.pk)
            for pt in overlapping:
                pt_end = pt.start_ts + timedelta(minutes=pt.duration_minutes)
                if pt_end > self.start_ts:
                    errors['trainer'] = 'У тренера уже есть тренировка в это время'
                    break

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'PT: {self.trainer} + {self.client} — {self.start_ts:%d.%m.%Y %H:%M}'