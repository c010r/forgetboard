from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'administrador'


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.rol == 'administrador'


class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        proyecto = self._get_proyecto(obj)
        if proyecto:
            return proyecto.miembros.filter(usuario=request.user).exists()
        return True

    def _get_proyecto(self, obj):
        if hasattr(obj, 'proyecto') and obj.proyecto:
            return obj.proyecto
        if hasattr(obj, 'tablero') and hasattr(obj.tablero, 'proyecto'):
            return obj.tablero.proyecto
        if hasattr(obj, 'tarea') and hasattr(obj.tarea, 'proyecto'):
            return obj.tarea.proyecto
        return None


class IsProjectMemberOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.rol == 'administrador':
            return True
        proyecto = self._get_proyecto(obj)
        if proyecto:
            return proyecto.miembros.filter(usuario=request.user).exists()
        return True

    def _get_proyecto(self, obj):
        if hasattr(obj, 'proyecto') and obj.proyecto:
            return obj.proyecto
        if hasattr(obj, 'tablero') and hasattr(obj.tablero, 'proyecto'):
            return obj.tablero.proyecto
        if hasattr(obj, 'tarea') and hasattr(obj.tarea, 'proyecto'):
            return obj.tarea.proyecto
        return None


class IsEspacioMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.rol == 'administrador':
            return True
        espacio = self._get_espacio(obj)
        if espacio:
            return espacio.miembros.filter(usuario=request.user).exists()
        return True

    def _get_espacio(self, obj):
        if hasattr(obj, 'espacio') and obj.espacio:
            return obj.espacio
        return None


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        if hasattr(obj, 'creador'):
            return obj.creador == request.user
        if hasattr(obj, 'autor'):
            return obj.autor == request.user
        return False
