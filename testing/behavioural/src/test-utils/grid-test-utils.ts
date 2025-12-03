import type { GridApi, IRowNode, RowDataTransaction, RowNode, RowNodeTransaction } from 'ag-grid-community';

import { GridRows } from './gridRows/gridRows';
import { GridRowsDiagramTree } from './gridRows/gridRowsDiagramTree';

export function optionalEscapeString(s: string): string {
    return /^(?!\d)\w[._-\w]*$|^\d+$/.test(s) ? s : JSON.stringify(s);
}

export function rowIdToString(row: IRowNode | string | number | null | undefined): string {
    if (typeof row === 'string') {
        return row;
    }
    if (typeof row === 'number') {
        return String(row);
    }
    if (!row) {
        return '<no-row>';
    }
    const id = row?.id;
    if (typeof id === 'string') {
        return optionalEscapeString(id);
    }
    if (id !== null && id !== undefined) {
        return JSON.stringify(id);
    }
    if (row.sourceRowIndex >= 0) {
        return `sourceRowIndex:${row.sourceRowIndex}`;
    }
    if (row.rowIndex !== null) {
        return `rowIndex:${row.rowIndex}`;
    }
    return '<no-id>';
}

export function rowIdAndIndexToString(row: IRowNode | null | undefined): string {
    let result = 'id:' + rowIdToString(row);
    if (row) {
        const { sourceRowIndex, rowIndex } = row;
        if (sourceRowIndex >= 0) {
            result += ` sourceRowIndex:${sourceRowIndex}`;
        }
        if (rowIndex !== null && rowIndex >= 0) {
            result += ` rowIndex:${rowIndex}`;
        }
    }
    return result;
}

export const getAllRows = (api: GridApi | null | undefined): RowNode[] => {
    const rows: RowNode<any>[] = [];
    api?.forEachNode((node) => {
        if (node.destroyed) {
            throw new Error(`Row node ${rowIdAndIndexToString(node)} is destroyed`);
        }
        rows.push(node as RowNode);
    });
    return rows;
};

function validateNodeState(node: IRowNode, context: string): void {
    if (node.destroyed) {
        throw new Error(`[${context}] Row node ${rowIdAndIndexToString(node)} is destroyed`);
    }

    const sibling = node.sibling;
    if (sibling) {
        if (sibling === node) {
            throw new Error(`[${context}] Row node ${rowIdAndIndexToString(node)} cannot be its own sibling`);
        }
        if (sibling.sibling !== node) {
            throw new Error(
                `[${context}] Row node ${rowIdAndIndexToString(node)} sibling ${rowIdAndIndexToString(sibling)} does not point back to the original row`
            );
        }
        if (!!node.footer === !!sibling.footer) {
            throw new Error(
                `[${context}] Row node ${rowIdAndIndexToString(node)} and sibling ${rowIdAndIndexToString(sibling)} both report footer=${node.footer}`
            );
        }
    } else if (node.footer) {
        throw new Error(`[${context}] Footer row ${rowIdAndIndexToString(node)} does not have a header sibling`);
    }
}

function collectAllNodes(api: GridApi, includeSiblings: boolean, context: string): Set<IRowNode> {
    const rows = new Set<IRowNode<any>>();
    const addNode = (node: IRowNode) => {
        validateNodeState(node, context);
        rows.add(node as RowNode);
    };
    api?.forEachNode(addNode);

    const rowModelType = api.getGridOption('rowModelType');
    if (!rowModelType || rowModelType === 'clientSide') {
        api.forEachLeafNode(addNode);
    }

    if (includeSiblings) {
        for (const node of Array.from(rows)) {
            const sibling = node.sibling;

            if (sibling) {
                if (rows.has(sibling)) {
                    continue;
                }
                rows.add(sibling);
                validateNodeState(sibling, context);
            } else if (node.footer) {
                throw new Error(
                    `[${context}] Footer row ${rowIdAndIndexToString(node)} lost its header sibling reference`
                );
            }
        }
    }
    return rows;
}

