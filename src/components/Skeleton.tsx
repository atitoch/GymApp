import { cn } from "../theme/constants";

/**
 * Componente skeleton simple y ligero
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
}) => {
  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-stone-800/50 rounded",
        className
      )}
      style={style}
    />
  );
};

