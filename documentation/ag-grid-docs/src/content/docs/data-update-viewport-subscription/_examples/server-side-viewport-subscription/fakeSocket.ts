import type { IServerSideGetRowsRequest, SortModelItem } from 'ag-grid-community';

/** A region, a sector or a stock. The id is the row's path in the tree, so it is unique across levels. */
export interface PortfolioRow {
    id: string;
    name: string;
    group: boolean;
    price?: number;
}

export type ClientMessage =
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'getRows'; requestId: number; request: IServerSideGetRowsRequest };

export type ServerMessage =
    | { type: 'rows'; requestId: number; rowData: PortfolioRow[]; rowCount: number }
    | { type: 'update'; rows: PortfolioRow[] };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 300;
const MAX_UPDATE_INTERVAL_MS = 1200;
// the chance that a subscribed stock changes price on each tick
const UPDATE_CHANCE = 0.4;
const REGIONS = ['Americas', 'Asia Pacific', 'Europe'];
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Technology'];

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function sortRows(rows: PortfolioRow[], sortModel: SortModelItem[]): void {
    rows.sort((a: any, b: any) => {
        for (const { colId, sort } of sortModel) {
            // the Portfolio column is the auto group column, which shows the row's name
            const field = colId === 'ag-Grid-AutoColumn' ? 'name' : colId;
            const diff = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
            if (diff) {
                return sort === 'asc' ? diff : -diff;
            }
        }
        return 0;
    });
}

/** Serves the portfolio tree a level at a time, and streams price updates for the subscribed stocks only. */
class FakeServer {
    // the children of each row, keyed by the parent's id ('' for the top level)
    private readonly children = new Map<string, PortfolioRow[]>();
    private readonly stocks = new Map<string, PortfolioRow>();
    private readonly subscribedIds = new Set<string>();
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly send: (message: ServerMessage) => void) {
        for (const region of REGIONS) {
            this.addRow('', region, true);
            for (const sector of SECTORS) {
                this.addRow(region, sector, true);
                for (let i = 0; i < 10; i++) {
                    const symbol = `${region.slice(0, 2)}${sector.slice(0, 3)}${i}`.toUpperCase();
                    const stock = this.addRow(`${region}/${sector}`, symbol, false);
                    stock.price = Math.round(Math.random() * 10000) / 100;
                    this.stocks.set(stock.id, stock);
                }
            }
        }
    }

    receive(message: ClientMessage): void {
        if (message.type === 'getRows') {
            this.send({ type: 'rows', requestId: message.requestId, ...this.getRows(message.request) });
            return;
        }

        const { type, ids } = message;
        ids.forEach((id) => (type === 'subscribe' ? this.subscribedIds.add(id) : this.subscribedIds.delete(id)));

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

    private addRow(parentId: string, name: string, group: boolean): PortfolioRow {
        const row: PortfolioRow = { id: parentId ? `${parentId}/${name}` : name, name, group };
        this.children.set(parentId, [...(this.children.get(parentId) ?? []), row]);
        return row;
    }

    private getRows({ groupKeys, sortModel, startRow, endRow }: IServerSideGetRowsRequest) {
        // the group keys are the names on the path to the parent row, so joined they make its id
        const rows = [...(this.children.get(groupKeys.join('/')) ?? [])];
        sortRows(rows, sortModel);
        return { rowData: rows.slice(startRow, endRow), rowCount: rows.length };
    }

    private sendUpdates(): void {
        const rows: PortfolioRow[] = [];
        for (const id of this.subscribedIds) {
            // regions and sectors are not stocks, so get no updates
            const stock = this.stocks.get(id);
            if (stock && Math.random() < UPDATE_CHANCE) {
                // a move of up to 2% either way
                stock.price = Math.max(0.01, Math.round(stock.price! * (1 + (Math.random() - 0.5) * 0.04) * 100) / 100);
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
