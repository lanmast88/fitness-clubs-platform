from django.core.exceptions import ValidationError
from django.db import models


class Club(models.Model):
    name     = models.CharField(max_length=255, verbose_name='Название')
    address  = models.TextField(verbose_name='Адрес')
    phone    = models.CharField(max_length=50, verbose_name='Телефон')
    timezone = models.CharField(max_length=50, verbose_name='Часовой пояс')

    class Meta:
        db_table            = 'club'
        verbose_name        = 'Клуб'
        verbose_name_plural = 'Клубы'
        ordering            = ['name']

    def __str__(self):
        return self.name


class Room(models.Model):
    class Kind(models.TextChoices):
        GYM    = 'gym',    'Тренажёрный зал'
        POOL   = 'pool',   'Бассейн'
        SPA    = 'spa',    'SPA'
        STUDIO = 'studio', 'Студия'

    club     = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='rooms', verbose_name='Клуб')
    name     = models.CharField(max_length=100, verbose_name='Название')
    kind     = models.CharField(max_length=50, choices=Kind.choices, verbose_name='Тип')
    capacity = models.PositiveIntegerField(verbose_name='Вместимость')

    class Meta:
        db_table            = 'room'
        verbose_name        = 'Зал'
        verbose_name_plural = 'Залы'
        ordering            = ['club', 'name']

    def clean(self):
        if self.capacity <= 0:
            raise ValidationError({'capacity': 'Вместимость должна быть больше нуля'})

    def __str__(self):
        return f'{self.name} ({self.club})'