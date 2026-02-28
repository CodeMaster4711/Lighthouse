<script lang="ts">
  import { onMount } from "svelte";

  let {
    totalLogs = null,
    recentTrend = null,
    errorCount = null,
    size = "sm",
  }: {
    totalLogs?: number | null;
    recentTrend?: number | null;
    errorCount?: number | null;
    size?: "sm" | "lg";
  } = $props();

  let total = $state<number | null>(totalLogs);
  let recent = $state<number | null>(recentTrend);
  let errors = $state<number | null>(errorCount);

  onMount(async () => {
    if (totalLogs !== null && recentTrend !== null && errorCount !== null)
      return;
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        total = json.data.totalLogs;
        recent = json.data.recentTrend;
        errors = json.data.errorCount;
      }
    } catch {
      // silent
    }
  });

  function fmt(n: number | null): string {
    if (n === null) return "—";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
    return String(n);
  }
</script>

<div
  class={size === "lg"
    ? "rounded-lg border border-border bg-card px-6 py-4"
    : "mx-2 mb-2 rounded-md border border-border bg-card px-3 py-2"}
>
  <div class="flex items-stretch divide-x divide-border">
    <div
      class={size === "lg"
        ? "flex flex-1 flex-col items-center gap-1 pr-6"
        : "flex flex-1 flex-col items-center gap-0.5 pr-3"}
    >
      <span
        class={size === "lg"
          ? "text-xs font-medium uppercase tracking-wide text-muted-foreground"
          : "text-[10px] font-medium uppercase tracking-wide text-muted-foreground"}
        >Total</span
      >
      <span
        class={size === "lg"
          ? "text-2xl font-bold tabular-nums text-foreground"
          : "text-sm font-semibold tabular-nums text-foreground"}
        >{fmt(total)}</span
      >
    </div>
    <div
      class={size === "lg"
        ? "flex flex-1 flex-col items-center gap-1 px-6"
        : "flex flex-1 flex-col items-center gap-0.5 px-3"}
    >
      <span
        class={size === "lg"
          ? "text-xs font-medium uppercase tracking-wide text-muted-foreground"
          : "text-[10px] font-medium uppercase tracking-wide text-muted-foreground"}
        >7d</span
      >
      <span
        class={size === "lg"
          ? "text-2xl font-bold tabular-nums text-foreground"
          : "text-sm font-semibold tabular-nums text-foreground"}
        >{fmt(recent)}</span
      >
    </div>
    <div
      class={size === "lg"
        ? "flex flex-1 flex-col items-center gap-1 pl-6"
        : "flex flex-1 flex-col items-center gap-0.5 pl-3"}
    >
      <span
        class={size === "lg"
          ? "text-xs font-medium uppercase tracking-wide text-muted-foreground"
          : "text-[10px] font-medium uppercase tracking-wide text-muted-foreground"}
        >Errors</span
      >
      <span
        class={size === "lg"
          ? "text-2xl font-bold tabular-nums text-destructive"
          : "text-sm font-semibold tabular-nums text-destructive"}
        >{fmt(errors)}</span
      >
    </div>
  </div>
</div>
