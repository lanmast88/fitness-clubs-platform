from django.contrib import admin

from .models import Club, Room


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'phone', 'timezone']
    search_fields = ['name', 'address', 'phone']
    ordering      = ['-id']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'kind', 'capacity', 'club']
    list_filter   = ['kind', 'club']
    search_fields = ['name', 'club__name']
    ordering      = ['-id']