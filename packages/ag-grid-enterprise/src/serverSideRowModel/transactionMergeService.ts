import type { NamedBean, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { BeanStub, _getRowIdCallback } from 'ag-grid-community';

import type { LazyStore } from './stores/lazy/lazyStore';
import { _applyMergedTransactions, _groupTransactionsByRoute } from './transactionMerger';

export type ApplyOnStore = (
    route: string[] | undefined,
    count: number,
    apply: (store: LazyStore) => ServerSideTransactionResult[]
) => ServerSideTransactionResult[];

export class TransactionMergeService extends BeanStub implements NamedBean {
    beanName = 'ssrmTxnMerger' as const;

    /**
     * Applies queued async transactions so that each row changes at most once per batch, with the same outcome
     * as applying them one after the other.
     *
     * @returns one result per transaction, or `undefined` when they have to be applied one after the other
     */
    public applyTransactions(
        transactions: ServerSideTransaction[],
        applyOnStore: ApplyOnStore
    ): ServerSideTransactionResult[] | undefined {
        const gos = this.gos;
        if (
            !gos.get('serverSideMergeAsyncTransactions') ||
            // a fully loaded store re-sorts after every transaction, and the sort is stable, so ties depend on it
            gos.get('serverSideEnableClientSideSort')
        ) {
            return undefined;
        }

        // tree data updates can turn a group into a leaf or change its key, which affects its child routes
        const treeData = gos.get('treeData');
        const groups = _groupTransactionsByRoute(
            transactions,
            (transaction) => !!transaction.remove?.length || (treeData && !!transaction.update?.length)
        );

        const results: ServerSideTransactionResult[] = new Array(transactions.length);
        for (let i = 0, len = groups.length; i < len; ++i) {
            const { route, indexes } = groups[i];
            const groupTransactions = indexes.map((index) => transactions[index]);
            const groupResults = applyOnStore(route, groupTransactions.length, (store) =>
                this.applyToStore(store, groupTransactions)
            );
            for (let j = 0, groupLen = indexes.length; j < groupLen; ++j) {
                results[indexes[j]] = groupResults[j];
            }
        }
        return results;
    }

    private applyToStore(store: LazyStore, transactions: ServerSideTransaction[]): ServerSideTransactionResult[] {
        const idFunc = _getRowIdCallback(this.beans);
        if (!idFunc) {
            return transactions.map((transaction) => store.applyTransaction(transaction));
        }

        const cache = store.getCache();
        return _applyMergedTransactions(transactions, {
            getRowId: (data, op) => (op === 'remove' ? store.getRemoveRowId(idFunc, data) : cache.getRowId(data)),
            isRowCached: (id) => cache.isNodeInCache(id),
            isAccepted: (transaction) => store.isTransactionAccepted(transaction),
            apply: (transaction, rowIds) => store.applyAcceptedTransaction(transaction, idFunc, rowIds),
        });
    }
}