export class DestroyedRowNodesChecker {
    private readonly originalNodes: Set<IRowNode>;

    public constructor(private readonly api: GridApi) {
        this.originalNodes = collectAllNodes(api, true, 'initial scan');
    }

    public check(): void {
        const newRowsSet = collectAllNodes(this.api, true, 'post-change scan');
        for (const originalNode of this.originalNodes) {
            if (newRowsSet.has(originalNode)) {
                continue;
            }
            if (!originalNode.destroyed) {
                throw new Error(`Expected removed row ${rowIdAndIndexToString(originalNode)} to be destroyed`);
            }
            const sibling = originalNode.sibling;
            if (sibling && !sibling.destroyed) {
                throw new Error(`Expected removed sibling row ${rowIdAndIndexToString(sibling)} to be destroyed`);
            }
        }
    }
}

export function setRowDataChecked<TData = any>(api: GridApi<TData>, rowData: TData[] | null | undefined): void {
    const destroyedRowNodesChecker = new DestroyedRowNodesChecker(api);
    api.setGridOption('rowData', rowData);
    destroyedRowNodesChecker.check();
}

export function expectRowNodesDestroyed(...nodes: (IRowNode[] | IRowNode | null | undefined)[]): void {
    for (const node of nodes) {
        if (!node) {
            throw new Error('Expected a row node reference when asserting destroyed state');
        }
        if (Array.isArray(node)) {
            for (const child of node) {
                expectRowNodesDestroyed(child);
            }
        } else {
            if (!node.destroyed) {
                throw new Error(`Expected removed row ${rowIdAndIndexToString(node)} to be destroyed`);
            }
            const sibling = node.sibling;
            if (sibling && !sibling.destroyed) {
                expectRowNodesDestroyed(sibling);
            }
        }
    }
}

export function applyTransactionChecked<TData = any>(
    api: GridApi<TData>,
    transaction: RowDataTransaction<TData>
): RowNodeTransaction<TData> | null | undefined {
    const destroyedRowNodesChecker = new DestroyedRowNodesChecker(api);
    const result = api.applyTransaction(transaction);
    destroyedRowNodesChecker.check();
    if (!result) {
        return result;
    }
    expectRowNodesDestroyed(result.remove);
    return result;
}

export async function executeTransactionsAsync<TData = any>(
    transactions: RowDataTransaction<TData>[] | RowDataTransaction<TData>,
    api: GridApi<TData>
): Promise<RowNodeTransaction<TData>[]> {
    if (!Array.isArray(transactions)) {
        transactions = [transactions];
    }
    const destroyedRowNodesChecker = new DestroyedRowNodesChecker(api);
    const promises = transactions.map(
        (transaction) =>
            new Promise<RowNodeTransaction<TData>>((resolve) => api.applyTransactionAsync(transaction, resolve))
    );
    api.flushAsyncTransactions();
    destroyedRowNodesChecker.check();
    const results = await Promise.all(promises);
    for (const r of results) {
        expectRowNodesDestroyed(r.remove);
    }
    return results;
}

export function isAgHtmlElementVisible(element: Element | string | null | undefined): boolean {
    if (!element) {
        return false;
    }
    if (typeof element === 'string') {
        element = document.querySelector(element);
        if (!element) {
            return false;
        }
    }
    let current: Element | null = element;
    while (current && current.role !== 'row') {
        const classList = current.classList;
        if (classList.contains('ag-hidden') || classList.contains('ag-invisible')) {
            return false;
        }
        const computedStyle = getComputedStyle(current);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return false;
        }
        current = current.parentElement;
    }
    return true;
}

export function drawGrid(api: GridApi): void {
    const gr = new GridRows(api, undefined, { printRowIndices: true });
    const tr = new GridRowsDiagramTree(gr);
    console.log(tr.diagramToString(false, null));
}
