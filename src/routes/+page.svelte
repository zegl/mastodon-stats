<script lang="ts">
	import data from '$lib/data/servers.json';
	import update from '$lib/data/update.json'

	let sortBy = 'lastWeekStatuses';

	$: showServers = data
		.filter((s) => s.activity[0].statuses > 0 && s.instance.stats.userCount > 10)
		.sort((a, b) => {
			switch (sortBy) {
				case 'lastWeekStatuses':
					return b.activity[0].statuses - a.activity[0].statuses;
				case 'activeUsers':
					return b.activity[0].logins - a.activity[0].logins;
				case 'totalUsers':
					return b.instance.stats.userCount - a.instance.stats.userCount;
				case 'lastWeekRegistrations':
					return b.activity[0].registrations - a.activity[0].registrations;
				case 'lastWeekStatuses':
					return b.activity[0].statuses - a.activity[0].statuses;
				case 'totalStatuses':
					return b.instance.stats.statusCount - a.instance.stats.statusCount;
			}
		});

	const setSort = (key: string) => {
		sortBy = key;
	};
	
	// Covers top 700 servers
	const fl = {
		"en": "🇺🇸",
		"ja": "🇯🇵",
		"zh-CN": "🇨🇳",
		"zh-YR": "🇨🇳",
		"zh-TW": "🇹🇼",
		"de": "🇩🇪",
		"fr": "🇫🇷",
		"es": "🇪🇸",
		"ko": "🇰🇷",
		"it": "🇮🇹",
		"pt-BR": "🇧🇷",
		"ca": "🏴󠁥󠁳󠁣󠁴󠁿",
		"sv": "🇸🇪",
		"fi": "🇫🇮",
		"pl": "🇵🇱",
		"he": "🇮🇱",
		"tr": "🇹🇷"
	}

	const flags = (instance): string => {
		let res = "";
		for(const l of instance.languages) {
			if (fl[l]) {
				res += fl[l] + " ";
			}
		}
		return res
	}
</script>

<svelte:head>
	<title>Mastodon Server Stats</title>
	<meta name="description" content="Mastodon Server Stats" />
</svelte:head>

<div class="space-y-4">
	<p class="text-left">
		Showing <strong>{showServers.length}</strong> active Mastodon servers.
	</p>

	<p class="text-gray-500">
		By <a class="underline" href="https://mastodon.se/@z">@z@mastodon.se</a> &mdash; Updated {update.at}
		&mdash; 🕷
	</p>

	<div class="flex flex-col">
		<div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
				<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
					<table class="min-w-full divide-y divide-gray-300">
						<thead class="bg-gray-50">
							<tr>
								<th>&nbsp;</th>
								<th
									scope="col"
									class="whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900 "
								>
									Server
								</th>
								<th scope="col" class="whitespace-nowrap  py-3.5 text-left text-sm font-semibold">
									Users (<span
										class="cursor-pointer"
										class:text-red-800={sortBy == 'activeUsers'}
										on:click={() => (sortBy = 'activeUsers')}
									>
										Active
									</span>
									/
									<span
										class="cursor-pointer"
										class:text-red-800={sortBy == 'totalUsers'}
										on:click={() => (sortBy = 'totalUsers')}
									>
										Total</span
									>)
								</th>
								<th
									scope="col"
									class="whitespace-nowrap  py-3.5 text-left text-sm font-semibold text-gray-900"
								>
									<span
										class="cursor-pointer"
										class:text-red-800={sortBy == 'lastWeekRegistrations'}
										on:click={() => (sortBy = 'lastWeekRegistrations')}
									>
										Registrations
									</span>
								</th>
								<th
									scope="col"
									class="whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900"
								>
									Statuses (<span
										class="cursor-pointer"
										class:text-red-800={sortBy == 'lastWeekStatuses'}
										on:click={() => (sortBy = 'lastWeekStatuses')}
									>
										Last Week
									</span>
									/
									<span
										class="cursor-pointer"
										class:text-red-800={sortBy == 'totalStatuses'}
										on:click={() => (sortBy = 'totalStatuses')}
									>
										Total</span
									>)
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each showServers as server, idx}
								<tr>
									<td class="whitespace-nowrap py-2 text-sm text-gray-500 pl-4">#{idx + 1}</td>
									<td class="whitespace-nowrap py-2 text-sm text-gray-500">
										<strong
											><a href={'https://' + server.instance.uri}>{server.instance.uri}</a></strong
										>
										{flags(server.instance)}
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
</div>
