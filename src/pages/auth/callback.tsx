import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { completeOAuthLogin } from '../../services/auth';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();
  // Evita ejecutar el intercambio dos veces (StrictMode monta dos veces en dev),
  // lo que invalidaría el código de autorización de un solo uso.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const legacyToken = searchParams.get('token');
    const legacyRefreshToken = searchParams.get('refreshToken');

    // Flujo OAuth con Supabase (Google/GitHub): viene un ?code= que intercambiamos
    // por una sesión.
    if (code || searchParams.get('error') || searchParams.get('error_description')) {
      completeOAuthLogin(window.location.href)
        .then((authData) => {
          setAuthData(authData);
          navigate('/dashboard', { replace: true });
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'authentication_failed';
          navigate(`/auth/error?message=${encodeURIComponent(message)}`, {
            replace: true,
          });
        });
      return;
    }

    // Flujo heredado: el backend redirige con token + refreshToken en la URL.
    if (legacyToken && legacyRefreshToken) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${legacyToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.user) {
            setAuthData({
              user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
              },
              token: legacyToken,
              refreshToken: legacyRefreshToken,
            });
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/login?error=authentication_failed', { replace: true });
          }
        })
        .catch(() => {
          navigate('/login?error=authentication_failed', { replace: true });
        });
      return;
    }

    navigate('/login?error=missing_tokens', { replace: true });
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400 mx-auto mb-4" />
        <p className="text-stone-400">Completando autenticación...</p>
      </div>
    </div>
  );
};
