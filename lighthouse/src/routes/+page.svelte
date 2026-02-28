<script lang="ts">
  import * as Chart from "$lib/components/ui/chart/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
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
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      if (result.success) {
        dashboardData = result.data;
      }
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      loading = false;
    }
  }

  const serviceColors: Record<string, string> = {
    'auth-service': '#3b82f6',
    'api-service': '#10b981',
    'database-service': '#f59e0b',
    'payment-service': '#ec4899',
    'notification-service': '#8b5cf6',
  };

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
        entry[item.source] = (entry[item.source] || 0) + item.count;
      });

    return Array.from(dataMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  const services = $derived.by(() => {
    if (!dashboardData?.logFrequency) return [];
    const uniqueServices = new Set(dashboardData.logFrequency.map((item: any) => item.source));
    return Array.from(uniqueServices);
  });

  const chartConfig = $derived.by(() => {
    const config: any = {};
    services.forEach((service, index) => {
      config[service] = {
        label: service,
        color: serviceColors[service] || `hsl(var(--chart-${(index % 5) + 1}))`
      };
    });
    return config;
  });

  $effect(() => {
    loadDashboard();
  });
</script>

<div class="p-6 space-y-6">
  <div>
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <p class="text-muted-foreground">Overview of your log monitoring</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading dashboard...</div>
    </div>
  {:else if dashboardData}
    <Card.Root>
      <Card.Header class="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div class="grid flex-1 gap-1 text-center sm:text-start">
          <Card.Title>Log Frequency</Card.Title>
          <Card.Description>Total logs collected over time</Card.Description>
        </div>
        <Select.Root bind:value={timeRange}>
          <Select.Trigger class="w-40 rounded-lg sm:ms-auto" aria-label="Select a value">
            <Select.Value placeholder={selectedLabel} />
          </Select.Trigger>
          <Select.Content class="rounded-xl">
            <Select.Item value="90d" label="Last 3 months">Last 3 months</Select.Item>
            <Select.Item value="30d" label="Last 30 days">Last 30 days</Select.Item>
            <Select.Item value="7d" label="Last 7 days">Last 7 days</Select.Item>
          </Select.Content>
        </Select.Root>
      </Card.Header>
      <Card.Content class="pt-6">
        <ChartContainer config={chartConfig} class="-ml-3 aspect-auto h-[300px] w-full">
          <AreaChart
            legend
            data={filteredData}
            x="date"
            xScale={scaleUtc()}
            series={services.map(service => ({
              key: service,
              label: service,
              color: chartConfig[service]?.color || 'hsl(var(--chart-1))'
            }))}
            seriesLayout="stack"
            props={{
              area: {
                curve: curveNatural,
                "fill-opacity": 0.6,
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
                  <linearGradient id="fill{s.key}" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stop-color={chartConfig[s.key]?.color || 'hsl(var(--chart-1))'}
                      stop-opacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stop-color={chartConfig[s.key]?.color || 'hsl(var(--chart-1))'}
                      stop-opacity={0.1}
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
                    fill="url(#fill{s.key})"
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
        <Card.Header>
          <Card.Title>Projects</Card.Title>
          <Card.Description>Log count by project</Card.Description>
        </Card.Header>
        <Card.Content>
          {#if dashboardData.projectStats.length === 0}
            <div class="text-center text-muted-foreground py-8">
              No projects yet
            </div>
          {:else}
            <div class="rounded-md border">
              <table class="w-full text-sm">
                <thead class="border-b bg-muted/50">
                  <tr>
                    <th class="text-left py-3 px-4 font-medium">Project</th>
                    <th class="text-left py-3 px-4 font-medium">Last Activity</th>
                    <th class="text-right py-3 px-4 font-medium">Logs</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  {#each dashboardData.projectStats as project}
                    <tr class="hover:bg-muted/30 transition-colors">
                      <td class="py-3 px-4 font-medium">{project.name}</td>
                      <td class="py-3 px-4 text-muted-foreground">
                        {#if project.last_log}
                          {new Date(project.last_log).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {:else}
                          No logs
                        {/if}
                      </td>
                      <td class="py-3 px-4 text-right font-semibold">{project.log_count.toLocaleString()}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>

      <div class="space-y-6">
        <div class="grid gap-6">
          <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Title class="text-sm font-medium">Total Logs</Card.Title>
              <ActivityIcon class="h-4 w-4 text-muted-foreground" />
            </Card.Header>
            <Card.Content>
              <div class="text-2xl font-bold">{dashboardData.totalLogs.toLocaleString()}</div>
              <p class="text-xs text-muted-foreground mt-1">
                All time
              </p>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Title class="text-sm font-medium">Weekly Trend</Card.Title>
              {#if dashboardData.trendPercentage >= 0}
                <TrendingUpIcon class="h-4 w-4 text-green-600" />
              {:else}
                <TrendingDownIcon class="h-4 w-4 text-red-600" />
              {/if}
            </Card.Header>
            <Card.Content>
              <div class="text-2xl font-bold {dashboardData.trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}">
                {dashboardData.trendPercentage >= 0 ? '+' : ''}{dashboardData.trendPercentage}%
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                {dashboardData.recentTrend.toLocaleString()} logs this week
              </p>
            </Card.Content>
          </Card.Root>

          <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Title class="text-sm font-medium">Errors</Card.Title>
              <AlertTriangleIcon class="h-4 w-4 text-destructive" />
            </Card.Header>
            <Card.Content>
              <div class="text-2xl font-bold">{dashboardData.errorCount.toLocaleString()}</div>
              <p class="text-xs text-muted-foreground mt-1">
                Last 7 days
                {#if dashboardData.recentTrend > 0}
                  <span class="text-destructive font-medium">
                    ({((dashboardData.errorCount / dashboardData.recentTrend) * 100).toFixed(1)}% of total)
                  </span>
                {/if}
              </p>
            </Card.Content>
          </Card.Root>
        </div>

        <Card.Root>
          <Card.Header class="pb-3">
            <Card.Title>Quick Insights</Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="space-y-3 text-sm">
              <div class="flex items-start gap-2">
                <div class="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                <div>
                  <span class="font-medium">{dashboardData.recentTrend.toLocaleString()}</span>
                  <span class="text-muted-foreground"> logs in the last 7 days</span>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                <div>
                  <span class="font-medium">{dashboardData.projectStats.length}</span>
                  <span class="text-muted-foreground"> active {dashboardData.projectStats.length === 1 ? 'project' : 'projects'}</span>
                </div>
              </div>
              {#if dashboardData.errorCount > 0}
                <div class="flex items-start gap-2">
                  <div class="w-2 h-2 rounded-full bg-destructive mt-1.5"></div>
                  <div>
                    <span class="font-medium text-destructive">{((dashboardData.errorCount / dashboardData.recentTrend) * 100).toFixed(1)}%</span>
                    <span class="text-muted-foreground"> error rate this week</span>
                  </div>
                </div>
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  {/if}
</div>
