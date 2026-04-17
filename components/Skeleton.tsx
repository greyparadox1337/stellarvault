import GlassCard from "./GlassCard";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`shimmer bg-white/5 rounded ${className}`} />
  );
}

export function BalanceSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-6 w-32 mb-4 bg-accent-violet/10" />
      <div className="flex items-baseline gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="mt-8 pt-4 border-t border-white/10">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </GlassCard>
  );
}

export function HistorySkeleton() {
  return (
    <GlassCard className="p-6 h-full">
      <Skeleton className="h-6 w-40 mb-6 bg-accent-cyan/10" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
