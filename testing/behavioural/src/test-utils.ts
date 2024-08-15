import type { GridApi, RowDataTransaction, RowNode } from '@ag-grid-community/core';
import util from 'util';

export const isGridApi = (node: unknown): node is GridApi =>
    typeof node === 'object' && node !== null && typeof (node as GridApi).setGridOption === 'function';

export const getAllRows = (api: GridApi | null | undefined) => {
    const rows: RowNode<any>[] = [];
    api?.forEachNode((node) => rows.push(node as RowNode));
    return rows;
};

export const getAllRowData = (rows: GridApi | RowNode[] | null | undefined) => {
    if (Array.isArray(rows)) {
        return rows.map((node) => node.data);
    }
    const result: any[] = [];
    rows?.forEachNode((node) => result.push(node.data));
    return result;
};

export async function executeTransactionsAsync(transactions: RowDataTransaction<any>[], api: GridApi<any>) {
    const promises: Promise<void>[] = [];
    for (const transaction of transactions) {
        promises.push(
            new Promise((resolve) => {
                api.applyTransactionAsync(transaction, () => resolve());
            })
        );
    }
    api.flushAsyncTransactions();
    await Promise.all(promises);
}

export const printDataSnapshot = (data: any, pretty = false) => {
    if (typeof data === 'string') {
        console.log('\nsnapshot:\n' + JSON.stringify(data) + '\n');
    }
    console.log(
        '\nsnapshot:\n' +
            util.inspect(data, {
                colors: false,
                depth: 0xfffff,
                breakLength: pretty ? 120 : 0xfffff,
                maxArrayLength: 0xfffff,
                compact: true,
                getters: false,
                maxStringLength: 0xfffff,
                showHidden: false,
                showProxy: false,
                sorted: false,
                customInspect: false,
                numericSeparator: false,
            }) +
            '\n'
    );
};
