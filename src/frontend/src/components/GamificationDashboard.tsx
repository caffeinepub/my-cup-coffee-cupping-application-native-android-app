import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lock, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Level } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetCuppingsForUser,
} from "../hooks/useQueries";

// ── Types ─────────────────────────────────────────────────────────────────

interface BadgeDef {
  id: number;
  icon: string;
  name: string;
  earned: boolean;
}

interface ChallengeDef {
  title: string;
  description: string;
  progress: number;
  reward: string;
  icon: string;
}

interface LeaderRow {
  rank: number;
  name: string;
  level: string;
  cuppings: number;
  xp: number;
  isYou?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getLevelDisplay(level: Level): {
  label: string;
  colorClass: string;
  ringClass: string;
} {
  switch (level) {
    case Level.novice:
      return {
        label: "Novice",
        colorClass: "bg-muted text-muted-foreground",
        ringClass: "border-muted-foreground/40",
      };
    case Level.intermediate:
      return {
        label: "Intermediate",
        colorClass: "bg-chart-2/20 text-chart-2",
        ringClass: "border-chart-2",
      };
    case Level.advanced:
      return {
        label: "Advanced",
        colorClass: "bg-primary/20 text-primary",
        ringClass: "border-primary",
      };
    case Level.expert:
      return {
        label: "Expert",
        colorClass: "bg-chart-4/20 text-chart-4",
        ringClass: "border-chart-4",
      };
  }
}

function getNextLevelThreshold(level: Level): number | null {
  switch (level) {
    case Level.novice:
      return 10;
    case Level.intermediate:
      return 25;
    case Level.advanced:
      return 50;
    case Level.expert:
      return null;
  }
}

function timeAgo(timestampNano: bigint): string {
  const ms = Number(timestampNano) / 1_000_000;
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// ── Animated Progress Bar ─────────────────────────────────────────────────

function AnimatedProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const target = Math.min(Math.max(value, 0), 100);
    let current = 0;
    const step = () => {
      current = Math.min(current + 1.5, target);
      setDisplay(current);
      if (current < target) {
        raf.current = requestAnimationFrame(step);
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [value]);

  return <Progress value={display} className={className} />;
}

// ── Main Component ────────────────────────────────────────────────────────

export default function GamificationDashboard() {
  const { data: profile } = useGetCallerUserProfile();
  const { data: cuppings } = useGetCuppingsForUser();
  const { identity } = useInternetIdentity();

  if (!profile) {
    return (
      <div
        data-ocid="gamification.loading_state"
        className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3"
      >
        <Trophy className="h-10 w-10 opacity-30" />
        <p className="text-sm">Loading your rewards…</p>
      </div>
    );
  }

  const completedCuppings = Number(profile.completedCuppings);
  const accuracy = profile.accuracyPercentage;
  const level = profile.level;
  const xp = completedCuppings * 100 + Math.round(accuracy);

  const levelDisplay = getLevelDisplay(level);
  const nextThreshold = getNextLevelThreshold(level);
  const xpProgress = nextThreshold
    ? Math.min((completedCuppings / nextThreshold) * 100, 100)
    : 100;

  // ── Badges ──────────────────────────────────────────────────────────────
  const badges: BadgeDef[] = [
    {
      id: 1,
      icon: "☕",
      name: "First Cup",
      earned: completedCuppings >= 1,
    },
    {
      id: 2,
      icon: "🗺️",
      name: "Explorer",
      earned: completedCuppings >= 3,
    },
    {
      id: 3,
      icon: "📋",
      name: "Reviewer",
      earned: completedCuppings >= 5,
    },
    {
      id: 4,
      icon: "🎓",
      name: "Apprentice",
      earned: completedCuppings >= 10,
    },
    {
      id: 5,
      icon: "⭐",
      name: "Intermediate",
      earned:
        level === Level.intermediate ||
        level === Level.advanced ||
        level === Level.expert,
    },
    {
      id: 6,
      icon: "🏆",
      name: "Advanced",
      earned: level === Level.advanced || level === Level.expert,
    },
    {
      id: 7,
      icon: "🎯",
      name: "Accuracy Pro",
      earned: accuracy >= 80,
    },
    {
      id: 8,
      icon: "💯",
      name: "Perfect Score",
      earned: accuracy >= 95,
    },
    {
      id: 9,
      icon: "🔄",
      name: "Consistent",
      earned: completedCuppings >= 15,
    },
    {
      id: 10,
      icon: "👑",
      name: "Expert Taster",
      earned: level === Level.expert,
    },
    {
      id: 11,
      icon: "⚡",
      name: "Speed Reviewer",
      earned: completedCuppings >= 20,
    },
    {
      id: 12,
      icon: "🌟",
      name: "My Cup Legend",
      earned: level === Level.expert && accuracy >= 90,
    },
  ];

  // ── Challenges ──────────────────────────────────────────────────────────
  const challenges: ChallengeDef[] = [
    {
      title: "Submit 3 Reviews This Week",
      description: "Complete 3 cupping reviews to earn bonus XP",
      progress: (Math.min(completedCuppings % 3, 3) / 3) * 100,
      reward: "+50 XP",
      icon: "📋",
    },
    {
      title: "Hit 80% Accuracy",
      description: "Improve your cupping accuracy to 80%",
      progress: (Math.min(accuracy, 80) / 80) * 100,
      reward: "Accuracy Badge",
      icon: "🎯",
    },
    {
      title: "Discover a New Cafe",
      description: "Visit a partner cafe and submit a review",
      progress: completedCuppings > 0 ? 100 : 0,
      reward: "+30 XP",
      icon: "🗺️",
    },
  ];

  // ── Leaderboard ──────────────────────────────────────────────────────────
  const userName =
    profile.name || identity?.getPrincipal().toString().slice(0, 8) || "You";
  const userXP = xp;

  const leaderboard: LeaderRow[] = [
    { rank: 1, name: "Budi Santoso", level: "Expert", cuppings: 98, xp: 9901 },
    { rank: 2, name: "Siti Rahayu", level: "Advanced", cuppings: 72, xp: 7289 },
    {
      rank: 3,
      name: userName,
      level: levelDisplay.label,
      cuppings: completedCuppings,
      xp: userXP,
      isYou: true,
    },
    {
      rank: 4,
      name: "Dimas Prasetyo",
      level: "Intermediate",
      cuppings: 28,
      xp: 2887,
    },
    {
      rank: 5,
      name: "Ayu Lestari",
      level: "Intermediate",
      cuppings: 22,
      xp: 2286,
    },
    {
      rank: 6,
      name: "Rizky Firmansyah",
      level: "Apprentice",
      cuppings: 12,
      xp: 1243,
    },
    {
      rank: 7,
      name: "Ninda Cahyani",
      level: "Apprentice",
      cuppings: 9,
      xp: 943,
    },
    {
      rank: 8,
      name: "Farhan Alwi",
      level: "Novice",
      cuppings: 4,
      xp: 478,
    },
    {
      rank: 9,
      name: "Mega Wulandari",
      level: "Novice",
      cuppings: 2,
      xp: 256,
    },
    {
      rank: 10,
      name: "Hendra Kurnia",
      level: "Novice",
      cuppings: 1,
      xp: 147,
    },
  ];

  // ── Activity Feed ────────────────────────────────────────────────────────
  const activityItems =
    cuppings && cuppings.length > 0
      ? cuppings.slice(0, 5).map((c, i) => ({
          id: i,
          icon: "☕",
          text: `You submitted a cupping review — Coffee: ${c.coffee}`,
          time: timeAgo(c.timestamp),
          borderColor: "border-primary",
        }))
      : [];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-5 pb-4" data-ocid="gamification.panel">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">
            Rewards & Progress
          </h2>
          <p className="text-xs text-muted-foreground">
            Track your coffee mastery journey
          </p>
        </div>
      </div>

      {/* ── Section 1: Level & XP ───────────────────────────────────── */}
      <Card data-ocid="gamification.level.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Level & XP Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Level ring badge */}
            <div
              className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${
                levelDisplay.ringClass
              }`}
            >
              <span className="text-2xl">☕</span>
              <span
                className={`text-[9px] font-bold uppercase leading-none mt-0.5 ${
                  levelDisplay.colorClass
                    .split(" ")
                    .find((c) => c.startsWith("text-")) ?? "text-foreground"
                }`}
              >
                {levelDisplay.label}
              </span>
            </div>
            {/* Stats */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {profile.name || "Coffee Explorer"}
                </span>
                <Badge
                  className={`text-[10px] px-2 py-0 ${levelDisplay.colorClass}`}
                >
                  {levelDisplay.label}
                </Badge>
              </div>
              <div className="flex items-baseline gap-1.5">
                <Zap className="h-3.5 w-3.5 text-chart-4" />
                <span className="text-xl font-bold text-chart-4">
                  {xp.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">XP</span>
              </div>
              <div className="space-y-1">
                <AnimatedProgress value={xpProgress} className="h-2.5" />
                <p className="text-[10px] text-muted-foreground">
                  {nextThreshold
                    ? `${completedCuppings} / ${nextThreshold} cuppings to next level`
                    : "🏆 Max level reached!"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Badges ──────────────────────────────────────── */}
      <Card data-ocid="gamification.badges.card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Achievements
            </CardTitle>
            <span className="text-xs text-primary font-semibold">
              {earnedCount}/{badges.length} unlocked
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, idx) => (
              <div
                key={badge.id}
                data-ocid={`gamification.badges.item.${idx + 1}`}
                className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                  badge.earned
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/30 opacity-40 grayscale"
                }`}
              >
                <span className="text-2xl leading-none">{badge.icon}</span>
                <span className="text-[9px] font-semibold text-center leading-tight">
                  {badge.name}
                </span>
                {badge.earned ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] text-primary-foreground">
                    ✓
                  </span>
                ) : (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Weekly Challenges ──────────────────────────── */}
      <Card data-ocid="gamification.challenges.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.map((challenge, idx) => (
            <div
              key={challenge.title}
              data-ocid={`gamification.challenges.item.${idx + 1}`}
              className="space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{challenge.icon}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {challenge.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] whitespace-nowrap shrink-0"
                >
                  {challenge.reward}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <AnimatedProgress
                  value={challenge.progress}
                  className="h-1.5"
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {Math.round(challenge.progress)}% complete
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Section 4: Leaderboard ─────────────────────────────────── */}
      <Card data-ocid="gamification.leaderboard.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {leaderboard.map((row) => (
              <div
                key={row.rank}
                data-ocid={`gamification.leaderboard.item.${row.rank}`}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  row.isYou ? "bg-primary/10 border-l-2 border-l-primary" : ""
                }`}
              >
                {/* Rank */}
                <span
                  className={`w-6 text-center text-xs font-bold ${
                    row.rank === 1
                      ? "text-chart-4"
                      : row.rank === 2
                        ? "text-muted-foreground"
                        : row.rank === 3
                          ? "text-primary"
                          : "text-muted-foreground"
                  }`}
                >
                  {row.rank === 1
                    ? "🥇"
                    : row.rank === 2
                      ? "🥈"
                      : row.rank === 3
                        ? "🥉"
                        : `#${row.rank}`}
                </span>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      row.isYou ? "text-primary" : ""
                    }`}
                  >
                    {row.name}
                    {row.isYou && (
                      <span className="ml-1.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {row.level} · {row.cuppings} cuppings
                  </p>
                </div>
                {/* XP */}
                <div className="text-right">
                  <p className="text-sm font-bold text-chart-4">
                    {row.xp.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-muted-foreground">XP</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: Activity Feed ───────────────────────────────── */}
      <Card data-ocid="gamification.activity.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityItems.length === 0 ? (
            <div
              data-ocid="gamification.activity.empty_state"
              className="flex flex-col items-center gap-2 py-6 text-muted-foreground"
            >
              <span className="text-3xl">🫗</span>
              <p className="text-sm text-center">
                No activity yet. Submit your first review to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityItems.map((item) => (
                <div
                  key={item.id}
                  data-ocid={`gamification.activity.item.${item.id + 1}`}
                  className={`flex items-start gap-3 border-l-2 pl-3 ${
                    item.borderColor
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
