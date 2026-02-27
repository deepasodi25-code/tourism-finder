import { Review } from "../backend.d";
import { StarRatingDisplay } from "./StarRating";
import { User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
}

function formatTimestamp(timestamp: bigint): string {
  try {
    // ICP timestamps are in nanoseconds
    const ms = Number(timestamp) / 1_000_000;
    const date = new Date(ms);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ReviewList({ reviews, isLoading }: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((n) => (
          <div key={n} className="flex gap-3 p-3 rounded-lg bg-muted/50">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const dateStr = formatTimestamp(review.timestamp);
        return (
          <div
            key={review.id.toString()}
            className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">
                    {review.reviewerName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StarRatingDisplay
                  rating={Number(review.rating)}
                  size="sm"
                />
                {dateStr && (
                  <span className="text-xs text-muted-foreground">{dateStr}</span>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground/80 pl-9">{review.comment}</p>
          </div>
        );
      })}
    </div>
  );
}
