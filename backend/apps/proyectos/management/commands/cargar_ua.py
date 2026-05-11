import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.proyectos.models import UA


class Command(BaseCommand):
    help = 'Carga el catálogo de unidades asistenciales desde unidades.geojson'

    def handle(self, *args, **options):
        path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'public', 'unidades.geojson')
        if not os.path.exists(path):
            self.stderr.write(f'Archivo no encontrado: {path}')
            return

        with open(path) as f:
            geo = json.load(f)

        creadas = 0
        for feature in geo.get('features', []):
            p = feature.get('properties', {})
            if not p or not p.get('latlong'):
                continue
            latlong = p['latlong']
            if ',' not in latlong:
                continue
            try:
                lat, lng = map(float, latlong.split(','))
            except (ValueError, TypeError):
                continue
            nombre = (p.get('nombre') or '').strip()
            if not nombre:
                continue
            if p.get('cerrada') == 'SI':
                continue
            _, created = UA.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'direccion': ' '.join(filter(None, [p.get('calle'), p.get('numpuerta')])),
                    'latitud': lat,
                    'longitud': lng,
                    'categoria': p.get('categoria') or '',
                    'departamento': p.get('departamento') or '',
                    'localidad': p.get('localida') or '',
                }
            )
            if created:
                creadas += 1

        total = UA.objects.count()
        self.stdout.write(f'{creadas} unidades nuevas creadas. Total en catálogo: {total}')
