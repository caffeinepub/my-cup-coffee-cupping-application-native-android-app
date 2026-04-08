import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Timestamp = Time.Time;
  type CafeId = Text;
  type CoffeeId = Text;
  type CuppingId = Text;
  type QRCodeId = Text;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  // ── Domain Types ──────────────────────────────────────────────────────────

  public type UserProfile = {
    name : Text;
    phoneNumber : ?Text;
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

  public type CuppingSubmission = {
    id : CuppingId;
    user : Principal;
    cafe : CafeId;
    coffeeId : CoffeeId;
    scores : CoffeeScores;
    intensityLevels : IntensityLevels;
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
    expiryTime : Timestamp;
    redemptionTimestamp : ?Timestamp;
  };

  public type DailyStats = {
    newUsers : Nat;
    cuppingSubmissions : Nat;
    qrCodesRedeemed : Nat;
    cafesRegistered : Nat;
  };

  // ── State ─────────────────────────────────────────────────────────────────

  let userProfiles = Map.empty<Principal, UserProfile>();
  let cafeProfiles = Map.empty<CafeId, CafeProfile>();
  let cuppingSubmissions = Map.empty<CuppingId, CuppingSubmission>();
  let qrCodes = Map.empty<QRCodeId, QRCodeData>();
  let cafeOwners = Map.empty<Principal, CafeId>();
  let dailyStats = Map.empty<Text, DailyStats>();
  var nextCafeId : Nat = 0;
  var nextCuppingId : Nat = 0;
  var nextQRCodeId : Nat = 0;

  // ── Helpers ───────────────────────────────────────────────────────────────

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
      case ("newUsers") { { currentStats with newUsers = currentStats.newUsers + 1 } };
      case ("cuppingSubmissions") { { currentStats with cuppingSubmissions = currentStats.cuppingSubmissions + 1 } };
      case ("qrCodesRedeemed") { { currentStats with qrCodesRedeemed = currentStats.qrCodesRedeemed + 1 } };
      case ("cafesRegistered") { { currentStats with cafesRegistered = currentStats.cafesRegistered + 1 } };
      case (_) { currentStats };
    };

    dailyStats.add(currentDate, updatedStats);
  };

  // ── User Profile API ──────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    incrementDailyStat("newUsers");
  };

  // ── Cafe Management ───────────────────────────────────────────────────────

  public shared ({ caller }) func createCafeProfile(
    owner : Principal,
    name : Text,
    latitude : Float,
    longitude : Float,
    roastLevel : Text,
    availableFreeCups : Nat
  ) : async CafeProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
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
      averageScores = {
        fragrance = 0.0;
        aroma = 0.0;
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

  public shared ({ caller }) func updateCafeFreeCups(cafeId : CafeId, availableFreeCups : Nat) : async () {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can update free cups");
    };
    switch (cafeProfiles.get(cafeId)) {
      case (?cafe) {
        cafeProfiles.add(cafeId, { cafe with availableFreeCups });
      };
      case null { Runtime.trap("Cafe not found") };
    };
  };

  public shared ({ caller }) func addCoffeeToCafe(cafeId : CafeId, coffee : Coffee) : async () {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can add coffees");
    };
    switch (cafeProfiles.get(cafeId)) {
      case (?cafe) {
        cafeProfiles.add(cafeId, { cafe with availableCoffees = cafe.availableCoffees.concat([coffee]) });
      };
      case null { Runtime.trap("Cafe not found") };
    };
  };

  public shared ({ caller }) func removeCoffeeFromCafe(cafeId : CafeId, coffeeId : CoffeeId) : async () {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can remove coffees");
    };
    switch (cafeProfiles.get(cafeId)) {
      case (?cafe) {
        cafeProfiles.add(cafeId, { cafe with availableCoffees = cafe.availableCoffees.filter(func(c) { c.id != coffeeId }) });
      };
      case null { Runtime.trap("Cafe not found") };
    };
  };

  public query ({ caller }) func getCafeForOwner() : async ?CafeProfile {
    switch (getCafeIdForOwner(caller)) {
      case (?cafeId) { cafeProfiles.get(cafeId) };
      case null { null };
    };
  };

  public query func getFilteredCafes(_maxDistance : Float, _minRoastLevel : Text) : async [CafeProfile] {
    let cafes = List.empty<CafeProfile>();
    for ((_, cafe) in cafeProfiles.entries()) {
      cafes.add(cafe);
    };
    cafes.toArray();
  };

  public query func getCafeProfile(cafeId : CafeId) : async ?CafeProfile {
    cafeProfiles.get(cafeId);
  };

  public shared ({ caller }) func assignCafeOwner(cafeId : CafeId, owner : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can assign cafe owners");
    };
    switch (cafeProfiles.get(cafeId)) {
      case null { Runtime.trap("Cafe not found") };
      case (?cafe) {
        cafeProfiles.add(cafeId, { cafe with owner });
        cafeOwners.add(owner, cafeId);
      };
    };
  };

  // ── QR Code API ───────────────────────────────────────────────────────────

  public shared ({ caller }) func generateQRCode(cafeId : CafeId, coffeeId : CoffeeId) : async QRCodeData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
    let twentyFourHours : Int = 24 * 60 * 60 * 1_000_000_000;
    let qrCode : QRCodeData = {
      id = qrCodeId;
      user = caller;
      cafe = cafeId;
      coffee = coffeeId;
      redeemed = false;
      expiryTime = Time.now() + twentyFourHours;
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

        qrCodes.add(qrCodeId, { qrCode with redeemed = true; redemptionTimestamp = ?Time.now() });

        switch (cafeProfiles.get(qrCode.cafe)) {
          case (?cafe) {
            if (cafe.availableFreeCups > 0) {
              cafeProfiles.add(qrCode.cafe, { cafe with availableFreeCups = cafe.availableFreeCups - 1 });
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

  // ── Cupping API ───────────────────────────────────────────────────────────

  public shared ({ caller }) func submitCuppingForm(
    qrCodeId : QRCodeId,
    scores : CoffeeScores,
    intensityLevels : IntensityLevels
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
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
          coffeeId = qrCode.coffee;
          scores;
          intensityLevels;
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
    for ((_, cupping) in cuppingSubmissions.entries()) {
      if (cupping.user == user) {
        userCuppings.add(cupping);
      };
    };
    userCuppings.toArray();
  };

  public query ({ caller }) func getCuppingsForCafe(cafeId : CafeId) : async [CuppingSubmission] {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can view cafe cuppings");
    };
    let cafeCuppings = List.empty<CuppingSubmission>();
    for ((_, cupping) in cuppingSubmissions.entries()) {
      if (cupping.cafe == cafeId) {
        cafeCuppings.add(cupping);
      };
    };
    cafeCuppings.toArray();
  };

  public query ({ caller }) func exportCafeData(cafeId : CafeId) : async Text {
    if (not isCafeOwner(caller, cafeId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the cafe owner or admin can export cafe data");
    };
    var csv = "Cupping ID,User,Coffee,Fragrance,Aroma,Flavor,Aftertaste,Acidity,Body,Balance,Uniformity,Sweetness,Clean Cup,Overall,Timestamp\n";

    for ((_, cupping) in cuppingSubmissions.entries()) {
      if (cupping.cafe == cafeId) {
        csv #= cupping.id # "," #
              cupping.user.toText() # "," #
              cupping.coffeeId # "," #
              cupping.scores.fragrance.toText() # "," #
              cupping.scores.aroma.toText() # "," #
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

  // ── Admin API ─────────────────────────────────────────────────────────────

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getDailyStats() : async [(Text, DailyStats)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admin can retrieve stats");
    };
    dailyStats.toArray();
  };
};
