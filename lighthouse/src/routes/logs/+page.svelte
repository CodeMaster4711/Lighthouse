<script lang="ts">
  import { page } from "$app/state";
  import type { LogEntry } from "$lib/shared/types";
  import LogFrequencyChart from "$lib/components/charts/log-frequency-chart.svelte";
  import LogDistributionChart from "$lib/components/charts/log-distribution-chart.svelte";
  import LogTableDense from "$lib/components/log-table-dense.svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Select from "$lib/components/ui/select/index.js";

  let logs = $state<LogEntry[]>([]);
  let loading = $state(false);
  let error = $state("");
  let levelFilter = $state("");
  let serviceFilter = $state("");
  let currentPage = $state(1);
  let totalCount = $state(0);
  const pageSize = 50;

  let statistics = $state<{ hour: string; count: number }[]>([]);
  let distribution = $state<
    { level: string; count: number; percentage: number }[]
  >([]);
  let services = $state<string[]>([]);

  let projectId = $derived(page.url.searchParams.get("project") ?? undefined);

  $effect(() => {
    const _ = projectId;
    levelFilter = "";
    serviceFilter = page.url.searchParams.get("service") ?? "";
    currentPage = 1;
  });

  async function loadStats(pid: string | undefined) {
    try {
      const params = new URLSearchParams();
      if (pid) params.append("project_id", pid);

      const response = await fetch(`/api/logs/stats?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        statistics = result.statistics || [];
        distribution = result.distribution || [];
        services = result.services || [];
      }
    } catch (err) {
      console.error(
        "[ERROR] failed_to_load_stats error=" +
          (err instanceof Error ? err.message : "unknown"),
      );
    }
  }

  async function loadLogs(
    pid: string | undefined,
    level: string,
    service: string,
    p: number,
  ) {
    loading = true;
    error = "";

    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((p - 1) * pageSize).toString(),
      });

      if (level) params.append("level", level);
      if (service) params.append("source", service);
      if (pid) params.append("project_id", pid);

      const response = await fetch(`/api/logs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to load logs");
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        logs = result.data;
        totalCount = result.total || logs.length;
      } else {
        throw new Error(result.error || "Failed to load logs");
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load logs";
      logs = [];
    } finally {
      loading = false;
    }
  }

  function handlePageChange(p: number) {
    currentPage = p;
  }

  $effect(() => {
    loadStats(projectId);
  });

  $effect(() => {
    loadLogs(projectId, levelFilter, serviceFilter, currentPage);
  });
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Logs</h1>
  </div>

  {#if error}
    <Card.Root class="border-destructive">
      <Card.Content class="pt-6">
        <p class="text-destructive">{error}</p>
      </Card.Content>
    </Card.Root>
  {/if}

  <div
    style="display: flex; flex-direction: row; gap: 1rem; margin-bottom: 1.5rem;"
  >
    <div style="flex: 1; min-width: 0;">
      <Card.Root>
        <Card.Content class="p-4">
          <div style="height: 224px;">
            {#if distribution.length > 0}
              <LogDistributionChart data={distribution} />
            {:else}
              <div
                class="flex items-center justify-center h-full text-muted-foreground"
              >
                No data available
              </div>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>
    </div>

    <div style="flex: 1; min-width: 0;">
      <Card.Root>
        <Card.Content class="p-4">
          <div style="height: 224px;">
            {#if statistics.length > 0}
              <LogFrequencyChart data={statistics} />
            {:else}
              <div
                class="flex items-center justify-center h-full text-muted-foreground"
              >
                No data available
              </div>
            {/if}
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  </div>

  <Card.Root>
    <Card.Header>
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <Select.Root
            selected={{ value: levelFilter || "_all", label: levelFilter || "All Levels" }}
            onSelectedChange={(v) => {
              if (v) {
                levelFilter = v.value === "_all" ? "" : v.value;
                currentPage = 1;
              }
            }}
          >
            <Select.Trigger class="w-40">
              <Select.Value placeholder="All Levels" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="_all" label="All Levels"
                >All Levels</Select.Item
              >
              <Select.Item value="DEBUG" label="DEBUG">DEBUG</Select.Item>
              <Select.Item value="INFO" label="INFO">INFO</Select.Item>
              <Select.Item value="WARN" label="WARN">WARN</Select.Item>
              <Select.Item value="ERROR" label="ERROR">ERROR</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div class="flex-1">
          <Select.Root
            selected={{ value: serviceFilter || "_all", label: serviceFilter || "All Services" }}
            onSelectedChange={(v) => {
              if (v) {
                serviceFilter = v.value === "_all" ? "" : v.value;
                currentPage = 1;
              }
            }}
          >
            <Select.Trigger class="w-40">
              <Select.Value placeholder="All Services" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="_all" label="All Services"
                >All Services</Select.Item
              >
              {#each services as service}
                <Select.Item value={service} label={service}
                  >{service}</Select.Item
                >
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </Card.Header>
    <Card.Content>
      {#if loading}
        <div
          class="flex items-center justify-center py-12 text-muted-foreground"
        >
          Loading logs...
        </div>
      {:else}
        <LogTableDense
          {logs}
          {totalCount}
          {currentPage}
          {pageSize}
          onPageChange={handlePageChange}
        />
      {/if}
    </Card.Content>
  </Card.Root>
</div>
