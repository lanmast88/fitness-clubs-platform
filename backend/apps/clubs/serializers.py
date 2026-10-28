from rest_framework import serializers  

from .models import Club, Room


class RoomSerializer(serializers.ModelSerializer):
    kind_display = serializers.CharField(source='get_kind_display', read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'club', 'name', 'kind', 'kind_display', 'capacity']
        read_only_fields = ['id']


class ClubSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Club
        fields = ['id', 'name', 'address', 'phone', 'timezone', 'rooms']
        read_only_fields = ['id']


class ClubListSerializer(serializers.ModelSerializer):
    """
    Облегчённый сериализатор для списка клубов — без вложенных залов.
    Используется в GET /clubs/ чтобы не грузить лишние данные.
    """
    class Meta:
        model = Club
        fields = ['id', 'name', 'address', 'phone', 'timezone']
        read_only_fields = ['id']

class ScheduleSessionSerializer(serializers.Serializer):
    """
    Сериализатор одной сессии в расписании клуба.
    Намеренно Serializer а не ModelSerializer —
    собираем только нужные поля из связанных моделей.
    """
    id = serializers.IntegerField()
    workout_type = serializers.CharField(source='workout_type.title')
    trainer = serializers.SerializerMethodField()
    room = serializers.CharField(source='room.name')
    # Отдаём момент времени целиком (ISO-8601), а не заранее отформатированные
    # часы: форматирование под часовой пояс пользователя — задача клиента,
    # иначе одно и то же занятие показывается в разное время в разных разделах.
    start_ts = serializers.DateTimeField()
    end_ts = serializers.DateTimeField()
    duration = serializers.SerializerMethodField()
    capacity = serializers.IntegerField()
    spots_left = serializers.SerializerMethodField()
    status = serializers.CharField()

    def get_trainer(self, obj):
        if not obj.trainer:
            return None
        return {
            'id':    obj.trainer.id,
            'email': obj.trainer.email,
        }
 
    def get_duration(self, obj):
        delta = obj.end_ts - obj.start_ts
        return int(delta.total_seconds() // 60)
 
    def get_spots_left(self, obj):
        confirmed = obj.bookings.exclude(status='cancelled').count()
        return max(obj.capacity - confirmed, 0)