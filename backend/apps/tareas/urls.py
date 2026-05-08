from rest_framework.routers import DefaultRouter
from .views import (
    TareaViewSet, EtiquetaViewSet, SubtareaViewSet, ChecklistViewSet,
    ChecklistItemViewSet, ComentarioViewSet, DependenciaTareaViewSet
)

router = DefaultRouter()
router.register(r'etiquetas', EtiquetaViewSet, basename='etiquetas')
router.register(r'subtareas', SubtareaViewSet, basename='subtareas')
router.register(r'checklists', ChecklistViewSet, basename='checklists')
router.register(r'checklist-items', ChecklistItemViewSet, basename='checklist-items')
router.register(r'comentarios', ComentarioViewSet, basename='comentarios')
router.register(r'dependencias', DependenciaTareaViewSet, basename='dependencias')
router.register(r'', TareaViewSet, basename='tareas')
urlpatterns = router.urls
