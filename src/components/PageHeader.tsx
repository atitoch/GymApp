import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, icon }) => {
  const navigate = useNavigate();

  return (
    <div
      className="sticky top-0 z-20"
      style={{
        background: 'rgba(12,10,9,0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        {icon && <span className="shrink-0">{icon}</span>}
        <h1 className="text-lg font-black text-white truncate">{title}</h1>
      </div>
    </div>
  );
};
