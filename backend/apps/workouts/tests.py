from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.clubs.models import Club, Room
from apps.users.models import User
from apps.workouts.models import Booking, PersonalTraining, WorkoutSession, WorkoutType

WORKOUT_TYPES_URL    = '/api/v1/workout-types/'
SESSIONS_URL         = '/api/v1/sessions/'
BOOKINGS_URL         = '/api/v1/bookings/'
PERSONAL_URL         = '/api/v1/personal-trainings/'
TEST_PASSWORD        = 'TestPass123!'


def session_detail_url(session_id):
    return f'/api/v1/sessions/{session_id}/'


def session_book_url(session_id):
    return f'/api/v1/sessions/{session_id}/book/'


def session_cancel_book_url(session_id):
    return f'/api/v1/sessions/{session_id}/cancel-book/'


def personal_detail_url(pt_id):
    return f'/api/v1/personal-trainings/{pt_id}/'


def personal_cancel_url(pt_id):
    return f'/api/v1/personal-trainings/{pt_id}/cancel/'


def create_user(**kwargs):
    defaults = {'email': 'client@test.com', 'password': TEST_PASSWORD}
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def create_trainer(**kwargs):
    defaults = {
        'email':    'trainer@test.com',
        'password': TEST_PASSWORD,
        'role':     User.Role.TRAINER,
    }
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def create_club():
    return Club.objects.create(
        name='Stack Центр', address='ул. Тверская, 12',
        phone='+74951234567', timezone='Europe/Moscow',
    )


def create_room(club, capacity=30):
    return Room.objects.create(
        club=club, name='Зал 1', kind=Room.Kind.GYM, capacity=capacity,
    )


def create_workout_type():
    return WorkoutType.objects.create(
        title='Йога', default_duration=60,
    )


def create_session(club, room, workout_type, trainer=None, capacity=20, **kwargs):
    now   = timezone.now()
    start = now + timedelta(hours=1)
    end   = start + timedelta(hours=1)
    defaults = {
        'start_ts': start,
        'end_ts':   end,
        'capacity': capacity,
        'status':   WorkoutSession.Status.SCHEDULED,
    }
    defaults.update(kwargs)
    return WorkoutSession.objects.create(
        club=club, room=room, workout_type=workout_type, trainer=trainer, **defaults,
    )


def create_booking(session, user, status=Booking.Status.CONFIRMED):
    return Booking.objects.create(session=session, user=user, status=status)


