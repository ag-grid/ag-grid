export interface Stock {
    id: string;
    sector: string;
    exchange: string;
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

/** The stocks in a group: those whose value for each grouped field matches the group key at that level. */
export interface GroupFilter {
    fields: (keyof Stock)[];
    keys: string[];
}

export type ClientMessage =
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'subscribeGroups'; groups: ({ id: string } & GroupFilter)[] }
    | { type: 'unsubscribeGroups'; ids: string[] };
export type ServerMessage = { type: 'update'; rows: Stock[] };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 50;
const MAX_UPDATE_INTERVAL_MS = 400;
// the chance that a stock changes price on each tick: a few stocks are busy, most are quiet
const MIN_UPDATE_CHANCE = 0.01;
const MAX_UPDATE_CHANCE = 0.12;
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Industrials', 'Technology'];
const EXCHANGES = ['NYSE', 'NASDAQ'];

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

export function isInGroup(stock: Stock, { fields, keys }: GroupFilter): boolean {
    return fields.every((field, i) => String(stock[field]) === keys[i]);
}

// each stock keeps its own update chance, so updates arrive at different rates
const updateChances = new Map<string, number>();

function getUpdateChance(id: string): number {
    let chance = updateChances.get(id);
    if (chance === undefined) {
        chance = MIN_UPDATE_CHANCE + Math.random() ** 2 * (MAX_UPDATE_CHANCE - MIN_UPDATE_CHANCE);
        updateChances.set(id, chance);
    }
    return chance;
}

/** Streams price updates for the subscribed stocks, and for every stock in a subscribed group. */
class FakeServer {
    private readonly subscribedIds = new Set<string>();
    // the subscribed groups, by group row id
    private readonly subscribedGroups = new Map<string, GroupFilter>();
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly send: (message: ServerMessage) => void) {}

    receive(message: ClientMessage): void {
        switch (message.type) {
            case 'subscribe':
                message.ids.forEach((id) => this.subscribedIds.add(id));
                break;
            case 'unsubscribe':
                message.ids.forEach((id) => this.subscribedIds.delete(id));
                break;
            case 'subscribeGroups':
                message.groups.forEach(({ id, fields, keys }) => this.subscribedGroups.set(id, { fields, keys }));
                break;
            case 'unsubscribeGroups':
                message.ids.forEach((id) => this.subscribedGroups.delete(id));
                break;
        }

        if (message.type === 'subscribe' || message.type === 'subscribeGroups') {
            // the client's copy can be out of date, so send the current values before streaming changes
            const rows = [...stocks.values()].filter((stock) =>
                message.type === 'subscribe'
                    ? message.ids.includes(stock.id)
                    : message.groups.some((group) => isInGroup(stock, group))
            );
            if (rows.length) {
                this.send({ type: 'update', rows });
            }
        }

        // only stream while something is subscribed
        const subscribedCount = this.subscribedIds.size + this.subscribedGroups.size;
        if (subscribedCount && !this.timer) {
            this.scheduleUpdates();
        } else if (!subscribedCount) {
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
        const groups = [...this.subscribedGroups.values()];
        for (const stock of stocks.values()) {
            const watched = this.subscribedIds.has(stock.id) || groups.some((group) => isInGroup(stock, group));
            if (watched && Math.random() < getUpdateChance(stock.id)) {
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
