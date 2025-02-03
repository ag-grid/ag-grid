import type { GridApi, IRowNode, RowDataTransaction, RowNode, RowNodeTransaction } from 'ag-grid-community';

export function optionalEscapeString(s: string): string {
    return /^(?!\d)\w[._-\w]*$|^\d+$/.test(s) ? s : JSON.stringify(s);
}

export function rowIdToString(row: IRowNode | string | number | null | undefined): string {
    if (typeof row === 'string') return row;
    if (typeof row === 'number') return String(row);
    if (!row) return '<no-row>';
    const id = row?.id;
    if (typeof id === 'string') return optionalEscapeString(id);
    if (id !== null && id !== undefined) return JSON.stringify(id);
    if (row.sourceRowIndex >= 0) return `sourceRowIndex:${row.sourceRowIndex}`;
    if (row.rowIndex !== null) return `rowIndex:${row.rowIndex}`;
    return '<no-id>';
}

export function rowIdAndIndexToString(row: IRowNode | null | undefined): string {
    let result = 'id:' + rowIdToString(row);
    if (row) {
        const { sourceRowIndex, rowIndex } = row;
        if (sourceRowIndex >= 0) result += ` sourceRowIndex:${sourceRowIndex}`;
        if (rowIndex !== null && rowIndex >= 0) result += ` rowIndex:${rowIndex}`;
    }
    return result;
}

export const getAllRows = (api: GridApi | null | undefined): RowNode[] => {
    const rows: RowNode<any>[] = [];
    api?.forEachNode((node) => rows.push(node as RowNode));
    return rows;
};

export function executeTransactionsAsync<TData = any>(
    transactions: RowDataTransaction<TData>[] | RowDataTransaction<TData>,
    api: GridApi<TData>
): Promise<RowNodeTransaction<TData>[]> {
    if (!Array.isArray(transactions)) {
        transactions = [transactions];
    }
    const promises = transactions.map(
        (transaction) =>
            new Promise<RowNodeTransaction<TData>>((resolve) => api.applyTransactionAsync(transaction, resolve))
    );
    api.flushAsyncTransactions();
    return Promise.all(promises);
}
