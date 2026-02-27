import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { TouristLocation, Review, Category } from "../backend.d";

export function useGetAllLocations() {
  const { actor, isFetching } = useActor();
  return useQuery<TouristLocation[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchLocations(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TouristLocation[]>({
    queryKey: ["locations", "search", keyword],
    queryFn: async () => {
      if (!actor) return [];
      if (!keyword.trim()) return actor.getAllLocations();
      return actor.searchLocations(keyword);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery<TouristLocation[]>({
    queryKey: ["locations", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (!category) return actor.getAllLocations();
      return actor.filterByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLocation(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<TouristLocation | null>({
    queryKey: ["location", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getLocation(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetReviews(locationId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", locationId?.toString()],
    queryFn: async () => {
      if (!actor || locationId === null) return [];
      return actor.getReviews(locationId);
    },
    enabled: !!actor && !isFetching && locationId !== null,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      locationId,
      reviewerName,
      comment,
      rating,
    }: {
      locationId: bigint;
      reviewerName: string;
      comment: string;
      rating: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addReview(locationId, reviewerName, comment, rating);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.locationId.toString()],
      });
    },
  });
}

export function useAddLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      category: Category;
      address: string;
      city: string;
      country: string;
      directions: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addLocation(
        params.name,
        params.description,
        params.category,
        params.address,
        params.city,
        params.country,
        params.directions,
        params.imageUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
