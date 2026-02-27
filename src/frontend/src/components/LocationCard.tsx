import { TouristLocation } from "../backend.d";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "./CategoryBadge";
import { StarRatingDisplay } from "./StarRating";
import { MapPin } from "lucide-react";

interface LocationCardProps {
  location: TouristLocation;
  onClick: () => void;
}

const FALLBACK_IMAGES: Record<string, string> = {
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=240&fit=crop&auto=format",
  museum:
    "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=240&fit=crop&auto=format",
  park: "https://images.unsplash.com/photo-1585503418537-88331351ad99?w=400&h=240&fit=crop&auto=format",
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=240&fit=crop&auto=format",
  landmark:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=240&fit=crop&auto=format",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop&auto=format",
};

export function LocationCard({ location, onClick }: LocationCardProps) {
  const imageSrc =
    location.imageUrl ||
    FALLBACK_IMAGES[location.category] ||
    FALLBACK_IMAGES["landmark"];

  return (
    <Card
      className="card-hover cursor-pointer overflow-hidden group border-border shadow-card h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-[5/3]">
        <img
          src={imageSrc}
          alt={location.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              FALLBACK_IMAGES[location.category] || FALLBACK_IMAGES["landmark"];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={location.category} size="sm" />
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-display font-semibold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {location.name}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {location.city}, {location.country}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {location.description}
        </p>
        <div className="pt-1 border-t border-border">
          <StarRatingDisplay
            rating={location.averageRating}
            size="sm"
            showValue
            reviewCount={Number(location.reviewCount)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
