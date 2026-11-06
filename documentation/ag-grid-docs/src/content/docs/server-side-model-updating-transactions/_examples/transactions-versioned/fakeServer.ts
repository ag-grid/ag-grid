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
 * A server that always reads its latest version, which is never older than the version the grid has caught up to,
 * passed in `request.dataVersion`.
 */
export class FakeServer {
    private version = 1;
    private trades: Trade[] = [];

    constructor() {
        for (const portfolio of portfolios) {
            for (const product of products) {
                this.trades.push({ tradeId: this.trades.length, portfolio, product, current: 1000, version: 1 });
            }
        }
    }

    public getRows(request: IServerSideGetRowsRequest): { rows: any[]; rowCount: number; version: number } {
        const { trades, version } = this;

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
        const index = Math.floor(Math.random() * this.trades.length);
        const version = ++this.version;
        const trade = { ...this.trades[index], current: Math.floor(Math.random() * 100000), version };
        this.trades[index] = trade;
        return { version, trade };
    }
}
