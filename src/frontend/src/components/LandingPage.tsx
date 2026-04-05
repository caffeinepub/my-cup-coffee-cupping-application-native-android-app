import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Coffee,
  Download,
  Map as MapIcon,
  QrCode,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

/* ─── Feature card data ──────────────────────────────────────────────────── */
const features = [
  {
    icon: MapIcon,
    title: "Discover Cafes",
    description:
      "Use the interactive map to find participating specialty coffee shops near you, filtered by distance, origin, and roast level.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    icon: ClipboardList,
    title: "Submit Reviews",
    description:
      "Log fragrance, flavor, body, acidity, and balance using the industry-standard SCA cupping form with an interactive flavor wheel.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: QrCode,
    title: "Earn Free Coffee",
    description:
      "Once your review is accepted and your accuracy score is verified, redeem a QR code for a complimentary cup at any partner cafe.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
];

/* ─── Steps ──────────────────────────────────────────────────────────────── */
const steps = [
  {
    num: "01",
    title: "Find Participating Cafe",
    body: "Browse the live map to discover cafes offering cupping sessions. Filter by proximity, available coffee origins, or roast style.",
  },
  {
    num: "02",
    title: "Taste & Submit Within 24 Hours",
    body: "Enjoy your coffee mindfully, then fill in the digital cupping form — scoring aroma, body, acidity, aftertaste, sweetness, and overall balance.",
  },
  {
    num: "03",
    title: "Redeem Your Free Cup",
    body: "Show your unique QR code at the counter. Your accuracy score improves with each review, unlocking premium cafes and skill badges.",
  },
];

/* ─── Cupping categories ─────────────────────────────────────────────────── */
const cuppingCategories = [
  {
    name: "Fragrance / Aroma",
    desc: "Dry grounds smell before hot water is added; the wet aroma released after brewing.",
  },
  {
    name: "Flavor",
    desc: "The combined impression of all taste and aromatic sensations — the core character of the cup.",
  },
  {
    name: "Aftertaste",
    desc: "Length and quality of positive flavor sensations that linger after the coffee is swallowed.",
  },
  {
    name: "Acidity",
    desc: "The bright, vibrant quality — citrus, malic, or tartaric — that adds liveliness to the cup.",
  },
  {
    name: "Body",
    desc: "The tactile weight and texture — from watery to syrupy — felt on the palate.",
  },
  {
    name: "Balance",
    desc: "How well all attributes complement each other without any single note dominating.",
  },
  {
    name: "Uniformity",
    desc: "Consistency across all five cups in the same sample; penalizes any odd or off-flavored cup.",
  },
  {
    name: "Clean Cup",
    desc: "Absence of negative impressions from first taste to final aftertaste.",
  },
  {
    name: "Sweetness",
    desc: "A pleasant sweetness of flavor, reflecting the presence of certain carbohydrates.",
  },
  {
    name: "Overall",
    desc: "The holistic, personal assessment — the rater's individual impression of the total experience.",
  },
];

/* ─── Skill levels ───────────────────────────────────────────────────────── */
const skillLevels = [
  {
    level: "Novice",
    cups: "0–4 reviews",
    color: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
    unlocks: [
      "Access to any Basic partner cafe",
      "Digital SCA cupping form",
      "Personal accuracy score tracker",
    ],
  },
  {
    level: "Apprentice",
    cups: "5–14 reviews",
    color: "bg-chart-3/15 text-chart-3",
    dot: "bg-chart-3",
    unlocks: [
      "Flavor wheel heat-map view",
      "Weekly tasting challenge access",
      "Apprentice profile badge",
    ],
  },
  {
    level: "Intermediate",
    cups: "15–34 reviews",
    color: "bg-chart-2/15 text-chart-2",
    dot: "bg-chart-2",
    unlocks: [
      "Access to Pro-tier partner cafes",
      "Blind tasting challenge mode",
      "Skill-specific badges (e.g. Acidity Expert)",
    ],
  },
  {
    level: "Advanced",
    cups: "35–74 reviews",
    color: "bg-primary/15 text-primary",
    dot: "bg-primary",
    unlocks: [
      "Access to premium specialty cafes",
      "Leaderboard ranking visibility",
      "Cupping Club group invites",
    ],
  },
  {
    level: "Expert",
    cups: "75+ reviews",
    color: "bg-chart-4/15 text-chart-4",
    dot: "bg-chart-4",
    unlocks: [
      "Certified cupper benchmark comparisons",
      "Access to exclusive roaster collaborations",
      "Expert badge + job board visibility",
    ],
  },
];

/* ─── Cafe plans ─────────────────────────────────────────────────────────── */
const cafePlans = [
  {
    tier: "Basic",
    price: "Free",
    color: "border-border",
    badge: "bg-muted text-muted-foreground",
    perks: [
      "Up to 5 cupping reviews/month",
      "Basic aggregate score view",
      "Partner cafe map listing",
    ],
  },
  {
    tier: "Pro",
    price: "$29/mo",
    color: "border-primary/40",
    badge: "bg-primary/15 text-primary",
    perks: [
      "Unlimited cupping reviews",
      "Flavor wheel visualization",
      "Downloadable CSV reports",
      "Daily free-cup quota control",
    ],
  },
  {
    tier: "Enterprise",
    price: "$99/mo",
    color: "border-chart-2/40",
    badge: "bg-chart-2/15 text-chart-2",
    perks: [
      "Everything in Pro",
      "API access for custom integrations",
      "Custom reporting & white-label data",
      "Dedicated account support",
    ],
  },
];

type ModalType = "reviews" | "cafes" | "levels" | null;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const handleLogin = () => {
    try {
      login();
    } catch {
      /* handled by hook */
    }
  };

  const stats: {
    value: string;
    label: string;
    icon: typeof Star;
    modal: ModalType;
    ocid: string;
  }[] = [
    {
      value: "500+",
      label: "Reviews Submitted",
      icon: Star,
      modal: "reviews",
      ocid: "stats.reviews.button",
    },
    {
      value: "50+",
      label: "Partner Cafes",
      icon: Coffee,
      modal: "cafes",
      ocid: "stats.cafes.button",
    },
    {
      value: "5",
      label: "Skill Levels",
      icon: Users,
      modal: "levels",
      ocid: "stats.levels.button",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* ── Hero — fills full mobile viewport ────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-foreground">
        {/* Background: uploaded espresso crema photo */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-fade-in"
          style={{
            backgroundImage:
              "url('/assets/uploads/Screenshot-2023-12-09-222546-1.png')",
          }}
        />
        {/* Darkening overlay so text stays readable over the warm amber image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />

        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-chart-2/20 blur-[120px] animate-pulse-slow pointer-events-none" />
        <div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "2s" }}
        />
        <div className="landing-grain absolute inset-0 overflow-hidden pointer-events-none" />

        {/* Decorative floating icons — desktop only */}
        <div className="hidden lg:block absolute top-20 right-16 text-chart-2/30 animate-float pointer-events-none">
          <Coffee className="w-20 h-20" />
        </div>
        <div
          className="hidden lg:block absolute bottom-32 left-12 text-primary/25 animate-float pointer-events-none"
          style={{ animationDelay: "2s" }}
        >
          <Star className="w-14 h-14" />
        </div>

        {/* ── Hero content ─────────────────────────────────────────────── */}
        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-16 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-chart-2/30 bg-chart-2/10 px-4 py-1.5 mb-4 sm:mb-6">
            <Coffee className="w-3.5 h-3.5 text-chart-2" />
            <span className="text-xs font-semibold uppercase tracking-widest text-chart-2">
              Gamified Coffee Discovery
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up-delay-1 font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight text-white mb-3 sm:mb-5"
            style={{ textShadow: "0 4px 32px rgba(0,0,0,0.5)" }}
          >
            My Free
            <br />
            <span className="text-chart-2 italic">Coffee Cup</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up-delay-2 max-w-xs sm:max-w-xl mx-auto text-base sm:text-xl text-white/75 leading-relaxed mb-6 sm:mb-8">
            Exchange expert coffee tasting reviews for free cups at partner
            cafes — while developing professional cupping skills that matter.
          </p>

          {/* CTA */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row gap-3 justify-center items-center mb-6 sm:mb-8">
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={isLoggingIn}
              data-ocid="landing.login_button"
              className="h-12 sm:h-14 px-8 text-base font-bold rounded-full bg-chart-2 text-foreground hover:bg-chart-2/90 shadow-lg shadow-chart-2/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-chart-2/40"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Connecting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start for Free
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <span className="text-white/40 text-xs">
              No credit card · Free forever
            </span>
          </div>

          {/* ── Stats buttons — reveal label on hover ───────────────────── */}
          <div className="animate-fade-up-delay-3 grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-xs sm:max-w-sm">
            {stats.map(({ value, label, icon: Icon, modal, ocid }) => (
              <button
                type="button"
                key={label}
                data-ocid={ocid}
                onClick={() => setOpenModal(modal)}
                className="group relative text-center cursor-pointer rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm hover:border-chart-2/50 hover:bg-black/50 px-2 pt-4 pb-3 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-chart-2/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-2"
                aria-label={`Learn more about ${label}`}
              >
                {/* Icon */}
                <div className="flex justify-center mb-2">
                  <div className="w-9 h-9 rounded-full bg-chart-2/20 flex items-center justify-center group-hover:bg-chart-2/35 transition-colors duration-300">
                    <Icon className="h-4 w-4 text-chart-2" />
                  </div>
                </div>

                {/* Number — always visible */}
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                  {value}
                </p>

                {/* Label — hidden by default, revealed on hover */}
                <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-0 opacity-0 group-hover:max-h-10 group-hover:opacity-100">
                  <p className="text-[11px] sm:text-xs text-white/75 mt-2 font-semibold leading-tight px-1">
                    {label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-12 sm:h-20 fill-background"
            aria-hidden="true"
            role="presentation"
          >
            <path d="M0,80 C360,0 1080,80 1440,20 L1440,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Combined Features + How It Works (equal-height grid) ─────────── */}
      <section className="bg-background py-20 sm:py-28 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-border/50 pointer-events-none" />
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full border border-border/30 pointer-events-none" />

        <div className="container mx-auto px-4">
          {/* ── Column headers side by side ───────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-10">
            {/* Left header */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                What You Get
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground leading-tight">
                Discover. Review.{" "}
                <span className="text-primary italic">Earn.</span>
              </h2>
            </div>

            {/* Right header */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                Three Simple Steps
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground leading-tight">
                How It <span className="text-primary italic">Works</span>
              </h2>
            </div>
          </div>

          {/* ── Paired card rows — same height per row via CSS grid ───── */}
          {/*
            Layout: feature[0] | step[0]
                    feature[1] | step[1]
                    feature[2] | step[2]
            CSS grid auto-rows stretches both cards in a row to equal height.
            Mobile: single column, all 6 cards stacked.
          */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            style={{ gridAutoRows: "1fr" }}
          >
            {features.map((feat, i) => {
              const step = steps[i];
              const featureOcids = [
                "landing.feature.item.1",
                "landing.feature.item.2",
                "landing.feature.item.3",
              ] as const;

              return (
                <>
                  {/* Feature card — left column */}
                  <div
                    key={`feat-${feat.title}`}
                    data-ocid={featureOcids[i]}
                    className="group relative rounded-2xl border border-border bg-card p-7 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-5 shrink-0`}
                    >
                      <feat.icon className={`h-6 w-6 ${feat.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {feat.description}
                    </p>
                  </div>

                  {/* Step card — right column */}
                  <div
                    key={`step-${step.num}`}
                    className="group rounded-2xl border border-border bg-card p-6 sm:p-8 h-full flex flex-col transition-all duration-300 hover:border-primary/30 hover:shadow-md"
                  >
                    {/* Step number — large decorative label above title */}
                    <p className="font-display text-4xl font-black text-primary/40 leading-none mb-2 tracking-tight shrink-0">
                      {step.num}
                    </p>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {step.body}
                    </p>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="bg-foreground relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-chart-2/10 rounded-full blur-[80px]" />
        </div>
        <div className="landing-grain absolute inset-0 overflow-hidden pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chart-2/20 border border-chart-2/30 mb-8 animate-float">
            <Coffee className="h-8 w-8 text-chart-2" />
          </div>

          <h2
            className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-background leading-tight mb-4"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
          >
            Ready to start your
            <br />
            <span className="text-chart-2 italic">coffee journey?</span>
          </h2>

          <p className="text-background/60 text-lg max-w-md mx-auto mb-10">
            Join hundreds of coffee enthusiasts already brewing their skills and
            earning free cups.
          </p>

          <Button
            size="lg"
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="landing.footer_login_button"
            className="h-14 px-10 text-base font-bold rounded-full bg-chart-2 text-foreground hover:bg-chart-2/90 shadow-2xl shadow-chart-2/30 transition-all hover:scale-105"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Connecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="mt-4 text-background/35 text-xs font-medium">
            Sign in with Internet Identity · Decentralized · Privacy-first
          </p>
        </div>
      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}

      {/* Reviews Modal */}
      <Dialog
        open={openModal === "reviews"}
        onOpenChange={(o) => !o && setOpenModal(null)}
      >
        <DialogContent
          data-ocid="stats.reviews.dialog"
          className="max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle className="font-display text-xl font-black text-foreground">
                How Reviews Work
              </DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Every review on My Cup uses the{" "}
            <span className="font-semibold text-foreground">
              SCA (Specialty Coffee Association) cupping protocol
            </span>{" "}
            — the gold standard used by Q-graders worldwide. You score 10
            attributes on a 0–10 scale, which combine into a final 0–100 cup
            score.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Each submission is compared against certified baseline reviews. The
            closer your scores align, the higher your{" "}
            <span className="font-semibold text-foreground">accuracy %</span>{" "}
            climbs — advancing your skill level and unlocking better cafes.
          </p>

          <div className="space-y-2.5">
            {cuppingCategories.map((cat, i) => (
              <div
                key={cat.name}
                data-ocid={`stats.reviews.item.${i + 1}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary font-black text-xs mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-chart-2/10 border border-chart-2/20 px-4 py-3 text-xs text-chart-2 font-medium">
            ✦ Reviews must be submitted within 24 hours of your cafe visit to
            count toward your accuracy score.
          </div>
        </DialogContent>
      </Dialog>

      {/* Partner Cafes Modal */}
      <Dialog
        open={openModal === "cafes"}
        onOpenChange={(o) => !o && setOpenModal(null)}
      >
        <DialogContent
          data-ocid="stats.cafes.dialog"
          className="max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center shrink-0">
                <Coffee className="h-5 w-5 text-chart-2" />
              </div>
              <DialogTitle className="font-display text-xl font-black text-foreground">
                Partner Cafes
              </DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            Partner cafes offer{" "}
            <span className="font-semibold text-foreground">free cups</span> to
            My Cup users in exchange for structured, SCA-standard cupping data —
            giving them real customer feedback at scale, without expensive
            market research.
          </p>

          <div className="mb-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              What cafes receive
            </p>
            {[
              {
                icon: BarChart3,
                text: "Aggregate cupping scores per coffee origin",
              },
              {
                icon: ClipboardList,
                text: "Flavor wheel heat-map of customer perceptions",
              },
              {
                icon: Download,
                text: "Downloadable CSV reports for inventory & sourcing",
              },
              {
                icon: BadgeCheck,
                text: "Daily free-cup quota — you control availability",
              },
            ].map(({ icon: Ico, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
              >
                <Ico className="h-4 w-4 text-chart-2 shrink-0" />
                <p className="text-sm text-foreground">{text}</p>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Subscription plans
          </p>
          <div className="space-y-3">
            {cafePlans.map((plan, i) => (
              <div
                key={plan.tier}
                data-ocid={`stats.cafes.item.${i + 1}`}
                className={`rounded-xl border-2 ${plan.color} bg-card px-4 py-3`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${plan.badge}`}
                  >
                    {plan.tier}
                  </span>
                  <span className="font-black text-foreground text-sm">
                    {plan.price}
                  </span>
                </div>
                <ul className="space-y-1">
                  {plan.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Skill Levels Modal */}
      <Dialog
        open={openModal === "levels"}
        onOpenChange={(o) => !o && setOpenModal(null)}
      >
        <DialogContent
          data-ocid="stats.levels.dialog"
          className="max-w-lg max-h-[85vh] overflow-y-auto"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-chart-4" />
              </div>
              <DialogTitle className="font-display text-xl font-black text-foreground">
                Skill Progression
              </DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            My Cup uses a{" "}
            <span className="font-semibold text-foreground">
              5-tier skill ladder
            </span>{" "}
            based on review count and accuracy score. Each level unlocks better
            cafes, exclusive challenges, and professional recognition.
          </p>

          <div className="space-y-3">
            {skillLevels.map((lvl, i) => (
              <div
                key={lvl.level}
                data-ocid={`stats.levels.item.${i + 1}`}
                className="rounded-xl border border-border bg-card px-4 py-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${lvl.dot}`} />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${lvl.color}`}
                    >
                      {lvl.level}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium ml-auto">
                    {lvl.cups}
                  </span>
                </div>
                <ul className="space-y-1 pl-5">
                  {lvl.unlocks.map((unlock) => (
                    <li
                      key={unlock}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {unlock}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 text-xs text-primary font-medium">
            ✦ Your accuracy score is calculated by comparing your ratings
            against certified Q-grader benchmarks.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
