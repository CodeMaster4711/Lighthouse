<script lang="ts">
	import { AreaChart } from "layerchart";
	import { curveNatural } from "d3-shape";
	import { scaleUtc } from "d3-scale";
	import * as Chart from "$lib/components/ui/chart/index.js";

	let {
		data
	}: {
		data: { hour: string; count: number }[];
	} = $props();

	const chartData = $derived(
		data.map((d) => ({
			date: new Date(d.hour),
			count: d.count,
		}))
	);

	const chartConfig = {
		count: {
			label: "Logs",
			color: "var(--chart-1)",
		},
	} satisfies Chart.ChartConfig;
</script>

<Chart.Container config={chartConfig} class="h-full w-full">
	<AreaChart
		data={chartData}
		x="date"
		xScale={scaleUtc()}
		series={[
			{
				key: "count",
				label: "Logs",
				color: chartConfig.count.color,
			},
		]}
		props={{
			area: {
				curve: curveNatural,
				"fill-opacity": 0.4,
				line: { class: "stroke-2" },
				motion: "tween",
			},
			xAxis: {
				format: (v: Date) =>
					v.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
			},
			yAxis: { format: (v: number) => v.toString() },
		}}
	>
		{#snippet tooltip()}
			<Chart.Tooltip
				labelFormatter={(v: Date) => {
					return v.toLocaleString("en-US", {
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					});
				}}
			/>
		{/snippet}
	</AreaChart>
</Chart.Container>
