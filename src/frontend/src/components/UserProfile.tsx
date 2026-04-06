import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Copy,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Level } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetCuppingsForUser,
} from "../hooks/useQueries";
import CuppingRadarChart from "./CuppingRadarChart";

interface UserProfileProps {
  onViewGamification?: () => void;
}

export default function UserProfile({ onViewGamification }: UserProfileProps) {
  const { data: profile } = useGetCallerUserProfile();
  const { data: cuppings } = useGetCuppingsForUser();
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() ?? "";

  const truncatedPrincipal = principalId
    ? `${principalId.slice(0, 10)}...${principalId.slice(-5)}`
    : "";

  const handleCopy = async () => {
    if (!principalId) return;
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!profile) {
    return null;
  }

  const levelInfo = {
    [Level.novice]: { name: "Novice", color: "bg-blue-500", next: 10 },
    [Level.intermediate]: {
      name: "Intermediate",
      color: "bg-green-500",
      next: 25,
    },
    [Level.advanced]: { name: "Advanced", color: "bg-purple-500", next: 50 },
    [Level.expert]: { name: "Expert", color: "bg-amber-500", next: null },
  };

  const currentLevel = levelInfo[profile.level];
  const progressPercentage = currentLevel.next
    ? (Number(profile.completedCuppings) / currentLevel.next) * 100
    : 100;

  const lastCupping = cuppings && cuppings.length > 0 ? cuppings[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <p className="text-muted-foreground">
          Track your coffee cupping journey
        </p>
      </div>

      {/* Principal ID badge — shown at the top of the profile */}
      {principalId && (
        <div
          data-ocid="profile.card"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
          <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Coffee className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-0.5">
              My Cup ID
            </p>
            <p
              className="font-mono text-sm text-amber-900 truncate"
              data-ocid="profile.panel"
            >
              {truncatedPrincipal}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            data-ocid="profile.secondary_button"
            aria-label="Copy My Cup ID"
            className="shrink-0 p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      {/* View Achievements shortcut */}
      {onViewGamification && (
        <button
          type="button"
          onClick={onViewGamification}
          data-ocid="profile.gamification.button"
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 hover:bg-primary/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-primary leading-tight">
                View Achievements
              </p>
              <p className="text-[10px] text-muted-foreground">
                Badges, challenges &amp; leaderboard
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary/60 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLevel.name}</div>
            <Badge className={`mt-2 ${currentLevel.color}`}>
              {profile.level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Cuppings
            </CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.completedCuppings.toString()}
            </div>
            {currentLevel.next && (
              <p className="text-xs text-muted-foreground">
                {currentLevel.next - Number(profile.completedCuppings)} to next
                level
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.accuracyPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs expert scores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.progress.toString()}%
            </div>
            <Progress value={Number(profile.progress)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
          <CardDescription>
            {currentLevel.next
              ? `Complete ${currentLevel.next} cuppings to reach the next level`
              : "You have reached the highest level!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.completedCuppings.toString()} /{" "}
            {currentLevel.next || "Max"} cuppings
          </p>
        </CardContent>
      </Card>

      {lastCupping && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Cupping Scores</CardTitle>
            <CardDescription>
              Visual breakdown of your most recent coffee evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CuppingRadarChart
              scores={lastCupping.scores}
              title={`Coffee: ${lastCupping.coffee}`}
            />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Submitted on{" "}
              {new Date(
                Number(lastCupping.timestamp) / 1000000,
              ).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Cuppings</CardTitle>
          <CardDescription>Your latest coffee evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          {!cuppings || cuppings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cuppings yet</p>
          ) : (
            <div className="space-y-4">
              {cuppings.slice(0, 5).map((cupping) => (
                <div
                  key={cupping.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">Coffee: {cupping.coffee}</p>
                    <p className="text-sm text-muted-foreground">
                      Overall Score: {cupping.scores.overall.toFixed(1)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(
                      Number(cupping.timestamp) / 1000000,
                    ).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
