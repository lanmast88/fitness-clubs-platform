from django.core.exceptions import ValidationError
from django.db import models

from apps.clubs.models import Club
from apps.users.models import User


class MembershipPlan(models.Model):
    class Scope(models.TextChoices):
        CLUB    = 'club',    'Один клуб'
        NETWORK = 'network', 'Вся сеть'

    slug            = models.SlugField(unique=True, verbose_name='Slug')
    title           = models.CharField(max_length=255, verbose_name='Название')
    scope           = models.CharField(max_length=10, choices=Scope.choices, verbose_name='Охват')
    price           = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    duration_months = models.PositiveIntegerField(verbose_name='Длительность (мес.)')

    class Meta:
        db_table            = 'membership_plan'
        verbose_name        = 'Тарифный план'
        verbose_name_plural = 'Тарифные планы'
        ordering            = ['price']

    def clean(self):
        errors = {}
        if self.price is not None and self.price <= 0:
            errors['price'] = 'Цена должна быть больше нуля'
        if self.duration_months == 0:
            errors['duration_months'] = 'Длительность должна быть больше нуля'
        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'{self.title} ({self.get_scope_display()}, {self.duration_months} мес.)'


class Membership(models.Model):
    class Status(models.TextChoices):
        ACTIVE    = 'active',    'Активен'
        FROZEN    = 'frozen',    'Заморожен'
        EXPIRED   = 'expired',   'Истёк'
        CANCELLED = 'cancelled', 'Отменён'

    user       = models.ForeignKey(User,           on_delete=models.CASCADE,  related_name='memberships', verbose_name='Пользователь')
    plan       = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT,  related_name='memberships', verbose_name='Тариф')
    club       = models.ForeignKey(Club,           on_delete=models.SET_NULL, related_name='memberships', null=True, blank=True, verbose_name='Клуб')
    start_date = models.DateField(verbose_name='Дата начала')
    end_date   = models.DateField(verbose_name='Дата окончания')
    status     = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, verbose_name='Статус')

    class Meta:
        db_table            = 'membership'
        verbose_name        = 'Абонемент'
        verbose_name_plural = 'Абонементы'
        ordering            = ['-start_date']

    def clean(self):
        errors = {}

        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                errors['end_date'] = 'Дата окончания должна быть позже даты начала'

        if self.plan_id:
            try:
                if self.plan.scope == MembershipPlan.Scope.CLUB and not self.club:
                    errors['club'] = 'Для клубного тарифа необходимо указать клуб'
                if self.plan.scope == MembershipPlan.Scope.NETWORK and self.club:
                    errors['club'] = 'Для сетевого тарифа клуб не указывается'
            except MembershipPlan.DoesNotExist:
                pass

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'{self.user} — {self.plan} ({self.get_status_display()})'

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE


class MembershipFreeze(models.Model):
    membership = models.ForeignKey(Membership, on_delete=models.CASCADE, related_name='freezes', verbose_name='Абонемент')
    from_date  = models.DateField(verbose_name='Дата начала заморозки')
    to_date    = models.DateField(verbose_name='Дата окончания заморозки')

    class Meta:
        db_table            = 'membership_freeze'
        verbose_name        = 'Заморозка'
        verbose_name_plural = 'Заморозки'
        ordering            = ['-from_date']

    def clean(self):
        errors = {}

        if self.from_date and self.to_date:
            if self.to_date <= self.from_date:
                errors['to_date'] = 'Дата окончания заморозки должна быть позже даты начала'

            if self.membership_id:
                try:
                    m = self.membership

                    if self.from_date < m.start_date:
                        errors['from_date'] = 'Заморозка не может начинаться раньше абонемента'
                    if self.to_date > m.end_date:
                        errors['to_date'] = 'Заморозка не может заканчиваться позже абонемента'

                    if m.status in (Membership.Status.CANCELLED, Membership.Status.EXPIRED):
                        errors['membership'] = f'Нельзя заморозить абонемент со статусом «{m.get_status_display()}»'

                    overlapping = MembershipFreeze.objects.filter(
                        membership=m,
                        from_date__lt=self.to_date,
                        to_date__gt=self.from_date,
                    )
                    if self.pk:
                        overlapping = overlapping.exclude(pk=self.pk)
                    if overlapping.exists():
                        errors['from_date'] = 'Период пересекается с уже существующей заморозкой'

                except Membership.DoesNotExist:
                    pass

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f'Заморозка: {self.membership} ({self.from_date} – {self.to_date})'