import { useNavigate } from 'react-router-dom';

export const Help: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mt-12 pt-8 border-t border-slate-800">
      <p className="text-sm text-slate-500 mb-4">
        ¿Necesitas ayuda? Intenta con:
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <button
          onClick={() => navigate('/login')}
          className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
        >
          Iniciar sesión
        </button>
        <span className="text-slate-700">•</span>
        <button
          onClick={() => navigate('/select')}
          className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
        >
          Seleccionar usuario
        </button>
        <span className="text-slate-700">•</span>
        <button
          onClick={() => navigate('/ayuda')}
          className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
        >
          Centro de ayuda
        </button>
      </div>
    </div>
  );
};
