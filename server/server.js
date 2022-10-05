import { readFileSync } from 'fs';
import { createServer } from 'https';
import WebSocket from 'ws';

const HTTPS_PORT = 8443;
const serverConfig = {
	key: readFileSync('key.pem'),
	cert: readFileSync('cert.pem')
};

const server = createServer(serverConfig);
server.listen(HTTPS_PORT, '0.0.0.0');

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) =>
	ws.on('message', (message) =>
		[...wss.clients]
			.filter((client) => client.readyState === WebSocket.OPEN)
			.forEach((client) => client.send(message))
	)
);

console.log('Server running');
