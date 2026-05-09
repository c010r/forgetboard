from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('apps.usuarios.urls_auth')),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/espacios/', include('apps.espacios.urls')),
    path('api/proyectos/', include('apps.proyectos.urls')),
    path('api/tableros/', include('apps.tableros.urls')),
    path('api/columnas/', include('apps.tableros.urls_columnas')),
    path('api/tareas/', include('apps.tareas.urls')),
    path('api/sprints/', include('apps.sprints.urls')),
    path('api/notificaciones/', include('apps.notificaciones.urls')),
    path('api/actividades/', include('apps.actividades.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
    path('api/documentos/', include('apps.proyectos.urls_documentos')),
    path('api/unidades/', include('apps.proyectos.urls_unidades')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
