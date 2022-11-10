<script>
	import '../app.css';
	import { page } from '$app/stores';
	import update from '$lib/data/update.json'
</script>

<div class="text-gray-700 max-w-5xl mx-auto p-2">
	<div class="py-2 flex items-baseline space-x-4">
		<a href="/"><h1 class="text-3xl text-blue-700">Mastodon Stats</h1></a>
		<a href="/" class:font-bold={$page.url.pathname == '/'}>Table</a>
		<a href="/graph" class:font-bold={$page.url.pathname == '/graph'}>Graph</a>
		<a href="https://github.com/zegl/mastodon-stats">Source Code</a>
	</div>

	<main class="py-2">
		<slot />
	</main>

	<p class="text-gray-400 py-2">
		By <a class="underline" href="https://mastodon.se/@z">@z@mastodon.se</a> &mdash; Updated {update.at} &mdash; 🕷
	</p>
</div>
