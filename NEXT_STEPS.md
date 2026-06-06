# GymApp — Próximos Pasos

## Inmediato: Activar el sistema (Supabase)

Correr estos SQLs en el SQL Editor de Supabase **en este orden**:

1. `GymAppBack/database/migrations/add_admin_system.sql`
2. `GymAppBack/database/migrations/seed_admin_user.sql`
3. `GymAppBack/database/migrations/add_rls_policies.sql`
4. `GymAppBack/database/migrations/add_coach_phase2.sql`

---

## Fase 3 — Notificaciones por email

**Objetivo:** Avisar a coaches y usuarios cuando hay cambios de estado.

Eventos a notificar:
- Coach aprobado/rechazado por admin
- Coach acepta/rechaza conexión de usuario
- (Opcional) Recordatorio de entrenamiento

**Stack sugerido:** Resend (gratis hasta 3k emails/mes, SDK sencillo)

Archivos a crear:
- `GymAppBack/src/utils/emailService.ts` — cliente de Resend
- Templates: aprobación de coach, rechazo, conexión aceptada
- Llamar desde `adminController.ts` (approve/reject) y `coachController.ts` (accept/reject connection)

---

## Fase 4 — Subida real de documentos

**Objetivo:** Coaches suben sus certificados directamente desde la app.

Pasos:
1. Crear bucket `coach-documents` en Supabase Storage
2. Configurar políticas: usuarios autenticados pueden subir, admins pueden leer
3. Actualizar `GymApp/src/pages/ApplyAsCoach.tsx` — reemplazar el flujo de email por subida real
4. Crear `GymAppBack/src/Controller/storageController.ts` — generar signed URLs para subida

---

## Fase 5 — Perfil público del coach

**Objetivo:** Página de presentación de cada coach con su información completa.

- Ruta: `/coaches/:id`
- Muestra: bio, especialización, años de experiencia, tarifa, certificaciones
- Botón "Solicitar conexión" si el usuario no está conectado
- (Futuro) Rating promedio basado en feedback de clientes

Archivos:
- `GymApp/src/pages/coaches/CoachProfile.tsx`
- `GymAppBack/src/Routes/publicCoachRoutes.ts` — agregar `GET /:coachId`

---

## Fase 6 — Dashboard del usuario con coach asignado

**Objetivo:** El usuario ve quién es su entrenador y los comentarios que le ha dejado.

- Sección en `/dashboard` o `/profile`: "Mi entrenador"
- Muestra coach asignado, sus comentarios (no privados), rutina asignada
- Ruta: `/my-coach` con detalle completo

---

## Deuda técnica

- [ ] Agregar paginación real en tablas del admin (usuarios, auth events)
- [ ] Rate limiting específico para `/api/admin/*`
- [ ] Tests de integración para flujo admin → coach → usuario
- [ ] Variables de entorno para producción (FRONTEND_URL, JWT_SECRET, JWT_REFRESH_SECRET)
