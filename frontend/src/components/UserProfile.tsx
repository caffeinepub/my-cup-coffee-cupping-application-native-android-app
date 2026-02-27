import { useGetCallerUserProfile, useGetCuppingsForUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Coffee, TrendingUp, Calendar } from 'lucide-react';
import { Level } from '../backend';
import CuppingRadarChart from './CuppingRadarChart';

export default function UserProfile() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: cuppings } = useGetCuppingsForUser();

  if (!profile) {
    return null;
  }

  const levelInfo = {
    [Level.novice]: { name: 'Novice', color: 'bg-blue-500', next: 10 },
    [Level.intermediate]: { name: 'Intermediate', color: 'bg-green-500', next: 25 },
    [Level.advanced]: { name: 'Advanced', color: 'bg-purple-500', next: 50 },
    [Level.expert]: { name: 'Expert', color: 'bg-amber-500', next: null },
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
        <p className="text-muted-foreground">Track your coffee cupping journey</p>
      </div>

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
            <CardTitle className="text-sm font-medium">Completed Cuppings</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.completedCuppings.toString()}</div>
            {currentLevel.next && (
              <p className="text-xs text-muted-foreground">
                {currentLevel.next - Number(profile.completedCuppings)} to next level
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
            <div className="text-2xl font-bold">{profile.progress.toString()}%</div>
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
              : 'You have reached the highest level!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.completedCuppings.toString()} / {currentLevel.next || 'Max'} cuppings
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
              Submitted on {new Date(Number(lastCupping.timestamp) / 1000000).toLocaleDateString()}
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
                <div key={cupping.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">Coffee: {cupping.coffee}</p>
                    <p className="text-sm text-muted-foreground">
                      Overall Score: {cupping.scores.overall.toFixed(1)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {new Date(Number(cupping.timestamp) / 1000000).toLocaleDateString()}
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
