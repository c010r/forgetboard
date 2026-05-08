from django.db import models
from django.conf import settings


class Sprint(models.Model):
    ESTADOS = [
        ('planificado', 'Planificado'),
        ('activo', 'Activo'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE, related_name='sprints')
    nombre = models.CharField(max_length=200)
    objetivo = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='planificado')
    capacidad_horas = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Sprint'
        verbose_name_plural = 'Sprints'
        ordering = ['-fecha_inicio']

    def __str__(self):
        return f"{self.nombre} - {self.proyecto.nombre}"


class Hito(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]

    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE, related_name='hitos')
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    fecha_estimada = models.DateField()
    fecha_real = models.DateField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    class Meta:
        verbose_name = 'Hito'
        verbose_name_plural = 'Hitos'
        ordering = ['fecha_estimada']

    def __str__(self):
        return f"{self.nombre} - {self.proyecto.nombre}"
