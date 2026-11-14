/** A stock held in the portfolio. The path is its region, its sector and its symbol. */
export interface Holding {
    id: string;
    path: string[];
    price: number;
    shares: number;
    value: number;
}

export type ClientMessage =
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'subscribeRoutes' | 'unsubscribeRoutes'; routes: string[][] };

export type ServerMessage = { type: 'update'; rows: Holding[] };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 50;
const MAX_UPDATE_INTERVAL_MS = 400;
// the chance that a stock changes price on each tick: a few stocks are busy, most are quiet
const MIN_UPDATE_CHANCE = 0.01;
const MAX_UPDATE_CHANCE = 0.12;
const REGIONS = ['Americas', 'Asia Pacific', 'Europe'];
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Technology'];

// the server's copy of the holdings, keyed by id
const holdings = new Map<string, Holding>();

/** Returns the holdings, as a snapshot request would. */
export function fetchHoldings(): Holding[] {
    if (!holdings.size) {
        for (const region of REGIONS) {
            for (const sector of SECTORS) {
                for (let i = 0; i < 10; i++) {
                    const symbol = `${region.slice(0, 2)}${sector.slice(0, 3)}${i}`.toUpperCase();
                    const price = Math.round((1 + Math.random() * 99) * 100) / 100;
                    const shares = 10 * Math.ceil(Math.random() * 100);
                    const id = String(holdings.size);
                    holdings.set(id, {
                        id,
                        path: [region, sector, symbol],
                        price,
                        shares,
                        value: getValue(price, shares),
                    });
                }
            }
        }
    }
    return copy([...holdings.values()]);
}

function getValue(price: number, shares: number): number {
    return Math.round(price * shares * 100) / 100;
}

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

/** Whether the holding is under the route, so a subscription to that route covers it. */
export function isUnder(holding: Holding, route: string[]): boolean {
    return route.every((key, i) => holding.path[i] === key);
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

/** Streams price updates for the subscribed holdings, and for every holding under a subscribed route. */
class FakeServer {
    private readonly subscribedIds = new Set<string>();
    // the subscribed routes, keyed by the route joined with '/'
    private readonly subscribedRoutes = new Map<string, string[]>();
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
            case 'subscribeRoutes':
                message.routes.forEach((route) => this.subscribedRoutes.set(route.join('/'), route));
                break;
            case 'unsubscribeRoutes':
                message.routes.forEach((route) => this.subscribedRoutes.delete(route.join('/')));
                break;
        }

        if (message.type === 'subscribe' || message.type === 'subscribeRoutes') {
            // the client's copy can be out of date, so send the current values before streaming changes
            const rows = [...holdings.values()].filter((holding) =>
                message.type === 'subscribe'
                    ? message.ids.includes(holding.id)
                    : message.routes.some((route) => isUnder(holding, route))
            );
            if (rows.length) {
                this.send({ type: 'update', rows });
            }
        }

        // only stream while something is subscribed
        const subscribedCount = this.subscribedIds.size + this.subscribedRoutes.size;
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

    private isWatched(holding: Holding): boolean {
        if (this.subscribedIds.has(holding.id)) {
            return true;
        }
        for (const route of this.subscribedRoutes.values()) {
            if (isUnder(holding, route)) {
                return true;
            }
        }
        return false;
    }

    private sendUpdates(): void {
        const rows: Holding[] = [];
        for (const holding of holdings.values()) {
            if (this.isWatched(holding) && Math.random() < getUpdateChance(holding.id)) {
                // a move of up to 2% either way
                holding.price = Math.max(
                    0.01,
                    Math.round(holding.price * (1 + (Math.random() - 0.5) * 0.04) * 100) / 100
                );
                holding.value = getValue(holding.price, holding.shares);
                rows.push(holding);
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
