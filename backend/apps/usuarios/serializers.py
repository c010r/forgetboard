from rest_framework import serializers
from .models import Usuario, PerfilUsuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'telefono', 'avatar', 'is_active']
        read_only_fields = ['id']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'rol', 'telefono']

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = '__all__'
        read_only_fields = ['usuario']
