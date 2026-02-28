<script lang="ts">
  import { PieChart, Text } from "layerchart";
  import * as Chart from "$lib/components/ui/chart/index.js";

  let {
    data,
  }: {
    data: { level: string; count: number; percentage: number }[];
  } = $props();

  const levelColors: Record<string, string> = {
    DEBUG: "#3b82f6",
    INFO: "#9ca3af",
    WARN: "#f97316",
    ERROR: "#ef4444",
    FATAL: "#7f1d1d",
    TRACE: "#6b7280",
  };

  const chartData = $derived(
    data.map((d) => ({
      level: d.level,
      count: d.count,
      percentage: d.percentage,
      color: levelColors[d.level] || "var(--chart-1)",
    })),
  );

  const chartConfig = {
    count: { label: "Logs" },
    DEBUG: { label: "DEBUG", color: levelColors.DEBUG },
    INFO: { label: "INFO", color: levelColors.INFO },
    WARN: { label: "WARN", color: levelColors.WARN },
    ERROR: { label: "ERROR", color: levelColors.ERROR },
  } satisfies Chart.ChartConfig;

  const totalLogs = $derived(
    chartData.reduce((acc, curr) => acc + curr.count, 0),
  );
</script>

<Chart.Container config={chartConfig} class="mx-auto h-full w-full">
  <PieChart
    data={chartData}
    key="level"
    value="count"
    c="color"
    innerRadius={60}
    padding={28}
    props={{ pie: { motion: "tween" } }}
  >
    {#snippet aboveMarks()}
      <Text
        value={String(totalLogs)}
        textAnchor="middle"
        verticalAnchor="middle"
        class="fill-foreground text-3xl! font-bold"
        dy={3}
      />
      <Text
        value="Logs"
        textAnchor="middle"
        verticalAnchor="middle"
        class="fill-muted-foreground! text-muted-foreground"
        dy={22}
      />
    {/snippet}
    {#snippet tooltip()}
      <Chart.Tooltip hideLabel />
    {/snippet}
  </PieChart>
</Chart.Container>
