from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion
from .serializers import NotificacionSerializer

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    filterset_fields = ['leida', 'tipo']
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        notificacion = self.get_object()
        notificacion.leida = True
        notificacion.save()
        return Response(NotificacionSerializer(notificacion).data)

    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        Notificacion.objects.filter(usuario=request.user, leida=False).update(leida=True)
        return Response(status=status.HTTP_200_OK)
