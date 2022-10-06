// @ts-check
import { WebSocketServer } from 'ws';
import { log } from './log.js';

/**
 * @param {import('http').Server} httpServer
 */
export function createLivereloadServer(httpServer) {
    const sockets = new Set();

    const server = new WebSocketServer({ server: httpServer });
    server.on('connection', (ws) => {
        sockets.add(ws);
        ws.on('close', () => sockets.delete(ws));
    });

    /**
     * @param {any} message
     */
    function sendMessage(message) {
        sockets.forEach((ws) => ws.send(JSON.stringify(message)));
        log.ok(message.type);
    }

    function close() {
        server.close();
    }

    return { sendMessage, close };
}
