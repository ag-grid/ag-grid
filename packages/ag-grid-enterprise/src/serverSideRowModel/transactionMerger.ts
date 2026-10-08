import type { IRowNode, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, ServerSideTransactionResultStatus } from 'ag-grid-community';

type TransactionRowOp = 'add' | 'update' | 'remove';

export interface TransactionMergeTarget {
    /** The id the store resolves for `data` when applying `op`. */
    getRowId(data: any, op: TransactionRowOp): string | null | undefined;
    isRowCached(id: string): boolean;
    /** Whether applying only `data` gives the same result as applying `previousData` and then `data`. */
    canSkipUpdate(previousData: any, data: any): boolean;
    isAccepted(transaction: ServerSideTransaction): boolean;
    /** Applies a transaction that has already been accepted, with `rowIds` holding the id of each row's data. */
    apply(transaction: ServerSideTransaction, rowIds?: Map<any, string>): ServerSideTransactionResult;
}

interface RowEntry {
    op: TransactionRowOp;
    id: string;
    data: any;
}

interface Contribution {
    transactionIndex: number;
    op: TransactionRowOp;
    id: string;
    generation: number;
}

/**
 * Applies transactions for one store so that each row changes at most once per batch, while giving the
 * same rows, data and order as applying them one after the other. Returns one result per transaction.
 *
 * Batches are planned from the transactions alone, then each batch's transactions are accepted against the
 * store just before that batch is applied, so acceptance sees the results of the earlier batches.
 */
export function _applyMergedTransactions(
    transactions: ServerSideTransaction[],
    target: TransactionMergeTarget
): ServerSideTransactionResult[] {
    const results: ServerSideTransactionResult[] = new Array(transactions.length);
    let plan = new BatchPlan();
    let planned: { index: number; entries: RowEntry[] }[] = [];

    const applyPlanned = () => {
        if (planned.length === 0) {
            return;
        }
        let batch = new MergeBatch();
        for (let i = 0, len = planned.length; i < len; ++i) {
            const { index, entries } = planned[i];
            const transaction = transactions[index];
            if (batch.mixesCachedAndUncachedRemoves(entries, target) || replacesOwnUpdateEffects(entries, target)) {
                // a removal that misses some ids and deletes others marks rows for refresh, and a row updated twice
                // with effects that can't be skipped needs both updates, so either must stay a call of its own
                batch.apply(transactions, target, results);
                batch = new MergeBatch();
                results[index] = target.isAccepted(transaction)
                    ? target.apply(transaction, getRowIds(entries))
                    : { status: ServerSideTransactionResultStatus.Cancelled };
            } else {
                if (batch.skipsUpdateEffects(entries, target)) {
                    batch.apply(transactions, target, results);
                    batch = new MergeBatch();
                }
                if (target.isAccepted(transaction)) {
                    batch.accept(index, entries, target);
                } else {
                    results[index] = { status: ServerSideTransactionResultStatus.Cancelled };
                }
            }
        }
        batch.apply(transactions, target, results);
        plan = new BatchPlan();
        planned = [];
    };

    for (let index = 0, len = transactions.length; index < len; ++index) {
        const transaction = transactions[index];
        const { entries, mergeable } = getRowEntries(transaction, target);
        if (!mergeable) {
            applyPlanned();
            results[index] = target.isAccepted(transaction)
                ? target.apply(transaction, getRowIds(entries))
                : { status: ServerSideTransactionResultStatus.Cancelled };
            continue;
        }
        if (!plan.canAdd(entries)) {
            applyPlanned();
        }
        plan.add(entries);
        planned.push({ index, entries });
    }
    applyPlanned();

    return results;
}

/** Whether the transaction updates a row twice, where the first update has effects that have to be applied. */
function replacesOwnUpdateEffects(entries: RowEntry[], target: TransactionMergeTarget): boolean {
    const updates = new Map<string, any>();
    for (let i = 0, len = entries.length; i < len; ++i) {
        const { op, id, data } = entries[i];
        if (op !== 'update') {
            continue;
        }
        if (updates.has(id) && !target.canSkipUpdate(updates.get(id), data)) {
            return true;
        }
        updates.set(id, data);
    }
    return false;
}

/** `mergeable` is false when the transaction has to be applied on its own, with `entries` holding the ids resolved so far. */
function getRowEntries(
    transaction: ServerSideTransaction,
    target: TransactionMergeTarget
): { entries: RowEntry[]; mergeable: boolean } {
    const entries: RowEntry[] = [];
    if (transaction.addIndex != null || transaction.rowCount != null) {
        return { entries, mergeable: false };
    }

    // the store applies updates, then adds, then removes, whatever order they were given in
    const opArrays: [TransactionRowOp, any[] | undefined][] = [
        ['update', transaction.update],
        ['add', transaction.add],
        ['remove', transaction.remove],
    ];
    for (const [op, rows] of opArrays) {
        if (!rows) {
            continue;
        }
        for (let i = 0, len = rows.length; i < len; ++i) {
            const data = rows[i];
            const id = target.getRowId(data, op);
            if (id == null || id === '' || id === GRAND_TOTAL_ROW_ID) {
                if (id != null) {
                    entries.push({ op, id, data });
                }
                return { entries, mergeable: false };
            }
            entries.push({ op, id, data });
        }
    }
    return { entries, mergeable: true };
}

