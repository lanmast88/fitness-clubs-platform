from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase

from apps.clubs.models import Club
from apps.memberships.models import Membership, MembershipFreeze, MembershipPlan
from apps.users.models import User

PLANS_URL        = '/api/v1/membership-plans/'
MEMBERSHIPS_URL  = '/api/v1/memberships/'

TEST_PASSWORD = 'TestPass123!'


def plan_detail_url(plan_id):
    return f'/api/v1/membership-plans/{plan_id}/'


def membership_detail_url(membership_id):
    return f'/api/v1/memberships/{membership_id}/'


def membership_freeze_url(membership_id):
    return f'/api/v1/memberships/{membership_id}/freeze/'


def membership_cancel_url(membership_id):
    return f'/api/v1/memberships/{membership_id}/cancel/'


def create_user(**kwargs):
    defaults = {'email': 'test@test.com', 'password': TEST_PASSWORD}
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def create_club(**kwargs):
    defaults = {
        'name':     'Stack Центр',
        'address':  'ул. Тверская, 12',
        'phone':    '+74951234567',
        'timezone': 'Europe/Moscow',
    }
    defaults.update(kwargs)
    return Club.objects.create(**defaults)


def create_plan(**kwargs):
    defaults = {
        'slug':             'base',
        'title':            'Базовый',
        'scope':            MembershipPlan.Scope.NETWORK,
        'price':            3500,
        'duration_months':  1,
    }
    defaults.update(kwargs)
    return MembershipPlan.objects.create(**defaults)


def create_membership(user, plan, **kwargs):
    today = date.today()
    defaults = {
        'start_date': today,
        'end_date':   today + timedelta(days=30),
        'status':     Membership.Status.ACTIVE,
    }
    defaults.update(kwargs)
    return Membership.objects.create(user=user, plan=plan, **defaults)


