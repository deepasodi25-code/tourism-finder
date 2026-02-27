import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Data Types
  type Category = {
    #beach;
    #museum;
    #park;
    #restaurant;
    #landmark;
    #hotel;
  };

  module Category {
    public func toText(category : Category) : Text {
      switch (category) {
        case (#beach) { "Beach" };
        case (#museum) { "Museum" };
        case (#park) { "Park" };
        case (#restaurant) { "Restaurant" };
        case (#landmark) { "Landmark" };
        case (#hotel) { "Hotel" };
      };
    };
  };

  type TouristLocation = {
    id : Nat;
    name : Text;
    description : Text;
    category : Category;
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
    timestamp : Time.Time;
  };

  module TouristLocation {
    public func compareByRating(location1 : TouristLocation, location2 : TouristLocation) : Order.Order {
      if (location1.averageRating > location2.averageRating) { return #greater };
      if (location1.averageRating < location2.averageRating) { return #less };
      #equal;
    };
  };

  // Persistent Data Stores
  var nextLocationId = 1;
  var nextReviewId = 1;
  var seeded = false;

  let locationsMap = Map.empty<Nat, TouristLocation>();
  let reviewsMap = Map.empty<Nat, List.List<Review>>();

  public query ({ caller }) func isSeeded() : async Bool {
    seeded;
  };

  // Add Location
  public shared ({ caller }) func addLocation(
    name : Text,
    description : Text,
    category : Category,
    address : Text,
    city : Text,
    country : Text,
    directions : Text,
    imageUrl : Text,
  ) : async Nat {
    let id = nextLocationId;
    nextLocationId += 1;

    let location : TouristLocation = {
      id;
      name;
      description;
      category;
      address;
      city;
      country;
      directions;
      imageUrl;
      averageRating = 0;
      reviewCount = 0;
    };

    locationsMap.add(id, location);
    id;
  };

  // Get All Locations
  public query ({ caller }) func getAllLocations() : async [TouristLocation] {
    locationsMap.values().toArray();
  };

  // Get Location by ID
  public query ({ caller }) func getLocation(id : Nat) : async ?TouristLocation {
    locationsMap.get(id);
  };

  // Search Locations by Keyword
  public query ({ caller }) func searchLocations(keyword : Text) : async [TouristLocation] {
    let lowerKeyword = keyword.toLower();
    let results = List.empty<TouristLocation>();

    for (location in locationsMap.values()) {
      if (
        location.name.toLower().contains(#text lowerKeyword) or
        location.city.toLower().contains(#text lowerKeyword) or
        location.description.toLower().contains(#text lowerKeyword)
      ) {
        results.add(location);
      };
    };

    results.toArray();
  };

  // Filter Locations by Category
  public query ({ caller }) func filterByCategory(category : Category) : async [TouristLocation] {
    let results = List.empty<TouristLocation>();

    for (location in locationsMap.values()) {
      if (location.category == category) {
        results.add(location);
      };
    };

    results.toArray();
  };

  // Add Review
  public shared ({ caller }) func addReview(locationId : Nat, reviewerName : Text, comment : Text, rating : Nat) : async () {
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let review : Review = {
      id = nextReviewId;
      locationId;
      reviewerName;
      comment;
      rating;
      timestamp = Time.now();
    };
    nextReviewId += 1;

    // Add review to reviewsMap
    let existingReviews = switch (reviewsMap.get(locationId)) {
      case (null) { List.empty<Review>() };
      case (?reviews) { reviews };
    };
    existingReviews.add(review);
    reviewsMap.add(locationId, existingReviews);

    // Recalculate average rating and update location
    switch (locationsMap.get(locationId)) {
      case (null) {
        Runtime.trap("Location not found. No reviews added.");
      };
      case (?location) {
        let totalReviews = existingReviews.size();
        let totalRating = existingReviews.values().foldLeft(
          0,
          func(acc, r) { acc + r.rating },
        );
        let newAverage = totalRating.toFloat() / totalReviews.toInt().toFloat();

        let updatedLocation : TouristLocation = {
          id = location.id;
          name = location.name;
          description = location.description;
          category = location.category;
          address = location.address;
          city = location.city;
          country = location.country;
          directions = location.directions;
          imageUrl = location.imageUrl;
          averageRating = newAverage;
          reviewCount = totalReviews;
        };

        locationsMap.add(locationId, updatedLocation);
      };
    };
  };

  // Get Reviews for Location
  public query ({ caller }) func getReviews(locationId : Nat) : async [Review] {
    switch (reviewsMap.get(locationId)) {
      case (null) { [] };
      case (?reviews) { reviews.toArray() };
    };
  };

  // Get All Categories
  public query ({ caller }) func getAllCategories() : async [Text] {
    [Category.toText(#beach), Category.toText(#museum), Category.toText(#park), Category.toText(#restaurant), Category.toText(#landmark), Category.toText(#hotel)];
  };

  // Seed Data for Dantewada District
  public shared ({ caller }) func seedDantewadaData() : async () {
    if (seeded) { return };
    seeded := true;

    // Add cities/towns as locations
    ignore await addLocation(
      "Dantewada",
      "District headquarters, administrative center of Dantewada district.",
      #landmark,
      "Main Road, Dantewada",
      "Dantewada",
      "India",
      "Reach Dantewada from Jagdalpur via NH30.",
      "",
    );
    ignore await addLocation(
      "Geedam",
      "Town known for its weekly markets and local crafts.",
      #landmark,
      "Geedam Main Market",
      "Geedam",
      "India",
      "Located north of Dantewada city.",
      "",
    );
    ignore await addLocation(
      "Barsur",
      "Ancient town with historical Shiva temples and sculptures.",
      #landmark,
      "Barsur Temples Complex",
      "Barsur",
      "India",
      "South of Dantewada on Aranpur Road.",
      "",
    );
    ignore await addLocation(
      "Kuakonda",
      "Town known for local markets and cultural festivals.",
      #landmark,
      "Kuakonda Market Area",
      "Kuakonda",
      "India",
      "Located northwest of Dantewada.",
      "",
    );

    // Add landmarks/temples
    ignore await addLocation(
      "Danteshwari Temple",
      "Famous Shakti Peeth temple dedicated to Goddess Danteshwari.",
      #landmark,
      "Danteshwari Temple Complex, Dantewada",
      "Dantewada",
      "India",
      "Central Dantewada, accessible from main city center.",
      "",
    );
    ignore await addLocation(
      "Barsur Temples",
      "Collection of ancient Shiva temples and sculptures.",
      #landmark,
      "Barsur Historic Temples",
      "Barsur",
      "India",
      "South of Dantewada near Geedam.",
      "",
    );

    // Add hotels
    ignore await addLocation(
      "Hotel Aranya Resort",
      "Nature resort offering modern amenities in Dantewada.",
      #hotel,
      "Near Danteshwari Temple, Dantewada",
      "Dantewada",
      "India",
      "Central Dantewada, close to Danteshwari Temple.",
      "",
    );
    ignore await addLocation(
      "Jagdalpur Residency Hotel",
      "3-star hotel with comfortable rooms near Bastar Palace.",
      #hotel,
      "Bastar Palace Road, Jagdalpur",
      "Jagdalpur",
      "India",
      "Central Jagdalpur, year-round access.",
      "",
    );

    // Add restaurants
    ignore await addLocation(
      "Bastar Spice Restaurant",
      "Serving local Chhattisgarh dishes and Indian cuisine.",
      #restaurant,
      "Main Market Road, Dantewada",
      "Dantewada",
      "India",
      "East Dantewada, short drive from city center.",
      "",
    );
    ignore await addLocation(
      "Bastar Flavors Restaurant",
      "Local specialty dishes, fusion cuisine, vegetarian options.",
      #restaurant,
      "Main Road, Jagdalpur",
      "Jagdalpur",
      "India",
      "Heart of Jagdalpur city.",
      "",
    );

    // Add parks/nature sites
    ignore await addLocation(
      "Indravati National Park",
      "Home to tigers, leopards, wild buffaloes, rare wildlife.",
      #park,
      "Indravati National Park, Dantewada",
      "Dantewada",
      "India",
      "West of Dantewada, private vehicle recommended.",
      "",
    );
    ignore await addLocation(
      "Bailadila Hills",
      "Rolling hills with trails for hiking, stunning views.",
      #park,
      "Bailadila Range, Dantewada",
      "Dantewada",
      "India",
      "Northwest of Dantewada, trails from city center.",
      "",
    );

    // Add museums/historical sites
    ignore await addLocation(
      "Ecomuseum Dantewada",
      "Showcasing tribal crafts, local textiles, regional history.",
      #museum,
      "Main Market Road, Dantewada",
      "Dantewada",
      "India",
      "North of city center.",
      "",
    );
    ignore await addLocation(
      "Bailadila Iron Ore Mine",
      "One of India's largest iron ore mines, offers tours by arrangement.",
      #museum,
      "Bailadila Hills, Kirandul",
      "Kirandul",
      "India",
      "Near Kirandul, tours from Dantewada city.",
      "",
    );

    // Add villages/small towns
    ignore await addLocation(
      "Pharasgaon",
      "Known for weekly markets, local tribal crafts.",
      #landmark,
      "Central Pharasgaon Area",
      "Pharasgaon",
      "India",
      "North of Dantewada city.",
      "",
    );
    ignore await addLocation(
      "Chitalnar",
      "Traditional village showcasing rural life in Dantewada.",
      #landmark,
      "Village Center, Chitalnar",
      "Chitalnar",
      "India",
      "West of Dantewada, accessible by local transport.",
      "",
    );

    // Add waterfalls/rivers
    ignore await addLocation(
      "Chitrakoot Waterfall",
      "Jagdalpur area; largest waterfall in India by width; Bastar border.",
      #park,
      "Jagdalpur",
      "Jagdalpur",
      "India",
      "West of Jagdalpur city.",
      "",
    );
    ignore await addLocation(
      "Shabri River Confluence",
      "Major river meeting point in southern Dantewada.",
      #park,
      "South Dantewada",
      "South Dantewada",
      "India",
      "Rural area, private vehicle access.",
      "",
    );

    // Add more locations as needed (limit to 25 for demonstration)...
  };
};
