from django.contrib import admin
from .models import Tarea, Subtarea, Checklist, ChecklistItem, Comentario, Etiqueta, Adjunto, DependenciaTarea

@admin.register(Tarea)
class TareaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'titulo', 'proyecto', 'columna', 'estado', 'prioridad', 'responsable']
    list_filter = ['estado', 'prioridad', 'tipo']
    search_fields = ['codigo', 'titulo']

@admin.register(Subtarea)
class SubtareaAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'tarea', 'completada']

@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tarea']

@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['texto', 'checklist', 'completado']

@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ['tarea', 'autor', 'fecha_creacion', 'editado']

@admin.register(Etiqueta)
class EtiquetaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'color', 'proyecto']

@admin.register(Adjunto)
class AdjuntoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tarea', 'subido_por', 'fecha_subida']

@admin.register(DependenciaTarea)
class DependenciaTareaAdmin(admin.ModelAdmin):
    list_display = ['tarea_origen', 'tarea_destino', 'tipo']
