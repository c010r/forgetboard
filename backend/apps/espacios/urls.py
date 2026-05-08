from rest_framework.routers import DefaultRouter
from .views import EspacioTrabajoViewSet

router = DefaultRouter()
router.register(r'', EspacioTrabajoViewSet, basename='espacios')
urlpatterns = router.urls
