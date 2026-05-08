from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROLES = [
        ('administrador', 'Administrador'),
        ('gerente_proyecto', 'Gerente de Proyecto'),
        ('coordinador', 'Coordinador'),
        ('tecnico', 'Técnico'),
        ('colaborador', 'Colaborador'),
        ('cliente', 'Cliente / Invitado'),
    ]

    rol = models.CharField(max_length=30, choices=ROLES, default='colaborador')
    telefono = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatares/', blank=True, null=True)

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_rol_display()})"


class PerfilUsuario(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil')
    bio = models.TextField(blank=True, null=True)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    departamento = models.CharField(max_length=100, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    habilidades = models.JSONField(default=list, blank=True)

    class Meta:
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'

    def __str__(self):
        return f"Perfil de {self.usuario.username}"
