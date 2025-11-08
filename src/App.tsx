import { useState } from 'react';
import { Dumbbell, ChevronRight, Edit2, Trash2 } from 'lucide-react';

import { routineData } from './services/routine';
import { SelectUser } from './pages/selectUser';
import { Header } from './components/header';

const App = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [view, setView] = useState<'select' | 'week' | 'routine'>('select');

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setView('week');
    // Detectar el día actual (0 = Domingo, 1 = Lunes, etc.)
    const today = new Date().getDay();
    setSelectedDay(today === 0 ? 6 : today - 1); // Ajustar para que Lunes = 0
  };

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setView('routine');
  };

  const handleBackToWeek = () => {
    setView('week');
  };

  const handleBackToSelect = () => {
    setView('select');
    setSelectedUser(null);
  };

  const currentRoutines = selectedUser ? routineData[selectedUser] : [];
  const currentRoutine = currentRoutines[selectedDay];

  // Vista de selección de usuario
  if (view === 'select') {
    return <SelectUser handleUserSelect={handleUserSelect} />;
  }

  // Vista de semana
  if (view === 'week') {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Header
            currentUser={selectedUser}
            handleBackToSelect={handleBackToSelect}
          />

          {/* Grid de días */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRoutines.map((routine, index) => {
              const isToday =
                index === new Date().getDay() - 1 ||
                (new Date().getDay() === 0 && index === 6);
              const isRest = routine.dayName === 'DESCANSO';

              return (
                <button
                  key={index}
                  onClick={() => handleDaySelect(index)}
                  className={`relative bg-slate-800 hover:bg-slate-700 rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 ${
                    isToday ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {isToday && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">
                      {routine.day}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  </div>

                  <div
                    className={`text-xl font-bold mb-2 ${
                      isRest ? 'text-green-400' : 'text-slate-50'
                    }`}
                  >
                    {routine.dayName}
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2">
                    {routine.title}
                  </p>

                  {!isRest && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <Dumbbell className="w-4 h-4" />
                      <span>
                        {routine.sections.reduce(
                          (acc, s) => acc + s.exercises.length,
                          0
                        )}{' '}
                        ejercicios
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vista de rutina del día
  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={handleBackToWeek}
            className="text-blue-500 hover:text-blue-400 mb-3 flex items-center gap-2 transition-colors"
          >
            ← Volver a la semana
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-50">
                  {currentRoutine.day}
                </h1>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full">
                  {currentRoutine.dayName}
                </span>
              </div>
              <p className="text-slate-400">{currentRoutine.title}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <Edit2 className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Calentamiento */}
        {currentRoutine.warmup && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              Calentamiento
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-6 space-y-2">
              {currentRoutine.warmup.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-slate-300"
                >
                  <span className="text-slate-600 text-sm mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secciones de ejercicios */}
        {currentRoutine.sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.exercises.map((exercise, eIdx) => (
                <div
                  key={eIdx}
                  className="bg-slate-800 rounded-xl p-6 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-50 mb-2">
                        {exercise.name}
                      </h3>
                      {exercise.notes && (
                        <p className="text-sm text-slate-400 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Series</div>
                      <div className="text-slate-50 font-semibold">
                        {exercise.sets}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Reps</div>
                      <div className="text-slate-50 font-semibold">
                        {exercise.reps}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">RPE</div>
                      <div className="text-green-400 font-semibold">
                        {exercise.rpe}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        Descanso
                      </div>
                      <div className="text-slate-50 font-semibold text-sm">
                        {exercise.rest}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Enfriamiento */}
        {currentRoutine.cooldown && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Enfriamiento
            </h2>
            <div className="bg-slate-800/50 rounded-xl p-6 space-y-2">
              {currentRoutine.cooldown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-slate-300"
                >
                  <span className="text-slate-600 text-sm mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consejos (solo mostrar en días específicos) */}
        {currentRoutine.day === 'Lunes' && (
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-50 mb-4">
              💡 Consejos Importantes
            </h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                • <strong>Progresión:</strong> Aumenta peso cuando alcances el
                rango superior de reps con buena técnica
              </p>
              <p>
                • <strong>Nutrición:</strong> Con 5 días de entrenamiento
                necesitas +300-400 calorías sobre mantenimiento
              </p>
              <p>
                • <strong>Hidratación:</strong> Mínimo 3L de agua diaria
              </p>
              <p>
                • <strong>Sueño crítico:</strong> 8-9 horas mínimo para
                recuperación óptima
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
