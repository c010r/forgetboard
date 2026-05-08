from rest_framework import serializers
from .models import EspacioTrabajo, MiembroEspacio

class MiembroEspacioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = MiembroEspacio
        fields = ['id', 'espacio', 'usuario', 'usuario_nombre', 'rol', 'fecha_ingreso']
        read_only_fields = ['id', 'fecha_ingreso']

class EspacioTrabajoSerializer(serializers.ModelSerializer):
    miembros_espacio = MiembroEspacioSerializer(many=True, read_only=True)

    class Meta:
        model = EspacioTrabajo
        fields = ['id', 'nombre', 'descripcion', 'creador', 'miembros_espacio', 'fecha_creacion', 'activo']
        read_only_fields = ['id', 'creador', 'fecha_creacion']
