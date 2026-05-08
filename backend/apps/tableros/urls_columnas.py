from rest_framework.routers import DefaultRouter
from .views import ColumnaTableroViewSet

router = DefaultRouter()
router.register(r'', ColumnaTableroViewSet, basename='columnas')
urlpatterns = router.urls
