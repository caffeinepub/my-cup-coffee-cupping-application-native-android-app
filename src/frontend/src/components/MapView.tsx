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
import {
  CheckCircle2,
  Coffee,
  Loader2,
  MapPin,
  Settings,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CafeProfile, Coffee as CoffeeType, QRCodeData } from "../backend";
import { useGenerateQRCode, useGetFilteredCafes } from "../hooks/useQueries";

// ── Helpers ──────────────────────────────────────────────────────────────

function slotColor(slots: number): string {
  if (slots >= 5) return "#22c55e";
  if (slots > 0) return "#f59e0b";
  return "#ef4444";
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

// ── Slot Legend ─────────────────────────────────────────────────────────────

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

// ── Leaflet loader ────────────────────────────────────────────────────────
// Load leaflet from CDN at runtime to avoid build-time dependency

let leafletLoaded = false;
let leafletLoadPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletLoaded) return Promise.resolve();
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    // Load CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load JS
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        leafletLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      leafletLoaded = true;
      resolve();
    }
  });

  return leafletLoadPromise;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function MapView() {
  const { data: cafes, isLoading } = useGetFilteredCafes();
  const generateQRCode = useGenerateQRCode();

  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const cafeMarkersRef = useRef<any[]>([]);
  const hasCenteredRef = useRef(false);

  const [leafletReady, setLeafletReady] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [gpsStatus, setGpsStatus] = useState<"locating" | "live" | "denied">(
    "locating",
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

  // filteredCafes declared early so marker effect can use it
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

  // Load leaflet from CDN
  useEffect(() => {
    loadLeaflet()
      .then(() => setLeafletReady(true))
      .catch(() => {});
  }, []);

  // Initialize map once leaflet is ready
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    const mapCenter: [number, number] = [-6.9147, 107.6098];

    // No default icon fix needed — we use L.divIcon for all markers

    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: 13,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;
  }, [leafletReady]);

  // Update user location marker
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:18px;height:18px;"><div style="position:absolute;top:0;left:0;width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 10px rgba(59,130,246,0.6);"></div></div>`,
        iconAnchor: [9, 9],
        iconSize: [18, 18],
        popupAnchor: [0, -11],
      });
      userMarkerRef.current = L.marker(userLocation, { icon })
        .addTo(map)
        .bindPopup(
          "<div style='text-align:center;padding:4px'>\uD83D\uDCCD You are here</div>",
        );

      if (!hasCenteredRef.current) {
        hasCenteredRef.current = true;
        map.flyTo(userLocation, 14, { animate: true, duration: 1.5 });
      }
    }
  }, [leafletReady, userLocation]);

  // Update cafe markers
  useEffect(() => {
    if (!leafletReady || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Remove old markers
    for (const m of cafeMarkersRef.current) {
      m.remove();
    }
    cafeMarkersRef.current = [];

    for (const cafe of filteredCafes) {
      const slots = Number(cafe.availableFreeCups);
      let icon: any;

      if (cafe.name === "Kopi Selasar") {
        const html = `
          <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;">
            <div style="background:#7c4c2a;color:white;border-radius:10px;padding:6px 10px;text-align:center;border:2px solid #f59e0b;box-shadow:0 3px 10px rgba(0,0,0,0.4);min-width:90px;">
              <div style="background:#f59e0b;color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:3px;margin-bottom:3px;display:inline-block;">\u2B50 FEATURED</div>
              <div style="font-size:16px;line-height:1;">\u2615</div>
              <div style="font-size:9px;font-weight:700;margin-top:2px;color:#ffe;white-space:nowrap;">Kopi Selasar</div>
            </div>
            <div style="width:3px;height:12px;background:#7c4c2a;margin:0 auto;"></div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid #7c4c2a;"></div>
          </div>
        `;
        icon = L.divIcon({
          className: "",
          html,
          iconAnchor: [50, 82],
          iconSize: [100, 82],
          popupAnchor: [0, -82],
        });
      } else {
        const color = slotColor(slots);
        icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:24px;height:24px;"><div style="position:absolute;top:0;left:0;width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.5);"></div></div>`,
          iconAnchor: [12, 12],
          iconSize: [24, 24],
          popupAnchor: [0, -14],
        });
      }

      const featuredBadge =
        cafe.name === "Kopi Selasar"
          ? `<span style="display:inline-block;background:#f59e0b;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;margin-top:3px">\u2B50 Featured</span>`
          : "";

      const popup = L.popup().setContent(`
        <div style="min-width:160px;padding:4px 0;font-family:sans-serif">
          <div>
            <p style="font-weight:700;font-size:14px;margin:0 0 2px">${cafe.name}</p>
            ${featuredBadge}
            <p style="font-size:12px;color:#888;margin:2px 0">${cafe.roastLevel} Roast</p>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin:6px 0">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${slotColor(slots)}"></span>
            <span style="font-size:12px">${slots} slot${slots !== 1 ? "s" : ""} available</span>
          </div>
          <div style="font-size:12px;color:#888;margin-bottom:6px">\u2B50 ${cafe.averageScores.overall.toFixed(1)} avg score</div>
        </div>
      `);

      const marker = L.marker(
        [cafe.location.latitude, cafe.location.longitude],
        { icon },
      )
        .addTo(map)
        .bindPopup(popup);

      marker.on("click", () => {
        setSelectedCafe(cafe);
        setQrResult(null);
      });

      cafeMarkersRef.current.push(marker);
    }
  }, [leafletReady, filteredCafes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Live GPS tracking via watchPosition
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus("live");
      },
      () => {
        setGpsStatus("denied");
        setUserLocation([-6.9147, 107.6098]);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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

  const handleResetFilters = () => {
    setDistanceKm(50);
    setRoastFilter("All");
    setSlotsOnly(false);
  };

  return (
    <div
      className="relative w-full"
      style={{ height: "calc(100vh - 8rem)" }}
      data-ocid="map.section"
    >
      {/* ── Loading overlay ─────────────────────────────────────────── */}
      {(isLoading || !leafletReady) && (
        <div
          className="absolute inset-0 z-[600] flex items-center justify-center bg-background/70 backdrop-blur-sm"
          data-ocid="map.loading_state"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              {!leafletReady ? "Loading map\u2026" : "Loading cafes\u2026"}
            </p>
          </div>
        </div>
      )}

      {/* ── GPS status indicator (top-left) ────────────────────────── */}
      {gpsStatus === "locating" && (
        <div
          data-ocid="map.gps.loading_state"
          className="absolute top-3 left-3 z-[500] flex items-center gap-2 rounded-full bg-white/95 dark:bg-card/95 backdrop-blur-sm border border-border px-3 py-2 shadow-lg"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          <span className="text-xs font-semibold text-foreground/80">
            Locating you\u2026
          </span>
        </div>
      )}

      {gpsStatus === "live" && (
        <div
          data-ocid="map.gps.success_state"
          className="absolute top-3 left-3 z-[500] flex items-center gap-2 rounded-full bg-white/95 dark:bg-card/95 backdrop-blur-sm border border-green-200 px-3 py-2 shadow-lg"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            Live GPS
          </span>
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

          {/* Reset Filters button */}
          <Button
            data-ocid="map.filters.button"
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={handleResetFilters}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* ── Slot legend ──────────────────────────────────────────────── */}
      <SlotLegend />

      {/* ── Map container ────────────────────────────────────────────── */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ zIndex: 0 }}
      />

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
                    {selectedCafe.name === "Kopi Selasar" && (
                      <span
                        style={{
                          display: "inline-block",
                          background: "#f59e0b",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "5px",
                          marginTop: "4px",
                          letterSpacing: "0.03em",
                        }}
                      >
                        \u2B50 Featured Cafe
                      </span>
                    )}
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
                            : "\u2014"
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
                                      \uD83C\uDF0D {coffee.origin}
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
                                      \u2026
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
