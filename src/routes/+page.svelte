<script>
	import data from '$lib/data/servers.json';

	let showServers = data
		.filter((s) => s.activity[0].statuses > 0 && s.instance.stats.userCount > 10)
		.sort((a, b) => b.activity[0].statuses - a.activity[0].statuses);

	const growth = (s) => {
		const total = s.instance.stats.userCount;
		const regs = s.activity[0].registrations;
		return regs / total;
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<p>Showing active Mastodon servers with more than 10 registered users.</p>

<table>
	<thead>
		<tr>
			<th>Server</th>
			<th>Users (Active / Total)</th>
			<th>Registrations (last week)</th>
			<th>Statuses (Last Week / Total)</th>
		</tr>
	</thead>
	<tbody>
	{#each showServers as server}
		<tr>

			<td><strong>{server.instance.uri}</strong></td>
			<td>{parseInt(server.activity[0].logins).toLocaleString()} / {server.instance.stats.userCount.toLocaleString()}</td>
			<td>+{parseInt(server.activity[0].registrations).toLocaleString()}</td>
			
			<td>{parseInt(server.activity[0].statuses).toLocaleString()} / {server.instance.stats
				.statusCount.toLocaleString()}</td>
		</tr>
	{/each}
</tbody>
</table>