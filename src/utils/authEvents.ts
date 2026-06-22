// src/utils/authEvents.ts
//
// Bus mínimo para avisar cuando el access token se renueva. api.ts renueva
// el token vía /auth/refresh y lo guarda en localStorage, pero nada más lo
// sabe en el momento — en particular, el socket de Supabase Realtime sigue
// autenticado con el JWT viejo hasta que alguien le llama setAuth() de
// nuevo. Sin esto, cuando el token expira el chat deja de recibir mensajes
// en silencio (RLS bloquea postgres_changes con un JWT vencido) y nadie se
// entera hasta que un cliente se queja.
type TokenListener = (token: string) => void;

const listeners = new Set<TokenListener>();

/** Se llama cada vez que se obtiene un access token nuevo via refresh. */
export function onTokenRefreshed(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitTokenRefreshed(token: string): void {
  for (const listener of listeners) listener(token);
}
