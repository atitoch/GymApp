import { AlertCircle, Dumbbell } from "lucide-react";

export const EmptyRoutine: React.FC<{ handleBackToSelect: () => void }> = ({
  handleBackToSelect,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-4 border-2 border-slate-700">
            <Dumbbell className="w-10 h-10 text-slate-400" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold text-slate-50">
              No hay rutina disponible
            </h1>
          </div>
          <p className="text-slate-400 mb-6">
            Aún no se ha configurado una rutina de entrenamiento para tu cuenta.
            Contacta con tu coach para obtener un plan personalizado.
          </p>
        </div>

        <button
          onClick={handleBackToSelect}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
        >
          ← Volver al dashboard
        </button>
      </div>
    </div>
  );
};
