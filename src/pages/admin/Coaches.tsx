import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAdminCoaches, type AdminUser } from '../../services/admin';

const PAGE_SIZE = 20;

export const AdminCoaches: React.FC = () => {
  const navigate = useNavigate();
  const [all, setAll] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminCoaches()
      .then(data => setAll(Array.isArray(data) ? data : []))
      .catch(() => setError('Error al cargar coaches'))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const coaches = all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-100">Coaches activos</h1>
          <p className="text-stone-500 text-sm">{all.length} coaches</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
          </div>
        ) : coaches.length === 0 ? (
          <p className="text-stone-400 text-center py-12">No hay coaches registrados.</p>
        ) : (
          <>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 disabled:opacity-40 hover:bg-stone-700 transition-colors"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <p className="text-stone-400">Página {page + 1} de {totalPages}</p>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 disabled:opacity-40 hover:bg-stone-700 transition-colors"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
