import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServerSideTransactionResult } from 'ag-grid-community';
import { ServerSideTransactionResultStatus } from 'ag-grid-community';

import { TransactionManager } from './transactionManager';

/**
 * Minimal unit coverage for two async-transaction flush branches that are NOT observable through
 * the public grid API (verified against a real SSRM grid in
 * testing/behavioural/src/row-data/ssrm-async-transactions.test.ts):
 *
 *   - StoreLoading retry: no live store implementation returns a StoreLoading result — applying to a
 *     mid-load child store reports Applied — so the requeue-and-retry branch cannot be exercised
 *     end-to-end. It is real manager logic and is pinned here directly.
 *   - StoreNotStarted: executeOnStore only returns false before the row model has started, which the
 *     public API never surfaces (queued transactions flush after start, reporting Applied).
 *
 * The remaining flush behaviours (deferred callback, no data-change-without-flush-event, StoreNotFound)
 * are covered as black-box behavioural tests and are deliberately not duplicated here.
 */
describe('TransactionManager internal flush branches', () => {
    let manager: TransactionManager;
    let dispatchEvent: ReturnType<typeof vi.fn>;
    let executeOnStore: ReturnType<typeof vi.fn>;

    // executeOnStore(route, cb) invokes cb(cache) when the store has started; cache.applyTransaction
    // returns the programmed result. Returning false models a store that has not started. `results`
    // is consumed one-per-flush in queue order.
    function programStore(results: Array<{ hasStarted: boolean; result?: ServerSideTransactionResult }>): void {
        let call = 0;
        executeOnStore.mockImplementation((_route: any, cb: (cache: any) => void) => {
            const programmed = results[call++];
            if (programmed.hasStarted) {
                cb({ applyTransaction: () => programmed.result });
            }
            return programmed.hasStarted;
        });
    }

    beforeEach(() => {
        vi.useFakeTimers();
        dispatchEvent = vi.fn();
        executeOnStore = vi.fn();

        manager = new TransactionManager();
        manager['gos'] = { get: () => 50 } as any;
        manager['eventSvc'] = { dispatchEvent } as any;
        manager['valueCache'] = { onDataChanged: vi.fn() } as any;
        manager['serverSideRowModel'] = { executeOnStore } as any;
        manager['selectionSvc'] = undefined;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const dispatchedTypes = () => dispatchEvent.mock.calls.map((c) => c[0].type);

    it('requeues a StoreLoading transaction and applies it on a later flush', () => {
        programStore([{ hasStarted: true, result: { status: ServerSideTransactionResultStatus.StoreLoading } }]);
        const callback = vi.fn();

        manager.applyTransactionAsync({ route: [] } as any, callback);
        manager.flushAsyncTransactions();

        // Nothing applied: only the flush event fires and the callback is not invoked.
        expect(dispatchedTypes()).toEqual(['asyncTransactionsFlushed']);
        vi.advanceTimersByTime(0);
        expect(callback).not.toHaveBeenCalled();

        // The loading transaction was requeued: a subsequent flush (store now ready) applies it.
        dispatchEvent.mockClear();
        programStore([{ hasStarted: true, result: { status: ServerSideTransactionResultStatus.Applied } }]);
        manager.flushAsyncTransactions();

        expect(dispatchedTypes()).toEqual(['storeUpdated', 'asyncTransactionsFlushed']);
        vi.advanceTimersByTime(0);
        expect(callback).toHaveBeenCalledWith({ status: ServerSideTransactionResultStatus.Applied });
    });

    it('reports StoreNotStarted when the store has not started', () => {
        programStore([{ hasStarted: false }]);
        const callback = vi.fn();

        manager.applyTransactionAsync({ route: [] } as any, callback);
        manager.flushAsyncTransactions();

        vi.advanceTimersByTime(0);
        expect(callback).toHaveBeenCalledWith({ status: ServerSideTransactionResultStatus.StoreNotStarted });
        expect(dispatchedTypes()).toEqual(['asyncTransactionsFlushed']);
    });
});
