from django.contrib import admin
from .models import Tablero, ColumnaTablero

@admin.register(Tablero)
class TableroAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'proyecto', 'tipo', 'creador', 'fecha_creacion']
    list_filter = ['tipo']

@admin.register(ColumnaTablero)
class ColumnaTableroAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tablero', 'orden', 'limite_tareas']
    list_filter = ['tablero']
