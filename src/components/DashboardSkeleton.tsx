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
        "p-4 sm:p-6"
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header simplificado */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Skeleton width={150} height={40} className="sm:w-[200px] sm:h-12 rounded-full" />
          <div className="flex gap-2">
            <Skeleton width={28} height={28} className="sm:w-8 sm:h-8 rounded-full" />
            <Skeleton width={28} height={28} className="sm:w-8 sm:h-8 rounded-full" />
          </div>
        </div>

        {/* 3 cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} className="sm:h-[120px] rounded-xl" />
          ))}
        </div>

        {/* Título */}
        <div className="mb-4 sm:mb-6">
          <Skeleton width="70%" height={28} className="sm:w-[300px] sm:h-8 mb-2" />
          <Skeleton width="85%" height={18} className="sm:w-[400px] sm:h-5" />
        </div>

        {/* Grid de rutinas - solo 4 cards en lugar de 7 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={160} className="sm:h-[180px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

