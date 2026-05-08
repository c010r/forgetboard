from django.db import models
from django.conf import settings


class Proyecto(models.Model):
    ESTADOS = [
        ('planificado', 'Planificado'),
        ('en_curso', 'En Curso'),
        ('en_pausa', 'En Pausa'),
        ('en_riesgo', 'En Riesgo'),
        ('finalizado', 'Finalizado'),
        ('cancelado', 'Cancelado'),
    ]
    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
        ('urgente', 'Urgente'),
    ]

    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    codigo = models.CharField(max_length=20, unique=True)
    espacio = models.ForeignKey('espacios.EspacioTrabajo', on_delete=models.CASCADE, related_name='proyectos', blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='planificado')
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='proyectos_responsable')
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_fin_estimada = models.DateField(blank=True, null=True)
    fecha_fin_real = models.DateField(blank=True, null=True)
    presupuesto_estimado = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    presupuesto_ejecutado = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    porcentaje_avance = models.PositiveIntegerField(default=0)
    direccion = models.CharField(max_length=300, blank=True, null=True)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class MiembroProyecto(models.Model):
    ROLES = [
        ('gerente_proyecto', 'Gerente de Proyecto'),
        ('coordinador', 'Coordinador'),
        ('tecnico', 'Técnico'),
        ('colaborador', 'Colaborador'),
        ('cliente', 'Cliente'),
    ]

    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='miembros')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='miembro_proyectos')
    rol = models.CharField(max_length=20, choices=ROLES, default='colaborador')
    fecha_ingreso = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Miembro del Proyecto'
        verbose_name_plural = 'Miembros del Proyecto'
        unique_together = ('proyecto', 'usuario')

    def __str__(self):
        return f"{self.usuario.username} - {self.proyecto.nombre}"


class DocumentoProyecto(models.Model):
    TIPOS = [
        ('documento', 'Documento'),
        ('plano', 'Plano'),
        ('informe', 'Informe'),
        ('contrato', 'Contrato'),
        ('presentacion', 'Presentación'),
        ('otro', 'Otro'),
    ]

    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='documentos')
    nombre = models.CharField(max_length=200)
    archivo = models.FileField(upload_to='documentos/')
    tipo = models.CharField(max_length=20, choices=TIPOS, default='documento')
    subido_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documentos_subidos')
    descripcion = models.TextField(blank=True, null=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Documento del Proyecto'
        verbose_name_plural = 'Documentos del Proyecto'
        ordering = ['-fecha_subida']

    def __str__(self):
        return f"{self.nombre} - {self.proyecto.nombre}"


class Unidad(models.Model):
    ESTADOS = [
        ('a_implementar', 'A IMPLEMENTAR'),
        ('en_implementacion', 'EN IMPLEMENTACIÓN'),
        ('implementada', 'IMPLEMENTADA'),
    ]

    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE, related_name='unidades')
    nombre = models.CharField(max_length=200)
    direccion = models.CharField(max_length=300, blank=True, null=True)
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    estado_implementacion = models.CharField(max_length=30, choices=ESTADOS, default='a_implementar')
    tarea = models.ForeignKey('tareas.Tarea', on_delete=models.SET_NULL, null=True, blank=True, related_name='unidades')
    fecha_implementacion = models.DateField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Unidad Asistencial'
        verbose_name_plural = 'Unidades Asistenciales'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.proyecto.codigo})"
