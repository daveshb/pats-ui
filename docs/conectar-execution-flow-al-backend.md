# Conectar los cambios de "creación automática de ejecución" al backend real

Hoy agregamos al mockup de pats-ui (`src/components/pats/PatsPlatform.tsx`) la representación visual de que PATS ahora crea la ejecución de un trade automáticamente cuando queda listo, en vez de esperar que Ops la cree a mano. Todo esto hoy es dato de mentira, fijo en el código. Esta nota es para no perder de vista qué endpoint real alimenta cada parte cuando se conecte de verdad.

## Vistas que cambiamos

1. **Pestaña "Execution Flow"** — es la vista principal afectada:
   - Banner superior "What to do here" (los 4 pasos): el paso 1 ahora dice "Execution created" con tag "Auto".
   - Tarjeta de cada trade: badge verde "Created automatically by PATS" junto al ticker.
   - Bloque "Next action": ícono de rayo y texto explicando que PATS crea la ejecución sola.
   - Panel "Execution" (dentro de la tarjeta): campo "Route method" mostrando `automatic`/`manual`, y el botón "Create Manually" como respaldo.
2. **Pestaña "Workflows"** — panel de detalle de un workflow: el texto del final ahora dice que al completar los requisitos, PATS crea la ejecución sola (antes decía que el trade "pasa a ready for execution", sin más).
3. **Panel de notificaciones** (campana del header): agregamos una notificación de ejemplo "Execution created automatically".

## Qué reemplaza cada dato de mentira

### 1. El array `executionFlows` (toda la pestaña Execution Flow)

Hoy es un array hardcodeado en el archivo. Debería reemplazarse por una llamada a:

- `GET /executions` — trae la lista de `TradeExecution`, ya filtrable por `needsAction`, `completed`, `failedOrCancelled` (esos query params ya existen en el backend, calzan directo con nuestros filtros "Needs action / All / Completed").
- Cada `TradeExecution` que devuelve ya trae el campo que necesitamos: `routeMethod: "manual" | "automatic"`. **El badge "Created automatically by PATS" sale directo de ahí** — no hay que inventar nada, solo pintar el badge si `routeMethod === "automatic"`.
- También trae `status`, `ticker`, `side`, `quantity`, `amount`, `fills` — o sea, la mayoría de lo que hoy está en `ExecutionFlowRecord` ya viene de acá.

**Lo que el endpoint NO trae hoy** y el mock sí usa, para tener claro qué falta:
- `broker` y `asset` como **nombre** (el endpoint solo da `patsBrokerProfileId` y `privateAssetId`, los IDs). Hay que pedir esos nombres aparte, o pedirle al equipo de backend que enriquezca este endpoint igual que ya lo hacen en `GET /inbound-trades` (ese sí devuelve nombre de broker y de activo, no solo el ID).
- `currentStep` / `blockedStep` (el stepper de 6 pasos) — es un concepto solo de la UI. Hay que armarlo en el frontend a partir de `status` de la ejecución + si el `InboundTrade`/workflow asociado está bloqueado. No existe tal cual en el backend.
- `tradeWorkflowId` / `workflowTemplateId` — esos vienen del `TradeWorkflow` asociado al mismo `inboundTradeId`, no de la ejecución. Hay que cruzarlo con `GET /trade-workflows` o con el detalle del inbound trade.

### 2. El texto en la pestaña "Workflows" ("PATS automatically creates the execution...")

Es texto fijo, no depende de ningún dato — no hay nada que conectar ahí, es solo la explicación de cómo funciona el proceso.

### 3. La notificación "Execution created automatically"

Hoy está a mano en el array `notifications`. Para que sea real, necesitamos que el front llame al endpoint de notificaciones del backend (el módulo `notifications` existe y guarda estas notificaciones en su propia tabla), pero **no confirmé todavía si hay un `GET /notifications` expuesto por HTTP** — hay que revisar `lambda/notifications/http/` en PATS-Backend antes de dar esto por hecho.

## Qué le falta al frontend para poder llamar al backend real

Ya tenemos gran parte de lo difícil resuelto:

- **Login real ya existe**: `src/services/auth.ts` + `src/hooks/useAuth.ts` ya hacen login contra Cognito (SRP) y manejan refresh de token. Todo indica que es el mismo Cognito User Pool de PATS-Backend (mismo ecosistema, mismo cookie `vantage_auth`).
- **Lo que falta es el cliente HTTP hacia la API de PATS-Backend.** Hoy solo existe `auth.ts` en `src/services/` — no hay ningún archivo que llame a `/executions`, `/inbound-trades`, etc. Habría que crear algo como `src/services/pats-api.ts` que:
  1. Llame `ensureFreshSession()` antes de cada request (ya existe, solo hay que reusarlo).
  2. Mande el token (`session.idToken`) en el header `Authorization`.
  3. Apunte a la URL del API Gateway de PATS-Backend (falta definir una env var, ej. `NEXT_PUBLIC_PATS_API_URL`, apuntando al dominio del stack ya desplegado).
  4. Exponga funciones tipo `listExecutions()`, `getExecutionByInboundTrade(id)`, `listTradeWorkflows()`, etc., una por endpoint que se vaya a usar.

## El candado "Executed — this can no longer be cancelled or reversed"

Este no necesita ningún dato nuevo del backend — ya se puede conectar hoy mismo en cuanto exista el cliente HTTP. Sale del mismo campo que ya usa el badge de estado de arriba de la tarjeta (`StatusBadge value={flow.executionStatus}`): el `status` que devuelve `GET /executions` o `GET /inbound-trades/{id}/execution`. La condición es literal: `flow.executionStatus === "executed"`. No hay que pedirle nada extra al backend ni enriquecer nada — es el mismo dato, solo una segunda lectura de él.

## Resumen

Nada de lo que agregamos hoy está roto ni es difícil de conectar — el dato clave (`routeMethod`) ya existe tal cual en el backend real, lo confirmamos en la prueba de ayer contra dev. Lo que falta es 1) crear el cliente HTTP hacia PATS-Backend reusando el login que ya existe, y 2) decidir si el enriquecimiento de nombres (broker/asset) y la construcción del stepper se hacen en el frontend o se le pide al backend que los agregue al endpoint, como ya hace con inbound trades.
