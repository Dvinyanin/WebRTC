import type { PageLoad } from './$types';
import { iceServers } from '../config.json';
import SignalServer from '$lib/signalServer';

export const load: PageLoad = async () => {
	const peerConnection = new RTCPeerConnection({ iceServers });
	const start = SignalServer(peerConnection);
	let localStream: MediaStream | undefined;
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
		stream.getTracks().forEach((track) => {
			peerConnection.addTrack(track, stream);
		});
		localStream = stream;
	} catch (error) {
		console.error(`Error while getting UserMedia: ${error}`);
	}
	return { start, peerConnection, localStream };
};

export const prerender = false;
export const ssr = false;
export const csr = true;
