from django.contrib import admin
from .models import Sprint, Hito

@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'proyecto', 'fecha_inicio', 'fecha_fin', 'estado']
    list_filter = ['estado']

@admin.register(Hito)
class HitoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'proyecto', 'fecha_estimada', 'estado']
    list_filter = ['estado']
