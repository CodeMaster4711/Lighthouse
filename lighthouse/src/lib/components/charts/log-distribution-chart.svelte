<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Title, Tooltip, Legend } from 'chart.js';

	Chart.register(DoughnutController, ArcElement, Title, Tooltip, Legend);

	let {
		data
	}: {
		data: { level: string; count: number; percentage: number }[];
	} = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	const levelColors: Record<string, { bg: string; border: string }> = {
		DEBUG: { bg: 'rgba(156, 163, 175, 0.8)', border: 'rgb(156, 163, 175)' },
		INFO: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },
		WARN: { bg: 'rgba(251, 191, 36, 0.8)', border: 'rgb(251, 191, 36)' },
		ERROR: { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgb(239, 68, 68)' }
	};

	function createChart() {
		if (!canvas) return;

		if (chart) {
			chart.destroy();
		}

		const labels = data.map(d => d.level);
		const counts = data.map(d => d.count);
		const backgroundColors = data.map(d => levelColors[d.level]?.bg || 'rgba(156, 163, 175, 0.8)');
		const borderColors = data.map(d => levelColors[d.level]?.border || 'rgb(156, 163, 175)');

		chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels,
				datasets: [{
					data: counts,
					backgroundColor: backgroundColors,
					borderColor: borderColors,
					borderWidth: 2
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: 'Log Level Distribution',
						color: 'rgb(156, 163, 175)',
						font: {
							size: 14,
							weight: 'normal'
						}
					},
					legend: {
						position: 'bottom',
						labels: {
							color: 'rgb(156, 163, 175)',
							padding: 15,
							font: {
								size: 12
							}
						}
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								const label = context.label || '';
								const value = context.parsed;
								const percentage = data[context.dataIndex].percentage;
								return `${label}: ${value} (${percentage}%)`;
							}
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

<div class="w-full h-full flex items-center justify-center">
	<canvas bind:this={canvas}></canvas>
</div>
