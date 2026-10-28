from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.clubs.models import Club, Room
from apps.memberships.models import MembershipPlan
from apps.users.models import User
from apps.workouts.models import WorkoutSession, WorkoutType

CLUBS = [
    {
        'name': 'Stack Fitness Центр',
        'address': 'ул. Ленина, 1',
        'phone': '+7 999 000-00-01',
        'timezone': 'Europe/Moscow',
        'rooms': [
            {'name': 'Основной зал', 'kind': Room.Kind.GYM, 'capacity': 40},
            {'name': 'Бассейн 25м', 'kind': Room.Kind.POOL, 'capacity': 20},
        ],
    },
    {
        'name': 'Stack Fitness Север',
        'address': 'пр. Мира, 42',
        'phone': '+7 999 000-00-02',
        'timezone': 'Europe/Moscow',
        'rooms': [
            {'name': 'Студия А', 'kind': Room.Kind.STUDIO, 'capacity': 15},
        ],
    },
]

PLANS = [
    {
        'slug': 'club-6m', 'title': 'Клубный 6 месяцев',
        'scope': MembershipPlan.Scope.CLUB, 'price': '24900.00', 'duration_months': 6,
    },
    {
        'slug': 'network-12m', 'title': 'Сетевой 12 месяцев',
        'scope': MembershipPlan.Scope.NETWORK, 'price': '49900.00', 'duration_months': 12,
    },
]

WORKOUT_TYPES = [
    {'title': 'Йога', 'description': 'Хатха-йога', 'default_duration': 60},
    {'title': 'Кроссфит', 'description': 'Функциональный тренинг', 'default_duration': 50},
    {'title': 'Аквааэробика', 'description': 'Занятия в бассейне', 'default_duration': 45},
]

# (название зала, название типа тренировки, сдвиг от 10:00 в часах, вместимость)
SESSIONS = [
    ('Основной зал', 'Йога', 0, 20),
    ('Основной зал', 'Кроссфит', 2, 15),
    ('Бассейн 25м', 'Аквааэробика', 4, 12),
]


class Command(BaseCommand):
    help = 'Наполняет базу демонстрационными данными. Повторный запуск ничего не дублирует.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-password', default='admin12345',
            help='Пароль администратора demo-стенда.',
        )
        parser.add_argument(
            '--trainer-password', default='Trainer123!',
            help='Пароль тренера demo-стенда.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        admin = self._upsert_user(
            'admin@stackfitness.ru', options['admin_password'],
            role=User.Role.ADMIN, is_staff=True, is_superuser=True,
        )
        trainer = self._upsert_user(
            'trainer@stackfitness.ru', options['trainer_password'],
            role=User.Role.TRAINER,
        )

        rooms = {}
        for club_data in CLUBS:
            fields = {key: value for key, value in club_data.items() if key != 'rooms'}
            club, _ = Club.objects.get_or_create(name=fields['name'], defaults=fields)

            for spec in club_data['rooms']:
                room, _ = Room.objects.get_or_create(
                    club=club, name=spec['name'], defaults=spec,
                )
                rooms[spec['name']] = room

        for plan in PLANS:
            MembershipPlan.objects.get_or_create(slug=plan['slug'], defaults=plan)

        types = {}
        for spec in WORKOUT_TYPES:
            workout_type, _ = WorkoutType.objects.get_or_create(
                title=spec['title'], defaults=spec,
            )
            types[spec['title']] = workout_type

        # Занятия ставим на завтра, чтобы они всегда были в будущем.
        base = timezone.now().replace(
            hour=10, minute=0, second=0, microsecond=0,
        ) + timedelta(days=1)

        created_sessions = 0
        for room_name, type_title, hours_offset, capacity in SESSIONS:
            room = rooms[room_name]
            workout_type = types[type_title]
            start = base + timedelta(hours=hours_offset)

            _, created = WorkoutSession.objects.get_or_create(
                room=room,
                start_ts=start,
                defaults={
                    'club': room.club,
                    'trainer': trainer,
                    'workout_type': workout_type,
                    'end_ts': start + timedelta(minutes=workout_type.default_duration),
                    'capacity': capacity,
                },
            )
            created_sessions += int(created)

        self.stdout.write(self.style.SUCCESS(
            f'Готово: клубов {Club.objects.count()}, залов {Room.objects.count()}, '
            f'тарифов {MembershipPlan.objects.count()}, типов тренировок {WorkoutType.objects.count()}, '
            f'занятий {WorkoutSession.objects.count()} (+{created_sessions}).'
        ))
        self.stdout.write(f'Администратор: {admin.email}')
        self.stdout.write(f'Тренер:        {trainer.email}')

    def _upsert_user(self, email, password, **fields):
        user, _ = User.objects.get_or_create(email=email, defaults=fields)
        for key, value in fields.items():
            setattr(user, key, value)
        user.set_password(password)
        user.save()
        return user
