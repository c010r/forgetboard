from rest_framework.routers import DefaultRouter
from .views import DocumentoProyectoViewSet

router = DefaultRouter()
router.register(r'', DocumentoProyectoViewSet, basename='documentos')
urlpatterns = router.urls
