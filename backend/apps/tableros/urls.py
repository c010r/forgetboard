from rest_framework.routers import DefaultRouter
from .views import TableroViewSet

router = DefaultRouter()
router.register(r'', TableroViewSet, basename='tableros')
urlpatterns = router.urls
