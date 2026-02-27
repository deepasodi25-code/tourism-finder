import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LocationCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border shadow-card">
      <div className="aspect-[5/3] skeleton-shimmer" />
      <CardContent className="p-4 flex flex-col gap-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="pt-1 border-t border-border flex gap-1">
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
