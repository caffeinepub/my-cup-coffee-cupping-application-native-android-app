import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // ── Old Types (from previous version) ────────────────────────────────────

  type OldTimestamp = Int;
  type OldCafeId = Text;
  type OldCoffeeId = Text;
  type OldCuppingId = Text;
  type OldQRCodeId = Text;

  type OldUserRole = { #admin; #user; #guest };

  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, OldUserRole>;
  };

  type OldLevel = { #novice; #intermediate; #advanced; #expert };

  type OldCuppingHistory = {
    fragrance : Nat;
    flavor : Nat;
    aftertaste : Nat;
    acidity : Nat;
    body : Nat;
    balance : Nat;
    uniformity : Nat;
    sweetness : Nat;
    cleanCup : Nat;
    overall : Nat;
  };

  type OldUserProfile = {
    name : Text;
    completedCuppings : Nat;
    accuracyPercentage : Float;
    level : OldLevel;
    progress : Nat;
    cuppingHistory : OldCuppingHistory;
  };

  type OldLocation = { latitude : Float; longitude : Float };

  type OldCoffee = {
    id : OldCoffeeId;
    name : Text;
    origin : Text;
    roastLevel : Text;
    flavorProfile : Text;
  };

  type OldCoffeeScores = {
    fragrance : Float;
    flavor : Float;
    aftertaste : Float;
    acidity : Float;
    body : Float;
    balance : Float;
    uniformity : Float;
    sweetness : Float;
    cleanCup : Float;
    overall : Float;
  };

  type OldCafeProfile = {
    id : OldCafeId;
    owner : Principal;
    name : Text;
    location : OldLocation;
    roastLevel : Text;
    availableFreeCups : Nat;
    photos : [Blob];
    averageScores : OldCoffeeScores;
    availableCoffees : [OldCoffee];
  };

  type OldIntensityLevels = {
    fragrance : Nat;
    flavor : Nat;
    aftertaste : Nat;
    acidity : Nat;
    body : Nat;
    balance : Nat;
  };

  type OldCuppingSubmission = {
    id : OldCuppingId;
    user : Principal;
    cafe : OldCafeId;
    coffee : OldCoffeeId;
    scores : OldCoffeeScores;
    intensityLevels : OldIntensityLevels;
    photo : ?Blob;
    timestamp : OldTimestamp;
    qrCodeId : OldQRCodeId;
  };

  type OldQRCodeData = {
    id : OldQRCodeId;
    user : Principal;
    cafe : OldCafeId;
    coffee : OldCoffeeId;
    redeemed : Bool;
    timestamp : OldTimestamp;
    redemptionTimestamp : ?OldTimestamp;
  };

  type OldDailyStats = {
    newUsers : Nat;
    cuppingSubmissions : Nat;
    qrCodesRedeemed : Nat;
    cafesRegistered : Nat;
  };

  // ── New Types (must match main.mo exactly) ────────────────────────────────

  type NewUserRole = { #admin; #user; #guest };

  type NewAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, NewUserRole>;
  };

  type NewLevel = { #novice; #intermediate; #advanced; #expert };

  type NewCuppingHistory = {
    fragrance : Nat;
    flavor : Nat;
    aftertaste : Nat;
    acidity : Nat;
    body : Nat;
    balance : Nat;
    uniformity : Nat;
    sweetness : Nat;
    cleanCup : Nat;
    overall : Nat;
  };

  type NewUserProfile = {
    name : Text;
    phoneNumber : ?Text;
    completedCuppings : Nat;
    accuracyPercentage : Float;
    level : NewLevel;
    progress : Nat;
    cuppingHistory : NewCuppingHistory;
  };

  type NewLocation = { latitude : Float; longitude : Float };

  type NewCoffee = {
    id : OldCoffeeId;
    name : Text;
    origin : Text;
    roastLevel : Text;
    flavorProfile : Text;
  };

  type NewCoffeeScores = {
    fragrance : Float;
    aroma : Float;
    flavor : Float;
    aftertaste : Float;
    acidity : Float;
    body : Float;
    balance : Float;
    uniformity : Float;
    sweetness : Float;
    cleanCup : Float;
    overall : Float;
  };

  type NewCafeProfile = {
    id : OldCafeId;
    owner : Principal;
    name : Text;
    location : NewLocation;
    roastLevel : Text;
    availableFreeCups : Nat;
    averageScores : NewCoffeeScores;
    availableCoffees : [NewCoffee];
  };

  type NewIntensityLevels = {
    fragrance : Nat;
    flavor : Nat;
    aftertaste : Nat;
    acidity : Nat;
    body : Nat;
    balance : Nat;
  };

  type NewCuppingSubmission = {
    id : OldCuppingId;
    user : Principal;
    cafe : OldCafeId;
    coffeeId : OldCoffeeId;
    scores : NewCoffeeScores;
    intensityLevels : NewIntensityLevels;
    timestamp : OldTimestamp;
    qrCodeId : OldQRCodeId;
  };

  type NewQRCodeData = {
    id : OldQRCodeId;
    user : Principal;
    cafe : OldCafeId;
    coffee : OldCoffeeId;
    redeemed : Bool;
    expiryTime : OldTimestamp;
    redemptionTimestamp : ?OldTimestamp;
  };

  type NewDailyStats = {
    newUsers : Nat;
    cuppingSubmissions : Nat;
    qrCodesRedeemed : Nat;
    cafesRegistered : Nat;
  };

  // ── Migration Record Types ────────────────────────────────────────────────

  type OldActor = {
    admin : ?Principal;
    accessControlState : OldAccessControlState;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    cafeProfiles : Map.Map<OldCafeId, OldCafeProfile>;
    cuppingSubmissions : Map.Map<OldCuppingId, OldCuppingSubmission>;
    qrCodes : Map.Map<OldQRCodeId, OldQRCodeData>;
    cafeOwners : Map.Map<Principal, OldCafeId>;
    dailyStats : Map.Map<Text, OldDailyStats>;
    var nextCafeId : Nat;
    var nextCuppingId : Nat;
    var nextQRCodeId : Nat;
  };

  type NewActor = {
    accessControlState : NewAccessControlState;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    cafeProfiles : Map.Map<OldCafeId, NewCafeProfile>;
    cuppingSubmissions : Map.Map<OldCuppingId, NewCuppingSubmission>;
    qrCodes : Map.Map<OldQRCodeId, NewQRCodeData>;
    cafeOwners : Map.Map<Principal, OldCafeId>;
    dailyStats : Map.Map<Text, NewDailyStats>;
    var nextCafeId : Nat;
    var nextCuppingId : Nat;
    var nextQRCodeId : Nat;
  };

  func migrateScores(old : OldCoffeeScores) : NewCoffeeScores {
    {
      fragrance = old.fragrance;
      aroma = 0.0;
      flavor = old.flavor;
      aftertaste = old.aftertaste;
      acidity = old.acidity;
      body = old.body;
      balance = old.balance;
      uniformity = old.uniformity;
      sweetness = old.sweetness;
      cleanCup = old.cleanCup;
      overall = old.overall;
    };
  };

  public func run(old : OldActor) : NewActor {
    let twentyFourHours : Int = 24 * 60 * 60 * 1_000_000_000;
    // Migrate userProfiles: add phoneNumber = null
    let userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_p, u) { { u with phoneNumber = null } }
    );

    // Migrate cafeProfiles: add aroma=0.0 to averageScores, drop photos
    let cafeProfiles = old.cafeProfiles.map<OldCafeId, OldCafeProfile, NewCafeProfile>(
      func(_id, c) {
        {
          id = c.id;
          owner = c.owner;
          name = c.name;
          location = c.location;
          roastLevel = c.roastLevel;
          availableFreeCups = c.availableFreeCups;
          averageScores = migrateScores(c.averageScores);
          availableCoffees = c.availableCoffees;
        }
      }
    );

    // Migrate cuppingSubmissions: rename coffee->coffeeId, add aroma to scores, drop photo
    let cuppingSubmissions = old.cuppingSubmissions.map<OldCuppingId, OldCuppingSubmission, NewCuppingSubmission>(
      func(_id, s) {
        {
          id = s.id;
          user = s.user;
          cafe = s.cafe;
          coffeeId = s.coffee;
          scores = migrateScores(s.scores);
          intensityLevels = s.intensityLevels;
          timestamp = s.timestamp;
          qrCodeId = s.qrCodeId;
        }
      }
    );

    // Migrate qrCodes: rename timestamp->expiryTime (add 24h), preserve other fields
    let qrCodes = old.qrCodes.map<OldQRCodeId, OldQRCodeData, NewQRCodeData>(
      func(_id, q) {
        {
          id = q.id;
          user = q.user;
          cafe = q.cafe;
          coffee = q.coffee;
          redeemed = q.redeemed;
          expiryTime = q.timestamp + twentyFourHours;
          redemptionTimestamp = q.redemptionTimestamp;
        }
      }
    );

    {
      accessControlState = old.accessControlState;
      userProfiles;
      cafeProfiles;
      cuppingSubmissions;
      qrCodes;
      cafeOwners = old.cafeOwners;
      dailyStats = old.dailyStats;
      var nextCafeId = old.nextCafeId;
      var nextCuppingId = old.nextCuppingId;
      var nextQRCodeId = old.nextQRCodeId;
    };
  };
};
