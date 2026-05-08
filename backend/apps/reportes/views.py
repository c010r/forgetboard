from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from apps.proyectos.models import Proyecto
from apps.tareas.models import Tarea
from apps.actividades.models import Actividad
from apps.actividades.serializers import ActividadSerializer

class ReporteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        ahora = timezone.now()

        total_proyectos = Proyecto.objects.count()
        proyectos_activos = Proyecto.objects.filter(estado__in=['en_curso', 'en_riesgo']).count()
        mis_tareas = Tarea.objects.filter(responsable=user).exclude(estado__in=['finalizada', 'cancelada']).count()
        tareas_vencidas = Tarea.objects.filter(
            responsable=user,
            fecha_limite__lt=ahora
        ).exclude(estado__in=['finalizada', 'cancelada']).count()

        tareas_por_estado = Tarea.objects.values('estado').annotate(count=Count('id'))
        tareas_por_prioridad = Tarea.objects.values('prioridad').annotate(count=Count('id'))
        proyectos_por_estado = Proyecto.objects.values('estado').annotate(count=Count('id'))

        actividades_recientes = Actividad.objects.filter(
            Q(usuario=user) | Q(proyecto__in=user.miembro_proyectos.values('proyecto'))
        ).order_by('-fecha')[:10]

        actividades_data = ActividadSerializer(actividades_recientes, many=True).data

        return Response({
            'total_proyectos': total_proyectos,
            'proyectos_activos': proyectos_activos,
            'mis_tareas': mis_tareas,
            'tareas_vencidas': tareas_vencidas,
            'tareas_por_estado': tareas_por_estado,
            'tareas_por_prioridad': tareas_por_prioridad,
            'proyectos_por_estado': proyectos_por_estado,
            'actividades_recientes': actividades_data,
        })