function getRowIds(entries: RowEntry[]): Map<any, string> | undefined {
    if (entries.length === 0) {
        return undefined;
    }
    const rowIds = new Map<any, string>();
    for (let i = 0, len = entries.length; i < len; ++i) {
        const { id, data } = entries[i];
        rowIds.set(data, id);
    }
    return rowIds;
}

/** Matches the order in which the store's object-keyed add map lists ids: array-index keys first, ascending. */
function isArrayIndexKey(id: string): boolean {
    const key = String(id);
    return /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;
}

/**
 * Decides batch boundaries before it is known which transactions are accepted or which rows are cached. It
 * tracks every add and remove, so the accepted transactions of a planned batch can always be merged.
 */
class BatchPlan {
    private readonly removedIds = new Set<string>();
    private maxIndexKeyAdd = -1;
    private hasNamedKeyAdd = false;

    public canAdd(entries: RowEntry[]): boolean {
        for (let i = 0, len = entries.length; i < len; ++i) {
            const { op, id } = entries[i];
            if (op !== 'add') {
                continue;
            }
            if (this.removedIds.has(id)) {
                return false;
            }
            if (isArrayIndexKey(id) && (this.hasNamedKeyAdd || Number(id) < this.maxIndexKeyAdd)) {
                return false;
            }
        }
        return true;
    }

    public add(entries: RowEntry[]): void {
        for (let i = 0, len = entries.length; i < len; ++i) {
            const { op, id } = entries[i];
            if (op === 'remove') {
                this.removedIds.add(id);
            } else if (op === 'add') {
                if (isArrayIndexKey(id)) {
                    this.maxIndexKeyAdd = Math.max(this.maxIndexKeyAdd, Number(id));
                } else {
                    this.hasNamedKeyAdd = true;
                }
            }
        }
    }
}

class MergeBatch {
    private readonly transactionIndexes: number[] = [];
    private readonly contributions: Contribution[] = [];
    private readonly adds = new Map<string, any>();
    private readonly updates = new Map<string, any>();
    private readonly removes = new Map<string, any>();
    private readonly addedBy = new Map<string, number>();
    private readonly generations = new Map<string, number>();

    public accept(transactionIndex: number, entries: RowEntry[], target: TransactionMergeTarget): void {
        this.transactionIndexes.push(transactionIndex);
        const { adds, updates, removes } = this;

        for (let i = 0, len = entries.length; i < len; ++i) {
            const { op, id, data } = entries[i];
            if (op === 'update') {
                if (adds.has(id)) {
                    adds.set(id, data);
                } else if (updates.has(id) || (!removes.has(id) && target.isRowCached(id))) {
                    updates.set(id, data);
                } else {
                    continue;
                }
            } else if (op === 'add') {
                if (adds.has(id)) {
                    if (this.addedBy.get(id) === transactionIndex) {
                        adds.set(id, data);
                    }
                    continue;
                }
                if (updates.has(id) || target.isRowCached(id)) {
                    continue;
                }
                adds.set(id, data);
                this.addedBy.set(id, transactionIndex);
            } else {
                if (adds.has(id)) {
                    adds.delete(id);
                    this.addedBy.delete(id);
                    this.generations.set(id, this.getGeneration(id) + 1);
                    continue;
                }
                if (!this.isRowPresent(id, target)) {
                    continue;
                }
                updates.delete(id);
                removes.set(id, data);
            }
            this.contributions.push({ transactionIndex, op, id, generation: this.getGeneration(id) });
        }
    }

    /**
     * Whether the transaction removes both rows that exist at that point and rows that don't. Removing only rows
     * that don't exist changes nothing, so those removes can be dropped from the batch. A row added in this batch
     * exists only if the add can be inserted, which is the same for all of them.
     */
    public mixesCachedAndUncachedRemoves(entries: RowEntry[], target: TransactionMergeTarget): boolean {
        const addedHere = new Set<string>();
        let hasCached = false;
        let hasUncached = false;
        let hasAdded = false;
        for (let i = 0, len = entries.length; i < len; ++i) {
            const { op, id } = entries[i];
            if (op === 'add') {
                if (!this.isRowPresent(id, target)) {
                    addedHere.add(id);
                }
            } else if (op === 'remove') {
                if (addedHere.has(id) || this.adds.has(id)) {
                    hasAdded = true;
                } else if (this.isRowPresent(id, target)) {
                    hasCached = true;
                } else {
                    hasUncached = true;
                }
            }
        }
        return Number(hasCached) + Number(hasUncached) + Number(hasAdded) > 1;
    }

