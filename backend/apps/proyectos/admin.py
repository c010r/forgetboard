from django.contrib import admin
from .models import Proyecto, MiembroProyecto, DocumentoProyecto, Unidad

@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'estado', 'prioridad', 'responsable', 'porcentaje_avance']
    list_filter = ['estado', 'prioridad']
    search_fields = ['nombre', 'codigo']

@admin.register(MiembroProyecto)
class MiembroProyectoAdmin(admin.ModelAdmin):
    list_display = ['proyecto', 'usuario', 'rol']
    list_filter = ['rol']


@admin.register(DocumentoProyecto)
class DocumentoProyectoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'proyecto', 'tipo', 'subido_por', 'fecha_subida']
    list_filter = ['tipo']


@admin.register(Unidad)
class UnidadAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'proyecto', 'estado_implementacion', 'latitud', 'longitud']
    list_filter = ['estado_implementacion', 'proyecto']
