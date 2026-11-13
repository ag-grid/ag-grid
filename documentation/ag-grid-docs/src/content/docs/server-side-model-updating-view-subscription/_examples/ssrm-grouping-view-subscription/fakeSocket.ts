import type { IServerSideGetRowsRequest, SortModelItem } from 'ag-grid-community';

export interface Stock {
    id: string;
    sector: string;
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

/** A sector group row, with the aggregates the server calculates from its stocks. */
export interface SectorRow {
    sector: string;
    // the biggest rise of the sector's stocks
    change: number;
    // the total shares traded
    volume: number;
}

export type Row = Stock | SectorRow;

export type ClientMessage =
    | { type: 'getRows'; requestId: number; request: IServerSideGetRowsRequest }
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'subscribeSectors' | 'unsubscribeSectors'; sectors: string[] };

export type ServerMessage =
    | { type: 'rows'; requestId: number; rowData: Row[]; rowCount: number }
    | { type: 'update'; stocks: Stock[]; sectors: SectorRow[] };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 300;
const MAX_UPDATE_INTERVAL_MS = 1200;
// the chance that a watched stock changes price on each tick
const UPDATE_CHANCE = 0.4;
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Industrials', 'Technology'];

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}

function sortRows(rows: Row[], sortModel: SortModelItem[]): void {
    rows.sort((a: any, b: any) => {
        for (const { colId, sort } of sortModel) {
            // the auto group column shows the sector
            const field = colId === 'ag-Grid-AutoColumn' ? 'sector' : colId;
            const diff = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
            if (diff) {
                return sort === 'asc' ? diff : -diff;
            }
        }
        return 0;
    });
}

/**
 * Groups the stocks by sector and aggregates each sector, and streams updates for the subscribed rows only.
 * A subscribed sector row is sent whole, recalculated whenever one of its stocks moves.
 */
class FakeServer {
    private readonly stocks: Stock[] = [];
    private readonly subscribedIds = new Set<string>();
    private readonly subscribedSectors = new Set<string>();
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly send: (message: ServerMessage) => void) {
        SECTORS.forEach((sector) => {
            for (let i = 0; i < 20; i++) {
                this.stocks.push({
                    id: String(this.stocks.length),
                    sector,
                    symbol: `${sector.slice(0, 3).toUpperCase()}${String(i).padStart(2, '0')}`,
                    price: round(1 + Math.random() * 99),
                    change: 0,
                    volume: Math.round(Math.random() * 100000),
                });
            }
        });
    }

    receive(message: ClientMessage): void {
        switch (message.type) {
            case 'getRows':
                this.send({ type: 'rows', requestId: message.requestId, ...this.getRows(message.request) });
                return;
            case 'subscribe':
                message.ids.forEach((id) => this.subscribedIds.add(id));
                break;
            case 'unsubscribe':
                message.ids.forEach((id) => this.subscribedIds.delete(id));
                break;
            case 'subscribeSectors':
                message.sectors.forEach((sector) => this.subscribedSectors.add(sector));
                break;
            case 'unsubscribeSectors':
                message.sectors.forEach((sector) => this.subscribedSectors.delete(sector));
                break;
        }

        if (message.type === 'subscribe' || message.type === 'subscribeSectors') {
            // the client's copy can be out of date, so send the current values before streaming changes
            const stocks = message.type === 'subscribe' ? this.stocks.filter((s) => message.ids.includes(s.id)) : [];
            const sectors =
                message.type === 'subscribeSectors' ? message.sectors.map((sector) => this.getSectorRow(sector)) : [];
            if (stocks.length || sectors.length) {
                this.send({ type: 'update', stocks, sectors });
            }
        }

        // only stream while something is subscribed
        const subscribedCount = this.subscribedIds.size + this.subscribedSectors.size;
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

    private getRows({ groupKeys, sortModel, startRow, endRow }: IServerSideGetRowsRequest) {
        const rows: Row[] = groupKeys.length
            ? this.stocks.filter((s) => s.sector === groupKeys[0]).map((s) => ({ ...s }))
            : SECTORS.map((sector) => this.getSectorRow(sector));
        sortRows(rows, sortModel);
        return { rowData: rows.slice(startRow, endRow), rowCount: rows.length };
    }

    private getSectorRow(sector: string): SectorRow {
        const stocks = this.stocks.filter((s) => s.sector === sector);
        return {
            sector,
            change: Math.max(...stocks.map((s) => s.change)),
            volume: stocks.reduce((sum, s) => sum + s.volume, 0),
        };
    }

    private sendUpdates(): void {
        const moved: Stock[] = [];
        for (const stock of this.stocks) {
            const watched = this.subscribedIds.has(stock.id) || this.subscribedSectors.has(stock.sector);
            if (watched && Math.random() < UPDATE_CHANCE) {
                // a move of up to 2% either way
                const price = Math.max(0.01, round(stock.price * (1 + (Math.random() - 0.5) * 0.04)));
                stock.change = round(((price - stock.price) / stock.price) * 100);
                stock.price = price;
                stock.volume += Math.round(Math.random() * 1000);
                moved.push(stock);
            }
        }
        const stocks = moved.filter((s) => this.subscribedIds.has(s.id));
        const sectors = [...this.subscribedSectors]
            .filter((sector) => moved.some((s) => s.sector === sector))
            .map((sector) => this.getSectorRow(sector));
        if (stocks.length || sectors.length) {
            this.send({ type: 'update', stocks, sectors });
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
