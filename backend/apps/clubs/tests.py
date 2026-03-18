from datetime import date, timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.clubs.models import Club, Room
from apps.workouts.models import WorkoutSession, WorkoutType

CLUBS_URL = '/api/v1/clubs/'


def club_detail_url(club_id):
    return f'/api/v1/clubs/{club_id}/'


def club_schedule_url(club_id, date_str=None):
    url = f'/api/v1/clubs/{club_id}/schedule/'
    if date_str:
        url += f'?date={date_str}'
    return url


def club_rooms_url(club_id):
    return f'/api/v1/clubs/{club_id}/rooms/'


def club_room_detail_url(club_id, room_id):
    return f'/api/v1/clubs/{club_id}/rooms/{room_id}/'


def create_club(**kwargs):
    defaults = {
        'name':     'Stack Центр',
        'address':  'ул. Тверская, 12',
        'phone':    '+74951234567',
        'timezone': 'Europe/Moscow',
    }
    defaults.update(kwargs)
    return Club.objects.create(**defaults)


def create_room(club, **kwargs):
    defaults = {
        'name': 'Зал 1',
        'kind': Room.Kind.GYM,
        'capacity': 30,
    }
    defaults.update(kwargs)
    return Room.objects.create(club=club, **defaults)


def create_workout_type(**kwargs):
    defaults = {
        'title': 'Йога',
        'default_duration': 60,
    }
    defaults.update(kwargs)
    return WorkoutType.objects.create(**defaults)


def create_session(club, room, workout_type, start_ts, end_ts, **kwargs):
    defaults = {
        'status':   WorkoutSession.Status.SCHEDULED,
        'capacity': 20,
    }
    defaults.update(kwargs)
    return WorkoutSession.objects.create(
        club=club,
        room=room,
        workout_type=workout_type,
        start_ts=start_ts,
        end_ts=end_ts,
        **defaults,
    )


class ClubListTests(APITestCase):

    def test_list_clubs_success(self):
        create_club(name='Stack Север')
        create_club(name='Stack Юг')

        response = self.client.get(CLUBS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_clubs_empty(self):
        response = self.client.get(CLUBS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_clubs_ordered_by_name(self):
        create_club(name='Stack Юг')
        create_club(name='Stack Север')
        create_club(name='Stack Центр')

        response = self.client.get(CLUBS_URL)

        names = [c['name'] for c in response.data]
        self.assertEqual(names, sorted(names))

    def test_list_clubs_no_rooms_field(self):
        create_club()

        response = self.client.get(CLUBS_URL)

        self.assertNotIn('rooms', response.data[0])

    def test_list_clubs_anonymous_allowed(self):
        response = self.client.get(CLUBS_URL)

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ClubDetailTests(APITestCase):

    def setUp(self):
        self.club = create_club()
        self.room = create_room(self.club)

    def test_retrieve_club_success(self):
        response = self.client.get(club_detail_url(self.club.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.club.name)
        self.assertEqual(response.data['address'], self.club.address)

    def test_retrieve_club_has_rooms(self):
        response = self.client.get(club_detail_url(self.club.id))

        self.assertIn('rooms', response.data)
        self.assertEqual(len(response.data['rooms']), 1)
        self.assertEqual(response.data['rooms'][0]['name'], self.room.name)

    def test_retrieve_club_not_found(self):
        response = self.client.get(club_detail_url(99999))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_club_anonymous_allowed(self):
        response = self.client.get(club_detail_url(self.club.id))

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ClubScheduleTests(APITestCase):

    def setUp(self):
        self.club        = create_club()
        self.room        = create_room(self.club)
        self.workout_type = create_workout_type()
        self.today       = date.today()
        self.today_str   = str(self.today)

        start = timezone.now().replace(hour=10, minute=0, second=0, microsecond=0)
        end   = start + timedelta(hours=1)

        self.session = create_session(
            club=self.club,
            room=self.room,
            workout_type=self.workout_type,
            start_ts=start,
            end_ts=end,
        )

    def test_schedule_returns_sessions(self):
        response = self.client.get(club_schedule_url(self.club.id, self.today_str))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_schedule_default_date_is_today(self):
        response = self.client.get(club_schedule_url(self.club.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_schedule_invalid_date_format(self):
        response = self.client.get(club_schedule_url(self.club.id, 'invalid-date'))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_schedule_excludes_cancelled_sessions(self):
        start = timezone.now().replace(hour=12, minute=0, second=0, microsecond=0)
        end   = start + timedelta(hours=1)
        create_session(
            club=self.club,
            room=self.room,
            workout_type=self.workout_type,
            start_ts=start,
            end_ts=end,
            status=WorkoutSession.Status.CANCELLED,
        )

        response = self.client.get(club_schedule_url(self.club.id, self.today_str))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_schedule_different_date_returns_empty(self):
        tomorrow = str(self.today + timedelta(days=1))
        response = self.client.get(club_schedule_url(self.club.id, tomorrow))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_schedule_session_fields(self):
        response = self.client.get(club_schedule_url(self.club.id, self.today_str))

        session = response.data[0]
        self.assertIn('id', session)
        self.assertIn('workout_type', session)
        self.assertIn('room', session)
        self.assertIn('start_ts', session)
        self.assertIn('end_ts', session)
        self.assertIn('duration', session)
        self.assertIn('capacity', session)
        self.assertIn('spots_left', session)

    def test_schedule_wrong_club_returns_404(self):
        response = self.client.get(club_schedule_url(99999, self.today_str))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_schedule_ordered_by_start_time(self):
        start2 = timezone.now().replace(hour=14, minute=0, second=0, microsecond=0)
        end2   = start2 + timedelta(hours=1)
        create_session(
            club=self.club,
            room=self.room,
            workout_type=self.workout_type,
            start_ts=start2,
            end_ts=end2,
        )

        response = self.client.get(club_schedule_url(self.club.id, self.today_str))

        times = [s['start_ts'] for s in response.data]
        self.assertEqual(times, sorted(times))


class RoomListTests(APITestCase):

    def setUp(self):
        self.club = create_club()

    def test_list_rooms_success(self):
        create_room(self.club, name='Зал 1')
        create_room(self.club, name='Зал 2')

        response = self.client.get(club_rooms_url(self.club.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_rooms_empty(self):
        response = self.client.get(club_rooms_url(self.club.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_rooms_only_for_club(self):
        other_club = create_club(name='Stack Север')
        create_room(self.club, name='Мой зал')
        create_room(other_club, name='Чужой зал')

        response = self.client.get(club_rooms_url(self.club.id))

        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Мой зал')

    def test_list_rooms_wrong_club_returns_404(self):
        response = self.client.get(club_rooms_url(99999))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_rooms_anonymous_allowed(self):
        response = self.client.get(club_rooms_url(self.club.id))

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoomDetailTests(APITestCase):

    def setUp(self):
        self.club = create_club()
        self.room = create_room(self.club)

    def test_retrieve_room_success(self):
        response = self.client.get(club_room_detail_url(self.club.id, self.room.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.room.name)
        self.assertEqual(response.data['capacity'], self.room.capacity)

    def test_retrieve_room_has_kind_display(self):
        response = self.client.get(club_room_detail_url(self.club.id, self.room.id))

        self.assertIn('kind_display', response.data)
        self.assertEqual(response.data['kind_display'], 'Тренажёрный зал')

    def test_retrieve_room_not_found(self):
        response = self.client.get(club_room_detail_url(self.club.id, 99999))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)