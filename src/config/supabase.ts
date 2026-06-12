import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    // Necesario para el login social (OAuth con Google/GitHub):
    // persistimos la sesión para conservar el code verifier de PKCE
    // entre la redirección al proveedor y la vuelta a /auth/callback.
    persistSession: true,
    autoRefreshToken: true,
    // El intercambio del código se hace de forma explícita en /auth/callback
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
    timeout: 10000,
  },
});

// Cliente dedicado SOLO para Realtime. La sesión de la app vive en
// localStorage (login vía backend REST), no en supabase-js; el cliente
// principal emite eventos de auth (sesiones OAuth persistidas, refresh)
// que sobrescriben el token del socket con realtime.setAuth(). Este
// cliente no gestiona sesión, así nada pisa el JWT que le pasamos.
export const supabaseRealtime = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
    timeout: 10000,
  },
});
