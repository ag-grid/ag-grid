import type { GridApi, IRowNode, RowDataTransaction, RowNode } from '@ag-grid-community/core';
import { setTimeout as asyncSetTimeout } from 'timers/promises';
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

export async function flushJestTimers() {
    jest.advanceTimersByTime(10000);
    jest.useRealTimers();
    await asyncSetTimeout(1);
}

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
        rows = getAllRows(rows);
    }
    const errors: string[] = [];
    for (let index = 0; index < rows.length; ++index) {
        const row = rows[index] as RowNode;
        if (row.positionInRootChildren !== index) {
            errors.push(`   row ${index} positionInRootChildren:${row.positionInRootChildren} id:'${row.id}'`);
        }
    }

    const errorsCount = errors.length;
    if (errorsCount > 0) {
        errors.push(JSON.stringify(rows.map((row) => (row as RowNode).positionInRootChildren)));
        if (errorsCount > 20) {
            errors.splice(20);
            errors.push(`And ${errorsCount - errors.length} more errors...`);
        }
        const error = new Error('❌ positionInRootChildren incorrect:\n' + errors.join('\n'));
        Error.captureStackTrace(error, verifyPositionInRootChildren);
        throw error;
    }

    return rows as RowNode[];
}
