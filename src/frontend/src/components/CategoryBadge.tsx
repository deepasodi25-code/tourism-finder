import { Badge } from "@/components/ui/badge";
import { Category } from "../backend.d";
import {
  Building2,
  TreePine,
  Waves,
  Landmark,
  UtensilsCrossed,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
  showIcon?: boolean;
}

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; icon: React.ReactNode; className: string }
> = {
  [Category.hotel]: {
    label: "Hotel",
    icon: <Building2 className="w-3 h-3" />,
    className:
      "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  },
  [Category.museum]: {
    label: "Museum",
    icon: <BookOpen className="w-3 h-3" />,
    className:
      "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  },
  [Category.park]: {
    label: "Park",
    icon: <TreePine className="w-3 h-3" />,
    className:
      "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300",
  },
  [Category.beach]: {
    label: "Beach",
    icon: <Waves className="w-3 h-3" />,
    className:
      "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300",
  },
  [Category.landmark]: {
    label: "Landmark",
    icon: <Landmark className="w-3 h-3" />,
    className:
      "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  },
  [Category.restaurant]: {
    label: "Restaurant",
    icon: <UtensilsCrossed className="w-3 h-3" />,
    className:
      "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300",
  },
};

export function CategoryBadge({
  category,
  size = "sm",
  showIcon = true,
}: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  if (!config) return null;
  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1 font-medium border-0",
        config.className,
        size === "md" && "text-sm py-1 px-2.5"
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}

export { CATEGORY_CONFIG };
