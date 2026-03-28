from django.contrib import admin

from .models import Membership, MembershipFreeze, MembershipPlan


@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display  = ['id', 'title', 'scope', 'price', 'duration_months']
    list_filter   = ['scope']
    search_fields = ['title', 'slug']
    ordering      = ['price']


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display  = ['id', 'user', 'plan', 'club', 'status', 'start_date', 'end_date']
    list_filter   = ['status', 'plan', 'club']
    search_fields = ['user__email']
    ordering      = ['-start_date']


@admin.register(MembershipFreeze)
class MembershipFreezeAdmin(admin.ModelAdmin):
    list_display  = ['id', 'membership', 'from_date', 'to_date']
    search_fields = ['membership__user__email']
    ordering      = ['-from_date']