from rest_framework import viewsets
from .models import Tablero, ColumnaTablero
from .serializers import TableroSerializer, ColumnaTableroSerializer
from apps.usuarios.permissions import IsProjectMemberOrAdmin

COLUMNAS_DEFAULT = [
    {'nombre': 'A IMPLEMENTAR', 'orden': 0, 'color': '#6b7280'},
    {'nombre': 'EN IMPLEMENTACIÓN', 'orden': 1, 'color': '#ef4444'},
    {'nombre': 'IMPLEMENTADA', 'orden': 2, 'color': '#3b82f6'},
]

class TableroViewSet(viewsets.ModelViewSet):
    serializer_class = TableroSerializer
    filterset_fields = ['proyecto']
    search_fields = ['nombre']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = Tablero.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()

    def perform_create(self, serializer):
        tablero = serializer.save(creador=self.request.user)
        for col_data in COLUMNAS_DEFAULT:
            ColumnaTablero.objects.create(tablero=tablero, **col_data)

class ColumnaTableroViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnaTableroSerializer
    filterset_fields = ['tablero', 'tablero__proyecto']
    ordering = ['orden']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = ColumnaTablero.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(tablero__proyecto__miembros__usuario=user).distinct()
