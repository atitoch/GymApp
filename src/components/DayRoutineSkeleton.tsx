import { Skeleton } from "./Skeleton";
import { themeClasses, cn } from "../theme/constants";

/**
 * Skeleton loader simple para la rutina del día
 */
export const DayRoutineSkeleton: React.FC = () => {
  return (
    <div
      className={cn(
        themeClasses.layout.screen,
        themeClasses.backgrounds.primary,
        "pb-12"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <Skeleton width={120} height={18} className="sm:w-[150px] sm:h-5 mb-2 sm:mb-3" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <Skeleton width="60%" height={24} className="sm:w-[250px] sm:h-8 mb-2" />
              <Skeleton width="50%" height={18} className="sm:w-[200px] sm:h-5" />
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <Skeleton width={36} height={36} className="sm:w-10 sm:h-10 rounded-lg" />
              <Skeleton width={36} height={36} className="sm:w-10 sm:h-10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className={cn(themeClasses.layout.container, "py-6 sm:py-8")}>
        {/* WarmUp - simplificado */}
        <div className="mb-6 sm:mb-8">
          <Skeleton width={120} height={20} className="sm:w-[150px] sm:h-6 mb-3 sm:mb-4" />
          <Skeleton height={100} className="sm:h-[120px] rounded-xl" />
        </div>

        {/* 2 secciones de ejercicios - simplificado */}
        {[1, 2].map((sectionIndex) => (
          <div key={sectionIndex} className="mb-6 sm:mb-8">
            <Skeleton width="60%" height={20} className="sm:w-[200px] sm:h-6 mb-3 sm:mb-4" />
            {/* Solo 2 ejercicios por sección en lugar de 3 */}
            <div className="space-y-3 sm:space-y-4">
              {[1, 2].map((exerciseIndex) => (
                <Skeleton key={exerciseIndex} height={120} className="sm:h-[140px] rounded-xl" />
              ))}
            </div>
          </div>
        ))}

        {/* Cooldown */}
        <div className="mb-6 sm:mb-8">
          <Skeleton width={100} height={20} className="sm:w-[120px] sm:h-6 mb-3 sm:mb-4" />
          <Skeleton height={70} className="sm:h-[80px] rounded-xl" />
        </div>
      </div>
    </div>
  );
};

