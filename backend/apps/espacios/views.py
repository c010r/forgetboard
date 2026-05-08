from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EspacioTrabajo, MiembroEspacio
from .serializers import EspacioTrabajoSerializer, MiembroEspacioSerializer
from apps.usuarios.permissions import IsAdminOrReadOnly, IsEspacioMember


class EspacioTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EspacioTrabajo.objects.filter(activo=True)
    serializer_class = EspacioTrabajoSerializer
    search_fields = ['nombre', 'descripcion']
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        espacio = serializer.save(creador=self.request.user)
        MiembroEspacio.objects.create(espacio=espacio, usuario=self.request.user, rol='propietario')

    @action(detail=True, methods=['post'])
    def agregar_miembro(self, request, pk=None):
        espacio = self.get_object()
        serializer = MiembroEspacioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(espacio=espacio)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['delete'])
    def remover_miembro(self, request, pk=None):
        espacio = self.get_object()
        miembro_id = request.data.get('miembro_id')
        MiembroEspacio.objects.filter(espacio=espacio, id=miembro_id).delete()
        return Response(status=204)
