import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface TouristLocation {
    id: bigint;
    country: string;
    directions: string;
    city: string;
    name: string;
    description: string;
    averageRating: number;
    imageUrl: string;
    address: string;
    category: Category;
    reviewCount: bigint;
}
export interface Review {
    id: bigint;
    reviewerName: string;
    comment: string;
    locationId: bigint;
    timestamp: Time;
    rating: bigint;
}
export enum Category {
    hotel = "hotel",
    museum = "museum",
    park = "park",
    beach = "beach",
    landmark = "landmark",
    restaurant = "restaurant"
}
export interface backendInterface {
    addLocation(name: string, description: string, category: Category, address: string, city: string, country: string, directions: string, imageUrl: string): Promise<bigint>;
    addReview(locationId: bigint, reviewerName: string, comment: string, rating: bigint): Promise<void>;
    filterByCategory(category: Category): Promise<Array<TouristLocation>>;
    getAllCategories(): Promise<Array<string>>;
    getAllLocations(): Promise<Array<TouristLocation>>;
    getLocation(id: bigint): Promise<TouristLocation | null>;
    getReviews(locationId: bigint): Promise<Array<Review>>;
    isSeeded(): Promise<boolean>;
    searchLocations(keyword: string): Promise<Array<TouristLocation>>;
    seedDantewadaData(): Promise<void>;
}
