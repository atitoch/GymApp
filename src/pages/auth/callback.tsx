import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { Loader2 } from "lucide-react";

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (token && refreshToken) {
      // Obtener info del usuario usando el endpoint verify
      fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.user) {
            // Construir AuthResponse con los datos del usuario
            setAuthData({
              user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
              },
              token: token,
              refreshToken: refreshToken,
            });
            navigate("/dashboard");
          } else {
            navigate("/login?error=authentication_failed");
          }
        })
        .catch(() => {
          navigate("/login?error=authentication_failed");
        });
    } else {
      navigate("/login?error=missing_tokens");
    }
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-400">Completando autenticación...</p>
      </div>
    </div>
  );
};
