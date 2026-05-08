from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models as django_models
from django_filters import rest_framework as filters
from .models import Tarea, Subtarea, Checklist, ChecklistItem, Comentario, Etiqueta, Adjunto, DependenciaTarea
from apps.proyectos.models import Unidad
from .serializers import (
    TareaListSerializer, TareaDetailSerializer, TareaMoveSerializer,
    SubtareaSerializer, ChecklistSerializer, ChecklistItemSerializer,
    ComentarioSerializer, EtiquetaSerializer, AdjuntoSerializer,
    DependenciaTareaSerializer
)
from apps.actividades.models import Actividad
from apps.usuarios.permissions import IsProjectMemberOrAdmin


COLUMNA_TO_ESTADO = {
    'A IMPLEMENTAR': 'a_implementar',
    'EN IMPLEMENTACIÓN': 'en_implementacion',
    'IMPLEMENTADA': 'implementada',
}


def sincronizar_unidad(tarea):
    estado = COLUMNA_TO_ESTADO.get(tarea.columna.nombre)
    if not estado:
        return
    Unidad.objects.filter(tarea=tarea).exclude(estado_implementacion=estado).update(
        estado_implementacion=estado,
        fecha_implementacion=None if estado == 'a_implementar' else (
            tarea.fecha_cierre if estado == 'implementada' else None
        )
    )

class TareaFilter(filters.FilterSet):
    class Meta:
        model = Tarea
        fields = {
            'proyecto': ['exact'],
            'columna': ['exact'],
            'tablero': ['exact'],
            'estado': ['exact'],
            'prioridad': ['exact'],
            'responsable': ['exact'],
            'tipo': ['exact'],
            'sprint': ['exact'],
            'etiquetas': ['exact'],
        }

