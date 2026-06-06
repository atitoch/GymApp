import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err?.message ?? 'Error inesperado' };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center space-y-4">
          <AlertTriangle size={36} className="text-yellow-400 mx-auto" />
          <p className="text-white font-bold text-lg">Algo salió mal</p>
          <p className="text-stone-400 text-sm">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-stone-950"
            style={{ background: 'linear-gradient(135deg,#a3e635,#84cc16)' }}
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
