<script lang="ts">
	import servers from '$lib/data/servers.json';
	import { Line } from 'svelte-chartjs';
	import moment from 'moment';
	import 'chartjs-adapter-date-fns';

	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		TimeSeriesScale,
		Filler
	} from 'chart.js';
	import { onMount } from 'svelte';

	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		LineElement,
		LinearScale,
		PointElement,
		CategoryScale,
		TimeSeriesScale,
		Filler
	);

	let weekStats = new Map();

	for (const s of servers) {
		for (const a of s.activity) {
			const key = moment(parseInt(a.week) * 1000)
				.endOf('isoweek')
				.unix();

			if (!weekStats.has(key)) {
				weekStats.set(key, {
					statuses: parseInt(a.statuses),
					logins: parseInt(a.logins),
					registrations: parseInt(a.registrations)
				});
			} else {
				let prev = weekStats.get(key);
				weekStats.set(key, {
					statuses: prev.statuses + parseInt(a.statuses),
					logins: prev.logins + parseInt(a.logins),
					registrations: prev.registrations + parseInt(a.registrations)
				});
			}
		}
	}

	let statuses = [];
	let logins = [];
	let registrations = [];

	for (let [key, value] of weekStats) {
		statuses.push({ x: key * 1000, y: value.statuses });
		logins.push({ x: key * 1000, y: value.logins });
		registrations.push({ x: key * 1000, y: value.registrations });
	}

	statuses = statuses.sort((a, b) => a.x - b.x).slice(-12, -1);
	logins = logins.sort((a, b) => a.x - b.x).slice(-12, -1);
	registrations = registrations.sort((a, b) => a.x - b.x).slice(-12, -1);

	let options = {
		scales: {
			x: {
				type: 'timeseries',
				time: {
					displayFormats: {
						quarter: 'YYYY-MM-DD'
					}
				}
			}
		}
	};

	let data = {
		datasets: [
			{
				label: 'Statuses',
				data: statuses,
				fill: true,
				lineTension: 0.3,
				backgroundColor: 'rgba(68, 156,181, .1)',
				borderColor: 'rgba(68, 156,181, 1)',
				borderCapStyle: 'butt'
			},
			{
				label: 'Logins',
				data: logins,

				fill: true,
				lineTension: 0.3,
				backgroundColor: 'rgba(66, 143,38, .1)',
				borderColor: 'rgba(66, 143,38,1)',
				borderCapStyle: 'butt'
			},
			{
				label: 'Registrations',
				data: registrations,

				fill: true,
				lineTension: 0.3,
				backgroundColor: 'rgba(150, 94,193, .1)',
				borderColor: 'rgba(150, 94,193,1)',
				borderCapStyle: 'butt'
			}
		]
	};

	let ready = false;

	onMount(() => {
		ready = true;
	});
</script>

{#if ready}
	<div>
		<Line {data} {options} />

		<p class="text-sm text-gray-500 text-center">
			Servers reports statistics on a weekly basis.
		</p>
	</div>
{/if}
