import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Category, TouristLocation } from "./backend.d";
import {
  useGetAllLocations,
  useSearchLocations,
  useFilterByCategory,
} from "./hooks/useQueries";
import { useActor } from "./hooks/useActor";
import { LocationCard } from "./components/LocationCard";
import { LocationCardSkeleton } from "./components/LocationCardSkeleton";
import { LocationDetail } from "./components/LocationDetail";
import { CategoryBadge } from "./components/CategoryBadge";
import { AddLocationModal } from "./components/AddLocationModal";
import { TravelChatBot } from "./components/TravelChatBot";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  MapPin,
  Plus,
  X,
  Compass,
  Grid3x3,
  Waves,
  TreePine,
  Building2,
  UtensilsCrossed,
  Landmark,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterCategory = Category | "all";

interface CategoryFilterItem {
  value: FilterCategory;
  label: string;
  icon: React.ReactNode;
}

const CATEGORY_FILTERS: CategoryFilterItem[] = [
  { value: "all", label: "All", icon: <Grid3x3 className="w-4 h-4" /> },
  { value: Category.beach, label: "Beach", icon: <Waves className="w-4 h-4" /> },
  { value: Category.museum, label: "Museum", icon: <BookOpen className="w-4 h-4" /> },
  { value: Category.park, label: "Park", icon: <TreePine className="w-4 h-4" /> },
  {
    value: Category.restaurant,
    label: "Restaurant",
    icon: <UtensilsCrossed className="w-4 h-4" />,
  },
  {
    value: Category.landmark,
    label: "Landmark",
    icon: <Landmark className="w-4 h-4" />,
  },
  { value: Category.hotel, label: "Hotel", icon: <Building2 className="w-4 h-4" /> },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function EmptyState({
  hasSearch,
  hasFilter,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        {hasSearch
          ? "No results found"
          : hasFilter
          ? "No locations in this category"
          : "No locations yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {hasSearch
          ? "Try adjusting your search terms or browse all categories."
          : hasFilter
          ? "Try selecting a different category or add the first one!"
          : "Be the first to add an amazing destination to discover."}
      </p>
    </div>
  );
}

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [selectedLocation, setSelectedLocation] =
    useState<TouristLocation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const queryClient = useQueryClient();
  const { actor } = useActor();
  const debouncedSearch = useDebounce(searchInput, 350);

  // Determine which query to use based on state
  const isSearching = debouncedSearch.trim().length > 0;
  const isFiltering = activeCategory !== "all";

  const allLocationsQuery = useGetAllLocations();
  const searchQuery = useSearchLocations(debouncedSearch);
  const categoryQuery = useFilterByCategory(
    isFiltering ? (activeCategory as Category) : null
  );

  // Active data selection
  let locations: TouristLocation[] = [];
  let isLoading = false;

  if (isSearching) {
    locations = searchQuery.data ?? [];
    isLoading = searchQuery.isLoading;
  } else if (isFiltering) {
    locations = categoryQuery.data ?? [];
    isLoading = categoryQuery.isLoading;
  } else {
    locations = allLocationsQuery.data ?? [];
    isLoading = allLocationsQuery.isLoading;
  }

  // Seed Dantewada data on first load once actor is ready
  useEffect(() => {
    if (!actor) return;
    let cancelled = false;
    (async () => {
      try {
        const alreadySeeded = await actor.isSeeded();
        if (!alreadySeeded && !cancelled) {
          await actor.seedDantewadaData();
          if (!cancelled) {
            queryClient.invalidateQueries({ queryKey: ["locations"] });
          }
        }
      } catch {
        // silently fail
      }
    })();
    return () => { cancelled = true; };
  }, [actor, queryClient]);

  const handleCategoryChange = useCallback((cat: FilterCategory) => {
    setActiveCategory(cat);
    setSearchInput(""); // Clear search when changing category
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
      if (e.target.value) setActiveCategory("all"); // Reset category filter when searching
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground hidden sm:block">
              WanderGuide
            </span>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search Dantewada — cities, villages, landmarks..."
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-9 pr-8 bg-secondary/50 border-border focus:bg-background transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="shrink-0 text-xs text-muted-foreground hidden lg:block">
            {!isLoading && (
              <span>{locations.length} destination{locations.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-24">
        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden mt-6 mb-8 h-56 sm:h-72 md:h-80">
          <img
            src="/assets/generated/tourism-hero.dim_1200x400.jpg"
            alt="World destinations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-start justify-center px-8 sm:px-12">
            <div className="slide-up">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-5 h-5 text-primary" />
                <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                  Explore & Discover
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
                Discover Dantewada
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
                Explore cities, villages and landmarks of Dantewada district, Chhattisgarh
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = activeCategory === filter.value;
              return (
                <button
                  type="button"
                  key={filter.value}
                  onClick={() => handleCategoryChange(filter.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/70 hover:scale-[1.02]"
                  )}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Active filter / search info */}
        {(isSearching || isFiltering) && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground fade-in">
            {isSearching ? (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>
                  Results for &ldquo;<strong className="text-foreground">{debouncedSearch}</strong>&rdquo;
                </span>
              </>
            ) : (
              <>
                <span>Showing:</span>
                <CategoryBadge category={activeCategory as Category} size="sm" />
              </>
            )}
            <span className="text-muted-foreground">
              ({locations.length} found)
            </span>
          </div>
        )}

        {/* Locations Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {isLoading ? (
              Array.from({ length: 8 }, (_, i) => i).map((i) => (
                <LocationCardSkeleton key={`skeleton-${i}`} />
              ))
            ) : locations.length === 0 ? (
              <EmptyState hasSearch={isSearching} hasFilter={isFiltering} />
            ) : (
              locations.map((loc) => (
                <div key={loc.id.toString()} className="fade-in">
                  <LocationCard
                    location={loc}
                    onClick={() => setSelectedLocation(loc)}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-foreground">
              WanderGuide
            </span>
          </div>
          <p>
            &copy; 2026. Built with{" "}
            <span className="text-primary">&#9829;</span> using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Location Detail Side Panel */}
      <Sheet
        open={selectedLocation !== null}
        onOpenChange={(open) => !open && setSelectedLocation(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[520px] md:w-[600px] p-0 flex flex-col"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>
              {selectedLocation?.name ?? "Location Details"}
            </SheetTitle>
          </SheetHeader>
          {selectedLocation && (
            <LocationDetail location={selectedLocation} />
          )}
        </SheetContent>
      </Sheet>

      {/* Add Location FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowAddModal(true)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-modal bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-transform"
          aria-label="Add new location"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* AI Travel Guide Chatbot (bottom-left) */}
      <TravelChatBot />
    </div>
  );
}
