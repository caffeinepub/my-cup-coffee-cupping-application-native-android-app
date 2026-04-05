import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import {
  CheckCircle2,
  Coffee,
  Loader2,
  MapPin,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { CafeProfile, Coffee as CoffeeType, QRCodeData } from "../backend";
import { useGenerateQRCode, useGetFilteredCafes } from "../hooks/useQueries";

// Fix leaflet default icon path issue with bundlers
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// ── Helpers ──────────────────────────────────────────────────────────────

function slotColor(slots: number): string {
  if (slots >= 5) return "#22c55e";
  if (slots > 0) return "#f59e0b";
  return "#ef4444";
}

function cafeIcon(slots: number) {
  const color = slotColor(slots);
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconAnchor: [10, 10],
    iconSize: [20, 20],
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 10px rgba(59,130,246,0.6)"><div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(59,130,246,0.2);animation:pulse 2s infinite"></div></div>`,
    iconAnchor: [9, 9],
    iconSize: [18, 18],
  });
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Slot Legend ────────────────────────────────────────────────────────────

function SlotLegend() {
  return (
    <div className="absolute bottom-20 left-3 z-[500] rounded-xl bg-white/95 dark:bg-card/95 backdrop-blur-sm shadow-lg border border-border px-3 py-2 flex flex-col gap-1.5">
      {[
        { color: "#22c55e", label: "Plenty of slots" },
        { color: "#f59e0b", label: "Few left" },
        { color: "#ef4444", label: "Full" },
        { color: "#3b82f6", label: "Your location" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full border-2 border-white"
            style={{ background: color }}
          />
          <span className="text-[11px] text-foreground/70 font-medium">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-muted/60 px-3 py-3 flex-1">
      <span
        className={`text-lg font-black leading-none ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground mt-1 text-center font-medium leading-tight">
        {label}
      </span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MapView() {
  const { data: cafes, isLoading } = useGetFilteredCafes();
  const generateQRCode = useGenerateQRCode();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [selectedCafe, setSelectedCafe] = useState<CafeProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [distanceKm, setDistanceKm] = useState(50);
  const [roastFilter, setRoastFilter] = useState("All");
  const [slotsOnly, setSlotsOnly] = useState(false);
  const [qrResult, setQrResult] = useState<QRCodeData | null>(null);
  const [reservingCoffeeId, setReservingCoffeeId] = useState<string | null>(
    null,
  );

  // Request user location on mount
  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // User denied or unavailable — use KL default
        },
      );
    }
  });

  const filteredCafes = useMemo(() => {
    if (!cafes) return [];
    return cafes.filter((cafe) => {
      const slots = Number(cafe.availableFreeCups);
      if (slotsOnly && slots === 0) return false;
      if (
        roastFilter !== "All" &&
        cafe.roastLevel.toLowerCase() !== roastFilter.toLowerCase()
      )
        return false;
      if (userLocation) {
        const dist = haversineKm(
          userLocation[0],
          userLocation[1],
          cafe.location.latitude,
          cafe.location.longitude,
        );
        if (dist > distanceKm) return false;
      }
      return true;
    });
  }, [cafes, slotsOnly, roastFilter, distanceKm, userLocation]);

  const handleReserve = (coffee: CoffeeType) => {
    if (!selectedCafe) return;
    setReservingCoffeeId(coffee.id);
    generateQRCode.mutate(
      { cafeId: selectedCafe.id, coffeeId: coffee.id },
      {
        onSuccess: (data) => {
          setQrResult(data);
          setReservingCoffeeId(null);
        },
        onError: () => {
          setReservingCoffeeId(null);
        },
      },
    );
  };

  const handleDrawerClose = (open: boolean) => {
    if (!open) {
      setSelectedCafe(null);
      setQrResult(null);
      setReservingCoffeeId(null);
    }
  };

  const qrExpiryDisplay = qrResult
    ? new Date(
        Number(qrResult.timestamp) / 1_000_000 + 24 * 60 * 60 * 1000,
      ).toLocaleString()
    : null;

  // Default map center: Kuala Lumpur
  const mapCenter: [number, number] = userLocation ?? [3.139, 101.6869];

  return (
    <div
      className="relative w-full"
      style={{ height: "calc(100vh - 8rem)" }}
      data-ocid="map.section"
    >
      {/* ── Loading overlay ─────────────────────────────────────────── */}
      {isLoading && (
        <div
          className="absolute inset-0 z-[600] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          data-ocid="map.loading_state"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              Loading cafes…
            </p>
          </div>
        </div>
      )}

      {/* ── Filters toggle button ────────────────────────────────────── */}
      <button
        type="button"
        data-ocid="map.filters.open_modal_button"
        onClick={() => setShowFilters((v) => !v)}
        className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-card/95 backdrop-blur-sm border border-border px-3 py-2 shadow-lg text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
        aria-label="Toggle filters panel"
      >
        <Settings className="h-4 w-4" />
        Filters
      </button>

      {/* ── Filters panel ────────────────────────────────────────────── */}
      {showFilters && (
        <div
          data-ocid="map.filters.panel"
          className="absolute top-14 right-3 z-[500] w-64 rounded-2xl bg-white/98 dark:bg-card/98 backdrop-blur-md border border-border shadow-2xl p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm text-foreground">Filter Cafes</p>
            <button
              type="button"
              data-ocid="map.filters.close_button"
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Distance slider */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Distance
            </Label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">1 km</span>
              <span className="text-xs font-bold text-primary">
                Within {distanceKm} km
              </span>
              <span className="text-xs text-muted-foreground">50 km</span>
            </div>
            <Slider
              data-ocid="map.distance.input"
              value={[distanceKm]}
              onValueChange={([val]) => setDistanceKm(val)}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Roast level dropdown */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Roast Level
            </Label>
            <Select value={roastFilter} onValueChange={setRoastFilter}>
              <SelectTrigger
                data-ocid="map.roast.select"
                className="h-9 text-sm"
              >
                <SelectValue placeholder="All roasts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roasts</SelectItem>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Slots-only toggle */}
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="slots-only-switch"
              className="text-sm font-medium text-foreground cursor-pointer flex-1"
            >
              Only cafes with slots
            </Label>
            <Switch
              id="slots-only-switch"
              data-ocid="map.slots_only.switch"
              checked={slotsOnly}
              onCheckedChange={setSlotsOnly}
            />
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {filteredCafes.length} cafe{filteredCafes.length !== 1 ? "s" : ""}{" "}
            showing
          </div>
        </div>
      )}

      {/* ── Slot legend ──────────────────────────────────────────────── */}
      <SlotLegend />

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!isLoading && filteredCafes.length === 0 && (
        <div
          data-ocid="map.empty_state"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] flex flex-col items-center gap-2 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border px-6 py-5 text-center"
        >
          <Coffee className="h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground text-sm">
            No cafes match your filters
          </p>
          <p className="text-xs text-muted-foreground">
            Try adjusting the distance or removing filters.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDistanceKm(50);
              setRoastFilter("All");
              setSlotsOnly(false);
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* ── Leaflet Map ──────────────────────────────────────────────── */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom
        className="rounded-xl overflow-hidden"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location blue dot */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon()}>
            <Popup>
              <div className="text-sm font-semibold text-center py-1">
                📍 You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Cafe markers */}
        {filteredCafes.map((cafe) => (
          <Marker
            key={cafe.id}
            position={[cafe.location.latitude, cafe.location.longitude]}
            icon={cafeIcon(Number(cafe.availableFreeCups))}
            eventHandlers={{
              click: () => {
                setSelectedCafe(cafe);
                setQrResult(null);
              },
            }}
          >
            <Popup>
              <div className="min-w-[160px] py-1 space-y-2">
                <div>
                  <p className="font-bold text-sm leading-tight">{cafe.name}</p>
                  <p className="text-xs text-gray-500">
                    {cafe.roastLevel} Roast
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{
                      background: slotColor(Number(cafe.availableFreeCups)),
                    }}
                  />
                  <span className="text-xs">
                    {Number(cafe.availableFreeCups)} slot
                    {Number(cafe.availableFreeCups) !== 1 ? "s" : ""} available
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{cafe.averageScores.overall.toFixed(1)} avg score</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCafe(cafe);
                    setQrResult(null);
                  }}
                  className="w-full mt-1 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Cafe Detail Bottom Drawer ────────────────────────────────── */}
      <Drawer open={!!selectedCafe} onOpenChange={handleDrawerClose}>
        <DrawerContent
          data-ocid="map.cafe_detail.sheet"
          className="max-h-[85vh] focus:outline-none"
        >
          {selectedCafe && (
            <>
              <DrawerHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <DrawerTitle className="font-display text-xl font-black text-foreground leading-tight">
                      {selectedCafe.name}
                    </DrawerTitle>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {selectedCafe.location.latitude.toFixed(4)},{" "}
                        {selectedCafe.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {selectedCafe.roastLevel}
                  </Badge>
                </div>
              </DrawerHeader>

              <div className="overflow-y-auto px-4 pb-6 space-y-5">
                {/* ── QR Code success state ─────────────────────────── */}
                {qrResult ? (
                  <div
                    data-ocid="map.qr_result.success_state"
                    className="flex flex-col items-center gap-4 py-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-foreground text-base">
                        Reservation Created!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Show this code at the cafe counter
                      </p>
                    </div>
                    <div
                      data-ocid="map.qr_code.card"
                      className="w-full rounded-2xl bg-muted/60 border-2 border-primary/20 px-5 py-4 text-center"
                    >
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
                        Reservation Code
                      </p>
                      <p className="font-mono text-sm font-bold text-foreground break-all">
                        {qrResult.id}
                      </p>
                      <Separator className="my-3" />
                      <p className="text-[10px] text-muted-foreground">
                        Expires:{" "}
                        <span className="font-semibold text-foreground">
                          {qrExpiryDisplay}
                        </span>
                      </p>
                    </div>
                    <Button
                      data-ocid="map.qr_done.button"
                      className="w-full"
                      onClick={() => handleDrawerClose(false)}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* ── Stats row ──────────────────────────────────── */}
                    <div className="grid grid-cols-4 gap-2">
                      <StatCard
                        label="Avg Score"
                        value={selectedCafe.averageScores.overall.toFixed(1)}
                        highlight
                      />
                      <StatCard
                        label="Slots Today"
                        value={Number(
                          selectedCafe.availableFreeCups,
                        ).toString()}
                        highlight={Number(selectedCafe.availableFreeCups) > 0}
                      />
                      <StatCard
                        label="Distance"
                        value={
                          userLocation
                            ? `${haversineKm(
                                userLocation[0],
                                userLocation[1],
                                selectedCafe.location.latitude,
                                selectedCafe.location.longitude,
                              ).toFixed(1)} km`
                            : "—"
                        }
                      />
                      <StatCard
                        label="Coffees"
                        value={selectedCafe.availableCoffees.length.toString()}
                      />
                    </div>

                    {/* ── Coffee menu ─────────────────────────────────── */}
                    <div>
                      <p className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                        Coffee Menu
                      </p>

                      {selectedCafe.availableCoffees.length === 0 ? (
                        <div
                          data-ocid="map.coffees.empty_state"
                          className="flex flex-col items-center gap-2 py-8 text-center"
                        >
                          <Coffee className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No coffees listed yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedCafe.availableCoffees.map((coffee, idx) => (
                            <div
                              key={coffee.id}
                              data-ocid={`map.coffee.item.${idx + 1}`}
                              className="rounded-2xl border border-border bg-card px-4 py-3 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-foreground leading-tight">
                                    {coffee.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-muted-foreground">
                                      🌍 {coffee.origin}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] h-4 px-1.5"
                                    >
                                      {coffee.roastLevel}
                                    </Badge>
                                  </div>
                                  {coffee.flavorProfile && (
                                    <p className="text-[11px] text-muted-foreground mt-1 italic leading-tight">
                                      {coffee.flavorProfile}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  data-ocid={`map.reserve.button.${idx + 1}`}
                                  onClick={() => handleReserve(coffee)}
                                  disabled={
                                    generateQRCode.isPending ||
                                    Number(selectedCafe.availableFreeCups) ===
                                      0 ||
                                    reservingCoffeeId !== null
                                  }
                                  className="shrink-0 h-8 px-3 text-xs"
                                >
                                  {reservingCoffeeId === coffee.id ? (
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      …
                                    </span>
                                  ) : Number(selectedCafe.availableFreeCups) ===
                                    0 ? (
                                    "Full"
                                  ) : (
                                    "Reserve"
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
