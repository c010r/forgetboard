from django.db import models as django_models
from rest_framework import viewsets
from .models import Actividad
from .serializers import ActividadSerializer
from apps.usuarios.permissions import IsProjectMemberOrAdmin

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    filterset_fields = ['proyecto', 'tarea', 'usuario', 'accion']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        proyecto = self.request.query_params.get('proyecto')
        if proyecto:
            qs = qs.filter(proyecto_id=proyecto)
        user = self.request.user
        if user.rol != 'administrador':
            qs = qs.filter(
                django_models.Q(proyecto__miembros__usuario=user) |
                django_models.Q(usuario=user)
            ).distinct()
        return qs
