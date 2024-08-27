import type { GridApi, IRowNode, RowDataTransaction, RowNode } from '@ag-grid-community/core';

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

export const getRootAllLeafChildren = (api: GridApi | null | undefined) => {
    const root = api && findRootNode(api);
    return root?.allLeafChildren ?? [];
};

export const getRootAllLeafChildrenData = (api: GridApi | null | undefined) => {
    return getRootAllLeafChildren(api).map((node) => node.data);
};

export function findRootNodes(gridApi: GridApi | IRowNode[]): RowNode[] {
    const set = new Set<RowNode>();
    const processNode = (row: RowNode) => {
        if (row.parent && !row.parent.parent) {
            set.add(row.parent);
        }
    };
    if (Array.isArray(gridApi)) {
        gridApi.forEach(processNode);
    } else {
        gridApi.forEachNode(processNode);
    }
    return Array.from(set);
}

export function findRootNode(gridApi: GridApi | IRowNode[]): RowNode | null {
    const rootNodes = findRootNodes(gridApi);
    if (rootNodes.length === 0) return null;
    if (rootNodes.length !== 1)
        throw new Error(
            'Expected one root node, but found ' + rootNodes.length + '. ' + rootNodes.map((n) => n.key).join(', ')
        );
    return rootNodes[0];
}

export async function executeTransactionsAsync(
    transactions: RowDataTransaction<any>[] | RowDataTransaction<any>,
    api: GridApi<any>
) {
    if (!Array.isArray(transactions)) {
        transactions = [transactions];
    }
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

export function verifyPositionInRootChildren(rows: GridApi | IRowNode[]): RowNode[] {
    if (!Array.isArray(rows)) {
        const root = findRootNode(rows);
        rows = root?.allLeafChildren ?? [];
    }
    const errors: string[] = [];
    for (let index = 0; index < rows.length; ++index) {
        const row = rows[index] as RowNode;
        if (row.sourceRowIndex !== index) {
            errors.push(`   row ${index} sourceRowIndex:${row.sourceRowIndex} id:'${row.id}'`);
        }
    }

    const errorsCount = errors.length;
    if (errorsCount > 0) {
        errors.push(JSON.stringify(rows.map((row) => (row as RowNode).sourceRowIndex)));
        if (errorsCount > 20) {
            errors.splice(20);
            errors.push(`And ${errorsCount - errors.length} more errors...`);
        }
        const error = new Error('❌ sourceRowIndex incorrect:\n' + errors.join('\n'));
        Error.captureStackTrace(error, verifyPositionInRootChildren);
        throw error;
    }

    return rows as RowNode[];
}

export function rowKey(row: IRowNode | null | undefined): string {
    return row?.key ?? row?.id ?? 'null';
}

export function checkGridSelectedNodes(api: GridApi) {
    const allRows = new Set<IRowNode>(getAllRows(api));
    const selectedNodes = api.getSelectedNodes();

    for (const node of selectedNodes) {
        if (!allRows.has(node)) {
            throw new Error(`❌ Selected node ${rowKey(node)} does not exist in the grid`);
        }
    }

    for (const node of allRows) {
        if (node.isSelected() && !selectedNodes.includes(node)) {
            throw new Error(`❌ Node ${rowKey(node)} is selected but not in the selected nodes list`);
        }
    }
}
