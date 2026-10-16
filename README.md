# Alerta Diversa Américas

Prototipo Next.js para documentar y visualizar crímenes de odio contra personas LGBTIQ+ en las Américas.

## Alcance actual

- Interfaz multilingüe en español, inglés, francés y portugués.
- Formulario y endpoint `POST /api/reports` con validación del lado del servidor.
- Visualización de ejemplos estáticos en `lib/cases.ts`, independientes de los formularios enviados. No constituyen una canalización de anonimización de reportes reales.

## Protección del endpoint

El POST acepta únicamente `application/x-www-form-urlencoded` y `multipart/form-data`. El cuerpo completo se limita a 64 KiB durante la lectura, incluso sin Content-Length; este límite incluye la codificación y los separadores multipart. Se rechazan formularios malformados, archivos, campos desconocidos y campos repetidos.

| Campo | Validación |
| --- | --- |
| location | Texto obligatorio no vacío; máximo 200 caracteres |
| incidentDate | Fecha real YYYY-MM-DD, año 0001–9999, no futura según el día UTC |
| violenceType | physical, threats, institutional u online |
| description | Al menos 20 caracteres después de quitar espacios de los extremos; máximo 10 000 caracteres |
| contact | Texto opcional; máximo 320 caracteres; no se verifica que sea un correo o teléfono |

Los máximos se comprueban sobre el texto original y se cuentan como unidades UTF-16 de JavaScript. Los controles del navegador no sustituyen estas comprobaciones.

Una entrada válida devuelve HTTP 200 y **solo** un UUID aleatorio y un mensaje fijo:

```json
{
  "reportId": "00000000-0000-4000-8000-000000000000",
  "message": "Report validated only; not stored or queued for review"
}
```

El UUID del ejemplo es ilustrativo. La respuesta real genera uno nuevo, independiente del contenido. No se devuelve el reporte, contacto, descripción ni otro dato enviado. El identificador no permite recuperar un caso y no acredita almacenamiento ni revisión humana. Se usa 200, en lugar de 201, porque no se crea un recurso persistente.

Los errores devuelven únicamente un mensaje fijo, sin valores recibidos ni detalles internos: 400 para formularios o campos inválidos, 413 para cuerpos demasiado grandes y 415 para tipos de contenido no admitidos. Todas las respuestas POST llevan `Cache-Control: no-store`. El handler no registra el cuerpo ni los errores en logs.

## Límites y trabajo pendiente

**No hay almacenamiento de reportes, cola de revisión, envío de notificaciones ni publicación de formularios recibidos.** El contenido se procesa temporalmente en memoria. Este prototipo no debe presentarse como un canal operativo de recepción o preservación de evidencia.

No devolver datos evita su exposición en la respuesta, pero **no anonimiza el contenido**: el texto libre puede incluir nombres, contactos, direcciones u otros identificadores. Los ejemplos públicos no demuestran anonimización real.

Antes de recibir casos reales se requiere:

- Diseñar almacenamiento y cifrado, gestión de claves, separación de datos de contacto, control de acceso y trazabilidad de consultas.
- Definir consentimiento, aviso de privacidad, retención, borrado y un flujo efectivo de revisión humana.
- Implementar minimización, eliminación de identificadores y metadatos, reducción de precisión geográfica y revisión del riesgo de reidentificación antes de publicar.
- Configurar HTTPS y revisar logs, cachés, telemetría y retención en la infraestructura: `no-store` y la ausencia de logs en este handler no controlan a proveedores externos.
- Añadir límites de frecuencia, protección contra abuso y límites de recursos en el servidor/proxy. El límite del handler no sustituye esas medidas.
- Actualizar los textos de la interfaz que todavía describen registro seguro o preservación de evidencia para reflejar el estado de prototipo.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

Usa `.env.example` como plantilla. No se versionan secretos reales.

## Verificación del endpoint

Después de instalar dependencias, con Node.js 22 o posterior:

```bash
node --test tests/reports.test.cjs
```

Las pruebas cargan el handler TypeScript y usan Request, Response y FormData reales de Node; sustituyen únicamente NextResponse.json. Cubren ausencia de datos en respuestas, UUID, validación, multipart, archivos, duplicados, errores de lectura y límite de tamaño. No sustituyen una prueba de integración con Next.js ni una revisión de infraestructura.
