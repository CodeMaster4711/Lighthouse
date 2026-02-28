<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Filler } from 'chart.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Filler);

	let {
		data
	}: {
		data: { hour: string; count: number }[];
	} = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	function formatHour(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
	}

	function createChart() {
		if (!canvas) return;

		if (chart) {
			chart.destroy();
		}

		const labels = data.map(d => formatHour(d.hour));
		const counts = data.map(d => d.count);

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [{
					label: 'Log Count',
					data: counts,
					borderColor: 'rgb(59, 130, 246)',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					fill: true,
					tension: 0.4,
					pointRadius: 3,
					pointHoverRadius: 5
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: 'Log Frequency (Last 24 Hours)',
						color: 'rgb(156, 163, 175)',
						font: {
							size: 14,
							weight: 'normal'
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							color: 'rgb(156, 163, 175)',
							precision: 0
						},
						grid: {
							color: 'rgba(156, 163, 175, 0.1)'
						}
					},
					x: {
						ticks: {
							color: 'rgb(156, 163, 175)',
							maxRotation: 45,
							minRotation: 45
						},
						grid: {
							color: 'rgba(156, 163, 175, 0.1)'
						}
					}
				}
			}
		});
	}

	$effect(() => {
		if (canvas && data) {
			createChart();
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="w-full h-full">
	<canvas bind:this={canvas}></canvas>
</div>
