# Security Audit — GymApp (Frontend)

Auditoría realizada en julio 2026. Complementa el `SECURITY_AUDIT.md` del backend.

---

## Estado general

El frontend delega toda la autorización real al backend. Su responsabilidad es:
1. No exponer rutas a usuarios sin el rol correcto (guards de rutas).
2. No introducir XSS ni inyección de datos.
3. Validar inputs client-side como primera línea de defensa (UX + reducción de requests inválidos).

---

## 1. Guards de rutas

| Componente | Protege | Comportamiento si no cumple |
|---|---|---|
| `ProtectedRoute` | Cualquier ruta autenticada | Redirige a `/` |
| `CoachRoute` | Rutas `/coach/*` | Redirige a `/dashboard` si `user.role !== 'coach'` |
| `AdminRoute` | Rutas `/admin/*` | Redirige a `/dashboard` si `!isAdmin` |

Todos esperan a que `isLoading` sea `false` antes de evaluar, evitando flasheos de contenido no autorizado.

---

## 2. Manejo de sesión y tokens

- Token JWT almacenado en `localStorage` — aceptable porque toda la validación real ocurre en el backend.
- El rol del usuario se enriquece desde `/users/profile` en cada inicio de sesión y al restaurar sesión desde storage. No se confía en el rol almacenado localmente sin confirmación del backend.
- Al recibir 401, `api.ts` intenta un refresh automático (una vez). Si falla, limpia `localStorage` y redirige a login.
- `refreshToken` almacenado en `localStorage` — mismo razonamiento: el backend valida su vigencia.

---

## 3. XSS

- No se usa `dangerouslySetInnerHTML` en ningún componente.
- No hay llamadas a `eval()` ni `innerHTML` directa.
- React escapa automáticamente todas las interpolaciones `{variable}` en JSX.

---

## 4. Validación de inputs client-side

### Formularios de perfil (`ProfileSettings.tsx`)

Todos los campos tienen `maxLength` en el input HTML:

| Campo | Límite |
|---|---|
| `first_name`, `last_name` | 60 caracteres |
| `bio` | 200 caracteres |
| `height_cm` | `max={250}` |
| `weight_kg` | `max={300}` |

### Chat (`Chat.tsx`)

- Textarea de mensaje: `maxLength={2000}`, coherente con el límite del backend.

### Subida de avatar — Perfil de usuario (`ProfileSettings.tsx`)

Corregido en julio 2026 (PR #12): `handleAvatarChange` ahora valida antes de llamar a `uploadAvatar`:
- MIME type: acepta solo `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Tamaño: rechaza si supera 5 MB

Antes no había ninguna validación client-side.

### Subida de archivos — Perfil de coach (`ProfileEditor.tsx`)

Valida antes de pedir URL firmada:
- MIME type contra lista blanca (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`)
- Tamaño máximo: 10 MB

### Subida de documentos — Solicitud coach (`ApplyAsCoach.tsx`)

Corregido en julio 2026: `handleFileChange` ahora valida:
- MIME type: rechaza si no es `application/pdf`, `image/jpeg`, `image/png` o `image/webp`
- Tamaño: rechaza si supera 10 MB

Antes de la corrección no había ninguna validación client-side (solo el atributo `accept` del input, que es eludible).

---

## 5. Pendiente — Requiere cambio en backend

### IDOR en `/messages/:partnerId` — CRÍTICO

**Archivo:** `src/pages/Chat.tsx` + `src/services/messages.ts`

**Descripción:** Cualquier usuario autenticado puede leer el historial de mensajes de otro usuario navegando directamente a `/messages/<victim-uuid>`. El cliente solo valida formato UUID; no verifica que el `partnerId` tenga una conversación existente con el usuario actual.

**Riesgo:** Lectura no autorizada de mensajes privados entre usuarios.

**Acción requerida en el backend:** El endpoint `GET /messages/:partnerId` debe verificar que `auth.uid()` sea igual a `sender_id` OR `receiver_id` de los mensajes antes de devolverlos. En Supabase esto se resuelve con una RLS policy sobre la tabla `messages`:

```sql
CREATE POLICY "users can only read their own messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```

Verificar también que la policy esté activa y que el cliente realtime use el JWT del usuario (ya implementado en `messages.ts` vía `supabaseRealtime.realtime.setAuth(token)`).

**Detectado:** julio 2026 (code review PR #12). No corregido en frontend por ser responsabilidad exclusiva del backend.

---

## 6. Pendiente — Fuera del código

### Límite de tamaño en Supabase Storage

El backend genera URLs firmadas sin ver los bytes del archivo. El límite de 10 MB se valida client-side, pero un cliente malicioso puede ignorarlo y subir directamente a la URL firmada.

**Acción requerida:** En Supabase Dashboard → Storage → bucket `coach-documents` → configurar *File size limit* a 10 MB (10485760 bytes).

Lo mismo aplica para el bucket de avatares de coaches si existe.

---

## Referencia cruzada

Ver `../GymAppBack/SECURITY_AUDIT.md` para validaciones equivalentes en el backend (las validaciones client-side son complementarias, no sustitutos).
