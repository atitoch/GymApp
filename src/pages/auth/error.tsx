import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export const AuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("message") || "Error desconocido al autenticar";

  useEffect(() => {
    // Redirigir automáticamente después de 5 segundos
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/60 border border-slate-700/50 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-50 mb-2">
          Error de Autenticación
        </h1>
        <p className="text-slate-400 mb-6">{errorMessage}</p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Volver al inicio de sesión
        </button>
        <p className="text-slate-500 text-sm mt-4">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>
    </div>
  );
};

