from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PerfilUsuario

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ['username', 'email', 'rol', 'is_active']
    list_filter = ['rol', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Info adicional', {'fields': ('rol', 'telefono', 'avatar')}),
    )

@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'cargo', 'departamento']
