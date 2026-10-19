import type { IServerSideGetRowsRequest } from 'ag-grid-community';

export interface Trade {
    tradeId: number;
    portfolio: string;
    product: string;
    current: number;
    /** The server version at which this trade last changed. */
    version: number;
}

export interface TradeChange {
    version: number;
    trade: Trade;
}

const portfolios = ['Aggressive', 'Hybrid', 'Income'];
const products = ['Aluminium', 'Copper', 'Gold', 'Nickel', 'Silver', 'Tin', 'Zinc', 'Lead'];

/**
 * A server that keeps every version of its trades, so that a request can read the version the grid has
 * already caught up to, passed in `request.dataVersion`.
 */
export class FakeServer {
    private version = 1;
    private readonly snapshots = new Map<number, Trade[]>();

    constructor() {
        const trades: Trade[] = [];
        for (const portfolio of portfolios) {
            for (const product of products) {
                trades.push({ tradeId: trades.length, portfolio, product, current: 1000, version: 1 });
            }
        }
        this.snapshots.set(this.version, trades);
    }

    public getVersion(): number {
        return this.version;
    }

    public getRows(request: IServerSideGetRowsRequest): { rows: any[]; rowCount: number; version: number } {
        const requested = request.dataVersion as number | undefined;
        const version = requested != null && this.snapshots.has(requested) ? requested : this.version;
        const trades = this.snapshots.get(version)!;

        const rows =
            request.groupKeys.length === 0
                ? portfolios.map((portfolio) => ({ portfolio }))
                : trades.filter((trade) => trade.portfolio === request.groupKeys[0]);

        return {
            rows: rows.slice(request.startRow, request.endRow),
            rowCount: rows.length,
            version,
        };
    }

    /** Changes the value of a random trade, creating a new version. */
    public changeRandomTrade(): TradeChange {
        const trades = [...this.snapshots.get(this.version)!];
        const index = Math.floor(Math.random() * trades.length);
        const version = ++this.version;
        const trade = { ...trades[index], current: Math.floor(Math.random() * 100000), version };
        trades[index] = trade;
        this.snapshots.set(version, trades);
        return { version, trade };
    }
}
