import type { GridApi, IRowNode, RowDataTransaction, RowNode } from '@ag-grid-community/core';
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

export const getRootAllLeafChildren = (api: GridApi | null | undefined) => {
    const root = api && findRootNode(api);
    return root?.allLeafChildren ?? [];
};

export const getRootAllLeafChildrenData = (api: GridApi | null | undefined) => {
    return getRootAllLeafChildren(api).map((node) => node.data);
};

export function findRootNodes(gridApi: GridApi | IRowNode[]): IRowNode[] {
    const set = new Set<IRowNode>();
    const processNode = (row: IRowNode) => {
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

export function findRootNode(gridApi: GridApi | IRowNode[]): IRowNode | null {
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

const cachedJSONObjectsMap = new Map<string, any>();

export const cachedJSONObjects = {
    /** Clears the cache of JSON objects. */
    clear() {
        cachedJSONObjectsMap.clear();
    },

    /**
     * This is useful for writing test code without having to store in variables the objects that are created.
     * This JSON stringify the object to use as a key in a global map, and if the object is already in the map, it returns the cached object.
     * You can call cachedJSONObjects.clear() to clear the cache on beforeEach() call.
     */
    object<T>(obj: T): T {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const key = JSON.stringify(obj);
        const found = cachedJSONObjectsMap.get(key);
        if (found !== undefined) {
            return found;
        }
        cachedJSONObjectsMap.set(key, obj);
        return obj;
    },

    /** return array.map(cachedJSONObjects.object) */
    array<T>(array: T[]): T[] {
        return array.map(cachedJSONObjects.object);
    },
};

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
