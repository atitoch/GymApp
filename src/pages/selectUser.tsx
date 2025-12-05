import { UserCards } from "../components/userCards";
import { Dumbbell, Plus, LogOut, Sparkles, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export const SelectUser: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleUserSelect = (userId: string) => {
    navigate(`/routine/${userId}`);
  };

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-slate-50 mb-2">GymTrack</h1>
          <p className="text-slate-400 text-lg">
            {user?.name
              ? `Bienvenido, ${user.name}`
              : "¿Quién va a entrenar hoy?"}
          </p>
        </div>

        <UserCards onUserSelect={handleUserSelect} />

        {/* Sección de Entrenamientos Personalizados - Próximamente */}
        <div className="mt-12 mb-8">
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-blue-500/30 p-8 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-slate-50">
                    Entrenamientos Personalizados
                  </h3>
                  <span className="px-3 py-1 bg-blue-500/30 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30">
                    Próximamente
                  </span>
                </div>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  Pronto podrás acceder a entrenamientos personalizados
                  diseñados especialmente para ti. Contacta con nuestros coaches
                  certificados para obtener un plan de entrenamiento adaptado a
                  tus objetivos y necesidades.
                </p>
                <div className="flex items-center gap-2 text-blue-400">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Contacta con un coach para más información
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button className="mx-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            Agregar Usuario
          </button>
          <button
            onClick={handleLogout}
            className="mx-auto flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-3 rounded-lg transition-colors border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};
