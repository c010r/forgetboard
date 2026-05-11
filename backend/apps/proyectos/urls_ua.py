from rest_framework.routers import DefaultRouter
from .views import UAViewSet

router = DefaultRouter()
router.register(r'', UAViewSet, basename='ua')
urlpatterns = router.urls
