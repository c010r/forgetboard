from django.db import models
from django.conf import settings


class Etiqueta(models.Model):
    nombre = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default='#3b82f6')
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE, related_name='etiquetas')

    class Meta:
        verbose_name = 'Etiqueta'
        verbose_name_plural = 'Etiquetas'
        unique_together = ('nombre', 'proyecto')

    def __str__(self):
        return self.nombre


class Tarea(models.Model):
    TIPOS = [
        ('tarea', 'Tarea'),
        ('bug', 'Bug'),
        ('historia_usuario', 'Historia de Usuario'),
        ('mejora', 'Mejora'),
        ('incidencia', 'Incidencia'),
        ('requerimiento', 'Requerimiento'),
        ('documentacion', 'Documentación'),
        ('reunion', 'Reunión'),
        ('soporte', 'Soporte'),
        ('implementacion', 'Implementación'),
    ]
    ESTADOS = [
        ('nueva', 'Nueva'),
        ('pendiente', 'Pendiente'),
        ('en_progreso', 'En Progreso'),
        ('bloqueada', 'Bloqueada'),
        ('en_revision', 'En Revisión'),
        ('en_pruebas', 'En Pruebas'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada'),
    ]
    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
        ('critica', 'Crítica'),
        ('urgente', 'Urgente'),
    ]

    codigo = models.CharField(max_length=20, unique=True)
    titulo = models.CharField(max_length=300)
    descripcion = models.TextField(blank=True, null=True)
    proyecto = models.ForeignKey('proyectos.Proyecto', on_delete=models.CASCADE, related_name='tareas')
    tablero = models.ForeignKey('tableros.Tablero', on_delete=models.CASCADE, related_name='tareas')
    columna = models.ForeignKey('tableros.ColumnaTablero', on_delete=models.CASCADE, related_name='tareas')
    tipo = models.CharField(max_length=20, choices=TIPOS, default='tarea')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='nueva')
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tareas_asignadas')
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tareas_creadas')
    etiquetas = models.ManyToManyField(Etiqueta, blank=True, related_name='tareas')
    sprint = models.ForeignKey('sprints.Sprint', on_delete=models.SET_NULL, null=True, blank=True, related_name='tareas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_inicio = models.DateTimeField(blank=True, null=True)
    fecha_limite = models.DateTimeField(blank=True, null=True)
    fecha_cierre = models.DateTimeField(blank=True, null=True)
    horas_estimadas = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    horas_trabajadas = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    porcentaje_avance = models.PositiveIntegerField(default=0)
    latitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitud = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        ordering = ['orden']

    def __str__(self):
        return f"{self.codigo} - {self.titulo}"


class Subtarea(models.Model):
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='subtareas')
    titulo = models.CharField(max_length=300)
    completada = models.BooleanField(default=False)
    responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Subtarea'
        verbose_name_plural = 'Subtareas'
        ordering = ['orden']

    def __str__(self):
        return self.titulo


class Checklist(models.Model):
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='checklists')
    nombre = models.CharField(max_length=200)

    class Meta:
        verbose_name = 'Checklist'
        verbose_name_plural = 'Checklists'

    def __str__(self):
        return self.nombre


class ChecklistItem(models.Model):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name='items')
    texto = models.CharField(max_length=300)
    completado = models.BooleanField(default=False)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Elemento de Checklist'
        verbose_name_plural = 'Elementos de Checklist'
        ordering = ['orden']

    def __str__(self):
        return self.texto


class Comentario(models.Model):
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comentarios')
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    editado = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Comentario'
        verbose_name_plural = 'Comentarios'
        ordering = ['fecha_creacion']

    def __str__(self):
        return f"Comentario de {self.autor.username} en {self.tarea.codigo}"


class Adjunto(models.Model):
    tarea = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='adjuntos')
    archivo = models.FileField(upload_to='adjuntos/')
    nombre = models.CharField(max_length=200)
    subido_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Adjunto'
        verbose_name_plural = 'Adjuntos'

    def __str__(self):
        return self.nombre


class DependenciaTarea(models.Model):
    TIPOS = [
        ('bloquea', 'Bloquea'),
        ('es_bloqueado', 'Es Bloqueado'),
        ('relacionada', 'Relacionada'),
    ]

    tarea_origen = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='dependencias_origen')
    tarea_destino = models.ForeignKey(Tarea, on_delete=models.CASCADE, related_name='dependencias_destino')
    tipo = models.CharField(max_length=20, choices=TIPOS, default='bloquea')

    class Meta:
        verbose_name = 'Dependencia de Tarea'
        verbose_name_plural = 'Dependencias de Tareas'
        unique_together = ('tarea_origen', 'tarea_destino')

    def __str__(self):
        return f"{self.tarea_origen.codigo} {self.get_tipo_display()} {self.tarea_destino.codigo}"
