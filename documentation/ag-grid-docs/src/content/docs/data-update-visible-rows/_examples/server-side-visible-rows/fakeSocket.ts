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
const UPDATE_INTERVAL_MS = 1000;
const REGIONS = ['Americas', 'Asia Pacific', 'Europe'];
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Technology'];

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function sortRows(rows: PortfolioRow[], sortModel: SortModelItem[]): void {
    rows.sort((a: any, b: any) => {
        for (const { colId, sort } of sortModel) {
            const diff = a[colId] < b[colId] ? -1 : a[colId] > b[colId] ? 1 : 0;
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
    private timer: ReturnType<typeof setInterval> | undefined;

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
            this.timer = setInterval(() => this.sendUpdates(), UPDATE_INTERVAL_MS);
        } else if (!this.subscribedIds.size) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
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
            if (stock) {
                stock.price = Math.round((stock.price! + Math.random() - 0.5) * 100) / 100;
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
