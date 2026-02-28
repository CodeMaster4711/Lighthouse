<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon2 from "@lucide/svelte/icons/chevron-right";
  import type { LogEntry } from "$lib/shared/types";

  let {
    logs,
    totalCount = 0,
    currentPage = 1,
    pageSize = 50,
    onPageChange,
  }: {
    logs: LogEntry[];
    totalCount?: number;
    currentPage?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
  } = $props();

  const totalPages = $derived(Math.ceil(totalCount / pageSize));
  let expandedRows = $state<Set<string>>(new Set());

  function toggleRow(logId: string) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    expandedRows = newExpanded;
  }

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  const levelStyles: Record<
    string,
    { color: string; bg: string; border: string }
  > = {
    ERROR: {
      color: "#ef4444",
      bg: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.35)",
    },
    FATAL: {
      color: "#f87171",
      bg: "rgba(127,29,29,0.18)",
      border: "rgba(248,113,113,0.35)",
    },
    WARN: {
      color: "#f97316",
      bg: "rgba(249,115,22,0.10)",
      border: "rgba(249,115,22,0.35)",
    },
    INFO: {
      color: "#9ca3af",
      bg: "rgba(156,163,175,0.10)",
      border: "rgba(156,163,175,0.30)",
    },
    DEBUG: {
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.10)",
      border: "rgba(59,130,246,0.35)",
    },
    TRACE: {
      color: "#6b7280",
      bg: "rgba(107,114,128,0.10)",
      border: "rgba(107,114,128,0.28)",
    },
  };

  function getLevelStyle(level: string) {
    return (
      levelStyles[level] ?? {
        color: "#9ca3af",
        bg: "rgba(156,163,175,0.1)",
        border: "rgba(156,163,175,0.28)",
      }
    );
  }

  function truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  function formatMetadata(metadata: any): string {
    if (!metadata) return "";
    try {
      return JSON.stringify(metadata, null, 2);
    } catch {
      return String(metadata);
    }
  }
</script>

<div class="space-y-2">
  <div class="rounded-md border">
    <Table.Root class="text-xs">
      <Table.Header>
        <Table.Row class="h-7 border-b">
          <Table.Head class="h-7 px-2 py-1 font-medium w-8"></Table.Head>
          <Table.Head class="h-7 px-2 py-1 font-medium">Time</Table.Head>
          <Table.Head class="h-7 px-2 py-1 font-medium">Level</Table.Head>
          <Table.Head class="h-7 px-2 py-1 font-medium">Service</Table.Head>
          <Table.Head class="h-7 px-2 py-1 font-medium">Message</Table.Head>
          <Table.Head class="h-7 px-2 py-1 font-medium">Metadata</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if logs.length === 0}
          <Table.Row>
            <Table.Cell colspan={6} class="h-28 text-center">
              No logs found
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each logs as log (log.id)}
            <Table.Row
              class="h-7 hover:bg-muted/50 cursor-pointer"
              onclick={() => toggleRow(log.id)}
            >
              <Table.Cell class="h-7 px-2 py-0.5">
                <Button variant="ghost" size="sm" class="h-5 w-5 p-0">
                  {#if expandedRows.has(log.id)}
                    <ChevronDownIcon class="h-4 w-4" />
                  {:else}
                    <ChevronRightIcon2 class="h-4 w-4" />
                  {/if}
                </Button>
              </Table.Cell>
              <Table.Cell class="h-7 px-2 py-0.5 font-mono whitespace-nowrap">
                {formatTime(log.timestamp)}
              </Table.Cell>
              <Table.Cell class="h-7 px-2 py-0.5">
                {#snippet levelCell()}
                  {@const s = getLevelStyle(log.level)}
                  <Badge
                    variant="outline"
                    class="gap-1 px-1.5 py-0 font-mono text-[11px] font-semibold tracking-wide"
                    style="color:{s.color};background:{s.bg};border-color:{s.border}"
                  >
                    <span
                      class="size-1.5 rounded-full shrink-0"
                      style="background:{s.color}"
                    ></span>
                    {log.level}
                  </Badge>
                {/snippet}
                {@render levelCell()}
              </Table.Cell>
              <Table.Cell class="h-7 px-2 py-0.5 font-mono">
                {log.source}
              </Table.Cell>
              <Table.Cell class="h-7 px-2 py-0.5 max-w-md truncate">
                {truncate(log.message, 100)}
              </Table.Cell>
              <Table.Cell
                class="h-7 px-2 py-0.5 font-mono text-muted-foreground max-w-xs truncate"
              >
                {truncate(formatMetadata(log.metadata), 50)}
              </Table.Cell>
            </Table.Row>
            {#if expandedRows.has(log.id)}
              <Table.Row>
                <Table.Cell colspan={6} class="bg-muted/30 p-4">
                  <div class="space-y-2">
                    <div>
                      <div class="text-sm font-semibold mb-1">Full Message</div>
                      <div class="font-mono text-xs whitespace-pre-wrap">
                        {log.message}
                      </div>
                    </div>
                    {#if log.metadata}
                      <div>
                        <div class="text-sm font-semibold mb-1">Metadata</div>
                        <pre
                          class="font-mono text-xs bg-background p-2 rounded border overflow-x-auto">{formatMetadata(
                            log.metadata,
                          )}</pre>
                      </div>
                    {/if}
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span class="font-semibold">ID:</span>
                        <span class="font-mono">{log.id}</span>
                      </div>
                      <div>
                        <span class="font-semibold">Timestamp:</span>
                        <span class="font-mono">{log.timestamp}</span>
                      </div>
                      {#if log.project_id}
                        <div>
                          <span class="font-semibold">Project ID:</span>
                          <span class="font-mono">{log.project_id}</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            {/if}
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if totalPages > 1}
    <div class="flex items-center justify-between px-2">
      <div class="text-xs text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(
          currentPage * pageSize,
          totalCount,
        )} of {totalCount} logs
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          class="h-7 w-7 p-0"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <div class="text-xs">
          Page {currentPage} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onclick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          class="h-7 w-7 p-0"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  {/if}
</div>