class MembershipPlanListTests(APITestCase):

    def test_list_plans_success(self):
        create_plan(slug='base', title='Базовый')
        create_plan(slug='network', title='Сетевой', price=5900)

        response = self.client.get(PLANS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_plans_anonymous_allowed(self):
        response = self.client.get(PLANS_URL)

        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_plans_has_scope_display(self):
        create_plan()

        response = self.client.get(PLANS_URL)

        self.assertIn('scope_display', response.data[0])

    def test_list_plans_ordered_by_price(self):
        create_plan(slug='expensive', title='Дорогой', price=9900)
        create_plan(slug='cheap',     title='Дешёвый', price=3500)

        response = self.client.get(PLANS_URL)

        prices = [p['price'] for p in response.data]
        self.assertEqual(prices, sorted(prices))


class MembershipPlanDetailTests(APITestCase):

    def setUp(self):
        self.plan = create_plan()

    def test_retrieve_plan_success(self):
        response = self.client.get(plan_detail_url(self.plan.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.plan.title)
        self.assertEqual(response.data['slug'], self.plan.slug)

    def test_retrieve_plan_not_found(self):
        response = self.client.get(plan_detail_url(99999))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MembershipListTests(APITestCase):

    def setUp(self):
        self.user = create_user()
        self.plan = create_plan()
        self.client.force_authenticate(user=self.user)

    def test_list_memberships_success(self):
        create_membership(self.user, self.plan)
        create_membership(self.user, self.plan, start_date=date.today() - timedelta(days=60),
                          end_date=date.today() - timedelta(days=30))

        response = self.client.get(MEMBERSHIPS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_memberships_only_own(self):
        other_user = create_user(email='other@test.com')
        create_membership(self.user, self.plan)
        create_membership(other_user, self.plan)

        response = self.client.get(MEMBERSHIPS_URL)

        self.assertEqual(len(response.data), 1)

    def test_list_memberships_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(MEMBERSHIPS_URL)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_memberships_has_freezes_field(self):
        create_membership(self.user, self.plan)

        response = self.client.get(MEMBERSHIPS_URL)

        self.assertIn('freezes', response.data[0])


class MembershipCreateTests(APITestCase):

    def setUp(self):
        self.user = create_user()
        self.club = create_club()
        self.client.force_authenticate(user=self.user)

    def test_create_network_membership_success(self):
        plan = create_plan(slug='network', scope=MembershipPlan.Scope.NETWORK)
        payload = {'plan': plan.id}

        response = self.client.post(MEMBERSHIPS_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Membership.objects.count(), 1)

    def test_create_club_membership_success(self):
        plan = create_plan(slug='club', scope=MembershipPlan.Scope.CLUB)
        payload = {'plan': plan.id, 'club': self.club.id}

        response = self.client.post(MEMBERSHIPS_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_club_membership_without_club_fails(self):
        plan = create_plan(slug='club', scope=MembershipPlan.Scope.CLUB)
        payload = {'plan': plan.id}

        response = self.client.post(MEMBERSHIPS_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_network_membership_with_club_fails(self):
        plan = create_plan(slug='network', scope=MembershipPlan.Scope.NETWORK)
        payload = {'plan': plan.id, 'club': self.club.id}

        response = self.client.post(MEMBERSHIPS_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_membership_unauthenticated(self):
        self.client.force_authenticate(user=None)
        plan = create_plan()
        payload = {'plan': plan.id}

        response = self.client.post(MEMBERSHIPS_URL, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_membership_sets_active_status(self):
        plan = create_plan()
        payload = {'plan': plan.id}

        self.client.post(MEMBERSHIPS_URL, payload, format='json')

        membership = Membership.objects.first()
        self.assertEqual(membership.status, Membership.Status.ACTIVE)

    def test_create_membership_sets_correct_dates(self):
        plan = create_plan(duration_months=1)
        payload = {'plan': plan.id}

        self.client.post(MEMBERSHIPS_URL, payload, format='json')

        membership = Membership.objects.first()
        self.assertEqual(membership.start_date, date.today())


class MembershipFreezeTests(APITestCase):

    def setUp(self):
        self.user       = create_user()
        self.plan       = create_plan()
        self.membership = create_membership(self.user, self.plan)
        self.client.force_authenticate(user=self.user)

        self.today     = date.today()
        self.freeze_payload = {
            'from_date': str(self.today + timedelta(days=1)),
            'to_date':   str(self.today + timedelta(days=8)),
        }

    def test_freeze_success(self):
        response = self.client.post(
            membership_freeze_url(self.membership.id),
            self.freeze_payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MembershipFreeze.objects.count(), 1)

    def test_freeze_changes_status_to_frozen(self):
        self.client.post(
            membership_freeze_url(self.membership.id),
            self.freeze_payload,
            format='json',
        )

        self.membership.refresh_from_db()
        self.assertEqual(self.membership.status, Membership.Status.FROZEN)

    def test_freeze_invalid_dates(self):
        payload = {
            'from_date': str(self.today + timedelta(days=8)),
            'to_date':   str(self.today + timedelta(days=1)),
        }
        response = self.client.post(
            membership_freeze_url(self.membership.id),
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_freeze_overlapping_period_fails(self):
        self.client.post(
            membership_freeze_url(self.membership.id),
            self.freeze_payload,
            format='json',
        )

        response = self.client.post(
            membership_freeze_url(self.membership.id),
            self.freeze_payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_freeze_cancelled_membership_fails(self):
        self.membership.status = Membership.Status.CANCELLED
        self.membership.save()

        response = self.client.post(
            membership_freeze_url(self.membership.id),
            self.freeze_payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_freeze_other_user_membership_fails(self):
        other_user       = create_user(email='other@test.com')
        other_membership = create_membership(other_user, self.plan)

        response = self.client.post(
            membership_freeze_url(other_membership.id),
            self.freeze_payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_freeze_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            membership_freeze_url(self.membership.id),
            self.freeze_payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MembershipCancelTests(APITestCase):

    def setUp(self):
        self.user       = create_user()
        self.plan       = create_plan()
        self.membership = create_membership(self.user, self.plan)
        self.client.force_authenticate(user=self.user)

    def test_cancel_success(self):
        response = self.client.post(
            membership_cancel_url(self.membership.id),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.membership.refresh_from_db()
        self.assertEqual(self.membership.status, Membership.Status.CANCELLED)

    def test_cancel_already_cancelled_fails(self):
        self.membership.status = Membership.Status.CANCELLED
        self.membership.save()

        response = self.client.post(
            membership_cancel_url(self.membership.id),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_expired_membership_fails(self):
        self.membership.status = Membership.Status.EXPIRED
        self.membership.save()

        response = self.client.post(
            membership_cancel_url(self.membership.id),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_other_user_membership_fails(self):
        other_user       = create_user(email='other@test.com')
        other_membership = create_membership(other_user, self.plan)

        response = self.client.post(
            membership_cancel_url(other_membership.id),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cancel_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            membership_cancel_url(self.membership.id),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)