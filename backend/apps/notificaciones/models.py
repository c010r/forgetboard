from django.db import models
from django.conf import settings


class Notificacion(models.Model):
    TIPOS = [
        ('asignacion', 'Asignación de Tarea'),
        ('comentario', 'Nuevo Comentario'),
        ('cambio_estado', 'Cambio de Estado'),
        ('vencimiento', 'Vencimiento Próximo'),
        ('mencion', 'Mención'),
        ('sistema', 'Sistema'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notificaciones')
    tipo = models.CharField(max_length=30, choices=TIPOS)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField(blank=True, null=True)
    leida = models.BooleanField(default=False)
    enlace = models.CharField(max_length=500, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.usuario.username}"
