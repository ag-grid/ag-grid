import { describe, expect, it, vi } from 'vitest';

import type { IRowNode, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { ServerSideTransactionResultStatus } from 'ag-grid-community';

import type { TransactionMergeTarget } from './transactionMerger';
import { _applyMergedTransactions, _groupTransactionsByRoute } from './transactionMerger';

interface Row {
    id: string;
    v?: number;
}

/** Mirrors how LazyCache applies one transaction: update, then add (object-keyed, cached ids skipped), then remove. */
class FakeStore {
    public readonly rows: IRowNode[] = [];
    public readonly applied: ServerSideTransaction[] = [];

    constructor(initial: Row[]) {
        for (const data of initial) {
            this.rows.push({ id: data.id, data } as IRowNode);
        }
    }

    public apply(transaction: ServerSideTransaction): ServerSideTransactionResult {
        this.applied.push(transaction);
        const find = (id: string) => this.rows.find((node) => node.id === id);

        const update = (transaction.update ?? []).map((data: Row) => find(data.id)).filter((node) => !!node);
        for (const data of transaction.update ?? []) {
            const node = find(data.id);
            if (node) {
                node.data = data;
            }
        }

        const inserts: { [id: string]: Row } = {};
        for (const data of transaction.add ?? []) {
            if (!find(data.id)) {
                inserts[data.id] = data;
            }
        }
        const add = Object.values(inserts).map((data) => ({ id: data.id, data }) as IRowNode);
        this.rows.push(...add);

        const removeIds = new Set((transaction.remove ?? []).map((data: Row) => data.id));
        const remove = this.rows.filter((node) => removeIds.has(node.id!));
        for (const node of remove) {
            this.rows.splice(this.rows.indexOf(node), 1);
        }

        return {
            status: ServerSideTransactionResultStatus.Applied,
            update: transaction.update?.length ? update : undefined,
            add: transaction.add?.length ? add : undefined,
            remove: transaction.remove?.length ? remove : undefined,
        };
    }

    public target(isAccepted: (tx: ServerSideTransaction) => boolean = () => true): TransactionMergeTarget {
        return {
            getRowId: (data: Row) => data.id,
            isRowCached: (id) => this.rows.some((node) => node.id === id),
            canSkipUpdate: () => true,
            isAccepted,
            apply: (tx) => this.apply(tx),
        };
    }

    public snapshot(): Row[] {
        return this.rows.map((node) => ({ ...node.data }));
    }
}

const row = (id: string, v?: number): Row => (v === undefined ? { id } : { id, v });
const ids = (nodes?: IRowNode[]) => nodes?.map((node) => node.id);

function applySequentially(initial: Row[], transactions: ServerSideTransaction[]): Row[] {
    const store = new FakeStore(initial);
    for (const tx of transactions) {
        store.apply(tx);
    }
    return store.snapshot();
}

function applyMerged(initial: Row[], transactions: ServerSideTransaction[]) {
    const store = new FakeStore(initial);
    const results = _applyMergedTransactions(transactions, store.target());
    return { store, results, rows: store.snapshot() };
}

describe('_applyMergedTransactions', () => {
    const initial = [row('a', 0), row('b', 0)];

    it.each<[string, ServerSideTransaction[], ServerSideTransaction[]]>([
        ['update + update', [{ update: [row('a', 1)] }, { update: [row('a', 2)] }], [{ update: [row('a', 2)] }]],
        ['add + update', [{ add: [row('c', 1)] }, { update: [row('c', 2)] }], [{ add: [row('c', 2)] }]],
        ['add + remove', [{ add: [row('c', 1)] }, { remove: [row('c')] }], []],
        ['update + remove', [{ update: [row('a', 1)] }, { remove: [row('a')] }], [{ remove: [row('a')] }]],
        [
            'add of a cached row + update',
            [{ add: [row('a', 1)] }, { update: [row('a', 2)] }],
            [{ update: [row('a', 2)] }],
        ],
        ['add of a cached row + remove', [{ add: [row('a', 1)] }, { remove: [row('a')] }], [{ remove: [row('a')] }]],
        ['add + add', [{ add: [row('c', 1)] }, { add: [row('c', 2)] }], [{ add: [row('c', 1)] }]],
        [
            'update of an uncached row',
            [{ update: [row('z', 1)] }, { update: [row('a', 1)] }],
            [{ update: [row('a', 1)] }],
        ],
        ['remove + update', [{ remove: [row('a')] }, { update: [row('a', 1)] }], [{ remove: [row('a')] }]],
        ['remove + remove', [{ remove: [row('a')] }, { remove: [row('a')] }], [{ remove: [row('a')] }]],
        [
            'remove + add starts a new batch',
            [{ remove: [row('a')] }, { add: [row('a', 1)] }],
            [{ remove: [row('a')] }, { add: [row('a', 1)] }],
        ],
        [
            'addIndex is applied on its own',
            [{ update: [row('a', 1)] }, { add: [row('c')], addIndex: 0 }, { update: [row('a', 2)] }],
            [{ update: [row('a', 1)] }, { add: [row('c')], addIndex: 0 }, { update: [row('a', 2)] }],
        ],
        [
            'an index-like id added before a lower one starts a new batch',
            [{ add: [row('10')] }, { add: [row('2')] }],
            [{ add: [row('10')] }, { add: [row('2')] }],
        ],
        [
            'index-like ids added in ascending order share a batch',
            [{ add: [row('2')] }, { add: [row('10')] }, { add: [row('x')] }],
            [{ add: [row('2'), row('10'), row('x')] }],
        ],
    ])('%s', (_name, transactions, expectedApplied) => {
        const { store, rows } = applyMerged(initial, transactions);

        expect(store.applied).toEqual(expectedApplied);
        expect(rows).toEqual(applySequentially(initial, transactions));
    });

    it('reports each caller only the nodes for its own rows, under the op it asked for', () => {
        const { results } = applyMerged(initial, [
            { update: [row('a', 1)] },
            { add: [row('c', 1)], update: [row('a', 2)] },
            { update: [row('c', 2)] },
            { add: [row('d')] },
            { remove: [row('d'), row('b')] },
        ]);

        expect(results.map((r) => r.status)).toEqual(Array(5).fill(ServerSideTransactionResultStatus.Applied));
        expect(results.map((r) => [ids(r.update), ids(r.add), ids(r.remove)])).toEqual([
            [['a'], undefined, undefined],
            [['a'], ['c'], undefined],
            [['c'], undefined, undefined],
            [undefined, ['d'], undefined],
            [undefined, undefined, ['b', 'd']],
        ]);
    });

    it('does not report a removed-then-added row to callers of the removed one', () => {
        const { results } = applyMerged(
            [],
            [{ add: [row('c', 1)] }, { update: [row('c', 2)] }, { remove: [row('c')] }, { add: [row('c', 3)] }]
        );

        expect(results.map((r) => [ids(r.update), ids(r.add), ids(r.remove)])).toEqual([
            [undefined, [], undefined],
            [[], undefined, undefined],
            [undefined, undefined, []],
            [undefined, ['c'], undefined],
        ]);
    });

    it('asks isApplyServerSideTransaction once per transaction and leaves rejected ones out', () => {
        const store = new FakeStore(initial);
        const isAccepted = vi.fn((tx: ServerSideTransaction) => tx.update?.[0].v !== 2);

        const results = _applyMergedTransactions(
            [{ update: [row('a', 1)] }, { update: [row('a', 2)] }, { update: [row('b', 3)] }],
            store.target(isAccepted)
        );

        expect(isAccepted).toHaveBeenCalledTimes(3);
        expect(results.map((r) => r.status)).toEqual([
            ServerSideTransactionResultStatus.Applied,
            ServerSideTransactionResultStatus.Cancelled,
            ServerSideTransactionResultStatus.Applied,
        ]);
        expect(store.applied).toEqual([{ update: [row('a', 1), row('b', 3)] }]);
    });

    it('accepts each batch against the store as left by the earlier batches', () => {
        const store = new FakeStore(initial);
        const seen: (number | undefined)[] = [];
        const isAccepted = (_tx: ServerSideTransaction) => {
            seen.push(store.snapshot().find((data) => data.id === 'a')?.v);
            return true;
        };

        _applyMergedTransactions(
            [{ update: [row('a', 1)] }, { remove: [row('a')] }, { add: [row('a', 2)] }, { update: [row('a', 3)] }],
            store.target(isAccepted)
        );

        expect(seen).toEqual([0, 0, undefined, undefined]);
        expect(store.applied).toEqual([{ remove: [row('a')] }, { add: [row('a', 3)] }]);
    });

    it('accepts a transaction split out for its mixed removes after applying the batch before it', () => {
        const store = new FakeStore(initial);
        const seen: (number | undefined)[] = [];
        const isAccepted = (_tx: ServerSideTransaction) => {
            seen.push(store.snapshot().find((data) => data.id === 'a')?.v);
            return true;
        };

        _applyMergedTransactions(
            [{ update: [row('a', 1)] }, { remove: [row('b'), row('z')] }],
            store.target(isAccepted)
        );

        expect(seen).toEqual([0, 1]);
        expect(store.applied).toEqual([{ update: [row('a', 1)] }, { remove: [row('b'), row('z')] }]);
    });

    it('applies an update on its own when the update it replaces has effects of its own', () => {
        const store = new FakeStore(initial);
        const target = { ...store.target(), canSkipUpdate: (previous: Row) => previous.v !== 1 };

        _applyMergedTransactions(
            [{ update: [row('a', 1)] }, { update: [row('a', 2)] }, { update: [row('a', 3)] }],
            target
        );

        expect(store.applied).toEqual([{ update: [row('a', 1)] }, { update: [row('a', 3)] }]);
    });

    it('matches applying the transactions one after the other for random streams', () => {
        let seed = 7;
        const random = (n: number) => {
            seed = (seed * 1103515245 + 12345) % 2147483648;
            return seed % n;
        };
        const pool = ['1', '2', '10', 'a', 'b', 'c'];
        const ops = ['add', 'update', 'remove'] as const;

        for (let run = 0; run < 300; ++run) {
            const start = pool.filter(() => random(2) === 0).map((id) => row(id, 0));
            const transactions: ServerSideTransaction[] = [];
            for (let t = 0, count = 1 + random(6); t < count; ++t) {
                const tx: ServerSideTransaction = {};
                for (let r = 0, rowCount = 1 + random(3); r < rowCount; ++r) {
                    const op = ops[random(3)];
                    (tx[op] ??= []).push(row(pool[random(pool.length)], run * 100 + t * 10 + r));
                }
                transactions.push(tx);
            }

            expect(applyMerged(start, transactions).rows).toEqual(applySequentially(start, transactions));
        }
    });
});

describe('_groupTransactionsByRoute', () => {
    const removes = (tx: ServerSideTransaction) => !!tx.remove?.length;
    const indexes = (
        transactions: ServerSideTransaction[],
        canChangeChildStores: (tx: ServerSideTransaction) => boolean = removes
    ) => _groupTransactionsByRoute(transactions, canChangeChildStores).map((group) => [group.route, group.indexes]);

    it('groups interleaved routes in first-seen order', () => {
        expect(
            indexes([{ route: ['x'] }, { route: ['y'] }, { route: ['x'] }, {}, { route: [] }, { route: ['y'] }])
        ).toEqual([
            [['x'], [0, 2]],
            [['y'], [1, 5]],
            [undefined, [3, 4]],
        ]);
    });

    it('starts new groups when a removal follows transactions for child routes', () => {
        expect(
            indexes([
                { update: [row('a')] },
                { route: ['g'], update: [row('b')] },
                { remove: [row('g')] },
                { route: ['g'], update: [row('b')] },
            ])
        ).toEqual([
            [undefined, [0]],
            [['g'], [1]],
            [undefined, [2]],
            [['g'], [3]],
        ]);
    });

    it('starts new groups when an update that can change child stores follows transactions for child routes', () => {
        const transactions: ServerSideTransaction[] = [
            { update: [row('a')] },
            { route: ['g'], update: [row('b')] },
            { update: [row('g')] },
        ];

        expect(indexes(transactions)).toEqual([
            [undefined, [0, 2]],
            [['g'], [1]],
        ]);
        expect(indexes(transactions, (tx) => removes(tx) || !!tx.update?.length)).toEqual([
            [undefined, [0]],
            [['g'], [1]],
            [undefined, [2]],
        ]);
    });

    it('keeps grouping when a removal has no pending child routes', () => {
        expect(indexes([{ update: [row('a')] }, { route: ['g'] }, { route: ['h'], remove: [row('b')] }, {}])).toEqual([
            [undefined, [0, 3]],
            [['g'], [1]],
            [['h'], [2]],
        ]);
    });
});
