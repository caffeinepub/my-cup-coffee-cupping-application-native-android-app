import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CoffeeScores } from "../backend";

interface CuppingRadarChartProps {
  scores: CoffeeScores;
  title?: string;
  showLegend?: boolean;
}

export default function CuppingRadarChart({
  scores,
  title,
  showLegend = true,
}: CuppingRadarChartProps) {
  const data = [
    { category: "Fragrance", value: scores.fragrance, fullMark: 100 },
    { category: "Flavor", value: scores.flavor, fullMark: 100 },
    { category: "Aftertaste", value: scores.aftertaste, fullMark: 100 },
    { category: "Acidity", value: scores.acidity, fullMark: 100 },
    { category: "Body", value: scores.body, fullMark: 100 },
    { category: "Balance", value: scores.balance, fullMark: 100 },
    { category: "Uniformity", value: scores.uniformity, fullMark: 100 },
    { category: "Sweetness", value: scores.sweetness, fullMark: 100 },
    { category: "Clean Cup", value: scores.cleanCup, fullMark: 100 },
    { category: "Overall", value: scores.overall, fullMark: 100 },
  ];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-center text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <defs>
            <linearGradient id="coffeeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(var(--primary))"
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor="oklch(var(--accent))"
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>
          <PolarGrid stroke="oklch(var(--border))" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: "oklch(var(--foreground))",
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: "oklch(var(--muted-foreground))",
              fontSize: 10,
            }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="oklch(var(--primary))"
            fill="url(#coffeeGradient)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
              }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(var(--popover))",
              border: "1px solid oklch(var(--border))",
              borderRadius: "8px",
              color: "oklch(var(--popover-foreground))",
            }}
            formatter={(value: number) => [`${value.toFixed(1)}`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
