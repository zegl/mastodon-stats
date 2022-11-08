<script lang="ts">
	import Graph from '$lib/Graph.svelte'
</script>

<svelte:head>
	<title>Mastodon Server Stats</title>
	<meta name="description" content="Mastodon Server Stats" />
</svelte:head>

<div class="space-y-4">

<p class="text-gray-400">
	By <a class="underline" href="https://mastodon.se/@z">@z@mastodon.se</a> &mdash;
	<a class="underline" href="https://github.com/zegl/mastodon-stats">Source Code</a><br>
	Last updated 2022-11-08 &mdash; 🕷
</p>

<Graph />

</div>