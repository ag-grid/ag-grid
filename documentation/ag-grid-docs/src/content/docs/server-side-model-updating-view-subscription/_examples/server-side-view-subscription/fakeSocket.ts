import type { IServerSideGetRowsRequest, SortModelItem } from 'ag-grid-community';

/**
 * A region, a sector or a stock. The id is the row's path in the tree, so it is unique across levels.
 * A stock has a price, the shares held and their value. A region or sector has only a value, the total of the stocks under it.
 */
export interface PortfolioRow {
    id: string;
    name: string;
    group: boolean;
    price?: number;
    shares?: number;
    value?: number;
}

export type ClientMessage =
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'getRows'; requestId: number; request: IServerSideGetRowsRequest };

export type ServerMessage =
    | { type: 'rows'; requestId: number; rowData: PortfolioRow[]; rowCount: number }
    | { type: 'update'; rows: PortfolioRow[] };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 50;
const MAX_UPDATE_INTERVAL_MS = 400;
// the chance that a stock changes price on each tick: a few stocks are busy, most are quiet
const MIN_UPDATE_CHANCE = 0.01;
const MAX_UPDATE_CHANCE = 0.12;
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

function getValue(stock: PortfolioRow): number {
    return Math.round(stock.shares! * stock.price! * 100) / 100;
}

/** The ids of the rows above this one, from the top level down. */
function getAncestorIds(id: string): string[] {
    const names = id.split('/');
    return names.slice(1).map((_, i) => names.slice(0, i + 1).join('/'));
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

/** Serves the portfolio tree a level at a time, and streams price updates for the subscribed rows only. */
class FakeServer {
    // the children of each row, keyed by the parent's id ('' for the top level)
    private readonly children = new Map<string, PortfolioRow[]>();
    private readonly rows = new Map<string, PortfolioRow>();
    private readonly stocks: PortfolioRow[] = [];
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
                    stock.shares = 10 * Math.ceil(Math.random() * 100);
                    stock.value = getValue(stock);
                    this.stocks.push(stock);
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
        if (type === 'subscribe' && ids.length) {
            // prices and values keep moving while a row is out of view, so send the current ones
            this.send({ type: 'update', rows: ids.map((id) => this.getRow(id)) });
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

    private addRow(parentId: string, name: string, group: boolean): PortfolioRow {
        const row: PortfolioRow = { id: parentId ? `${parentId}/${name}` : name, name, group };
        this.children.set(parentId, [...(this.children.get(parentId) ?? []), row]);
        this.rows.set(row.id, row);
        return row;
    }

    /** The row with its current values. The value of a region or sector is the total of the stocks under it. */
    private getRow(id: string): PortfolioRow {
        const row = this.rows.get(id)!;
        if (!row.group) {
            return row;
        }
        const stocks = this.stocks.filter((stock) => stock.id.startsWith(`${id}/`));
        const total = stocks.reduce((sum, stock) => sum + stock.value!, 0);
        return { ...row, value: Math.round(total * 100) / 100 };
    }

    private getRows({ groupKeys, sortModel, startRow, endRow }: IServerSideGetRowsRequest) {
        // the group keys are the names on the path to the parent row, so joined they make its id
        const rows = (this.children.get(groupKeys.join('/')) ?? []).map((row) => this.getRow(row.id));
        sortRows(rows, sortModel);
        return { rowData: rows.slice(startRow, endRow), rowCount: rows.length };
    }

    private sendUpdates(): void {
        // the ids of the stocks that moved, and of the regions and sectors above them
        const changedIds = new Set<string>();
        for (const stock of this.stocks) {
            // a stock is watched when it is subscribed, or a region or sector above it is
            const watched = [stock.id, ...getAncestorIds(stock.id)].some((id) => this.subscribedIds.has(id));
            if (watched && Math.random() < getUpdateChance(stock.id)) {
                // a move of up to 2% either way
                stock.price = Math.max(0.01, Math.round(stock.price! * (1 + (Math.random() - 0.5) * 0.04) * 100) / 100);
                stock.value = getValue(stock);
                changedIds.add(stock.id);
                getAncestorIds(stock.id).forEach((id) => changedIds.add(id));
            }
        }
        const rows = [...this.subscribedIds].filter((id) => changedIds.has(id)).map((id) => this.getRow(id));
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
