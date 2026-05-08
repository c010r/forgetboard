# PROMPT MAESTRO — SISTEMA TIPO TRELLO + JIRA PARA GESTIÓN DE PROYECTOS Y RECURSOS

Quiero desarrollar un sistema web completo para gestión de proyectos, tareas, tableros Kanban, planificación tipo Jira, sprints, recursos, documentación y reportes.

## Stack técnico obligatorio

Backend:
- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication con djangorestframework-simplejwt
- django-filter
- CORS habilitado para frontend React

Frontend:
- React
- Vite
- Tailwind CSS 3.4.17
- React Router
- Axios
- TanStack Query
- Dnd Kit para drag and drop
- Recharts para gráficos

## Objetivo del sistema

Crear una plataforma tipo Trello + Jira que permita gestionar distintos proyectos desde un único lugar. Cada proyecto podrá tener tableros Kanban, tareas, subtareas, checklists, comentarios, responsables, prioridades, etiquetas, sprints, backlog, roadmap, recursos, documentos y reportes.

## Módulos principales

1. Autenticación y usuarios
2. Roles y permisos
3. Espacios de trabajo
4. Proyectos
5. Miembros de proyecto
6. Tableros
7. Columnas del tablero
8. Tareas
9. Subtareas
10. Checklists
11. Comentarios
12. Etiquetas
13. Adjuntos
14. Sprints
15. Backlog
16. Roadmap e hitos
17. Recursos del proyecto
18. Registro de horas
19. Notificaciones
20. Actividad y auditoría
21. Dashboard
22. Reportes

## Roles

Crear los siguientes roles:

- Administrador
- Gerente de Proyecto
- Coordinador
- Técnico
- Colaborador
- Cliente / Invitado

## Modelos principales

Crear modelos Django en español o con nombres claros, manteniendo consistencia.

Modelos requeridos:

- Usuario
- PerfilUsuario
- EspacioTrabajo
- Proyecto
- MiembroProyecto
- Tablero
- ColumnaTablero
- Tarea
- Subtarea
- Checklist
- ChecklistItem
- Comentario
- Etiqueta
- Adjunto
- Sprint
- Hito
- Recurso
- RegistroTiempo
- DependenciaTarea
- Notificacion
- Actividad
- DocumentoProyecto

## Proyecto

Campos mínimos:

- nombre
- descripcion
- codigo
- estado
- fecha_inicio
- fecha_fin_estimada
- fecha_fin_real
- responsable
- prioridad
- presupuesto_estimado
- presupuesto_ejecutado
- porcentaje_avance

Estados:

- planificado
- en_curso
- en_pausa
- en_riesgo
- finalizado
- cancelado

## Tarea

Campos mínimos:

- codigo
- titulo
- descripcion
- proyecto
- tablero
- columna
- tipo
- estado
- prioridad
- responsable
- creador
- fecha_creacion
- fecha_inicio
- fecha_limite
- fecha_cierre
- horas_estimadas
- horas_trabajadas
- porcentaje_avance
- orden

Tipos:

- tarea
- bug
- historia_usuario
- mejora
- incidencia
- requerimiento
- documentacion
- reunion
- soporte
- implementacion

Prioridades:

- baja
- media
- alta
- critica
- urgente

Estados:

- nueva
- pendiente
- en_progreso
- bloqueada
- en_revision
- en_pruebas
- finalizada
- cancelada

## Funcionalidades obligatorias del MVP

1. Login con JWT.
2. CRUD de proyectos.
3. CRUD de tableros.
4. CRUD de columnas.
5. CRUD de tareas.
6. Drag and drop para mover tareas entre columnas.
7. Asignar responsables a tareas.
8. Cambiar prioridad.
9. Agregar etiquetas.
10. Agregar comentarios.
11. Crear subtareas.
12. Crear checklists.
13. Registrar actividad automática.
14. Dashboard inicial.
15. Filtros por proyecto, responsable, estado, prioridad y etiqueta.

## Frontend

Crear una SPA moderna con:

- Login
- Layout principal con sidebar
- Dashboard
- Vista de proyectos
- Detalle de proyecto
- Vista Kanban
- Modal de tarea
- Vista lista tipo Jira
- Vista de recursos
- Vista de reportes
- Configuración

## Diseño visual

Usar una estética moderna, limpia y profesional:

- Sidebar vertical
- Modo claro/oscuro preparado
- Cards con bordes redondeados
- Colores por prioridad
- Badges para estados
- Tableros drag and drop fluidos
- Modales amplios para detalle de tareas
- Toasts para feedback
- Diseño responsive

## Backend

Crear:

- serializers
- viewsets
- routers
- permisos personalizados
- filtros
- paginación
- ordenamiento
- endpoints especiales para mover tareas entre columnas
- endpoints para dashboard y reportes

## Endpoints esperados

- /api/auth/login/
- /api/auth/refresh/
- /api/usuarios/
- /api/espacios/
- /api/proyectos/
- /api/proyectos/{id}/miembros/
- /api/tableros/
- /api/columnas/
- /api/tareas/
- /api/tareas/{id}/mover/
- /api/tareas/{id}/comentarios/
- /api/tareas/{id}/subtareas/
- /api/tareas/{id}/checklists/
- /api/sprints/
- /api/recursos/
- /api/documentos/
- /api/notificaciones/
- /api/reportes/dashboard/

## Requisitos técnicos

- Código ordenado por apps Django.
- Variables de entorno.
- Configuración para PostgreSQL.
- CORS habilitado.
- Migraciones iniciales.
- Permisos por rol.
- Validaciones en serializers.
- Respuestas JSON claras.
- Frontend desacoplado del backend.
- Servicios Axios organizados por módulo.
- Componentes reutilizables.

## Resultado esperado

Generar el proyecto completo paso a paso, comenzando por:

1. Crear backend Django.
2. Configurar PostgreSQL.
3. Crear apps.
4. Crear modelos.
5. Crear serializers.
6. Crear viewsets.
7. Crear rutas.
8. Probar API.
9. Crear frontend React.
10. Crear login.
11. Crear layout.
12. Crear CRUD de proyectos.
13. Crear tablero Kanban.
14. Crear tareas con drag and drop.
15. Crear dashboard inicial.

El sistema debe estar preparado para crecer hacia una plataforma comercial multiempresa en futuras versiones.
