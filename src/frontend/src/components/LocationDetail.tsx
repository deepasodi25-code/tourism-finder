import { TouristLocation } from "../backend.d";
import { useGetReviews } from "../hooks/useQueries";
import { CategoryBadge } from "./CategoryBadge";
import { StarRatingDisplay } from "./StarRating";
import { ReviewList } from "./ReviewList";
import { AddReviewForm } from "./AddReviewForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MapPin, Navigation, Globe, Star, MessageSquare } from "lucide-react";

interface LocationDetailProps {
  location: TouristLocation;
}

const FALLBACK_IMAGES: Record<string, string> = {
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=320&fit=crop&auto=format",
  museum:
    "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&h=320&fit=crop&auto=format",
  park: "https://images.unsplash.com/photo-1585503418537-88331351ad99?w=800&h=320&fit=crop&auto=format",
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=320&fit=crop&auto=format",
  landmark:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=320&fit=crop&auto=format",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=320&fit=crop&auto=format",
};

function DirectionsDisplay({ directions }: { directions: string }) {
  // Parse directions if they contain numbered steps, otherwise display as paragraphs
  const lines = directions
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic">
        No directions available
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {lines.map((line, idx) => {
        // Strip leading numbers like "1." or "1)"
        const cleanLine = line.replace(/^\d+[\.\)]\s*/, "");
        return (
          <li key={`dir-step-${idx}-${cleanLine.slice(0, 10)}`} className="flex gap-3 text-sm">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              {idx + 1}
            </span>
            <span className="text-foreground/80 pt-0.5">{cleanLine}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function LocationDetail({ location }: LocationDetailProps) {
  const { data: reviews, isLoading: reviewsLoading } = useGetReviews(
    location.id
  );

  const imageSrc =
    location.imageUrl ||
    FALLBACK_IMAGES[location.category] ||
    FALLBACK_IMAGES["landmark"];

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* Hero Image */}
        <div className="relative h-52 md:h-64 overflow-hidden shrink-0">
          <img
            src={imageSrc}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                FALLBACK_IMAGES[location.category] ||
                FALLBACK_IMAGES["landmark"];
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <CategoryBadge category={location.category} size="md" />
            <h2 className="font-display text-xl md:text-2xl font-bold text-white mt-2 drop-shadow-sm">
              {location.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Location info */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>{location.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span>
                {location.city}, {location.country}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border/50">
            <Star className="w-5 h-5 text-star-filled fill-star-filled" />
            <div>
              <div className="flex items-center gap-2">
                <StarRatingDisplay
                  rating={location.averageRating}
                  size="md"
                  showValue
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Based on {Number(location.reviewCount)} review
                {Number(location.reviewCount) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display font-semibold text-base text-foreground mb-2">
              About This Place
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {location.description}
            </p>
          </div>

          <Separator />

          {/* Directions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-5 h-5 text-accent" />
              <h3 className="font-display font-semibold text-base text-foreground">
                How to Get There
              </h3>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <DirectionsDisplay directions={location.directions} />
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-base text-foreground">
                Reviews
              </h3>
              {reviews && reviews.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {reviews.length}
                </span>
              )}
            </div>
            <ReviewList reviews={reviews ?? []} isLoading={reviewsLoading} />
          </div>

          <Separator />

          {/* Add Review */}
          <div>
            <h3 className="font-display font-semibold text-base text-foreground mb-4">
              Leave a Review
            </h3>
            <AddReviewForm locationId={location.id} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
