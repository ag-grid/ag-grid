import type { IRowNode, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, ServerSideTransactionResultStatus } from 'ag-grid-community';

type TransactionRowOp = 'add' | 'update' | 'remove';

export interface TransactionMergeTarget {
    /** The id the store resolves for `data` when applying `op`. */
    getRowId(data: any, op: TransactionRowOp): string | null | undefined;
    isRowCached(id: string): boolean;
    isAccepted(transaction: ServerSideTransaction): boolean;
    /** Applies a transaction that has already been accepted. */
    apply(transaction: ServerSideTransaction): ServerSideTransactionResult;
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
 */
export function _applyMergedTransactions(
    transactions: ServerSideTransaction[],
    target: TransactionMergeTarget
): ServerSideTransactionResult[] {
    const results: ServerSideTransactionResult[] = new Array(transactions.length);
    let batch = new MergeBatch();
    const flush = () => {
        batch.apply(transactions, target, results);
        batch = new MergeBatch();
    };

    for (let index = 0, len = transactions.length; index < len; ++index) {
        const transaction = transactions[index];
        const entries = target.isAccepted(transaction) ? getMergeableEntries(transaction, target) : undefined;
        if (entries === undefined) {
            results[index] = { status: ServerSideTransactionResultStatus.Cancelled };
        } else if (entries === null) {
            flush();
            results[index] = target.apply(transaction);
        } else {
            if (!batch.canAccept(entries)) {
                flush();
            }
            batch.accept(index, entries, target);
        }
    }
    flush();

    return results;
}

/** Returns `null` when the transaction has to be applied on its own. */
function getMergeableEntries(transaction: ServerSideTransaction, target: TransactionMergeTarget): RowEntry[] | null {
    if (transaction.addIndex != null || transaction.rowCount != null) {
        return null;
    }

    const entries: RowEntry[] = [];
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
                return null;
            }
            entries.push({ op, id, data });
        }
    }
    return entries;
}

/** Matches the order in which the store's object-keyed add map lists ids: array-index keys first, ascending. */
function isArrayIndexKey(id: string): boolean {
    const key = String(id);
    return /^(0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;
}

class MergeBatch {
    private readonly transactionIndexes: number[] = [];
    private readonly contributions: Contribution[] = [];
    private readonly adds = new Map<string, any>();
    private readonly updates = new Map<string, any>();
    private readonly removes = new Map<string, any>();
    private readonly addedBy = new Map<string, number>();
    private readonly generations = new Map<string, number>();
    private maxIndexKeyAdd = -1;
    private hasNamedKeyAdd = false;

    /** Whether the entries can join this batch without changing the outcome of applying it. */
    public canAccept(entries: RowEntry[]): boolean {
        for (let i = 0, len = entries.length; i < len; ++i) {
            const { op, id } = entries[i];
            if (op !== 'add') {
                continue;
            }
            if (this.removes.has(id)) {
                return false;
            }
            if (isArrayIndexKey(id) && (this.hasNamedKeyAdd || Number(id) < this.maxIndexKeyAdd)) {
                return false;
            }
        }
        return true;
    }

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
                if (isArrayIndexKey(id)) {
                    this.maxIndexKeyAdd = Math.max(this.maxIndexKeyAdd, Number(id));
                } else {
                    this.hasNamedKeyAdd = true;
                }
            } else {
                if (adds.has(id)) {
                    adds.delete(id);
                    this.addedBy.delete(id);
                    this.generations.set(id, this.getGeneration(id) + 1);
                    continue;
                }
                if (removes.has(id)) {
                    continue;
                }
                updates.delete(id);
                removes.set(id, data);
            }
            this.contributions.push({ transactionIndex, op, id, generation: this.getGeneration(id) });
        }
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
        if (this.updates.size) {
            merged.update = [...this.updates.values()];
        }
        if (this.adds.size) {
            merged.add = [...this.adds.values()];
        }
        if (this.removes.size) {
            merged.remove = [...this.removes.values()];
        }

        const hasChanges = merged.update || merged.add || merged.remove;
        const result = hasChanges ? target.apply(merged) : { status: ServerSideTransactionResultStatus.Applied };
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
