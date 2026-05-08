from django.contrib import admin
from .models import Actividad

@admin.register(Actividad)
class ActividadAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'accion', 'descripcion', 'fecha']
    list_filter = ['accion', 'fecha']
