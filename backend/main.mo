import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Timestamp = Time.Time;
  type CafeId = Text;
  type CoffeeId = Text;
  type CuppingId = Text;
  type QRCodeId = Text;

  stable var admin : ?Principal = null;

  public type UserRole = AccessControl.UserRole;

  public type UserProfile = {
    name : Text;
    completedCuppings : Nat;
    accuracyPercentage : Float;
    level : Level;
    progress : Nat;
    cuppingHistory : CuppingHistory;
  };

  public type Level = {
    #novice;
    #intermediate;
    #advanced;
    #expert;
  };

  public type CuppingHistory = {
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

  public type CafeProfile = {
    id : CafeId;
    owner : Principal;
    name : Text;
    location : Location;
    roastLevel : Text;
    availableFreeCups : Nat;
    photos : [Storage.ExternalBlob];
    averageScores : CoffeeScores;
    availableCoffees : [Coffee];
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
  };

  public type Coffee = {
    id : CoffeeId;
    name : Text;
    origin : Text;
    roastLevel : Text;
    flavorProfile : Text;
  };

  public type CoffeeScores = {
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

  public type CuppingSubmission = {
    id : CuppingId;
    user : Principal;
    cafe : CafeId;
    coffee : CoffeeId;
    scores : CoffeeScores;
    intensityLevels : IntensityLevels;
    photo : ?Storage.ExternalBlob;
    timestamp : Timestamp;
    qrCodeId : QRCodeId;
  };

  public type IntensityLevels = {
    fragrance : Nat;
    flavor : Nat;
    aftertaste : Nat;
    acidity : Nat;
    body : Nat;
    balance : Nat;
  };

  public type QRCodeData = {
    id : QRCodeId;
    user : Principal;
    cafe : CafeId;
    coffee : CoffeeId;
    redeemed : Bool;
    timestamp : Timestamp;
    redemptionTimestamp : ?Timestamp;
  };

  public type DailyStats = {
    newUsers : Nat;
    cuppingSubmissions : Nat;
    qrCodesRedeemed : Nat;
    cafesRegistered : Nat;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let cafeProfiles = Map.empty<CafeId, CafeProfile>();
  let cuppingSubmissions = Map.empty<CuppingId, CuppingSubmission>();
  let qrCodes = Map.empty<QRCodeId, QRCodeData>();
  let cafeOwners = Map.empty<Principal, CafeId>();
  let dailyStats = Map.empty<Text, DailyStats>();
  var nextCafeId : Nat = 0;
  var nextCuppingId : Nat = 0;
  var nextQRCodeId : Nat = 0;

  // Helper functions
  func generateCafeId() : CafeId {
    let id = "CAFE_" # nextCafeId.toText();
    nextCafeId += 1;
    id;
  };

  func generateCuppingId() : CuppingId {
    let id = "CUPPING_" # nextCuppingId.toText();
    nextCuppingId += 1;
    id;
  };

  func generateQRCodeId() : QRCodeId {
    let id = "QR_" # nextQRCodeId.toText();
    nextQRCodeId += 1;
    id;
  };

  func isCafeOwner(caller : Principal, cafeId : CafeId) : Bool {
    switch (cafeOwners.get(caller)) {
      case (?ownedCafeId) { ownedCafeId == cafeId };
      case null { false };
    };
  };

  func getCafeIdForOwner(caller : Principal) : ?CafeId {
    cafeOwners.get(caller);
  };

  func getCurrentDate() : Text {
    let nanos = Time.now();
    let daysSinceEpoch = nanos / (24 * 60 * 60 * 1_000_000_000);
    let year = 1970 + (daysSinceEpoch / 365);
    let dayOfYear = daysSinceEpoch % 365;
    let month = (dayOfYear / 30) + 1;
    let dayOfMonth = (dayOfYear % 30) + 1;
    year.toText() # "-" # month.toText() # "-" # dayOfMonth.toText();
  };

  func incrementDailyStat(stat : Text) {
    let currentDate = getCurrentDate();
    let currentStats = switch (dailyStats.get(currentDate)) {
      case (?stats) { stats };
      case null {
        {
          newUsers = 0;
          cuppingSubmissions = 0;
          qrCodesRedeemed = 0;
          cafesRegistered = 0;
        };
      };
    };

    let updatedStats = switch (stat) {
      case ("newUsers") {
        {
          newUsers = currentStats.newUsers + 1;
          cuppingSubmissions = currentStats.cuppingSubmissions;
          qrCodesRedeemed = currentStats.qrCodesRedeemed;
          cafesRegistered = currentStats.cafesRegistered;
        };
      };
      case ("cuppingSubmissions") {
        {
          newUsers = currentStats.newUsers;
          cuppingSubmissions = currentStats.cuppingSubmissions + 1;
          qrCodesRedeemed = currentStats.qrCodesRedeemed;
          cafesRegistered = currentStats.cafesRegistered;
        };
      };
      case ("qrCodesRedeemed") {
        {
          newUsers = currentStats.newUsers;
          cuppingSubmissions = currentStats.cuppingSubmissions;
          qrCodesRedeemed = currentStats.qrCodesRedeemed + 1;
          cafesRegistered = currentStats.cafesRegistered;
        };
      };
      case ("cafesRegistered") {
        {
          newUsers = currentStats.newUsers;
          cuppingSubmissions = currentStats.cuppingSubmissions;
          qrCodesRedeemed = currentStats.qrCodesRedeemed;
          cafesRegistered = currentStats.cafesRegistered + 1;
        };
      };
      case (_) { currentStats };
    };

    dailyStats.add(currentDate, updatedStats);
  };

  // Admin check - persistent and upgrade safe.
  // Returns true only when the caller's principal matches the stored admin principal.
  public query ({ caller }) func isAdmin() : async Bool {
    switch (admin) {
      case (?adminPrincipal) { caller == adminPrincipal };
      case (null) { false };
    };
  };

  // Authorization
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    // Admin-only check happens inside AccessControl.assignRole
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    incrementDailyStat("newUsers");
  };

  // Cafe Management (Admin only for creation)
  public shared ({ caller }) func createCafeProfile(
    owner : Principal,
    name : Text,
    latitude : Float,
    longitude : Float,
    roastLevel : Text,
    availableFreeCups : Nat
  ) : async CafeProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create cafe profiles");
    };

    let cafeId = generateCafeId();
    let cafeProfile : CafeProfile = {
      id = cafeId;
      owner;
      name;
      location = { latitude; longitude };
      roastLevel;
      availableFreeCups;
      photos = [];
      averageScores = {
        fragrance = 0.0;
        flavor = 0.0;
        aftertaste = 0.0;
        acidity = 0.0;
        body = 0.0;
        balance = 0.0;
        uniformity = 0.0;
        sweetness = 0.0;
        cleanCup = 0.0;
        overall = 0.0;
      };
      availableCoffees = [];
    };

    cafeProfiles.add(cafeId, cafeProfile);
    cafeOwners.add(owner, cafeId);
    incrementDailyStat("cafesRegistered");
    cafeProfile;
  };

  // Cafe Owner Functions
  public shared ({ caller }) func updateCafeFreeCups(cafeId : CafeId, availableFreeCups : Nat) : async () {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can update free cups");
    };
    switch (cafeProfiles.get(cafeId)) {
      case (?cafe) {
        let updatedCafe = {
          id = cafe.id;
          owner = cafe.owner;
          name = cafe.name;
          location = cafe.location;
          roastLevel = cafe.roastLevel;
          availableFreeCups;
          photos = cafe.photos;
          averageScores = cafe.averageScores;
          availableCoffees = cafe.availableCoffees;
        };
        cafeProfiles.add(cafeId, updatedCafe);
      };
      case null {
        Runtime.trap("Cafe not found");
      };
    };
  };

  public shared ({ caller }) func addCoffeeToCafe(cafeId : CafeId, coffee : Coffee) : async () {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can add coffees");
    };
    switch (cafeProfiles.get(cafeId)) {
      case (?cafe) {
        let updatedCoffees = cafe.availableCoffees.concat([coffee]);
        let updatedCafe = {
          id = cafe.id;
          owner = cafe.owner;
          name = cafe.name;
          location = cafe.location;
          roastLevel = cafe.roastLevel;
          availableFreeCups = cafe.availableFreeCups;
          photos = cafe.photos;
          averageScores = cafe.averageScores;
          availableCoffees = updatedCoffees;
        };
        cafeProfiles.add(cafeId, updatedCafe);
      };
      case null {
        Runtime.trap("Cafe not found");
      };
    };
  };

  public shared ({ caller }) func removeCoffeeFromCafe(cafeId : CafeId, coffeeId : CoffeeId) : async () {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can remove coffees");
    };
    switch (cafeProfiles.get(cafeId)) {
      case (?cafe) {
        let updatedCoffees = cafe.availableCoffees.filter(func(c) { c.id != coffeeId });
        let updatedCafe = {
          id = cafe.id;
          owner = cafe.owner;
          name = cafe.name;
          location = cafe.location;
          roastLevel = cafe.roastLevel;
          availableFreeCups = cafe.availableFreeCups;
          photos = cafe.photos;
          averageScores = cafe.averageScores;
          availableCoffees = updatedCoffees;
        };
        cafeProfiles.add(cafeId, updatedCafe);
      };
      case null {
        Runtime.trap("Cafe not found");
      };
    };
  };

  public query ({ caller }) func getCafeForOwner() : async ?CafeProfile {
    switch (getCafeIdForOwner(caller)) {
      case (?cafeId) { cafeProfiles.get(cafeId) };
      case null { null };
    };
  };

  public query ({ caller }) func getCuppingsForCafe(cafeId : CafeId) : async [CuppingSubmission] {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can view cafe cuppings");
    };
    let cafeCuppings = List.empty<CuppingSubmission>();
    for ((id, cupping) in cuppingSubmissions.entries()) {
      if (cupping.cafe == cafeId) {
        cafeCuppings.add(cupping);
      };
    };
    cafeCuppings.toArray();
  };

  // Public Cafe Discovery (no auth required)
  public query func getFilteredCafes(maxDistance : Float, minRoastLevel : Text) : async [CafeProfile] {
    let cafes = List.empty<CafeProfile>();
    for ((id, cafe) in cafeProfiles.entries()) {
      cafes.add(cafe);
    };
    cafes.toArray();
  };

  public query func getCafeProfile(cafeId : CafeId) : async ?CafeProfile {
    cafeProfiles.get(cafeId);
  };

  // QR Code Management
  public shared ({ caller }) func generateQRCode(cafeId : CafeId, coffeeId : CoffeeId) : async QRCodeData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate QR codes");
    };
    switch (cafeProfiles.get(cafeId)) {
      case null { Runtime.trap("Cafe not found") };
      case (?cafe) {
        if (cafe.availableFreeCups == 0) {
          Runtime.trap("No free cups available at this cafe");
        };
      };
    };

    let qrCodeId = generateQRCodeId();
    let qrCode : QRCodeData = {
      id = qrCodeId;
      user = caller;
      cafe = cafeId;
      coffee = coffeeId;
      redeemed = false;
      timestamp = Time.now();
      redemptionTimestamp = null;
    };

    qrCodes.add(qrCodeId, qrCode);
    qrCode;
  };

  public shared ({ caller }) func redeemQRCode(qrCodeId : QRCodeId) : async () {
    switch (qrCodes.get(qrCodeId)) {
      case null { Runtime.trap("QR code not found") };
      case (?qrCode) {
        if (not isCafeOwner(caller, qrCode.cafe)) {
          Runtime.trap("Unauthorized: Only cafe owner can redeem QR codes");
        };
        if (qrCode.redeemed) {
          Runtime.trap("QR code already redeemed");
        };

        let updatedQRCode = {
          id = qrCode.id;
          user = qrCode.user;
          cafe = qrCode.cafe;
          coffee = qrCode.coffee;
          redeemed = true;
          timestamp = qrCode.timestamp;
          redemptionTimestamp = ?Time.now();
        };
        qrCodes.add(qrCodeId, updatedQRCode);

        switch (cafeProfiles.get(qrCode.cafe)) {
          case (?cafe) {
            if (cafe.availableFreeCups > 0) {
              let updatedCafe = {
                id = cafe.id;
                owner = cafe.owner;
                name = cafe.name;
                location = cafe.location;
                roastLevel = cafe.roastLevel;
                availableFreeCups = cafe.availableFreeCups - 1;
                photos = cafe.photos;
                averageScores = cafe.averageScores;
                availableCoffees = cafe.availableCoffees;
              };
              cafeProfiles.add(qrCode.cafe, updatedCafe);
            };
          };
          case null {};
        };
        incrementDailyStat("qrCodesRedeemed");
      };
    };
  };

  public query ({ caller }) func getQRCode(qrCodeId : QRCodeId) : async ?QRCodeData {
    switch (qrCodes.get(qrCodeId)) {
      case null { null };
      case (?qrCode) {
        if (caller == qrCode.user or isCafeOwner(caller, qrCode.cafe) or AccessControl.isAdmin(accessControlState, caller)) {
          ?qrCode;
        } else {
          Runtime.trap("Unauthorized: Can only view your own QR codes");
        };
      };
    };
  };

  // Cupping Submission
  public shared ({ caller }) func submitCuppingForm(
    qrCodeId : QRCodeId,
    scores : CoffeeScores,
    intensityLevels : IntensityLevels,
    photo : ?Storage.ExternalBlob
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit cupping forms");
    };
    switch (qrCodes.get(qrCodeId)) {
      case null { Runtime.trap("QR code not found") };
      case (?qrCode) {
        if (qrCode.user != caller) {
          Runtime.trap("Unauthorized: QR code does not belong to you");
        };
        if (not qrCode.redeemed) {
          Runtime.trap("QR code must be redeemed before submitting cupping form");
        };

        let now = Time.now();
        let redemptionTime = switch (qrCode.redemptionTimestamp) {
          case (?t) { t };
          case null { Runtime.trap("QR code redemption timestamp not found") };
        };
        let twentyFourHours : Int = 24 * 60 * 60 * 1_000_000_000;
        if (now - redemptionTime > twentyFourHours) {
          Runtime.trap("Cupping form must be submitted within 24 hours of redemption");
        };

        let cuppingId = generateCuppingId();
        let cuppingSubmission : CuppingSubmission = {
          id = cuppingId;
          user = caller;
          cafe = qrCode.cafe;
          coffee = qrCode.coffee;
          scores;
          intensityLevels;
          photo;
          timestamp = now;
          qrCodeId;
        };

        cuppingSubmissions.add(cuppingId, cuppingSubmission);
        incrementDailyStat("cuppingSubmissions");
      };
    };
  };

  public query ({ caller }) func getCuppingsForUser(user : Principal) : async [CuppingSubmission] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own cupping submissions");
    };
    let userCuppings = List.empty<CuppingSubmission>();
    for ((id, cupping) in cuppingSubmissions.entries()) {
      if (cupping.user == user) {
        userCuppings.add(cupping);
      };
    };
    userCuppings.toArray();
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func exportCafeData(cafeId : CafeId) : async Text {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can export cafe data");
    };
    var csv = "Cupping ID,User,Coffee,Fragrance,Flavor,Aftertaste,Acidity,Body,Balance,Uniformity,Sweetness,Clean Cup,Overall,Timestamp\n";

    for ((id, cupping) in cuppingSubmissions.entries()) {
      if (cupping.cafe == cafeId) {
        csv #= cupping.id # "," #
              cupping.user.toText() # "," #
              cupping.coffee # "," #
              cupping.scores.fragrance.toText() # "," #
              cupping.scores.flavor.toText() # "," #
              cupping.scores.aftertaste.toText() # "," #
              cupping.scores.acidity.toText() # "," #
              cupping.scores.body.toText() # "," #
              cupping.scores.balance.toText() # "," #
              cupping.scores.uniformity.toText() # "," #
              cupping.scores.sweetness.toText() # "," #
              cupping.scores.cleanCup.toText() # "," #
              cupping.scores.overall.toText() # "," #
              cupping.timestamp.toText() # "\n";
      };
    };

    csv;
  };

  public shared ({ caller }) func assignCafeOwner(cafeId : CafeId, owner : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign cafe owners");
    };
    switch (cafeProfiles.get(cafeId)) {
      case null { Runtime.trap("Cafe not found") };
      case (?cafe) {
        let updatedCafe = {
          id = cafe.id;
          owner;
          name = cafe.name;
          location = cafe.location;
          roastLevel = cafe.roastLevel;
          availableFreeCups = cafe.availableFreeCups;
          photos = cafe.photos;
          averageScores = cafe.averageScores;
          availableCoffees = cafe.availableCoffees;
        };
        cafeProfiles.add(cafeId, updatedCafe);
        cafeOwners.add(owner, cafeId);
      };
    };
  };

  public shared ({ caller }) func _dummyUpdateLocation(location : Location) : async () {};

  public query ({ caller }) func getDailyStats() : async [(Text, DailyStats)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can retrieve stats");
    };
    dailyStats.toArray();
  };
};
