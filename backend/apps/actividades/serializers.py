from rest_framework import serializers
from .models import Actividad

class ActividadSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Actividad
        fields = ['id', 'usuario', 'usuario_nombre', 'proyecto', 'tarea', 'accion', 'descripcion', 'metadatos', 'fecha']
        read_only_fields = ['id', 'fecha']
