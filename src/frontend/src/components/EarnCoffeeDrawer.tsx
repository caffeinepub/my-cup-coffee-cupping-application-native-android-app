import { Button } from "@/components/ui/button";
import {
  Award,
  BadgeCheck,
  CheckCircle,
  ChevronDown,
  Coffee,
  QrCode,
  RefreshCw,
  Star,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

/* ─── Sample redemption data ─────────────────────────────────────────────── */
const SAMPLE_QR = {
  id: "QR-KOPI-SELASAR-4829",
  cafe: "Kopi Selasar",
  coffee: "Aceh Gayo Natural — Light Roast",
  accuracy: 87,
  reviewsCount: 12,
  level: "Intermediate",
  levelColor: "bg-chart-2/15 text-chart-2",
  levelDot: "bg-chart-2",
  expiresAt: "Today, 11:59 PM",
  badges: ["Acidity Expert", "Balance Pro", "5-Star Reviewer"],
};

const HOW_IT_WORKS = [
  {
    key: "submit",
    icon: Star,
    text: "Submit a cupping review at a partner cafe",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    key: "verify",
    icon: CheckCircle,
    text: "Your accuracy score is verified against Q-grader benchmarks",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "generate",
    icon: QrCode,
    text: "A unique QR code is generated for your visit",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    key: "show",
    icon: Coffee,
    text: "Show the QR at the counter to redeem your free cup",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    key: "improve",
    icon: Award,
    text: "Your score improves, unlocking premium cafes and skill badges",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

/* ─── QR pattern visual ──────────────────────────────────────────────────── */
function QRPattern({ id }: { id: string }) {
  // Deterministic grid from the ID string
  const cells = Array.from({ length: 7 * 7 }, (_, i) => {
    const charCode = id.charCodeAt(i % id.length);
    return { on: (charCode + i * 13) % 3 !== 0, cellKey: `cell-${i}` };
  });
  const corners = new Set([
    0, 1, 2, 7, 14, 6, 13, 42, 49, 43, 44, 45, 46, 47, 48,
  ]);
  return (
    <div className="relative w-48 h-48 bg-white rounded-2xl p-4 shadow-xl">
      {/* Grid */}
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
      >
        {cells.map(({ on, cellKey }, i) => (
          <div
            key={cellKey}
            className={`aspect-square rounded-[1px] transition-all ${
              corners.has(i)
                ? "bg-foreground"
                : on
                  ? "bg-foreground"
                  : "bg-transparent"
            }`}
          />
        ))}
      </div>
      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
          <Coffee className="h-5 w-5 text-chart-2" />
        </div>
      </div>
    </div>
  );
}

interface EarnCoffeeDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function EarnCoffeeDrawer({
  open,
  onClose,
}: EarnCoffeeDrawerProps) {
  const [redeemed, setRedeemed] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const startYRef = useRef<number | null>(null);

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setRedeemed(false);
      setRedeeming(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Swipe-down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    if (delta > 80) onClose();
    startYRef.current = null;
  };

  const handleRedeem = () => {
    setRedeeming(true);
    setTimeout(() => {
      setRedeeming(false);
      setRedeemed(true);
    }, 1400);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <dialog
        ref={drawerRef}
        open
        className="fixed inset-x-0 bottom-0 z-[101] flex flex-col bg-background rounded-t-3xl shadow-2xl max-h-[92vh] max-w-[430px] mx-auto m-0 p-0 border-0 w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Earn Free Coffee — QR Redemption"
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-3" />
          {/* Header */}
          <div className="w-full px-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <QrCode className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-foreground leading-tight">
                  Earn Free Coffee
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sample redemption flow
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="Close"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
          {/* User accuracy card */}
          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Your Profile
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-2/15 flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">
                    Sample User
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${SAMPLE_QR.levelDot}`}
                    />
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SAMPLE_QR.levelColor}`}
                    >
                      {SAMPLE_QR.level}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">
                  {SAMPLE_QR.accuracy}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Accuracy Score
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">
                  {SAMPLE_QR.reviewsCount} reviews
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Next: Advanced (35)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-chart-2 transition-all duration-700"
                  style={{ width: `${(SAMPLE_QR.reviewsCount / 35) * 100}%` }}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {SAMPLE_QR.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary"
                >
                  <BadgeCheck className="h-3 w-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div className="rounded-2xl border border-chart-4/20 bg-chart-4/5 px-4 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Redemption QR Code
            </p>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">
                  {SAMPLE_QR.cafe}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {SAMPLE_QR.coffee}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Expires: {SAMPLE_QR.expiresAt}
                </p>
              </div>
              {redeemed && (
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3" /> Redeemed
                </span>
              )}
            </div>

            {/* QR visual */}
            <div className="flex flex-col items-center py-4">
              <div
                className={`transition-all duration-300 ${redeemed ? "opacity-40 grayscale" : ""}`}
              >
                <QRPattern id={SAMPLE_QR.id} />
              </div>
              {!redeemed && (
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Show this to the barista at the counter
                </p>
              )}
              {redeemed && (
                <div className="mt-3 flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-green-700">
                    Enjoy your free cup!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This code has been used
                  </p>
                </div>
              )}
            </div>

            <p className="text-[10px] font-mono text-muted-foreground/60 text-center">
              {SAMPLE_QR.id}
            </p>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-border bg-card px-4 py-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            {HOW_IT_WORKS.map(({ key, icon: Icon, text, color, bg }) => (
              <div key={key} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className="rounded-xl bg-chart-2/10 border border-chart-2/20 px-4 py-3 text-xs text-chart-2 font-medium">
            ✦ This is a sample flow. Sign in and submit a real cupping review to
            earn your first free cup.
          </div>
        </div>

        {/* Action button */}
        <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-border bg-background">
          {!redeemed ? (
            <Button
              type="button"
              disabled={redeeming}
              onClick={handleRedeem}
              className="w-full h-14 text-base font-bold rounded-2xl bg-chart-4 hover:bg-chart-4/90 text-white shadow-lg shadow-chart-4/25 transition-all hover:scale-[1.02] disabled:opacity-70"
            >
              {redeeming ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Redeeming…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Redeem Sample QR Code
                </span>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full h-14 text-base font-bold rounded-2xl"
            >
              Close
            </Button>
          )}
          <p className="text-center text-xs text-muted-foreground mt-2">
            Sign in to generate real QR codes from your reviews
          </p>
        </div>
      </dialog>
    </>
  );
}
