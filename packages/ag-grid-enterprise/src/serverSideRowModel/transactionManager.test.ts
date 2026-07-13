import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ServerSideTransactionResult } from 'ag-grid-community';
import { ServerSideTransactionResultStatus } from 'ag-grid-community';

import { TransactionManager } from './transactionManager';

// Unit coverage for the async-transaction flush pipeline, which batches queued transactions, retries those
// whose store is still loading, defers user callbacks to the next VM turn, and only signals a data change when
// something actually applied. None of this was previously unit-tested.
describe('TransactionManager.executeAsyncTransactions', () => {
    let manager: TransactionManager;
    let dispatchEvent: ReturnType<typeof vi.fn>;
    let onDataChanged: ReturnType<typeof vi.fn>;
    let executeOnStore: ReturnType<typeof vi.fn>;

    // executeOnStore(route, cb) invokes cb(cache); cache.applyTransaction returns the queued result. Returning
    // false models a store that hasn't started. `results` is consumed one-per-transaction in queue order.
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
        onDataChanged = vi.fn();
        executeOnStore = vi.fn();

        manager = new TransactionManager();
        manager['gos'] = { get: () => 50 } as any;
        manager['eventSvc'] = { dispatchEvent } as any;
        manager['valueCache'] = { onDataChanged } as any;
        manager['serverSideRowModel'] = { executeOnStore } as any;
        manager['selectionSvc'] = undefined;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const dispatchedTypes = () => dispatchEvent.mock.calls.map((c) => c[0].type);

    it('applies a transaction: signals data change and flushes results, invoking the callback asynchronously', () => {
        programStore([{ hasStarted: true, result: { status: ServerSideTransactionResultStatus.Applied } }]);
        const callback = vi.fn();

        manager.applyTransactionAsync({ route: [] } as any, callback);
        manager.flushAsyncTransactions();

        // data-change + flush events fire synchronously during the flush
        expect(onDataChanged).toHaveBeenCalledTimes(1);
        expect(dispatchedTypes()).toEqual(['storeUpdated', 'asyncTransactionsFlushed']);

        // the user callback is deferred to the next VM turn, not run inline
        expect(callback).not.toHaveBeenCalled();
        vi.advanceTimersByTime(0);
        expect(callback).toHaveBeenCalledWith({ status: ServerSideTransactionResultStatus.Applied });
    });

    it('does not signal a data change when no transaction applied, but still emits the flush event', () => {
        // store found but transaction produced no result -> StoreNotFound, nothing applied
        programStore([{ hasStarted: true, result: undefined }]);

        manager.applyTransactionAsync({ route: [] } as any);
        manager.flushAsyncTransactions();

        expect(onDataChanged).not.toHaveBeenCalled();
        expect(dispatchedTypes()).toEqual(['asyncTransactionsFlushed']);
    });

    it('retries a transaction whose store is still loading rather than applying or calling back', () => {
        programStore([{ hasStarted: true, result: { status: ServerSideTransactionResultStatus.StoreLoading } }]);
        const callback = vi.fn();

        manager.applyTransactionAsync({ route: [] } as any, callback);
        manager.flushAsyncTransactions();

        // nothing applied -> no data change; flush event still reports the loading result
        expect(onDataChanged).not.toHaveBeenCalled();
        expect(dispatchedTypes()).toEqual(['asyncTransactionsFlushed']);
        vi.advanceTimersByTime(0);
        expect(callback).not.toHaveBeenCalled();

        // the loading transaction is requeued: a subsequent flush (store now ready) applies it
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
        expect(onDataChanged).not.toHaveBeenCalled();
    });
});
