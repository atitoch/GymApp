import { Dumbbell } from 'lucide-react';

export const Error404: React.FC = () => {
  return (
    <div className="relative mb-8">
      <div className="text-[180px] md:text-[240px] font-black text-transparent bg-clip-text bg-linear-to-br from-stone-800 to-stone-900 leading-none select-none">
        404
      </div>

      {/* Icono flotante */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-stone-800 rounded-full p-6 border-2 border-stone-700">
            <Dumbbell
              className="w-16 h-16 text-red-400 animate-bounce"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
