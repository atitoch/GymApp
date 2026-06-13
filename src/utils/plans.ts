import type { PlanInterval } from '../services/coachDashboard';

export const PLAN_INTERVAL_LABELS: Record<PlanInterval, string> = {
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  one_time: 'Pago único',
};

/** Sufijo corto para mostrar junto al precio: $800/mes */
export const PLAN_INTERVAL_SUFFIX: Record<PlanInterval, string> = {
  weekly: '/sem',
  monthly: '/mes',
  quarterly: '/trim',
  one_time: '',
};

export const fmtPlanPrice = (price: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(price);
