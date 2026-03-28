from django.contrib import admin

from .models import Booking, PersonalTraining, WorkoutSession, WorkoutType


@admin.register(WorkoutType)
class WorkoutTypeAdmin(admin.ModelAdmin):
    list_display  = ['id', 'title', 'default_duration']
    search_fields = ['title']
    ordering      = ['title']


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display  = ['id', 'workout_type', 'club', 'room', 'trainer', 'start_ts', 'status']
    list_filter   = ['status', 'club', 'workout_type']
    search_fields = ['workout_type__title', 'trainer__email']
    ordering      = ['-start_ts']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'user', 'session', 'status', 'created_at']
    list_filter   = ['status']
    search_fields = ['user__email', 'session__workout_type__title']
    ordering      = ['-created_at']


@admin.register(PersonalTraining)
class PersonalTrainingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'trainer', 'client', 'start_ts', 'duration_minutes', 'status']
    list_filter   = ['status']
    search_fields = ['trainer__email', 'client__email']
    ordering      = ['-start_ts']
