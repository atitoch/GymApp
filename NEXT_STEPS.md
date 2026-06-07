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
- [ ] Variables de entorno para producción (FRONTEND_URL, JWT_SECRET, JWT_REFRESH_SECRET) — verificar configuración en Vercel
- [ ] Paginación server-side en `getAdminCoaches` (actualmente trae todo y pagina en cliente con `.slice`)
