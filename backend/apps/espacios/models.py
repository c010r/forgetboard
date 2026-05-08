from django.db import models
from django.conf import settings


class EspacioTrabajo(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='espacios_creados')
    miembros = models.ManyToManyField(settings.AUTH_USER_MODEL, through='MiembroEspacio', related_name='espacios')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Espacio de Trabajo'
        verbose_name_plural = 'Espacios de Trabajo'

    def __str__(self):
        return self.nombre


class MiembroEspacio(models.Model):
    ROLES = [
        ('propietario', 'Propietario'),
        ('admin', 'Admin'),
        ('miembro', 'Miembro'),
        ('invitado', 'Invitado'),
    ]

    espacio = models.ForeignKey(EspacioTrabajo, on_delete=models.CASCADE, related_name='miembros_espacio')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rol = models.CharField(max_length=20, choices=ROLES, default='miembro')
    fecha_ingreso = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Miembro del Espacio'
        verbose_name_plural = 'Miembros del Espacio'
        unique_together = ('espacio', 'usuario')

    def __str__(self):
        return f"{self.usuario.username} - {self.espacio.nombre}"
