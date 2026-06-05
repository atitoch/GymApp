import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getAdminCoaches, type AdminUser } from '../../services/admin';

export const AdminCoaches: React.FC = () => {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminCoaches()
      .then(data => setCoaches(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar coaches'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <h1 className="text-2xl font-bold text-stone-100">Coaches activos</h1>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
          </div>
        ) : coaches.length === 0 ? (
          <p className="text-stone-400 text-center py-12">No hay coaches registrados.</p>
        ) : (
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-400 text-xs border-b border-stone-800">
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Nombre</th>
                  <th className="text-left px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map(coach => {
                  const name = [coach.first_name, coach.last_name].filter(Boolean).join(' ') || '—';
                  const isActive = coach.coach_status === 'approved';
                  return (
                    <tr key={coach.id} className="border-b border-stone-800/50 last:border-0">
                      <td className="px-5 py-3 text-stone-100">{coach.email}</td>
                      <td className="px-5 py-3 text-stone-300">{name}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30' : 'bg-stone-700 text-stone-400 border border-stone-600'}`}>
                          {isActive ? 'activo' : coach.coach_status ?? 'desconocido'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
