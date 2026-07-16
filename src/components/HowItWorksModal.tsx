import React, { useState, useEffect } from 'react';
import { X, Users, Star, Dumbbell, ClipboardList, MessageSquare, CheckCircle, ChevronRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Role = 'user' | 'coach' | 'admin' | undefined;

interface Props {
  role: Role;
  onClose: () => void;
}

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: { label: string; path: string };
}

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  steps: Step[];
}

const userSections: Section[] = [
  {
    id: 'get-coach',
    label: 'Tener un coach',
    icon: <UserCheck size={16} />,
    color: '#a3e635',
    steps: [
      {
        icon: <Users size={18} />,
        title: 'Explora el directorio',
        desc: 'Ve a "Ver coaches" para ver todos los entrenadores disponibles con sus perfiles, especialidades y precios.',
        action: { label: 'Ver coaches', path: '/coaches' },
      },
      {
        icon: <Star size={18} />,
        title: 'Elige tu coach',
        desc: 'Revisa el perfil de cada coach: su bio, especialización y planes disponibles. Escoge el que mejor se adapte a tus metas.',
      },
      {
        icon: <MessageSquare size={18} />,
        title: 'Envía una solicitud',
        desc: 'Desde el perfil del coach, selecciona un plan y envía tu solicitud. El coach recibirá una notificación.',
      },
      {
        icon: <CheckCircle size={18} />,
        title: 'Espera confirmación',
        desc: 'Cuando el coach acepte tu solicitud, verás su tarjeta en tu dashboard y podrán comunicarse por mensajes.',
      },
      {
        icon: <Dumbbell size={18} />,
        title: 'Recibe tus rutinas',
        desc: 'Tu coach te asignará rutinas semana a semana. Aparecerán automáticamente en tu panel principal.',
      },
    ],
  },
  {
    id: 'become-coach',
    label: 'Ser coach',
    icon: <Star size={16} />,
    color: '#f59e0b',
    steps: [
      {
        icon: <ClipboardList size={18} />,
        title: 'Solicita ser coach',
        desc: 'Ve a "Ser coach" en tu dashboard y llena el formulario de solicitud con tu experiencia y motivación.',
        action: { label: 'Solicitar', path: '/apply-as-coach' },
      },
      {
        icon: <CheckCircle size={18} />,
        title: 'Espera aprobación',
        desc: 'El equipo de administración revisará tu solicitud. Recibirás una respuesta en tu correo.',
      },
      {
        icon: <Users size={18} />,
        title: 'Accede a tu panel',
        desc: 'Una vez aprobado, tendrás acceso al Panel de Entrenador donde puedes crear rutinas, gestionar clientes y más.',
      },
    ],
  },
];

const coachSections: Section[] = [
  {
    id: 'manage-clients',
    label: 'Gestionar clientes',
    icon: <Users size={16} />,
    color: '#a3e635',
    steps: [
      {
        icon: <CheckCircle size={18} />,
        title: 'Acepta solicitudes',
        desc: 'En tu panel verás las solicitudes pendientes. Acepta o rechaza a cada usuario que quiera contratarte.',
        action: { label: 'Ver solicitudes', path: '/coach/requests' },
      },
      {
        icon: <Users size={18} />,
        title: 'Revisa a tus clientes',
        desc: 'En "Clientes activos" puedes ver el historial de entrenamientos, racha y notas de cada uno.',
        action: { label: 'Mis clientes', path: '/coach/clients' },
      },
      {
        icon: <MessageSquare size={18} />,
        title: 'Comunícate con ellos',
        desc: 'Usa el chat integrado para dar indicaciones, responder dudas o motivar a tus clientes.',
        action: { label: 'Mensajes', path: '/messages' },
      },
    ],
  },
  {
    id: 'routines',
    label: 'Rutinas',
    icon: <Dumbbell size={16} />,
    color: '#8b5cf6',
    steps: [
      {
        icon: <Dumbbell size={18} />,
        title: 'Crea una rutina',
        desc: 'Ve a "Mis rutinas" y crea una nueva plantilla. Define los días, secciones y ejercicios con series y repeticiones.',
        action: { label: 'Crear rutina', path: '/coach/routines/new' },
      },
      {
        icon: <ClipboardList size={18} />,
        title: 'Gestiona tus plantillas',
        desc: 'Tus rutinas guardadas son reutilizables. Puedes editarlas y asignarlas a varios clientes a la vez.',
        action: { label: 'Mis rutinas', path: '/coach/routines' },
      },
      {
        icon: <UserCheck size={18} />,
        title: 'Asigna al cliente',
        desc: 'Entra al perfil de un cliente y usa el botón "Asignar rutina" para elegir una plantilla y la fecha de inicio.',
        action: { label: 'Ver clientes', path: '/coach/clients' },
      },
    ],
  },
  {
    id: 'plans',
    label: 'Planes y perfil',
    icon: <Star size={16} />,
    color: '#f59e0b',
    steps: [
      {
        icon: <Star size={18} />,
        title: 'Completa tu perfil',
        desc: 'Agrega tu bio y especialización para aparecer en el directorio público y que los usuarios puedan encontrarte.',
        action: { label: 'Editar perfil', path: '/coach/edit-profile' },
      },
      {
        icon: <ClipboardList size={18} />,
        title: 'Crea tus planes',
        desc: 'Define los planes que ofreces con nombre, precio y descripción. Aparecen en tu perfil público.',
        action: { label: 'Mis planes', path: '/coach/plans' },
      },
    ],
  },
];

export const HowItWorksModal: React.FC<Props> = ({ role, onClose }) => {
  const navigate = useNavigate();
  const isCoach = role === 'coach' || role === 'admin';
  const sections = isCoach ? coachSections : userSections;
  const [activeSection, setActiveSection] = useState(sections[0].id);

  const current = sections.find(s => s.id === activeSection) ?? sections[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleAction = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: '#1c1917',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <p className="text-white font-black text-lg">¿Cómo funciona?</p>
            <p className="text-stone-500 text-sm">
              {isCoach ? 'Guía para entrenadores' : 'Guía de uso'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pb-4 shrink-0 overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0"
              style={activeSection === s.id
                ? { background: s.color + '20', color: s.color, border: `1px solid ${s.color}40` }
                : { background: 'rgba(255,255,255,0.04)', color: '#78716c', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="overflow-y-auto px-6 pb-6 space-y-3">
          {current.steps.map((step, i) => (
            <div
              key={i}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-start gap-3">
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: current.color + '18', color: current.color }}
                  >
                    {step.icon}
                  </div>
                  {i < current.steps.length - 1 && (
                    <div className="w-px h-4" style={{ background: current.color + '25' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: current.color + 'aa' }}
                    >
                      Paso {i + 1}
                    </span>
                  </div>
                  <p className="text-white font-bold text-sm">{step.title}</p>
                  <p className="text-stone-400 text-xs mt-1 leading-relaxed">{step.desc}</p>
                  {step.action && (
                    <button
                      onClick={() => handleAction(step.action?.path ?? '')}
                      className="mt-2 flex items-center gap-1 text-xs font-bold transition-colors"
                      style={{ color: current.color }}
                    >
                      {step.action.label}
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
