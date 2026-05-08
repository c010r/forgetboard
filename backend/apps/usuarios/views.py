from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario, PerfilUsuario
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, PerfilUsuarioSerializer
from apps.usuarios.permissions import IsAdmin, IsAdminOrReadOnly


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.filter(is_active=True)
    serializer_class = UsuarioSerializer
    search_fields = ['username', 'email', 'first_name', 'last_name']
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class PerfilUsuarioViewSet(viewsets.ModelViewSet):
    queryset = PerfilUsuario.objects.all()
    serializer_class = PerfilUsuarioSerializer
    permission_classes = [IsAdmin]
