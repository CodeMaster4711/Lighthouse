<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import DatabaseIcon from "@lucide/svelte/icons/database";
	import CodeIcon from "@lucide/svelte/icons/code";
	import ServerIcon from "@lucide/svelte/icons/server";
	import WorkflowIcon from "@lucide/svelte/icons/workflow";
	import GlobeIcon from "@lucide/svelte/icons/globe";
	import ShieldIcon from "@lucide/svelte/icons/shield";
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let {
		services,
		projectId
	}: {
		services: string[];
		projectId: string;
	} = $props();

	const serviceIcons: Record<string, any> = {
		frontend: CodeIcon,
		backend: ServerIcon,
		database: DatabaseIcon,
		api: GlobeIcon,
		worker: WorkflowIcon,
		auth: ShieldIcon
	};

	function getIcon(service: string) {
		return serviceIcons[service] || ServerIcon;
	}

	function handleServiceClick(service: string) {
		if (browser) {
			goto(`/logs?project=${projectId}&service=${service}`);
		}
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Services</Sidebar.GroupLabel>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each services as service (service)}
				<Collapsible.Root>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton onclick={() => handleServiceClick(service)}>
							{#snippet child({ props })}
								<button type="button" {...props} class="w-full">
									{#if service === 'frontend'}
										<CodeIcon />
									{:else if service === 'backend'}
										<ServerIcon />
									{:else if service === 'database'}
										<DatabaseIcon />
									{:else if service === 'api'}
										<GlobeIcon />
									{:else if service === 'worker'}
										<WorkflowIcon />
									{:else if service === 'auth'}
										<ShieldIcon />
									{:else}
										<ServerIcon />
									{/if}
									<span>{service}</span>
								</button>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Collapsible.Root>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
