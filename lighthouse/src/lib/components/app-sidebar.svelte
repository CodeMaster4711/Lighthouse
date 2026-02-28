<script lang="ts" module>
  import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
</script>

<script lang="ts">
  import NavMain from "./nav-main.svelte";
  import NavProjects from "./nav-projects.svelte";
  import NavSecondary from "./nav-secondary.svelte";
  import NavUser from "./nav-user.svelte";
  import SidebarStats from "./sidebar-stats.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";

  let {
    projects = [],
    ref = $bindable(null),
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    projects?: { id?: string; name: string; url: string }[];
  } = $props();

  const navMain = $derived([
    {
      title: "Logs",
      url: "/logs",
      icon: SquareTerminalIcon,
      isActive: true,
      items: projects.map((project) => ({
        title: project.name,
        url: project.url,
      })),
    },
  ]);

  const navfooter = $derived([
    {
      title: "Api Docs",
      url: "/api/docs",
      icon: BookOpenIcon,
    },
  ]);
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton size="lg">
          {#snippet child({ props })}
            <a href="/" {...props}>
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden"
              >
                <img
                  src="/logo/logo.jpg"
                  alt="Lighthouse"
                  class="size-full object-cover"
                />
              </div>
              <div class="grid flex-1 text-start text-sm leading-tight">
                <span class="truncate font-medium">Lighthouse</span>
              </div>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={navMain} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <SidebarStats />
    <NavSecondary items={navfooter} />
  </Sidebar.Footer>
</Sidebar.Root>