class TareaViewSet(viewsets.ModelViewSet):
    queryset = Tarea.objects.all()
    filterset_class = TareaFilter
    search_fields = ['titulo', 'descripcion', 'codigo']
    ordering_fields = ['orden', 'fecha_creacion', 'prioridad', 'fecha_limite']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_serializer_class(self):
        if self.action == 'list':
            return TareaListSerializer
        return TareaDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()

    def perform_create(self, serializer):
        proyecto = serializer.validated_data.get('proyecto')
        existing_codes = Tarea.objects.filter(proyecto=proyecto).values_list('codigo', flat=True)
        max_num = 0
        for code in existing_codes:
            parts = code.split('-')
            if len(parts) > 1 and parts[-1].isdigit():
                max_num = max(max_num, int(parts[-1]))
        codigo = f"{proyecto.codigo}-{max_num + 1}"
        tarea = serializer.save(creador=self.request.user, codigo=codigo)
        Actividad.objects.create(
            usuario=self.request.user,
            proyecto=tarea.proyecto,
            tarea=tarea,
            accion='creacion',
            descripcion=f'Creó la tarea {tarea.codigo}: {tarea.titulo}'
        )

    def perform_update(self, serializer):
        tarea = serializer.save()
        sincronizar_unidad(tarea)
        Actividad.objects.create(
            usuario=self.request.user,
            proyecto=tarea.proyecto,
            tarea=tarea,
            accion='actualizacion',
            descripcion=f'Actualizó la tarea {tarea.codigo}'
        )

    def perform_destroy(self, instance):
        codigo = instance.codigo
        titulo = instance.titulo
        proyecto = instance.proyecto
        instance.delete()
        Actividad.objects.create(
            usuario=self.request.user,
            proyecto=proyecto,
            accion='eliminacion',
            descripcion=f'Eliminó la tarea {codigo}: {titulo}'
        )

    @action(detail=True, methods=['post'])
    def mover(self, request, pk=None):
        tarea = self.get_object()
        serializer = TareaMoveSerializer(data=request.data)
        if serializer.is_valid():
            columna_id = serializer.validated_data['columna_id']
            orden = serializer.validated_data.get('orden', 0)
            tarea.columna_id = columna_id
            tarea.orden = orden
            tarea.save()
            sincronizar_unidad(tarea)
            Actividad.objects.create(
                usuario=request.user,
                proyecto=tarea.proyecto,
                tarea=tarea,
                accion='movimiento',
                descripcion=f'Movió la tarea {tarea.codigo} a {tarea.columna.nombre}'
            )
            return Response(TareaDetailSerializer(tarea).data)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get', 'post'])
    def comentarios(self, request, pk=None):
        tarea = self.get_object()
        if request.method == 'GET':
            comentarios = Comentario.objects.filter(tarea=tarea)
            serializer = ComentarioSerializer(comentarios, many=True)
            return Response(serializer.data)
        serializer = ComentarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tarea=tarea, autor=request.user)
            Actividad.objects.create(
                usuario=request.user,
                proyecto=tarea.proyecto,
                tarea=tarea,
                accion='comentario',
                descripcion=f'Comentó en {tarea.codigo}'
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get', 'post'])
    def subtareas(self, request, pk=None):
        tarea = self.get_object()
        if request.method == 'GET':
            subtareas = Subtarea.objects.filter(tarea=tarea)
            serializer = SubtareaSerializer(subtareas, many=True)
            return Response(serializer.data)
        serializer = SubtareaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tarea=tarea)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get', 'post'])
    def checklists(self, request, pk=None):
        tarea = self.get_object()
        if request.method == 'GET':
            checklists = Checklist.objects.filter(tarea=tarea)
            serializer = ChecklistSerializer(checklists, many=True)
            return Response(serializer.data)
        serializer = ChecklistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tarea=tarea)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def adjuntos(self, request, pk=None):
        tarea = self.get_object()
        serializer = AdjuntoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tarea=tarea, subido_por=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get', 'post'])
    def dependencias(self, request, pk=None):
        tarea = self.get_object()
        if request.method == 'GET':
            deps = DependenciaTarea.objects.filter(
                django_models.Q(tarea_origen=tarea) | django_models.Q(tarea_destino=tarea)
            )
            serializer = DependenciaTareaSerializer(deps, many=True)
            return Response(serializer.data)
        serializer = DependenciaTareaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tarea_origen=tarea)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def asignar(self, request, pk=None):
        tarea = self.get_object()
        usuario_id = request.data.get('usuario_id')
        if not usuario_id:
            return Response({'error': 'usuario_id requerido'}, status=400)
        tarea.responsable_id = usuario_id
        tarea.save()
        Actividad.objects.create(
            usuario=request.user,
            proyecto=tarea.proyecto,
            tarea=tarea,
            accion='asignacion',
            descripcion=f'Asignó {tarea.codigo} a {tarea.responsable.username if tarea.responsable else "sin asignar"}'
        )
        return Response(TareaDetailSerializer(tarea).data)


class EtiquetaViewSet(viewsets.ModelViewSet):
    serializer_class = EtiquetaSerializer
    filterset_fields = ['proyecto']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = Etiqueta.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()


class SubtareaViewSet(viewsets.ModelViewSet):
    serializer_class = SubtareaSerializer
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = Subtarea.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(tarea__proyecto__miembros__usuario=user).distinct()


class ChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistSerializer
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = Checklist.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(tarea__proyecto__miembros__usuario=user).distinct()


class ChecklistItemViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = ChecklistItem.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(checklist__tarea__proyecto__miembros__usuario=user).distinct()


class ComentarioViewSet(viewsets.ModelViewSet):
    serializer_class = ComentarioSerializer
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = Comentario.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(tarea__proyecto__miembros__usuario=user).distinct()


class DependenciaTareaViewSet(viewsets.ModelViewSet):
    serializer_class = DependenciaTareaSerializer
    permission_classes = [IsProjectMemberOrAdmin]
    filterset_fields = ['tarea_origen', 'tarea_destino', 'tipo']

    def get_queryset(self):
        qs = DependenciaTarea.objects.all()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(
            models.Q(tarea_origen__proyecto__miembros__usuario=user) |
            models.Q(tarea_destino__proyecto__miembros__usuario=user)
        ).distinct()
