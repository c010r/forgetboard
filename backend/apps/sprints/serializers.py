from rest_framework import serializers
from .models import Sprint, Hito

class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion']

class HitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hito
        fields = '__all__'
        read_only_fields = ['id']