class WorkoutTypeTests(APITestCase):

    def test_list_workout_types_success(self):
        WorkoutType.objects.create(title='Йога', default_duration=60)
        WorkoutType.objects.create(title='HIIT', default_duration=45)

        response = self.client.get(WORKOUT_TYPES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_workout_types_anonymous_allowed(self):
        response = self.client.get(WORKOUT_TYPES_URL)

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_workout_type_success(self):
        wt = WorkoutType.objects.create(title='Йога', default_duration=60)

        response = self.client.get(f'{WORKOUT_TYPES_URL}{wt.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Йога')


class WorkoutSessionListTests(APITestCase):

    def setUp(self):
        club             = create_club()
        room             = create_room(club)
        workout_type     = create_workout_type()
        self.session     = create_session(club, room, workout_type)

    def test_list_sessions_success(self):
        response = self.client.get(SESSIONS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_sessions_anonymous_allowed(self):
        response = self.client.get(SESSIONS_URL)

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_sessions_excludes_cancelled(self):
        club         = create_club()
        room         = create_room(club)
        workout_type = create_workout_type()
        create_session(
            club, room, workout_type,
            status=WorkoutSession.Status.CANCELLED,
        )

        response = self.client.get(SESSIONS_URL)

        self.assertEqual(len(response.data), 1)

    def test_session_has_spots_left_field(self):
        response = self.client.get(SESSIONS_URL)

        self.assertIn('spots_left', response.data[0])

    def test_session_has_duration_field(self):
        response = self.client.get(SESSIONS_URL)

        self.assertIn('duration', response.data[0])


class BookSessionTests(APITestCase):

    def setUp(self):
        self.user        = create_user()
        self.trainer     = create_trainer()
        club             = create_club()
        room             = create_room(club)
        workout_type     = create_workout_type()
        self.session     = create_session(club, room, workout_type, trainer=self.trainer)
        self.client.force_authenticate(user=self.user)

    def test_book_session_success(self):
        response = self.client.post(session_book_url(self.session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)

    def test_book_session_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(session_book_url(self.session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_book_cancelled_session_fails(self):
        self.session.status = WorkoutSession.Status.CANCELLED
        self.session.save()

        response = self.client.post(session_book_url(self.session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_completed_session_fails(self):
        self.session.status = WorkoutSession.Status.COMPLETED
        self.session.save()

        response = self.client.post(session_book_url(self.session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_duplicate_fails(self):
        create_booking(self.session, self.user)
        response = self.client.post(session_book_url(self.session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_full_session_fails(self):
        club         = create_club()
        room         = create_room(club, capacity=1)
        workout_type = create_workout_type()
        session      = create_session(club, room, workout_type, capacity=1)
        other_user   = create_user(email='other@test.com')
        create_booking(session, other_user)

        response = self.client.post(session_book_url(session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_trainer_cannot_book_own_session(self):
        self.client.force_authenticate(user=self.trainer)
        response = self.client.post(session_book_url(self.session.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CancelBookTests(APITestCase):

    def setUp(self):
        self.user    = create_user()
        club         = create_club()
        room         = create_room(club)
        workout_type = create_workout_type()
        self.session = create_session(club, room, workout_type)
        self.booking = create_booking(self.session, self.user)
        self.client.force_authenticate(user=self.user)

    def test_cancel_book_success(self):
        response = self.client.post(
            session_cancel_book_url(self.session.id), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.CANCELLED)

    def test_cancel_book_not_booked_fails(self):
        other_session = create_session(
            self.session.club, self.session.room, self.session.workout_type,
            start_ts=timezone.now() + timedelta(hours=3),
            end_ts=timezone.now() + timedelta(hours=4),
        )
        response = self.client.post(
            session_cancel_book_url(other_session.id), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_book_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            session_cancel_book_url(self.session.id), format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class BookingListTests(APITestCase):

    def setUp(self):
        self.user    = create_user()
        club         = create_club()
        room         = create_room(club)
        workout_type = create_workout_type()
        self.session = create_session(club, room, workout_type)
        self.client.force_authenticate(user=self.user)

    def test_list_bookings_success(self):
        create_booking(self.session, self.user)

        response = self.client.get(BOOKINGS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_bookings_only_own(self):
        other_user = create_user(email='other@test.com')
        create_booking(self.session, self.user)
        create_booking(self.session, other_user)

        response = self.client.get(BOOKINGS_URL)

        self.assertEqual(len(response.data), 1)

    def test_list_bookings_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(BOOKINGS_URL)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PersonalTrainingTests(APITestCase):

    def setUp(self):
        self.user    = create_user()
        self.trainer = create_trainer()
        self.client.force_authenticate(user=self.user)
        self.payload = {
            'trainer':          self.trainer.id,
            'start_ts':         (timezone.now() + timedelta(hours=2)).isoformat(),
            'duration_minutes': 60,
        }

    def test_create_pt_success(self):
        response = self.client.post(PERSONAL_URL, self.payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PersonalTraining.objects.count(), 1)

    def test_create_pt_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(PERSONAL_URL, self.payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_pt_non_trainer_fails(self):
        other_client = create_user(email='other@test.com')
        payload = {**self.payload, 'trainer': other_client.id}

        response = self.client.post(PERSONAL_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_pt_self_fails(self):
        self.client.force_authenticate(user=self.trainer)
        payload = {**self.payload, 'trainer': self.trainer.id}

        response = self.client.post(PERSONAL_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_pt_only_own(self):
        other_user = create_user(email='other@test.com')
        PersonalTraining.objects.create(
            trainer=self.trainer, client=self.user,
            start_ts=timezone.now() + timedelta(hours=2),
            duration_minutes=60,
        )
        PersonalTraining.objects.create(
            trainer=self.trainer, client=other_user,
            start_ts=timezone.now() + timedelta(hours=4),
            duration_minutes=60,
        )

        response = self.client.get(PERSONAL_URL)

        self.assertEqual(len(response.data), 1)

    def test_cancel_pt_success(self):
        pt = PersonalTraining.objects.create(
            trainer=self.trainer, client=self.user,
            start_ts=timezone.now() + timedelta(hours=2),
            duration_minutes=60,
        )
        response = self.client.post(personal_cancel_url(pt.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pt.refresh_from_db()
        self.assertEqual(pt.status, PersonalTraining.Status.CANCELLED)

    def test_cancel_already_cancelled_fails(self):
        pt = PersonalTraining.objects.create(
            trainer=self.trainer, client=self.user,
            start_ts=timezone.now() + timedelta(hours=2),
            duration_minutes=60,
            status=PersonalTraining.Status.CANCELLED,
        )
        response = self.client.post(personal_cancel_url(pt.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_other_user_pt_fails(self):
        other_user = create_user(email='other@test.com')
        pt = PersonalTraining.objects.create(
            trainer=self.trainer, client=other_user,
            start_ts=timezone.now() + timedelta(hours=2),
            duration_minutes=60,
        )
        response = self.client.post(personal_cancel_url(pt.id), format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)