from django.contrib import admin
from .models import Notificacion

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'tipo', 'titulo', 'leida', 'fecha_creacion']
    list_filter = ['leida', 'tipo']
