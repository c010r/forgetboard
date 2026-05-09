from rest_framework import serializers
from .models import Tarea, Subtarea, Checklist, ChecklistItem, Comentario, Etiqueta, Adjunto, DependenciaTarea

class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ['id', 'nombre', 'color', 'proyecto']
        read_only_fields = ['id']

class SubtareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtarea
        fields = ['id', 'tarea', 'titulo', 'completada', 'responsable', 'orden']
        read_only_fields = ['id', 'tarea']

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'checklist', 'texto', 'completado', 'orden']
        read_only_fields = ['id']

class ChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Checklist
        fields = ['id', 'tarea', 'nombre', 'items']
        read_only_fields = ['id', 'tarea']

class ComentarioSerializer(serializers.ModelSerializer):
    autor_nombre = serializers.CharField(source='autor.username', read_only=True)

    class Meta:
        model = Comentario
        fields = ['id', 'tarea', 'autor', 'autor_nombre', 'contenido', 'fecha_creacion', 'editado']
        read_only_fields = ['id', 'tarea', 'autor', 'fecha_creacion', 'editado']

class AdjuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adjunto
        fields = ['id', 'tarea', 'archivo', 'nombre', 'subido_por', 'fecha_subida']
        read_only_fields = ['id', 'subido_por', 'fecha_subida']

class TareaListSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.CharField(source='responsable.username', read_only=True, allow_null=True)
    columna_nombre = serializers.CharField(source='columna.nombre', read_only=True)

    class Meta:
        model = Tarea
        fields = ['id', 'codigo', 'titulo', 'tipo', 'estado', 'prioridad', 'responsable',
                  'responsable_nombre', 'columna', 'columna_nombre', 'proyecto',
                  'fecha_creacion', 'fecha_limite', 'porcentaje_avance', 'latitud', 'longitud', 'orden']
        read_only_fields = ['id', 'fecha_creacion']

class TareaDetailSerializer(serializers.ModelSerializer):
    subtareas = SubtareaSerializer(many=True, read_only=True)
    checklists = ChecklistSerializer(many=True, read_only=True)
    comentarios = ComentarioSerializer(many=True, read_only=True)
    adjuntos = AdjuntoSerializer(many=True, read_only=True)
    etiquetas = EtiquetaSerializer(many=True, read_only=True)
    responsable_nombre = serializers.CharField(source='responsable.username', read_only=True, allow_null=True)
    creador_nombre = serializers.CharField(source='creador.username', read_only=True)
    columna_nombre = serializers.CharField(source='columna.nombre', read_only=True)

    class Meta:
        model = Tarea
        fields = ['id', 'codigo', 'titulo', 'descripcion', 'proyecto', 'tablero', 'columna',
                  'columna_nombre', 'tipo', 'estado', 'prioridad', 'responsable', 'responsable_nombre',
                  'creador', 'creador_nombre', 'etiquetas', 'sprint',
                  'fecha_creacion', 'fecha_inicio', 'fecha_limite', 'fecha_cierre',
                  'horas_estimadas', 'horas_trabajadas', 'porcentaje_avance',
                  'latitud', 'longitud', 'orden',
                  'subtareas', 'checklists', 'comentarios', 'adjuntos']
        read_only_fields = ['id', 'codigo', 'creador', 'fecha_creacion']

class DependenciaTareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DependenciaTarea
        fields = ['id', 'tarea_origen', 'tarea_destino', 'tipo']
        read_only_fields = ['id']

class TareaMoveSerializer(serializers.Serializer):
    columna_id = serializers.IntegerField()
    orden = serializers.IntegerField(required=False)
