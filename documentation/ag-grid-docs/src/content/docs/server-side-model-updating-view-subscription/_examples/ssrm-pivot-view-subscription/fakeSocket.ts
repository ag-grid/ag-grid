import type { IServerSideGetRowsRequest, SortModelItem } from 'ag-grid-community';

export interface Stock {
    id: string;
    sector: string;
    exchange: string;
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

/** A row the server sends. A group row holds its group keys and an aggregate for each of its result columns. */
export type ResultRow = Record<string, string | number>;

export interface ValueCol {
    field: string;
    aggFunc: string;
}

/** How the grid shows a group row: the grouped fields and keys down to it, and the pivot and value columns. */
export interface GroupQuery {
    groupFields: string[];
    groupKeys: string[];
    pivotFields: string[];
    valueCols: ValueCol[];
}

/** A group row subscription: the row id, and how to compute the row. */
export interface GroupSubscription extends GroupQuery {
    id: string;
}

export type ClientMessage =
    | { type: 'getRows'; requestId: number; request: IServerSideGetRowsRequest }
    | { type: 'subscribe' | 'unsubscribe'; ids: string[] }
    | { type: 'subscribeGroups'; groups: GroupSubscription[] }
    | { type: 'unsubscribeGroups'; ids: string[] };

export type ServerMessage =
    | { type: 'rows'; requestId: number; rowData: ResultRow[]; rowCount: number; pivotResultFields?: string[] }
    | { type: 'update'; stocks: Stock[]; groups: { id: string; row: ResultRow }[] }
    // the number of rows the server streams, sent whenever the subscriptions change
    | { type: 'status'; streamedRows: number };

const LATENCY_MS = 150;
const MIN_UPDATE_INTERVAL_MS = 50;
const MAX_UPDATE_INTERVAL_MS = 400;
// the chance that a stock changes price on each tick: a few stocks are busy, most are quiet
const MIN_UPDATE_CHANCE = 0.01;
const MAX_UPDATE_CHANCE = 0.12;
// the chance that a changed group row is sent on each tick, so the group rows update at different times
const GROUP_SEND_CHANCE = 0.15;
const SECTORS = ['Energy', 'Finance', 'Healthcare', 'Industrials', 'Technology'];
const EXCHANGES = ['NYSE', 'NASDAQ'];

// messages are copied, as sending them over a real socket would
function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function round(value: number): number {
    return Math.round(value * 100) / 100;
}

function aggregate(values: number[], aggFunc: string): number {
    switch (aggFunc) {
        case 'avg':
            return round(values.reduce((sum, value) => sum + value, 0) / values.length);
        case 'min':
            return Math.min(...values);
        case 'max':
            return Math.max(...values);
        case 'count':
            return values.length;
        default:
            return round(values.reduce((sum, value) => sum + value, 0));
    }
}

function isInGroup(stock: Stock, groupFields: string[], groupKeys: string[]): boolean {
    return groupKeys.every((key, i) => String(stock[groupFields[i] as keyof Stock]) === key);
}

function unique(values: string[]): string[] {
    return [...new Set(values)].sort();
}

function sortRows(rows: ResultRow[], sortModel: SortModelItem[], groupField: string | undefined): void {
    rows.sort((a, b) => {
        for (const { colId, sort } of sortModel) {
            // the auto group column shows the group key
            const field = colId === 'ag-Grid-AutoColumn' && groupField ? groupField : colId;
            const diff = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0;
            if (diff) {
                return sort === 'asc' ? diff : -diff;
            }
        }
        return 0;
    });
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

/**
 * Groups, pivots and aggregates the stocks for the grid, and streams updates for the subscribed rows only.
 * A subscribed group row receives every one of its aggregates, recomputed whenever one of its stocks moves.
 */
class FakeServer {
    private readonly stocks: Stock[] = [];
    private readonly subscribedIds = new Set<string>();
    // the subscribed group rows, by row id
    private readonly subscribedGroups = new Map<string, GroupQuery>();
    // ids of the subscribed group rows whose stocks moved since the row was last sent
    private readonly changedGroupIds = new Set<string>();
    private timer: ReturnType<typeof setTimeout> | undefined;

    constructor(private readonly send: (message: ServerMessage) => void) {
        SECTORS.forEach((sector) => {
            for (let i = 0; i < 20; i++) {
                this.stocks.push({
                    id: String(this.stocks.length),
                    sector,
                    exchange: EXCHANGES[i % EXCHANGES.length],
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
            case 'subscribeGroups':
                message.groups.forEach(({ id, ...query }) => this.subscribedGroups.set(id, query));
                break;
            case 'unsubscribeGroups':
                message.ids.forEach((id) => this.subscribedGroups.delete(id));
                break;
        }

        if (message.type === 'subscribe' || message.type === 'subscribeGroups') {
            // prices keep moving while a row is unsubscribed, so send the current values
            const stocks = message.type === 'subscribe' ? this.stocks.filter((s) => message.ids.includes(s.id)) : [];
            const groups =
                message.type === 'subscribeGroups'
                    ? message.groups.map(({ id, ...query }) => ({ id, row: this.getGroupRow(query) }))
                    : [];
            if (stocks.length || groups.length) {
                this.send({ type: 'update', stocks, groups });
            }
        }

        // a group row is sent whole, so the server streams one row for each subscription
        this.send({ type: 'status', streamedRows: this.subscribedIds.size + this.subscribedGroups.size });

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

    private getRows({
        rowGroupCols,
        groupKeys,
        pivotMode,
        pivotCols,
        valueCols,
        sortModel,
        startRow,
        endRow,
    }: IServerSideGetRowsRequest) {
        const groupFields = rowGroupCols.map((col) => col.field!);
        let rows: ResultRow[];
        let pivotResultFields: string[] | undefined;
        if (groupKeys.length < groupFields.length) {
            const query: Omit<GroupQuery, 'groupKeys'> = {
                groupFields,
                pivotFields: pivotMode ? pivotCols.map((col) => col.field!) : [],
                valueCols: valueCols.map((col) => ({ field: col.field!, aggFunc: col.aggFunc ?? 'sum' })),
            };
            const field = groupFields[groupKeys.length];
            const keys = unique(
                this.stocks
                    .filter((s) => isInGroup(s, groupFields, groupKeys))
                    .map((s) => String(s[field as keyof Stock]))
            );
            rows = keys.map((key) => this.getGroupRow({ ...query, groupKeys: [...groupKeys, key] }));
            if (query.pivotFields.length) {
                pivotResultFields = this.getPivotKeys(this.stocks, query.pivotFields).flatMap((pivotKey) =>
                    query.valueCols.map((col) => `${pivotKey}_${col.field}`)
                );
            }
        } else {
            rows = this.stocks.filter((s) => isInGroup(s, groupFields, groupKeys)).map((s) => ({ ...s }));
        }
        sortRows(rows, sortModel, groupFields[groupKeys.length]);
        return { rowData: rows.slice(startRow, endRow), rowCount: rows.length, pivotResultFields };
    }

    /** The pivot column values of the stocks, joined with the field separator the grid splits them on. */
    private getPivotKeys(stocks: Stock[], pivotFields: string[]): string[] {
        return unique(stocks.map((s) => pivotFields.map((field) => String(s[field as keyof Stock])).join('_')));
    }

    /** The group row with its current aggregates, one for each value column, or for each pivot key and value column. */
    private getGroupRow({ groupFields, groupKeys, pivotFields, valueCols }: GroupQuery): ResultRow {
        const row: ResultRow = {};
        groupKeys.forEach((key, i) => (row[groupFields[i]] = key));
        const stocks = this.stocks.filter((s) => isInGroup(s, groupFields, groupKeys));
        if (!pivotFields.length) {
            valueCols.forEach(({ field, aggFunc }) => {
                row[field] = aggregate(
                    stocks.map((s) => Number(s[field as keyof Stock])),
                    aggFunc
                );
            });
            return row;
        }
        for (const pivotKey of this.getPivotKeys(stocks, pivotFields)) {
            const pivoted = stocks.filter((s) => this.getPivotKeys([s], pivotFields)[0] === pivotKey);
            valueCols.forEach(({ field, aggFunc }) => {
                row[`${pivotKey}_${field}`] = aggregate(
                    pivoted.map((s) => Number(s[field as keyof Stock])),
                    aggFunc
                );
            });
        }
        return row;
    }

    /** A stock is watched when it is subscribed, or a subscribed group holds it. */
    private isWatched(stock: Stock): boolean {
        if (this.subscribedIds.has(stock.id)) {
            return true;
        }
        for (const { groupFields, groupKeys } of this.subscribedGroups.values()) {
            if (isInGroup(stock, groupFields, groupKeys)) {
                return true;
            }
        }
        return false;
    }

    private sendUpdates(): void {
        const groups = [...this.subscribedGroups.entries()];
        const movedStocks: Stock[] = [];
        for (const stock of this.stocks) {
            if (this.isWatched(stock) && Math.random() < getUpdateChance(stock.id)) {
                // a move of up to 2% either way
                const price = Math.max(0.01, round(stock.price * (1 + (Math.random() - 0.5) * 0.04)));
                stock.change = round(((price - stock.price) / stock.price) * 100);
                stock.price = price;
                stock.volume += Math.round(Math.random() * 1000);
                movedStocks.push(stock);
            }
        }
        const stocks = movedStocks.filter((stock) => this.subscribedIds.has(stock.id));
        groups
            .filter(([, { groupFields, groupKeys }]) => movedStocks.some((s) => isInGroup(s, groupFields, groupKeys)))
            .forEach(([id]) => this.changedGroupIds.add(id));
        const changedGroups = groups
            .filter(([id]) => this.changedGroupIds.has(id) && Math.random() < GROUP_SEND_CHANCE)
            .map(([id, query]) => {
                this.changedGroupIds.delete(id);
                return { id, row: this.getGroupRow(query) };
            });
        if (stocks.length || changedGroups.length) {
            this.send({ type: 'update', stocks, groups: changedGroups });
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
