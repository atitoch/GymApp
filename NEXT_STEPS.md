# GymApp — Próximos Pasos

## Estado: Fases 3–6 completadas ✅

- Fase 3 (emails de notificación): implementada (`emailService.ts`)
- Fase 4 (subida real de documentos): implementada (`storageController.ts`, signed URLs, `ApplyAsCoach.tsx`)
- Fase 5 (perfil público del coach): implementada (`CoachProfile.tsx`, `getCoachProfile`)
- Fase 6 (dashboard "Mi entrenador"): implementada (`MyCoach.tsx`, `getMyCoach`)

---

## Deuda técnica

- [x] Paginación real en tablas del admin (usuarios, auth events) — server-side, ya implementada
- [x] Rate limiting específico para `/api/admin/*` — `adminRateLimit` en `index.ts`
- [x] Tests de integración para flujo admin → coach → usuario — `GymAppBack/src/tests/adminCoachUserFlow.test.ts`
- [ ] Verificar en Vercel que estén configuradas las variables de producción del backend:
  - `SUPABASE_URL`, `SUPABASE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — conexión a Supabase
  - `FRONTEND_URL` — CORS en producción + links en emails
  - `BACKEND_URL` — URLs de callback (si falta, cae a `VERCEL_URL`)
  - `RESEND_API_KEY` — envío de emails transaccionales
  - `NODE_ENV=production`
  - Frontend (Vite): `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Nota: `JWT_SECRET`/`JWT_REFRESH_SECRET` NO aplican — la auth está delegada por completo a Supabase Auth, el backend solo decodifica claims (no firma con secreto propio)
- [ ] Paginación server-side en `getAdminCoaches` (actualmente trae todo y pagina en cliente con `.slice`)
