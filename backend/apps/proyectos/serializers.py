from rest_framework import serializers
from .models import Proyecto, MiembroProyecto, DocumentoProyecto, Unidad

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

    class Meta:
        model = Proyecto
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion']


class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion']


class DocumentoProyectoSerializer(serializers.ModelSerializer):
    subido_por_nombre = serializers.CharField(source='subido_por.username', read_only=True)

    class Meta:
        model = DocumentoProyecto
        fields = ['id', 'proyecto', 'nombre', 'archivo', 'tipo', 'subido_por', 'subido_por_nombre', 'descripcion', 'fecha_subida']
        read_only_fields = ['id', 'subido_por', 'fecha_subida']
