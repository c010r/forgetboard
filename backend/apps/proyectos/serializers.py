from rest_framework import serializers
from .models import Proyecto, MiembroProyecto, DocumentoProyecto, Unidad, PlantillaProyecto

class MiembroProyectoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    class Meta:
        model = MiembroProyecto
        fields = ['id', 'proyecto', 'usuario', 'usuario_nombre', 'usuario_email', 'rol', 'fecha_ingreso']
        read_only_fields = ['id', 'fecha_ingreso']

class ProyectoSerializer(serializers.ModelSerializer):
    miembros = MiembroProyectoSerializer(many=True, read_only=True)
    responsable_nombre = serializers.CharField(source='responsable.username', read_only=True, allow_null=True)
    plantilla_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Proyecto
        fields = ['id', 'nombre', 'descripcion', 'codigo', 'espacio', 'estado', 'prioridad',
                  'responsable', 'responsable_nombre', 'fecha_inicio', 'fecha_fin_estimada',
                  'fecha_fin_real', 'presupuesto_estimado', 'presupuesto_ejecutado',
                  'porcentaje_avance', 'direccion', 'latitud', 'longitud', 'fecha_creacion',
                  'plantilla', 'mostrar_mapa', 'plantilla_id', 'miembros']
        read_only_fields = ['id', 'fecha_creacion', 'porcentaje_avance', 'presupuesto_ejecutado', 'fecha_fin_real']


class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = ['id', 'proyecto', 'nombre', 'direccion', 'latitud', 'longitud',
                  'estado_implementacion', 'tarea', 'fecha_implementacion', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']


class PlantillaProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantillaProyecto
        fields = ['id', 'nombre', 'descripcion', 'mostrar_mapa', 'columnas', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']


class DocumentoProyectoSerializer(serializers.ModelSerializer):
    subido_por_nombre = serializers.CharField(source='subido_por.username', read_only=True)

    class Meta:
        model = DocumentoProyecto
        fields = ['id', 'proyecto', 'nombre', 'archivo', 'tipo', 'subido_por', 'subido_por_nombre', 'descripcion', 'fecha_subida']
        read_only_fields = ['id', 'subido_por', 'fecha_subida']
