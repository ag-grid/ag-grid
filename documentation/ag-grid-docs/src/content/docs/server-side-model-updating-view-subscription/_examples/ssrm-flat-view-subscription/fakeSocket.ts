import type { IServerSideGetRowsRequest } from 'ag-grid-community';

export interface Stock {
    id: string;
    symbol: string;
    exchange: string;
    country: string;
    price: number;
    change: number;
    volume: number;
}

export type ClientMessage =
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'getRows'; requestId: number; request: IServerSideGetRowsRequest };

export type ServerMessage =
    | { type: 'rows'; requestId: number; rowData: Stock[]; rowCount: number }
    | { type: 'update'; rows: Stock[] };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 300;
const MAX_UPDATE_INTERVAL_MS = 1200;
// the chance that a subscribed stock changes price on each tick
const UPDATE_CHANCE = 0.4;
const STOCK_COUNT = 1000;
const EXCHANGES = ['NYSE', 'NASDAQ', 'LSE'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Japan'];

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

/** Serves the stocks a block at a time, and streams price updates for the subscribed stocks only. */
class FakeServer {
    private readonly stocks: Stock[] = [];
    private readonly subscribedIds = new Set<string>();
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly send: (message: ServerMessage) => void) {
        for (let i = 0; i < STOCK_COUNT; i++) {
            this.stocks.push({
                id: String(i),
                symbol: `STK${String(i).padStart(4, '0')}`,
                exchange: EXCHANGES[i % EXCHANGES.length],
                country: COUNTRIES[(i * 7) % COUNTRIES.length],
                price: Math.round((1 + Math.random() * 99) * 100) / 100,
                change: 0,
                volume: Math.round(Math.random() * 100000),
            });
        }
    }

    receive(message: ClientMessage): void {
        if (message.type === 'getRows') {
            const { requestId, request } = message;
            const rowData = this.stocks.slice(request.startRow, request.endRow);
            this.send({ type: 'rows', requestId, rowData, rowCount: this.stocks.length });
            return;
        }

        const { type, ids } = message;
        ids.forEach((id) => (type === 'subscribe' ? this.subscribedIds.add(id) : this.subscribedIds.delete(id)));
        if (type === 'subscribe') {
            // the client's copy can be out of date, so send the current values before streaming changes
            const rows = ids.map((id) => this.stocks[Number(id)]).filter((stock): stock is Stock => !!stock);
            if (rows.length) {
                this.send({ type: 'update', rows });
            }
        }

        // only stream while something is subscribed
        if (this.subscribedIds.size && !this.timer) {
            this.scheduleUpdates();
        } else if (!this.subscribedIds.size) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    private scheduleUpdates(): void {
        const delay = MIN_UPDATE_INTERVAL_MS + Math.random() * (MAX_UPDATE_INTERVAL_MS - MIN_UPDATE_INTERVAL_MS);
        this.timer = setTimeout(() => {
            this.sendUpdates();
            this.scheduleUpdates();
        }, delay);
    }

    private sendUpdates(): void {
        const rows: Stock[] = [];
        for (const id of this.subscribedIds) {
            const stock = this.stocks[Number(id)];
            if (stock && Math.random() < UPDATE_CHANCE) {
                // a move of up to 2% either way
                const price = Math.max(0.01, Math.round(stock.price * (1 + (Math.random() - 0.5) * 0.04) * 100) / 100);
                stock.change = Math.round(((price - stock.price) / stock.price) * 10000) / 100;
                stock.price = price;
                stock.volume += Math.round(Math.random() * 1000);
                rows.push(stock);
            }
        }
        if (rows.length) {
            this.send({ type: 'update', rows });
        }
    }
}

/** A WebSocket-like client for the fake server, with simulated network latency. */
export class FakeSocket {
    onmessage: ((message: ServerMessage) => void) | null = null;

    private readonly server = new FakeServer((message) => {
        const sent = copy(message);
        setTimeout(() => this.onmessage?.(sent), LATENCY_MS);
    });

    send(message: ClientMessage): void {
        const sent = copy(message);
        setTimeout(() => this.server.receive(sent), LATENCY_MS);
    }
}
