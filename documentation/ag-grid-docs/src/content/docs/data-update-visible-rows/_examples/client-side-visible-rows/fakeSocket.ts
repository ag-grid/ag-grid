export interface Stock {
    id: string;
    sector: string;
    exchange: string;
    country: string;
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

export type ClientMessage = { type: 'subscribe' | 'unsubscribe'; ids: string[] };
export type ServerMessage = { type: 'update'; rows: Stock[] };

const LATENCY_MS = 150;
const UPDATE_INTERVAL_MS = 1000;
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Industrials', 'Technology'];
const EXCHANGES = ['NYSE', 'NASDAQ', 'LSE'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Japan'];

// the server's copy of the stocks, keyed by id
const stocks = new Map<string, Stock>();
let dataVersion = 0;

/** Replaces the server's stocks with a new set with new ids, and returns them as a snapshot request would. */
export function fetchStocks(): Stock[] {
    dataVersion++;
    stocks.clear();
    SECTORS.forEach((sector) => {
        for (let i = 0; i < 20; i++) {
            const id = `${dataVersion}-${stocks.size}`;
            const symbol = `${sector.slice(0, 3).toUpperCase()}${String(i).padStart(2, '0')}`;
            stocks.set(id, {
                id,
                sector,
                exchange: EXCHANGES[i % EXCHANGES.length],
                country: COUNTRIES[(i * 7) % COUNTRIES.length],
                symbol,
                price: Math.round((1 + Math.random() * 99) * 100) / 100,
                change: 0,
                volume: Math.round(Math.random() * 100000),
            });
        }
    });
    return copy([...stocks.values()]);
}

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

/** Streams price updates for the subscribed stocks only. */
class FakeServer {
    private readonly subscribedIds = new Set<string>();
    private timer: ReturnType<typeof setInterval> | undefined;

    constructor(private readonly send: (message: ServerMessage) => void) {}

    receive({ type, ids }: ClientMessage): void {
        ids.forEach((id) => (type === 'subscribe' ? this.subscribedIds.add(id) : this.subscribedIds.delete(id)));

        // only stream while something is subscribed
        if (this.subscribedIds.size && !this.timer) {
            this.timer = setInterval(() => this.sendUpdates(), UPDATE_INTERVAL_MS);
        } else if (!this.subscribedIds.size) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    private sendUpdates(): void {
        const rows: Stock[] = [];
        for (const id of this.subscribedIds) {
            // group rows have no stock, so get no updates
            const stock = stocks.get(id);
            if (stock) {
                const price = Math.max(0.01, Math.round((stock.price + Math.random() - 0.5) * 100) / 100);
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
