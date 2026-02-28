<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let { data, children } = $props();

  onMount(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    updateTheme(mediaQuery);
    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  });
</script>

<svelte:head>
  <script>
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  </script>
</svelte:head>

<Sidebar.Provider>
  <AppSidebar projects={data.projects} />
  <Sidebar.Inset>
    <header class="flex h-16 shrink-0 items-center gap-2">
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger class="-ms-1" />
        <Separator
          orientation="vertical"
          class="me-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item class="hidden md:block">
              <Breadcrumb.Link href="##"
                >Building Your Application</Breadcrumb.Link
              >
            </Breadcrumb.Item>
            <Breadcrumb.Separator class="hidden md:block" />
            <Breadcrumb.Item>
              <Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </header>
    <div class="flex flex-1 flex-col p-4">
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
