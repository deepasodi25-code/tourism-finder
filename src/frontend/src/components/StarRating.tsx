import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
}

export function StarRatingDisplay({
  rating,
  maxStars = 5,
  size = "md",
  showValue = false,
  reviewCount,
}: StarRatingDisplayProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          const starKey = `star-display-${i}`;
          return (
            <span key={starKey} className="relative">
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-star-empty fill-star-empty"
                )}
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : `${(rating % 1) * 100}%` }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      "text-star-filled fill-star-filled"
                    )}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-medium text-foreground", textClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={cn("text-muted-foreground", textClasses[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export function StarRatingInput({
  value,
  onChange,
  size = "lg",
}: StarRatingInputProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;
        const inputKey = `star-input-${starValue}`;
        return (
          <button
            key={inputKey}
            type="button"
            onClick={() => onChange(starValue)}
            className="cursor-pointer hover:scale-110 transition-transform"
            aria-label={`Rate ${starValue} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled
                  ? "text-star-filled fill-star-filled"
                  : "text-star-empty fill-star-empty"
              )}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value}/5
        </span>
      )}
    </div>
  );
}
