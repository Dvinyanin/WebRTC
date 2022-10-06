<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	onMount(() => {
		localVideo.srcObject = data.localStream;
		data.peerConnection.ontrack = (event) => {
			remoteVideo.srcObject = event.streams[0];
		};
	});

	let localVideo: any = null;
	let remoteVideo: any = null;
</script>

<div>
	<div>
		<!-- svelte-ignore a11y-media-has-caption -->
		<video bind:this={localVideo} autoplay volume="0" />
		<!-- svelte-ignore a11y-media-has-caption -->
		<video bind:this={remoteVideo} autoplay />
	</div>
	<button on:click={data.start}>Connect</button>
</div>
