from django.db import models
from django.conf import settings


class Tablero(models.Model):
    TIPOS = [
        ('kanban', 'Kanban'),
        ('scrum', 'Scrum'),
        ('personal', 'Personal'),
    ]

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE, related_name='tableros')
    tipo = models.CharField(max_length=20, choices=TIPOS, default='kanban')
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tableros_creados')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tablero'
        verbose_name_plural = 'Tableros'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.nombre} - {self.proyecto.nombre}"


class ColumnaTablero(models.Model):
    tablero = models.ForeignKey(Tablero, on_delete=models.CASCADE, related_name='columnas')
    nombre = models.CharField(max_length=200)
    orden = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=7, default='#6b7280')
    limite_tareas = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        verbose_name = 'Columna del Tablero'
        verbose_name_plural = 'Columnas del Tablero'
        ordering = ['orden']

    def __str__(self):
        return f"{self.nombre} ({self.tablero.nombre})"
