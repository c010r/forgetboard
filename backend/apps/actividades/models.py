from django.db import models
from django.conf import settings


class Actividad(models.Model):
    ACCIONES = [
        ('creacion', 'Creación'),
        ('actualizacion', 'Actualización'),
        ('eliminacion', 'Eliminación'),
        ('comentario', 'Comentario'),
        ('movimiento', 'Movimiento'),
        ('asignacion', 'Asignación'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='actividades')
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE, null=True, blank=True, related_name='actividades')
    tarea = models.ForeignKey('tareas.Tarea', on_delete=models.SET_NULL, null=True, blank=True, related_name='actividades')
    accion = models.CharField(max_length=20, choices=ACCIONES)
    descripcion = models.TextField()
    metadatos = models.JSONField(default=dict, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Actividad'
        verbose_name_plural = 'Actividades'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.usuario.username} - {self.get_accion_display()} - {self.fecha.strftime('%d/%m/%Y %H:%M')}"
