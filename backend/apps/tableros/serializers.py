from rest_framework import serializers
from .models import Tablero, ColumnaTablero

class ColumnaTableroSerializer(serializers.ModelSerializer):
    class Meta:
        model = ColumnaTablero
        fields = ['id', 'tablero', 'nombre', 'orden', 'color', 'limite_tareas']
        read_only_fields = ['id']

class TableroSerializer(serializers.ModelSerializer):
    columnas = ColumnaTableroSerializer(many=True, read_only=True)

    class Meta:
        model = Tablero
        fields = ['id', 'nombre', 'descripcion', 'proyecto', 'tipo', 'creador', 'fecha_creacion', 'columnas']
        read_only_fields = ['id', 'creador', 'fecha_creacion']
