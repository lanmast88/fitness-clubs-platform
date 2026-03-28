from django.utils import timezone
from rest_framework import serializers

from .models import Membership, MembershipFreeze, MembershipPlan


class MembershipPlanSerializer(serializers.ModelSerializer):
    scope_display = serializers.CharField(source='get_scope_display', read_only=True)

    class Meta:
        model  = MembershipPlan
        fields = [
            'id', 'slug', 'title', 'scope', 'scope_display',
            'price', 'duration_months',
        ]
        read_only_fields = ['id']


class MembershipFreezeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MembershipFreeze
        fields = ['id', 'from_date', 'to_date']
        read_only_fields = ['id']

    def validate(self, attrs):
        membership = self.context['membership']
        from_date  = attrs['from_date']
        to_date    = attrs['to_date']

        if to_date <= from_date:
            raise serializers.ValidationError(
                {'to_date': 'Дата окончания должна быть позже даты начала'}
            )

        if from_date < membership.start_date:
            raise serializers.ValidationError(
                {'from_date': 'Заморозка не может начинаться раньше абонемента'}
            )

        if to_date > membership.end_date:
            raise serializers.ValidationError(
                {'to_date': 'Заморозка не может заканчиваться позже абонемента'}
            )

        if membership.status in (Membership.Status.CANCELLED, Membership.Status.EXPIRED):
            raise serializers.ValidationError(
                {'membership': f'Нельзя заморозить абонемент со статусом «{membership.get_status_display()}»'}
            )

        # Проверка пересечения с существующими заморозками
        overlapping = MembershipFreeze.objects.filter(
            membership=membership,
            from_date__lt=to_date,
            to_date__gt=from_date,
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError(
                {'from_date': 'Период пересекается с уже существующей заморозкой'}
            )

        return attrs

    def create(self, validated_data):
        membership = self.context['membership']
        return MembershipFreeze.objects.create(membership=membership, **validated_data)


class MembershipSerializer(serializers.ModelSerializer):
    """
    Сериализатор для чтения абонемента — с вложенными данными.
    """
    plan          = MembershipPlanSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    freezes       = MembershipFreezeSerializer(many=True, read_only=True)

    class Meta:
        model  = Membership
        fields = [
            'id', 'plan', 'club', 'start_date', 'end_date',
            'status', 'status_display', 'freezes',
        ]
        read_only_fields = ['id', 'status', 'start_date', 'end_date']


class MembershipCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания абонемента.
    Пользователь выбирает тариф и клуб (если тариф клубный).
    Даты и статус устанавливаются автоматически.
    """
    class Meta:
        model  = Membership
        fields = ['plan', 'club']

    def validate(self, attrs):
        plan = attrs['plan']
        club = attrs.get('club')

        if plan.scope == MembershipPlan.Scope.CLUB and not club:
            raise serializers.ValidationError(
                {'club': 'Для клубного тарифа необходимо указать клуб'}
            )

        if plan.scope == MembershipPlan.Scope.NETWORK and club:
            raise serializers.ValidationError(
                {'club': 'Для сетевого тарифа клуб не указывается'}
            )

        return attrs

    def create(self, validated_data):
        from dateutil.relativedelta import relativedelta

        user  = self.context['request'].user
        plan  = validated_data['plan']
        today = timezone.now().date()

        return Membership.objects.create(
            user=user,
            plan=plan,
            club=validated_data.get('club'),
            start_date=today,
            end_date=today + relativedelta(months=plan.duration_months),
            status=Membership.Status.ACTIVE,
        )