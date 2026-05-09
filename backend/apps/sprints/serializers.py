from rest_framework import serializers
from .models import Sprint, Hito

class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = ['id', 'proyecto', 'nombre', 'objetivo', 'fecha_inicio', 'fecha_fin',
                  'estado', 'capacidad_horas', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']

class HitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hito
        fields = ['id', 'proyecto', 'nombre', 'descripcion', 'fecha_estimada',
                  'fecha_real', 'estado']
        read_only_fields = ['id']
