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
        className="group flex items-center gap-3 bg-linear-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-stone-900 font-semibold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg shadow-lime-400/30 hover:shadow-lime-400/50 hover:scale-105"
      >
        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Regresar al inicio
      </button>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-50 font-semibold px-8 py-4 rounded-lg transition-all duration-300 border border-stone-700 hover:border-stone-600"
      >
        ← Página anterior
      </button>
    </div>
  );
};
