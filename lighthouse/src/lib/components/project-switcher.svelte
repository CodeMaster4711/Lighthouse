<script lang="ts">
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChartAreaIcon from "@lucide/svelte/icons/chart-area";
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let {
		projects,
		selectedProjectId = $bindable()
	}: {
		projects: { id: string; name: string; services: string[] }[];
		selectedProjectId: string;
	} = $props();

	const selectedProject = $derived(
		projects.find((p) => p.id === selectedProjectId) || projects[0]
	);

	function handleValueChange(value: string | undefined) {
		if (value && browser) {
			selectedProjectId = value;
			goto(`/logs?project=${value}`);
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<Select.Root selected={{ value: selectedProjectId }} onSelectedChange={(v) => handleValueChange(v?.value)}>
			<Select.Trigger class="w-full h-auto py-2">
				<Sidebar.MenuButton size="lg" class="w-full">
					{#snippet child({ props })}
						<div {...props} class="flex items-center gap-2 w-full">
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<ChartAreaIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">{selectedProject?.name || 'Select Project'}</span>
								<span class="truncate text-xs">{selectedProject?.services.length || 0} services</span>
							</div>
						</div>
					{/snippet}
				</Sidebar.MenuButton>
			</Select.Trigger>
			<Select.Content>
				{#each projects as project (project.id)}
					<Select.Item value={project.id}>
						{project.name}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
