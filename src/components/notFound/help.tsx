import { useNavigate } from "react-router-dom";

export const Help: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-12 pt-8 border-t border-stone-800">
      <p className="text-sm text-stone-500 mb-4">
        ¿Necesitas ayuda? Intenta con:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <button
          onClick={() => navigate("/login")}
          className="text-lime-400 hover:text-lime-300 transition-colors hover:underline"
        >
          Iniciar sesión
        </button>
        <span className="text-stone-700">•</span>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-lime-400 hover:text-lime-300 transition-colors hover:underline"
        >
          Ir al dashboard
        </button>
        <span className="text-stone-700">•</span>
        <button
          onClick={() => navigate("/ayuda")}
          className="text-lime-400 hover:text-lime-300 transition-colors hover:underline"
        >
          Centro de ayuda
        </button>
      </div>
    </div>
  );
};
