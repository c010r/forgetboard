from rest_framework.routers import DefaultRouter
from .views import ActividadViewSet

router = DefaultRouter()
router.register(r'', ActividadViewSet, basename='actividades')
urlpatterns = router.urls
