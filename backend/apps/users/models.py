from django.db import models

class Club(models.Model):
    name = models.CharField(max_length=255)
    adress = models.TextField()
    phone = models.CharField(max_length=50)
    timezone = models.CharField(max_length=50)

    class Meta:
        db_table = 'club'

    def __str__(self):
        return self.name


class Room(models.Model):
    class Kind(models.TextChoices):
        GYM = 'gym', 'Gym'
        POOL = 'pool', 'Pool'
        SPA = 'spa', 'Spa'
        STUDIO = 'studio', 'Studio'
    
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=100)
    kind = models.CharField(max_length=50, choices=Kind.choices)
    capacity = models.PositiveIntegerField()

    class Meta:
        db_table = 'room'

    def __str__(self):
        return f'{self.name} ({self.club})'

class User(models.Model):
    email = models.EmailField(unique=True, null=False)
    phone = models.CharField(max_length=50, blank=True, null=False)
    password_hash = models.CharField(max_length=255, null=False)
    role = models.CharField(max_length=50, default='client')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table='user'

    def __str__(self):
        return self.email

class MembershipPlan(models.Model):
    class Scope(models.TextChoices):
        CLUB = 'club', 'Club'
        NETWORK = 'network', 'Network'

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    scope = models.CharField(max_length=10, choices=Scope.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_months = models.PositiveIntegerField()

    class Meta:
        db_table = 'membership_plan'

    def __str__(self):
        return self.title

class Membership(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        FROZEN = 'frozen', 'Frozen'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT, related_name='memberships')
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True, related_name='memberships')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        db_table = 'membership'

    def __str__(self):
        return f'{self.user} - {self.plan} ({self.status})'

class MembershipFreeze(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name='freezes')
    from_date = models.DateField()
    to_date = models.DateField()

    class Meta:
        db_table = 'membership_freeze'

    def __str__(self):
        return f'Freeze {self.membership} ({self.from_date} - {self.to_date})'

class WorkoutType(models.Model):
    title = models.CharField(max_length=255)
    default_duration = models.PositiveIntegerField(help_text='Duration in minutes')

    class Meta:
        db_table = 'workout_type'

    def __str__(self):
        return self.title

class WorkoutSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        ONGOING = 'ongoing', 'Ongoing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='workout_sessions')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='workout_sessions')
    trainer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='trainer_sessions', limit_choices_to={'role': 'trainer'}
    )
    workout_type = models.ForeignKey(WorkoutType, on_delete=models.PROTECT, related_name='sessions')
    start_ts = models.DateTimeField()
    end_ts = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)

    class Meta:
        db_table = 'workout_session'

    def __str__(self):
        return f'{self.workout_type} at {self.start_ts} ({self.status})'

class Booking(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELLED = 'cancelled', 'Cancelled'
        ATTENDED = 'attended', 'Attended'

    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CONFIRMED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'booking'
        unique_together = ('session', 'user')

    def __str__(self):
        return f'{self.user} → {self.session} ({self.status})'

class PersonalTraining(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    trainer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='pt_as_trainer',
        limit_choices_to={'role': 'trainer'}
    )
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pt_as_client')
    start_ts = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)

    class Meta:
        db_table = 'personal_training'

    def __str__(self):
        return f'PT: {self.trainer} + {self.client} at {self.start_ts}'