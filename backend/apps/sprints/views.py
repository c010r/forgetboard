from rest_framework import viewsets
from .models import Sprint, Hito
from .serializers import SprintSerializer, HitoSerializer
from apps.usuarios.permissions import IsProjectMemberOrAdmin

class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    filterset_fields = ['proyecto', 'estado']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()

class HitoViewSet(viewsets.ModelViewSet):
    queryset = Hito.objects.all()
    serializer_class = HitoSerializer
    filterset_fields = ['proyecto', 'estado']
    permission_classes = [IsProjectMemberOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.rol == 'administrador':
            return qs
        return qs.filter(proyecto__miembros__usuario=user).distinct()
