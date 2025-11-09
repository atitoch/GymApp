import { AlertCircle } from 'lucide-react';

export const ErrorMessage: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-2 mb-3">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
          Página no encontrada
        </h1>
      </div>
      <p className="text-lg text-slate-400 mb-2">
        Parece que esta rutina no existe en nuestro sistema
      </p>
      <p className="text-sm text-slate-500">
        La página que buscas pudo haber sido removida, renombrada o no existe.
      </p>
    </div>
  );
};
