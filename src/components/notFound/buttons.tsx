import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Buttons: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <button
        onClick={handleGoHome}
        className="group flex items-center gap-3 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
      >
        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Regresar al inicio
      </button>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-50 font-semibold px-8 py-4 rounded-lg transition-all duration-300 border border-slate-700 hover:border-slate-600"
      >
        ← Página anterior
      </button>
    </div>
  );
};
