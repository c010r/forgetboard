from django.contrib import admin
from .models import EspacioTrabajo, MiembroEspacio

@admin.register(EspacioTrabajo)
class EspacioTrabajoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'creador', 'activo', 'fecha_creacion']
    list_filter = ['activo']

@admin.register(MiembroEspacio)
class MiembroEspacioAdmin(admin.ModelAdmin):
    list_display = ['espacio', 'usuario', 'rol']
    list_filter = ['rol']
