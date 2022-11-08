<script lang="ts">
	import data from '$lib/data/servers.json';

	let showServers = data
		.filter((s) => s.activity[0].statuses > 0 && s.instance.stats.userCount > 10)
		.sort((a, b) => b.activity[0].statuses - a.activity[0].statuses);

	let sortBy = 'lastWeekStatuses';

	const setSort = (key: string) => {
		sortBy = key;
	};

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

<p class="text-left">Showing {showServers.length} active Mastodon servers with more than 10 registered users.</p>

<p class="text-gray-400">By <a class="underline" href="https://mastodon.se/@z">@z@mastodon.se</a> &mdash; Last updated 2022-11-08 &mdash; 🕷</p>

<div class="mt-8 flex flex-col">
	<div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
			<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
				<table class="min-w-full divide-y divide-gray-300">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="whitespace-nowrap py-3.5 pl-4 text-left text-sm font-semibold text-gray-900 "
							>
								Server
							</th>
							<th scope="col" class="whitespace-nowrap  py-3.5 text-left text-sm font-semibold">
								Users (Active / Total)
							</th>
							<th
								scope="col"
								class="whitespace-nowrap  py-3.5 text-left text-sm font-semibold text-gray-900"
							>
								Registrations
							</th>
							<th
								scope="col"
								class="whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900"
							>
								Statuses (Last Week / Total)
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each showServers as server}
							<tr>
								<td class="whitespace-nowrap py-2 text-sm text-gray-500 pl-4">
									<strong><a href={'https://' + server.instance.uri}>{server.instance.uri}</a></strong>
								</td>
								<td class="whitespace-nowrap py-2  text-sm text-gray-500 ">
									{parseInt(server.activity[0].logins).toLocaleString()} / {server.instance.stats.userCount.toLocaleString()}
								</td>
								<td class="whitespace-nowrap py-2  text-sm text-gray-500 ">
									+{parseInt(server.activity[0].registrations).toLocaleString()}
								</td>

								<td class="whitespace-nowrap py-2  text-sm text-gray-500">
									{parseInt(server.activity[0].statuses).toLocaleString()} / {server.instance.stats.statusCount.toLocaleString()}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
