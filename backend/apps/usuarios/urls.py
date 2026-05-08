from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, PerfilUsuarioViewSet

router = DefaultRouter()
router.register(r'perfiles', PerfilUsuarioViewSet, basename='perfiles')
router.register(r'', UsuarioViewSet, basename='usuarios')
urlpatterns = router.urls
