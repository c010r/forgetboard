from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario, PerfilUsuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'is_active']
        read_only_fields = ['id']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'rol']

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['id', 'usuario', 'bio', 'cargo', 'departamento', 'fecha_nacimiento', 'habilidades']
        read_only_fields = ['usuario']
