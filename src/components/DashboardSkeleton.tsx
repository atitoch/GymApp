import { Skeleton } from "./Skeleton";
import { themeClasses, cn } from "../theme/constants";

/**
 * Skeleton loader simple para el Dashboard
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div
      className={cn(
        themeClasses.layout.screen,
        themeClasses.backgrounds.primary,
        "p-6"
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header simplificado */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton width={200} height={48} className="rounded-full" />
          <div className="flex gap-2">
            <Skeleton width={32} height={32} className="rounded-full" />
            <Skeleton width={32} height={32} className="rounded-full" />
          </div>
        </div>

        {/* 3 cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} className="rounded-xl" />
          ))}
        </div>

        {/* Título */}
        <div className="mb-6">
          <Skeleton width={300} height={32} className="mb-2" />
          <Skeleton width={400} height={20} />
        </div>

        {/* Grid de rutinas - solo 4 cards en lugar de 7 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={180} className="rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

