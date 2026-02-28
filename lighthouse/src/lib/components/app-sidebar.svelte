<script lang="ts">
	import ProjectSwitcher from "./project-switcher.svelte";
	import NavServices from "./nav-services.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { ComponentProps } from "svelte";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { page } from "$app/stores";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let projects: { id: string; name: string; services: string[] }[] = $state([]);
	let selectedProjectId = $state('');
	let loading = $state(true);

	async function loadProjects() {
		try {
			const response = await fetch('/api/projects?owner_id=users:default');
			const result = await response.json();
			if (result.success && Array.isArray(result.data)) {
				projects = result.data;
				if (projects.length > 0 && !selectedProjectId) {
					const urlParams = new URLSearchParams(browser ? window.location.search : '');
					selectedProjectId = urlParams.get('project') || projects[0].id;
				}
			}
		} catch (error) {
			console.error('[ERROR] failed_to_load_projects error=' + (error instanceof Error ? error.message : 'unknown'));
		} finally {
			loading = false;
		}
	}

	const selectedProject = $derived(
		projects.find((p) => p.id === selectedProjectId)
	);

	onMount(() => {
		loadProjects();
	});
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		{#if loading}
			<div class="p-4 text-sm text-muted-foreground">Loading...</div>
		{:else if projects.length > 0}
			<ProjectSwitcher {projects} bind:selectedProjectId />
		{:else}
			<div class="p-4 text-sm text-muted-foreground">No projects found</div>
		{/if}
	</Sidebar.Header>
	<Sidebar.Content>
		{#if selectedProject && selectedProject.services.length > 0}
			<NavServices services={selectedProject.services} projectId={selectedProject.id} />
		{/if}
	</Sidebar.Content>
</Sidebar.Root>
