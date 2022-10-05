import type { PageLoad } from './$types';
import { iceServers, signalingServer } from '../config.json';

export const load: PageLoad = async () => {
	const localStream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true
	});
	const uuid = createUUID();
	const peerConnection = new RTCPeerConnection({ iceServers });
	const serverConnection = new WebSocket(signalingServer.url);

	serverConnection.onmessage = async (message) => {
		const signal = JSON.parse(message.data);

		if (signal.uuid == uuid) return;
		if (signal.ice) {
			return peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
		}
		if (!signal.sdp) {
			return;
		}
		await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
		if (signal.sdp.type == 'offer') {
			const sdp = await peerConnection.createAnswer();
			serverConnection.send(JSON.stringify({ sdp, uuid }));
			return peerConnection.setLocalDescription(sdp);
		}
	};

	peerConnection.onicecandidate = (event) => {
		if (event.candidate == null) {
			return;
		}
		serverConnection.send(JSON.stringify({ ice: event.candidate, uuid }));
	};

	localStream.getTracks().forEach((track) => {
		peerConnection.addTrack(track, localStream);
	});

	async function start() {
		const sdp = await peerConnection.createOffer();
		serverConnection.send(JSON.stringify({ sdp, uuid }));
		return peerConnection.setLocalDescription(sdp);
	}

	return { localStream, start, peerConnection };
};

function createUUID() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export const prerender = false;
export const ssr = false;
export const csr = true;
