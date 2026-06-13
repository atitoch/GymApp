# Contrato API — Planes de entrenamiento del coach

El frontend (branch `claude/coach-customer-payments-plans-yl9kbz`) ya implementa el flujo completo
de planes. Este documento especifica lo que el backend (`GymAppBack`) debe implementar para que
funcione. **No mezclar el frontend a `main` hasta que estos endpoints existan.**

## Flujo

1. El coach crea planes con precio en `/coach/plans` (UI: "Mis planes" en el panel).
2. El cliente ve los planes activos en el perfil público del coach y **elige uno al solicitar**
   la conexión (si el coach tiene planes, la selección es obligatoria en el frontend).
3. El coach ve la solicitud con el plan y precio elegidos. Al aceptar indica si ya recibió el pago:
   - `payment_received: true` → el backend crea un `coach_payment` **confirmado**.
   - `payment_received: false` → lo crea **pendiente** (lo confirma después en la pestaña Pagos).
   - Sin plan en la solicitud → comportamiento actual, sin pago automático.

El cobro sigue ocurriendo fuera de la app (igual que el módulo de pagos existente).

## Tabla nueva: `coach_plans`

```sql
create table coach_plans (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references coaches(id) on delete cascade,
  name        text not null,
  description text,
  price       numeric(10,2) not null check (price > 0),
  currency    text not null default 'MXN',
  interval    text not null default 'monthly'
              check (interval in ('weekly','monthly','quarterly','one_time')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
```

Columna nueva en la tabla de relaciones coach-cliente (la que respalda `/coach/connections`):

```sql
alter table client_relationships add column plan_id uuid references coach_plans(id) on delete set null;
```

> Nota: `on delete set null` + el frontend avisa al coach que "las solicitudes existentes lo
> conservan" — si se prefiere conservar el histórico exacto, usar borrado lógico
> (`is_active = false`) en lugar de DELETE físico y que DELETE archive.

## Endpoints

Todos autenticados con el JWT de Supabase, igual que el resto.

### Coach (rol `coach`)

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| GET | `/coach/plans` | — | `{ plans: CoachPlan[] }` (todos los del coach, activos e inactivos) |
| POST | `/coach/plans` | `{ name, description?, price, currency?, interval }` | `{ plan: CoachPlan }` |
| PUT | `/coach/plans/:planId` | parcial de los campos anteriores + `is_active?` | `{ plan: CoachPlan }` |
| DELETE | `/coach/plans/:planId` | — | `204` |

### Público (cualquier usuario autenticado)

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/coaches/:coachId/plans` | `{ plans: CoachPlan[] }` — **solo `is_active = true`** |

### Cambios en endpoints existentes

**`POST /coaches/:coachId/connect`** — ahora acepta body opcional:

```json
{ "plan_id": "uuid-del-plan" }
```

Validar que el plan pertenezca a ese coach y esté activo. Guardar `plan_id` en la relación.

**`GET /coach/connections/pending`** — cada request debe incluir el plan elegido (si hay):

```json
{
  "requests": [{
    "id": "...", "user_id": "...", "status": "pending",
    "users": { "...": "..." },
    "plan_id": "uuid",
    "plan": { "id": "uuid", "name": "Plan mensual", "price": 800, "currency": "MXN", "interval": "monthly" }
  }]
}
```

**`POST /coach/connections/:id/accept`** — ahora acepta body opcional:

```json
{ "payment_received": true }
```

Comportamiento cuando la relación tiene `plan_id` y llega `payment_received` (true o false):
crear un registro en la tabla de pagos existente (`coach_payments` o equivalente) con:

- `amount` / `currency`: los del plan
- `status`: `confirmed` si `payment_received === true`, `pending` si `false`
- `concept`: nombre del plan (ej. `"Plan mensual"`)
- `payment_date`: fecha de aceptación
- `coach_id` / `user_id`: los de la relación

Si no hay `plan_id` o no llega `payment_received`, aceptar igual que hoy sin crear pago.

## Shape de `CoachPlan` (el que espera el frontend)

```ts
interface CoachPlan {
  id: string;
  coach_id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;            // default 'MXN'
  interval: 'weekly' | 'monthly' | 'quarterly' | 'one_time';
  is_active: boolean;
  created_at?: string;
}
```

## Comportamiento del frontend mientras no exista el backend

- `getMyPlans` / `getCoachPlans` hacen `catch → []`: el panel y el perfil público se ven igual
  que hoy (sin sección de planes) y la solicitud funciona como siempre.
- La página `/coach/plans` muestra un error amigable al intentar cargar/crear.

## Opcional (mejoras posteriores)

- `GET /coaches` (directorio): incluir `min_plan_price` por coach para mostrar "desde $X".
- Deprecar `hourly_rate` en el perfil del coach una vez que los planes estén en uso.
