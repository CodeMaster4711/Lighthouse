<script lang="ts">
	import * as Table from "$lib/components/ui/table/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import type { LogEntry } from "$lib/shared/types";

	let {
		logs,
		totalCount = 0,
		currentPage = 1,
		pageSize = 50,
		onPageChange
	}: {
		logs: LogEntry[];
		totalCount?: number;
		currentPage?: number;
		pageSize?: number;
		onPageChange: (page: number) => void;
	} = $props();

	const totalPages = $derived(Math.ceil(totalCount / pageSize));

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	}

	function getBadgeVariant(level: string): "default" | "secondary" | "destructive" | "outline" {
		switch (level) {
			case 'ERROR':
				return 'destructive';
			case 'WARN':
				return 'outline';
			case 'INFO':
				return 'default';
			case 'DEBUG':
				return 'secondary';
			default:
				return 'secondary';
		}
	}

	function truncate(text: string, maxLength: number): string {
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	function formatMetadata(metadata: any): string {
		if (!metadata) return '';
		return JSON.stringify(metadata);
	}
</script>

<div class="space-y-2">
	<div class="rounded-md border">
		<Table.Root class="text-xs">
			<Table.Header>
				<Table.Row class="h-7 border-b">
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
						<Table.Cell colspan={5} class="h-28 text-center">
							No logs found
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each logs as log (log.id)}
						<Table.Row class="h-7 hover:bg-muted/50">
							<Table.Cell class="h-7 px-2 py-0.5 font-mono whitespace-nowrap">
								{formatTime(log.timestamp)}
							</Table.Cell>
							<Table.Cell class="h-7 px-2 py-0.5">
								<Badge variant={getBadgeVariant(log.level)} class="text-xs px-1.5 py-0">
									{log.level}
								</Badge>
							</Table.Cell>
							<Table.Cell class="h-7 px-2 py-0.5 font-mono">
								{log.source}
							</Table.Cell>
							<Table.Cell class="h-7 px-2 py-0.5 max-w-md truncate">
								{truncate(log.message, 100)}
							</Table.Cell>
							<Table.Cell class="h-7 px-2 py-0.5 font-mono text-muted-foreground max-w-xs truncate">
								{truncate(formatMetadata(log.metadata), 50)}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	{#if totalPages > 1}
		<div class="flex items-center justify-between px-2">
			<div class="text-xs text-muted-foreground">
				Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} logs
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
