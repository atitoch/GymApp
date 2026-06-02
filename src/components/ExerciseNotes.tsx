import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StickyNote,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import * as exerciseService from '../services/exercises';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExerciseNotesProps {
  exerciseName: string;
  userId: string;
  className?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Hook: useExerciseNote ────────────────────────────────────────────────────

function useExerciseNote(exerciseName: string, userId: string) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar nota existente
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    exerciseService
      .getExerciseNote(exerciseName)
      .then((data) => {
        if (cancelled) return;
        if (data?.note) setNote(data.note);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('Error loading note:', error.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseName, userId]);

  // Guardar con debounce (1.5s)
  const saveNote = useCallback(
    (value: string) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setStatus('saving');

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (!value.trim()) {
            // Si está vacío, eliminar la nota
            await exerciseService.deleteExerciseNote(exerciseName);
            setStatus('saved');
          } else {
            // Guardar o actualizar la nota
            await exerciseService.upsertExerciseNote({
              exercise_name: exerciseName,
              note: value,
            });
            setStatus('saved');
          }
        } catch (error) {
          console.error('Error saving note:', error);
          setStatus('error');
        }
        setTimeout(() => setStatus('idle'), 2000);
      }, 1500);
    },
    [exerciseName],
  );

  const handleChange = (value: string) => {
    setNote(value);
    saveNote(value);
  };

  const handleDelete = async () => {
    setNote('');
    setStatus('saving');
    try {
      await exerciseService.deleteExerciseNote(exerciseName);
      setStatus('saved');
    } catch (error) {
      console.error('Error deleting note:', error);
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 1500);
  };

  return { note, loading, status, handleChange, handleDelete };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExerciseNotes({
  exerciseName,
  userId,
  className = '',
}: ExerciseNotesProps) {
  const [expanded, setExpanded] = useState(false);
  const { note, loading, status, handleChange, handleDelete } = useExerciseNote(
    exerciseName,
    userId,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note, expanded]);

  // Abrir si ya hay nota guardada
  useEffect(() => {
    if (!loading && note.trim()) setExpanded(true);
  }, [loading, note]);

  const hasNote = note.trim().length > 0;

  return (
    <div className={`mt-3 ${className}`}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 text-xs font-medium transition-colors group"
        style={{ color: hasNote ? '#a5b4fc' : '#475569' }}
      >
        <StickyNote
          size={13}
          className={
            hasNote
              ? 'text-lime-400'
              : 'text-stone-600 group-hover:text-stone-400 transition-colors'
          }
        />
        <span className="group-hover:text-stone-300 transition-colors">
          {hasNote ? 'Ver nota' : 'Agregar nota'}
        </span>
        {hasNote && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#84cc16' }}
          />
        )}
        {expanded ? (
          <ChevronUp size={12} className="text-stone-500" />
        ) : (
          <ChevronDown size={12} className="text-stone-500" />
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div
          className="mt-2 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(163,230,53,0.06)',
            border: '1px solid rgba(163,230,53,0.2)',
          }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={loading ? '' : note}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={
              loading
                ? 'Cargando...'
                : 'Técnica, peso usado, sensaciones, PRs... cualquier cosa que quieras recordar.'
            }
            disabled={loading}
            rows={2}
            className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-stone-300 placeholder-stone-600 resize-none outline-none leading-relaxed"
            style={{ minHeight: '64px' }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 pb-3">
            {/* Character count */}
            <span className="text-xs text-stone-600">
              {note.length > 0 ? `${note.length} caracteres` : ''}
            </span>

            {/* Status + delete */}
            <div className="flex items-center gap-3">
              {/* Save status */}
              <span className="flex items-center gap-1 text-xs">
                {status === 'saving' && (
                  <>
                    <Loader2
                      size={11}
                      className="animate-spin text-lime-400"
                    />
                    <span className="text-stone-500">Guardando...</span>
                  </>
                )}
                {status === 'saved' && (
                  <>
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-emerald-500">Guardado</span>
                  </>
                )}
                {status === 'error' && (
                  <span className="text-red-400">Error al guardar</span>
                )}
              </span>

              {/* Delete button */}
              {hasNote && (
                <button
                  onClick={handleDelete}
                  className="text-stone-600 hover:text-red-400 transition-colors"
                  title="Eliminar nota"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
