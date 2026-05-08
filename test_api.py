"""Script de verificación de la API - ForgeBoard"""
import json, sys, urllib.request, urllib.error

BASE = 'http://localhost:8000/api'
ok = 0

def req(method, path, data=None, token=None):
    url = f'{BASE}/{path}'
    h = {'Content-Type': 'application/json'}
    if token: h['Authorization'] = f'Bearer {token}'
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=h, method=method)
    try:
        resp = urllib.request.urlopen(r)
        body = resp.read()
        return resp.status, json.loads(body.decode()) if body and body.strip() else {}
    except urllib.error.HTTPError as e:
        body = e.read()
        return e.code, json.loads(body.decode()) if body and body.strip() else {'_http_error': str(body)}

def check(label, cond):
    global ok
    if cond:
        ok += 1; print(f"  ✅ {label}")
    else:
        print(f"  ❌ {label}")

print("=== VERIFICACIÓN API FORGEBOARD ===")

code, data = req('POST', 'auth/login/', {'username': 'admin', 'password': 'admin123'})
TOKEN = data.get('access', '')
check("Login JWT", code == 200 and bool(TOKEN))

for path in ['usuarios/me/', 'espacios/', 'proyectos/', 'tableros/', 'columnas/',
             'tareas/', 'sprints/', 'recursos/', 'documentos/', 'notificaciones/',
             'actividades/', 'reportes/dashboard/']:
    code, d = req('GET', path, token=TOKEN)
    check(f"GET /{path} => {code}", code == 200)

# Clean old test data
code, projs = req('GET', 'proyectos/', token=TOKEN)
for p in (projs.get('results', projs) if isinstance(projs, dict) else projs):
    if p.get('codigo', '').startswith('TST'):
        req('DELETE', f'proyectos/{p["id"]}/', token=TOKEN)

code, esp = req('POST', 'espacios/', {'nombre': f'WS Test'}, token=TOKEN)
check(f"POST /espacios/ => {code}", code in [200, 201])
ESP_ID = esp.get('id')

code, proj = req('POST', 'proyectos/', {'nombre': 'Test', 'codigo': f'TST{ESP_ID}',
    'descripcion': 'Test', 'espacio': ESP_ID, 'estado': 'en_curso', 'prioridad': 'alta'}, token=TOKEN)
check(f"POST /proyectos/ => {code}", code in [200, 201])
PROJ_ID = proj.get('id')

code, board = req('POST', 'tableros/', {'nombre': 'Kanban', 'proyecto': PROJ_ID, 'tipo': 'kanban'}, token=TOKEN)
check(f"POST /tableros/ => {code}", code in [200, 201])
BOARD_ID = board.get('id')

code, cols = req('GET', f'columnas/?tablero={BOARD_ID}', token=TOKEN)
cols_list = cols.get('results', cols) if isinstance(cols, dict) else cols
check(f"3 Columnas creadas", len(cols_list) == 3)
COL1 = cols_list[0]['id']
COL2 = cols_list[1]['id']

code, task = req('POST', 'tareas/', {'titulo': 'Tarea A', 'proyecto': PROJ_ID,
    'tablero': BOARD_ID, 'columna': COL1, 'tipo': 'tarea', 'prioridad': 'alta'}, token=TOKEN)
check(f"POST /tareas/ => {code} ({task.get('codigo','')})", code in [200, 201])
TID = task.get('id')

code, _ = req('POST', f'tareas/{TID}/mover/', {'columna_id': COL2}, token=TOKEN)
check(f"Mover tarea => {code}", code == 200)

code, _ = req('POST', f'tareas/{TID}/comentarios/', {'contenido': 'Comentario test'}, token=TOKEN)
check(f"Comentar => {code}", code in [200, 201])

code, _ = req('POST', f'tareas/{TID}/subtareas/', {'titulo': 'Subtarea 1'}, token=TOKEN)
check(f"Subtarea => {code}", code in [200, 201])

code, chk = req('POST', f'tareas/{TID}/checklists/', {'nombre': 'Checklist test'}, token=TOKEN)
check(f"Checklist => {code}", code in [200, 201])
if code in [200, 201] and chk.get('id'):
    code2, _ = req('POST', 'tareas/checklist-items/', {'checklist': chk['id'], 'texto': 'Item 1'}, token=TOKEN)
    check(f"ChecklistItem => {code2}", code2 in [200, 201])

code, _ = req('POST', 'recursos/registros-tiempo/', {'tarea': TID, 'horas': 2.5,
    'descripcion': 'Desarrollo', 'fecha': '2026-05-07'}, token=TOKEN)
check(f"Registro Tiempo => {code}", code in [200, 201])

code, _ = req('POST', 'recursos/', {'nombre': 'Developer', 'tipo': 'humano', 'costo_hora': 50}, token=TOKEN)
check(f"POST /recursos/ => {code}", code in [200, 201])

code, _ = req('POST', 'sprints/', {'nombre': 'Sprint 1', 'proyecto': PROJ_ID,
    'fecha_inicio': '2026-05-01', 'fecha_fin': '2026-05-15'}, token=TOKEN)
check(f"POST /sprints/ => {code}", code in [200, 201])

code, _ = req('POST', 'sprints/hitos/', {'nombre': 'Hito 1', 'proyecto': PROJ_ID,
    'fecha_estimada': '2026-05-15'}, token=TOKEN)
check(f"POST /hitos/ => {code}", code in [200, 201])

code, _ = req('POST', 'notificaciones/', {'usuario': 1, 'tipo': 'sistema',
    'titulo': 'Notificación test', 'mensaje': 'Test'}, token=TOKEN)
check(f"POST /notificaciones/ => {code}", code in [200, 201])

code, dash = req('GET', 'reportes/dashboard/', token=TOKEN)
check(f"Dashboard OK", code == 200 and 'total_proyectos' in dash)

code, _ = req('GET', 'actividades/', token=TOKEN)
check(f"Actividades OK", code == 200)

print(f"\n=== {ok}/28 tests OK ===")
