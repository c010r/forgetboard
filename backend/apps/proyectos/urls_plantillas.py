from rest_framework.routers import DefaultRouter
from .views import PlantillaProyectoViewSet

router = DefaultRouter()
router.register(r'', PlantillaProyectoViewSet, basename='plantillas')
urlpatterns = router.urls
