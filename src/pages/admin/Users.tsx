import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getAdminUsers, type AdminUser } from '../../services/admin';

type RoleFilter = 'all' | 'user' | 'coach' | 'admin';

const roleBadge: Record<string, string> = {
  admin: 'bg-lime-400/10 text-lime-400 border border-lime-400/30',
  coach: 'bg-blue-400/10 text-blue-400 border border-blue-400/30',
  user: 'bg-stone-700 text-stone-300 border border-stone-600',
};

const coachStatusBadge: Record<string, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30',
  approved: 'bg-lime-400/10 text-lime-400 border border-lime-400/30',
  rejected: 'bg-red-400/10 text-red-400 border border-red-400/30',
};

const PAGE_SIZE = 20;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAdminUsers({
      role: roleFilter === 'all' ? undefined : roleFilter,
      limit: PAGE_SIZE,
      page: page + 1,
    })
      .then(data => {
        setUsers(data.users);
        setTotal(data.pagination.total);
      })
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  }, [roleFilter, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-stone-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-stone-100">Usuarios</h1>
          <p className="text-stone-400 text-sm">{total} en total</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'user', 'coach', 'admin'] as RoleFilter[]).map(r => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${roleFilter === r ? 'bg-lime-400 text-stone-950' : 'bg-stone-800 text-stone-400 hover:text-stone-100'}`}
            >
              {r === 'all' ? 'Todos' : r}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-stone-400 text-center py-12">No hay usuarios.</p>
        ) : (
          <>
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-stone-400 text-xs border-b border-stone-800">
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Nombre</th>
                    <th className="text-left px-5 py-3">Rol</th>
                    <th className="text-left px-5 py-3">Coach status</th>
                    <th className="text-left px-5 py-3">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
                    return (
                      <tr key={u.id} className="border-b border-stone-800/50 last:border-0">
                        <td className="px-5 py-3 text-stone-100 truncate max-w-[200px]">{u.email}</td>
                        <td className="px-5 py-3 text-stone-300">{name}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[u.role] ?? roleBadge.user}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {u.coach_status ? (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${coachStatusBadge[u.coach_status] ?? 'bg-stone-700 text-stone-400'}`}>
                              {u.coach_status}
                            </span>
                          ) : (
                            <span className="text-stone-600 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-stone-400 text-xs">{formatDate(u.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-stone-400 text-sm">Página {page + 1} de {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-stone-300 rounded-xl text-sm hover:bg-stone-700 transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex items-center gap-1 px-3 py-2 bg-stone-800 text-stone-300 rounded-xl text-sm hover:bg-stone-700 transition-colors disabled:opacity-40"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
