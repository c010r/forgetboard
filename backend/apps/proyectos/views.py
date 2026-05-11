from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Proyecto, MiembroProyecto, DocumentoProyecto, Unidad
from .serializers import ProyectoSerializer, MiembroProyectoSerializer, DocumentoProyectoSerializer, UnidadSerializer
from apps.tableros.models import Tablero, ColumnaTablero
from apps.actividades.models import Actividad
from apps.usuarios.permissions import IsAdminOrReadOnly, IsProjectMemberOrAdmin

class ProyectoFilter(filters.FilterSet):
    class Meta:
        model = Proyecto
        fields = {
            'estado': ['exact'],
            'prioridad': ['exact'],
            'responsable': ['exact'],
            'espacio': ['exact'],
        }

class ProyectoViewSet(viewsets.ModelViewSet):
    queryset = Proyecto.objects.all()
    serializer_class = ProyectoSerializer
    filterset_class = ProyectoFilter
    search_fields = ['nombre', 'descripcion', 'codigo']
    permission_classes = [IsProjectMemberOrAdmin]

    TEMPLATE_COLUMNAS = {
        'implementacion': [
            {'nombre': 'SIN IMPLEMENTAR', 'orden': 0, 'color': '#6b7280'},
            {'nombre': 'EN IMPLEMENTACIÓN', 'orden': 1, 'color': '#ef4444'},
            {'nombre': 'IMPLEMENTADA', 'orden': 2, 'color': '#3b82f6'},
        ],
    }

    def perform_create(self, serializer):
        proyecto = serializer.save()
        MiembroProyecto.objects.create(proyecto=proyecto, usuario=self.request.user, rol='gerente_proyecto')
        if proyecto.plantilla == 'implementacion':
            proyecto.mostrar_mapa = True
            proyecto.save(update_fields=['mostrar_mapa'])
            tablero = Tablero.objects.create(
                nombre='Tablero Principal',
                proyecto=proyecto,
                tipo='kanban',
                creador=self.request.user,
            )
            for col_data in self.TEMPLATE_COLUMNAS['implementacion']:
                ColumnaTablero.objects.create(tablero=tablero, **col_data)
        Actividad.objects.create(
            usuario=self.request.user,
            proyecto=proyecto,
            accion='creacion',
            descripcion=f'Creó el proyecto {proyecto.nombre}'
        )

    def perform_update(self, serializer):
        proyecto = serializer.save()
        Actividad.objects.create(
            usuario=self.request.user,
            proyecto=proyecto,
            accion='actualizacion',
            descripcion=f'Actualizó el proyecto {proyecto.nombre}'
        )

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(miembros__usuario=user).distinct()

    @action(detail=True, methods=['get', 'post'])
    def miembros(self, request, pk=None):
        proyecto = self.get_object()
        if request.method == 'GET':
            miembros = MiembroProyecto.objects.filter(proyecto=proyecto)
            serializer = MiembroProyectoSerializer(miembros, many=True)
            return Response(serializer.data)
        serializer = MiembroProyectoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(proyecto=proyecto)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class DocumentoProyectoViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentoProyectoSerializer
    filterset_fields = ['proyecto', 'tipo']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = DocumentoProyecto.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()

    def perform_create(self, serializer):
        serializer.save(subido_por=self.request.user)


class UnidadViewSet(viewsets.ModelViewSet):
    serializer_class = UnidadSerializer
    filterset_fields = ['proyecto', 'estado_implementacion']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = Unidad.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()
