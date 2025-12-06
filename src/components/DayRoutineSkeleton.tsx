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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Skeleton width={150} height={20} className="mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton width={250} height={32} className="mb-2" />
              <Skeleton width={200} height={20} />
            </div>
            <div className="flex gap-2">
              <Skeleton width={40} height={40} className="rounded-lg" />
              <Skeleton width={40} height={40} className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className={cn(themeClasses.layout.container, "py-8")}>
        {/* WarmUp - simplificado */}
        <div className="mb-8">
          <Skeleton width={150} height={24} className="mb-4" />
          <Skeleton height={120} className="rounded-xl" />
        </div>

        {/* 2 secciones de ejercicios - simplificado */}
        {[1, 2].map((sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <Skeleton width={200} height={24} className="mb-4" />
            {/* Solo 2 ejercicios por sección en lugar de 3 */}
            <div className="space-y-4">
              {[1, 2].map((exerciseIndex) => (
                <Skeleton key={exerciseIndex} height={140} className="rounded-xl" />
              ))}
            </div>
          </div>
        ))}

        {/* Cooldown */}
        <div className="mb-8">
          <Skeleton width={120} height={24} className="mb-4" />
          <Skeleton height={80} className="rounded-xl" />
        </div>
      </div>
    </div>
  );
};