    /** Whether merging the entries would replace a pending update whose own effects have to be applied. */
    public skipsUpdateEffects(entries: RowEntry[], target: TransactionMergeTarget): boolean {
        const updates = this.updates;
        for (let i = 0, len = entries.length; i < len; ++i) {
            const { op, id, data } = entries[i];
            if (op === 'update' && updates.has(id) && !target.canSkipUpdate(updates.get(id), data)) {
                return true;
            }
        }
        return false;
    }

    private isRowPresent(id: string, target: TransactionMergeTarget): boolean {
        return this.updates.has(id) || (!this.removes.has(id) && target.isRowCached(id));
    }

    public apply(
        transactions: ServerSideTransaction[],
        target: TransactionMergeTarget,
        results: ServerSideTransactionResult[]
    ): void {
        const transactionIndexes = this.transactionIndexes;
        if (transactionIndexes.length === 0) {
            return;
        }

        const merged: ServerSideTransaction = {};
        const rowIds = new Map<any, string>();
        const toRows = (rowsById: Map<string, any>) => {
            const rows: any[] = [];
            for (const [id, data] of rowsById) {
                rowIds.set(data, id);
                rows.push(data);
            }
            return rows;
        };
        if (this.updates.size) {
            merged.update = toRows(this.updates);
        }
        if (this.adds.size) {
            merged.add = toRows(this.adds);
        }
        if (this.removes.size) {
            merged.remove = toRows(this.removes);
        }

        const hasChanges = merged.update || merged.add || merged.remove;
        const result = hasChanges
            ? target.apply(merged, rowIds)
            : { status: ServerSideTransactionResultStatus.Applied };
        const { status } = result;
        if (status !== ServerSideTransactionResultStatus.Applied) {
            for (let i = 0, len = transactionIndexes.length; i < len; ++i) {
                results[transactionIndexes[i]] = { status };
            }
            return;
        }

        const nodesById = new Map<string, IRowNode>();
        for (const nodes of [result.update, result.add, result.remove]) {
            if (!nodes) {
                continue;
            }
            for (let i = 0, len = nodes.length; i < len; ++i) {
                const node = nodes[i];
                nodesById.set(node.id!, node);
            }
        }

        for (let i = 0, len = transactionIndexes.length; i < len; ++i) {
            const index = transactionIndexes[i];
            const transaction = transactions[index];
            const callerResult: ServerSideTransactionResult = { status };
            if (transaction.update?.length) {
                callerResult.update = [];
            }
            if (transaction.add?.length) {
                callerResult.add = [];
            }
            if (transaction.remove?.length) {
                callerResult.remove = [];
            }
            results[index] = callerResult;
        }

        const contributions = this.contributions;
        for (let i = 0, len = contributions.length; i < len; ++i) {
            const { transactionIndex, op, id, generation } = contributions[i];
            const node = nodesById.get(id);
            if (node && generation === this.getGeneration(id)) {
                results[transactionIndex][op]!.push(node);
            }
        }
    }

    private getGeneration(id: string): number {
        return this.generations.get(id) ?? 0;
    }
}

export interface RouteTransactionGroup {
    route: string[] | undefined;
    indexes: number[];
}

/**
 * Groups transactions by route, keeping groups in the order their routes first appear. When
 * `canChangeChildStores` holds for a transaction and any of its descendant routes have pending transactions,
 * new groups are started for its route and those descendants, so the earlier child transactions still apply first.
 */
export function _groupTransactionsByRoute(
    transactions: ServerSideTransaction[],
    canChangeChildStores: (transaction: ServerSideTransaction) => boolean
): RouteTransactionGroup[] {
    const groups: RouteTransactionGroup[] = [];
    const openGroups = new Map<string, { keys: string[]; group: RouteTransactionGroup }>();

    for (let index = 0, len = transactions.length; index < len; ++index) {
        const transaction = transactions[index];
        const route = transaction.route;
        const keys = (route ?? []).map(String);
        const routeKey = JSON.stringify(keys);

        if (canChangeChildStores(transaction)) {
            let closedDescendant = false;
            for (const [openKey, open] of openGroups) {
                if (isDescendantRoute(open.keys, keys)) {
                    openGroups.delete(openKey);
                    closedDescendant = true;
                }
            }
            if (closedDescendant) {
                openGroups.delete(routeKey);
            }
        }

        let open = openGroups.get(routeKey);
        if (!open) {
            open = { keys, group: { route, indexes: [] } };
            groups.push(open.group);
            openGroups.set(routeKey, open);
        }
        open.group.indexes.push(index);
    }

    return groups;
}

function isDescendantRoute(keys: string[], ancestorKeys: string[]): boolean {
    return keys.length > ancestorKeys.length && ancestorKeys.every((key, i) => keys[i] === key);
}
