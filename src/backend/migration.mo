import Map "mo:core/Map";
import List "mo:core/List";

module {
  type Location = {
    id : Nat;
    name : Text;
    description : Text;
    category : {
      #beach;
      #museum;
      #park;
      #restaurant;
      #landmark;
      #hotel;
    };
    address : Text;
    city : Text;
    country : Text;
    directions : Text;
    imageUrl : Text;
    averageRating : Float;
    reviewCount : Nat;
  };

  type Review = {
    id : Nat;
    locationId : Nat;
    reviewerName : Text;
    comment : Text;
    rating : Nat;
    timestamp : Int;
  };

  type OldActor = {
    locationsMap : Map.Map<Nat, Location>;
    reviewsMap : Map.Map<Nat, List.List<Review>>;
    nextLocationId : Nat;
    nextReviewId : Nat;
  };

  type NewActor = {
    locationsMap : Map.Map<Nat, Location>;
    reviewsMap : Map.Map<Nat, List.List<Review>>;
    nextLocationId : Nat;
    nextReviewId : Nat;
    seeded : Bool;
  };

  public func run(old : OldActor) : NewActor {
    { old with seeded = false };
  };
};
