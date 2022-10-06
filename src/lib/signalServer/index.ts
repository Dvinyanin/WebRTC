import { io } from 'socket.io-client';
import { signalingServer } from '../../config.json';

function init(peerConnection: RTCPeerConnection) {
	const server = io(signalingServer.url);

	server.on('connect', () => server.emit('join'));

	server.on('offer', async ({ offer }) => {
		await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = await peerConnection.createAnswer();
		server.emit('answer', { answer });
		await peerConnection.setLocalDescription(answer);
	});

	server.on('answer', ({ answer }) =>
		peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
	);

	server.on('ice-candidate', ({ candidate }) =>
		peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
	);

	peerConnection.onicecandidate = ({ candidate }) => {
		if (candidate !== null) {
			server.emit('ice-candidate', { candidate });
		}
	};

	return async () => {
		const offer = await peerConnection.createOffer();
		server.emit('offer', { offer });
		await peerConnection.setLocalDescription(offer);
	};
}

export default init;
