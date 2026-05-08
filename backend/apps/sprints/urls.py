from rest_framework.routers import DefaultRouter
from .views import SprintViewSet, HitoViewSet

router = DefaultRouter()
router.register(r'hitos', HitoViewSet, basename='hitos')
router.register(r'', SprintViewSet, basename='sprints')
urlpatterns = router.urls
