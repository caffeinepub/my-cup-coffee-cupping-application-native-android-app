import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ClipboardList, Info } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

/* ─── SCA categories ─────────────────────────────────────────────────────── */
const categories = [
  {
    key: "fragrance",
    label: "Fragrance / Aroma",
    emoji: "👃",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50 border-purple-200",
    tip: "Dry grounds before water; wet aroma after brewing.",
    hasIntensity: true,
  },
  {
    key: "flavor",
    label: "Flavor",
    emoji: "☕",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 border-amber-200",
    tip: "Combined taste & aromatic impression — the core character.",
    hasIntensity: true,
  },
  {
    key: "aftertaste",
    label: "Aftertaste",
    emoji: "🌊",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50 border-teal-200",
    tip: "Length and quality of flavor that lingers after swallowing.",
    hasIntensity: true,
  },
  {
    key: "acidity",
    label: "Acidity",
    emoji: "⚡",
    color: "from-yellow-400 to-lime-500",
    bg: "bg-yellow-50 border-yellow-200",
    tip: "Brightness and vibrancy — citrus, malic, or tartaric qualities.",
    hasIntensity: true,
  },
  {
    key: "body",
    label: "Body",
    emoji: "🫗",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 border-blue-200",
    tip: "Tactile weight and texture — from watery to syrupy.",
    hasIntensity: true,
  },
  {
    key: "balance",
    label: "Balance",
    emoji: "⚖️",
    color: "from-rose-400 to-pink-600",
    bg: "bg-rose-50 border-rose-200",
    tip: "How well all attributes complement each other.",
    hasIntensity: true,
  },
  {
    key: "uniformity",
    label: "Uniformity",
    emoji: "🔄",
    color: "from-slate-400 to-slate-600",
    bg: "bg-slate-50 border-slate-200",
    tip: "Consistency across all five cups in the sample.",
    hasIntensity: false,
  },
  {
    key: "sweetness",
    label: "Sweetness",
    emoji: "🍯",
    color: "from-orange-400 to-amber-500",
    bg: "bg-orange-50 border-orange-200",
    tip: "Pleasant sweetness from natural carbohydrates in the bean.",
    hasIntensity: false,
  },
  {
    key: "cleanCup",
    label: "Clean Cup",
    emoji: "✨",
    color: "from-sky-400 to-blue-500",
    bg: "bg-sky-50 border-sky-200",
    tip: "Absence of any negative flavors from first sip to finish.",
    hasIntensity: false,
  },
  {
    key: "overall",
    label: "Overall",
    emoji: "🏆",
    color: "from-chart-2 to-primary",
    bg: "bg-primary/5 border-primary/20",
    tip: "Your holistic, personal impression of the total experience.",
    hasIntensity: false,
  },
];

const getScoreLabel = (score: number) => {
  if (score >= 90) return { label: "Outstanding", color: "text-emerald-600" };
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 70) return { label: "Very Good", color: "text-lime-600" };
  if (score >= 60) return { label: "Good", color: "text-amber-600" };
  if (score >= 50) return { label: "Fair", color: "text-orange-500" };
  return { label: "Below Avg", color: "text-red-500" };
};

interface CuppingFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (
    scores: Record<string, number>,
    intensities: Record<string, number>,
  ) => void;
  prefillQR?: string;
}

export default function CuppingFormDrawer({
  open,
  onClose,
  onSubmit,
  prefillQR = "",
}: CuppingFormDrawerProps) {
  const [scores, setScores] = useState<Record<string, number>>({
    fragrance: 75,
    flavor: 75,
    aftertaste: 75,
    acidity: 75,
    body: 75,
    balance: 75,
    uniformity: 75,
    sweetness: 75,
    cleanCup: 75,
    overall: 75,
  });
  const [intensities, setIntensities] = useState<Record<string, number>>({
    fragrance: 5,
    flavor: 5,
    aftertaste: 5,
    acidity: 5,
    body: 5,
    balance: 5,
  });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState(prefillQR);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const startYRef = useRef<number | null>(null);

  // Sync prefillQR
  useEffect(() => {
    if (prefillQR) setQrCode(prefillQR);
  }, [prefillQR]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
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

  const totalScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / categories.length,
  );

  const handleSubmit = () => {
    if (onSubmit) onSubmit(scores, intensities);
    onClose();
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
        aria-label="SCA Cupping Form"
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-3" />
          {/* Header */}
          <div className="w-full px-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-foreground leading-tight">
                  SCA Cupping Form
                </h2>
                <p className="text-xs text-muted-foreground">
                  Industry-standard scoring · 0–100
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

          {/* Live total score pill */}
          <div className="w-full px-5 pb-3">
            <div className="flex items-center justify-between rounded-2xl bg-primary/8 border border-primary/20 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Total Score
                </p>
                <p className="text-2xl font-black text-foreground leading-none mt-0.5">
                  {totalScore}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-bold ${
                    getScoreLabel(totalScore).color
                  }`}
                >
                  {getScoreLabel(totalScore).label}
                </div>
                <div className="w-24 h-2 rounded-full bg-muted mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${totalScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
          {/* QR Code field */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <label
              htmlFor="cupping-qr-input"
              className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
            >
              QR Code ID
            </label>
            <input
              id="cupping-qr-input"
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="e.g. QR_123456 (from your reservation)"
              className="w-full text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Score sliders */}
          {categories.map((cat) => {
            const score = scores[cat.key];
            const label = getScoreLabel(score);
            return (
              <div
                key={cat.key}
                className={`rounded-2xl border ${cat.bg} px-4 py-4 transition-all duration-200`}
              >
                {/* Category header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{cat.emoji}</span>
                    <span className="font-bold text-sm text-foreground">
                      {cat.label}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === cat.key ? null : cat.key,
                        )
                      }
                      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      aria-label={`Info about ${cat.label}`}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${label.color}`}>
                      {label.label}
                    </span>
                    <span className="text-xl font-black text-foreground w-10 text-right">
                      {score}
                    </span>
                  </div>
                </div>

                {/* Tooltip */}
                {activeTooltip === cat.key && (
                  <p className="text-xs text-muted-foreground bg-white/70 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                    {cat.tip}
                  </p>
                )}

                {/* Score slider */}
                <Slider
                  value={[score]}
                  onValueChange={([v]) =>
                    setScores((prev) => ({ ...prev, [cat.key]: v }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground/60">
                    0
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    50
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    100
                  </span>
                </div>

                {/* Intensity slider */}
                {cat.hasIntensity && (
                  <div className="mt-3 pt-3 border-t border-black/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        Intensity
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {intensities[cat.key]}/10
                      </span>
                    </div>
                    <Slider
                      value={[intensities[cat.key]]}
                      onValueChange={([v]) =>
                        setIntensities((prev) => ({ ...prev, [cat.key]: v }))
                      }
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* SCA note */}
          <div className="rounded-xl bg-chart-2/10 border border-chart-2/20 px-4 py-3 text-xs text-chart-2 font-medium">
            ✦ Submit within 24 hours of your cafe visit — scores are compared
            against certified Q-grader benchmarks to calculate your accuracy.
          </div>
        </div>

        {/* Submit button */}
        <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-border bg-background">
          <Button
            type="button"
            className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
            onClick={handleSubmit}
          >
            Submit Cupping Score
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            Sign in required to save your review
          </p>
        </div>
      </dialog>
    </>
  );
}
