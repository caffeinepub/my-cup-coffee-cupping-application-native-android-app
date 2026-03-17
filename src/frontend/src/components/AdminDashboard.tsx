import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Coffee,
  QrCode,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStats } from "../backend";
import { useGetDailyStats } from "../hooks/useQueries";

interface DayData {
  date: string;
  displayDate: string;
  newUsers: number;
  cuppings: number;
  qrRedemptions: number;
  newCafes: number;
}

function generateLast7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    // Match backend date format: year-month-day (no zero padding)
    days.push(`${year}-${month}-${day}`);
  }
  return days;
}

function formatDisplayDate(dateStr: string): string {
  // dateStr format: "2026-2-27" (no zero padding from backend)
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = Number.parseInt(parts[0]);
  const month = Number.parseInt(parts[1]) - 1;
  const day = Number.parseInt(parts[2]);
  const d = new Date(year, month, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: rawStats, isLoading, isError } = useGetDailyStats();

  const chartData = useMemo<DayData[]>(() => {
    const last7Days = generateLast7Days();
    const statsMap = new Map<string, DailyStats>();

    if (rawStats) {
      for (const [dateStr, stats] of rawStats) {
        statsMap.set(dateStr, stats);
      }
    }

    return last7Days.map((dateStr) => {
      const stats = statsMap.get(dateStr);
      return {
        date: dateStr,
        displayDate: formatDisplayDate(dateStr),
        newUsers: stats ? Number(stats.newUsers) : 0,
        cuppings: stats ? Number(stats.cuppingSubmissions) : 0,
        qrRedemptions: stats ? Number(stats.qrCodesRedeemed) : 0,
        newCafes: stats ? Number(stats.cafesRegistered) : 0,
      };
    });
  }, [rawStats]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, day) => ({
        newUsers: acc.newUsers + day.newUsers,
        cuppings: acc.cuppings + day.cuppings,
        qrRedemptions: acc.qrRedemptions + day.qrRedemptions,
        newCafes: acc.newCafes + day.newCafes,
      }),
      { newUsers: 0, cuppings: 0, qrRedemptions: 0, newCafes: 0 },
    );
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {["stat-1", "stat-2", "stat-3", "stat-4"].map((id) => (
            <Card key={id}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">
            Failed to load daily statistics. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Daily activity for the last 7 days
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Admin Only
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          title="New Users"
          value={totals.newUsers}
          icon={Users}
          description="Last 7 days total"
        />
        <SummaryCard
          title="Cupping Submissions"
          value={totals.cuppings}
          icon={Coffee}
          description="Last 7 days total"
        />
        <SummaryCard
          title="QR Redemptions"
          value={totals.qrRedemptions}
          icon={QrCode}
          description="Last 7 days total"
        />
        <SummaryCard
          title="New Cafes"
          value={totals.newCafes}
          icon={Store}
          description="Last 7 days total"
        />
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Chart</CardTitle>
          <CardDescription>Breakdown of key metrics per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Legend />
              <Bar
                dataKey="newUsers"
                name="New Users"
                fill="#c2855a"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="cuppings"
                name="Cuppings"
                fill="#8b5e3c"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="qrRedemptions"
                name="QR Redemptions"
                fill="#d4a574"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="newCafes"
                name="New Cafes"
                fill="#6b4226"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Detailed stats per day</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">New Users</TableHead>
                <TableHead className="text-right">Cuppings</TableHead>
                <TableHead className="text-right">QR Redemptions</TableHead>
                <TableHead className="text-right">New Cafes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">
                    {day.displayDate}
                  </TableCell>
                  <TableCell className="text-right">
                    {day.newUsers > 0 ? (
                      <span className="font-semibold text-primary">
                        {day.newUsers}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {day.cuppings > 0 ? (
                      <span className="font-semibold text-primary">
                        {day.cuppings}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {day.qrRedemptions > 0 ? (
                      <span className="font-semibold text-primary">
                        {day.qrRedemptions}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {day.newCafes > 0 ? (
                      <span className="font-semibold text-primary">
                        {day.newCafes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
