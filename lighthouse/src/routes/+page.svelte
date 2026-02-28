<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import SidebarStats from "$lib/components/sidebar-stats.svelte";
  import { scaleUtc } from "d3-scale";
  import { Area, AreaChart, ChartClipPath } from "layerchart";
  import { curveNatural } from "d3-shape";
  import ChartContainer from "$lib/components/ui/chart/chart-container.svelte";
  import { cubicInOut } from "svelte/easing";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import ActivityIcon from "@lucide/svelte/icons/activity";

  let dashboardData = $state<any>(null);
  let loading = $state(true);
  let timeRange = $state("90d");

  const selectedLabel = $derived.by(() => {
    switch (timeRange) {
      case "90d":
        return "Last 3 months";
      case "30d":
        return "Last 30 days";
      case "7d":
        return "Last 7 days";
      default:
        return "Last 3 months";
    }
  });

  async function loadDashboard() {
    loading = true;
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      if (result.success) {
        dashboardData = result.data;
      }
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      loading = false;
    }
  }

  const CHART_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
  ];

  const filteredData = $derived.by(() => {
    if (!dashboardData?.logFrequency) return [];

    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    referenceDate.setDate(referenceDate.getDate() - daysToSubtract);

    const dataMap = new Map<string, any>();

    dashboardData.logFrequency
      .filter((item: any) => new Date(item.date) >= referenceDate)
      .forEach((item: any) => {
        const dateKey = item.date;
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, { date: new Date(item.date) });
        }
        const entry = dataMap.get(dateKey);
        entry[item.project_name] = (entry[item.project_name] || 0) + item.count;
      });

    return Array.from(dataMap.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  });

  const projects = $derived.by(() => {
    if (!dashboardData?.logFrequency) return [];
    const unique = new Set(
      dashboardData.logFrequency.map((item: any) => item.project_name),
    );
    return Array.from(unique) as string[];
  });

  const chartConfig = $derived.by(() => {
    const config: any = {};
    projects.forEach((project, index) => {
      config[project] = {
        label: project,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
    return config;
  });

  $effect(() => {
    loadDashboard();
  });

  function gradientId(key: string): string {
    return "grad_" + key.replace(/[^a-zA-Z0-9]/g, "_");
  }
</script>

<div class="p-6 space-y-6">
  <div class="flex items-end justify-between gap-4 flex-wrap">
    <div>
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="text-muted-foreground">Overview of your log monitoring</p>
    </div>
    {#if dashboardData}{/if}
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading dashboard...</div>
    </div>
  {:else if dashboardData}
    <Card.Root>
      <Card.Header
        class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row"
      >
        <div class="grid flex-1 gap-1 text-center sm:text-start">
          <Card.Title>Log Frequency</Card.Title>
          <Card.Description>Total logs collected over time</Card.Description>
        </div>
        <Select.Root bind:value={timeRange}>
          <Select.Trigger
            class="w-40 rounded-lg sm:ms-auto"
            aria-label="Select a value"
          >
            <Select.Value placeholder={selectedLabel} />
          </Select.Trigger>
          <Select.Content class="rounded-xl">
            <Select.Item value="90d" label="Last 3 months"
              >Last 3 months</Select.Item
            >
            <Select.Item value="30d" label="Last 30 days"
              >Last 30 days</Select.Item
            >
            <Select.Item value="7d" label="Last 7 days">Last 7 days</Select.Item
            >
          </Select.Content>
        </Select.Root>
      </Card.Header>
      <Card.Content class="pt-6">
        <ChartContainer
          config={chartConfig}
          class="-ml-3 aspect-auto h-[300px] w-full"
        >
          <AreaChart
            legend
            data={filteredData}
            x="date"
            xScale={scaleUtc()}
            series={projects.map((project) => ({
              key: project,
              label: project,
              color: chartConfig[project]?.color,
            }))}
            seriesLayout="stack"
            props={{
              area: {
                curve: curveNatural,
                "fill-opacity": 1,
                line: { class: "stroke-2" },
                motion: "tween",
              },
              xAxis: {
                ticks: timeRange === "7d" ? 7 : undefined,
                format: (v) => {
                  return v.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                },
              },
              yAxis: { format: (v) => v.toString() },
            }}
          >
            {#snippet marks({ series: chartSeries, getAreaProps })}
              <defs>
                {#each chartSeries as s (s.key)}
                  <linearGradient
                    id={gradientId(s.key)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stop-color={chartConfig[s.key]?.color}
                      stop-opacity={0.55}
                    />
                    <stop
                      offset="45%"
                      stop-color={chartConfig[s.key]?.color}
                      stop-opacity={0.15}
                    />
                    <stop
                      offset="100%"
                      stop-color={chartConfig[s.key]?.color}
                      stop-opacity={0}
                    />
                  </linearGradient>
                {/each}
              </defs>
              <ChartClipPath
                initialWidth={0}
                motion={{
                  width: { type: "tween", duration: 1000, easing: cubicInOut },
                }}
              >
                {#each chartSeries as s, i (s.key)}
                  <Area
                    {...getAreaProps(s, i)}
                    fill="url(#{gradientId(s.key)})"
                  />
                {/each}
              </ChartClipPath>
            {/snippet}
            {#snippet tooltip()}
              <Chart.Tooltip
                labelFormatter={(v: Date) => {
                  return v.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  });
                }}
                indicator="dot"
              />
            {/snippet}
          </AreaChart>
        </ChartContainer>
      </Card.Content>
    </Card.Root>

    <div class="grid gap-6 md:grid-cols-2">
      <Card.Root>
        <Card.Content>
          {#if dashboardData.projectStats.length === 0}
            <div class="text-center text-muted-foreground py-8">
              No projects yet
            </div>
          {:else}
            <div class="rounded-md border">
              <table class="w-full text-xs">
                <thead class="border-b bg-muted/50">
                  <tr class="h-7">
                    <th class="text-left py-1 px-2 font-medium">Project</th>
                    <th class="text-left py-1 px-2 font-medium"
                      >Last Activity</th
                    >
                    <th class="text-right py-1 px-2 font-medium">Logs</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  {#each dashboardData.projectStats as project}
                    <tr class="h-7 hover:bg-muted/50 transition-colors">
                      <td class="py-0.5 px-2 font-medium">{project.name}</td>
                      <td class="py-0.5 px-2 text-muted-foreground font-mono">
                        {#if project.last_log}
                          {new Date(project.last_log).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        {:else}
                          No logs
                        {/if}
                      </td>
                      <td
                        class="py-0.5 px-2 text-right font-semibold tabular-nums"
                        >{project.log_count.toLocaleString()}</td
                      >
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>

      <div class="space-y-6">
        <SidebarStats
          totalLogs={dashboardData.totalLogs}
          recentTrend={dashboardData.recentTrend}
          errorCount={dashboardData.errorCount}
          size="lg"
        />
      </div>
    </div>
  {/if}
</div>
