import type { GridApi, ViewRow, ViewRowRef, ViewSubscriptionOptions } from 'ag-grid-community';

export interface Call {
    type: 'subscribe' | 'unsubscribe';
    ids: string[];
}

type Handlers = Pick<ViewSubscriptionOptions, 'subscribeRows' | 'unsubscribeRows' | 'debounceMs'>;

/**
 * Records handler calls and checks that every subscribed row is unsubscribed exactly once.
 * `handlers` sets `debounceMs` to `0`, so tests that are not about timing get each batch after one task.
 */
export function createRecorder(onCall?: (call: Call) => void) {
    const subscribed = new Map<string, ViewRow>();
    const unsubscribedRefs: ViewRowRef[] = [];
    const calls: Call[] = [];
    const violations: string[] = [];

    const handlers: Handlers = {
        debounceMs: 0,
        subscribeRows(rows) {
            for (const row of rows) {
                if (subscribed.has(row.id)) {
                    violations.push(`subscribed twice: ${row.id}`);
                }
                subscribed.set(row.id, row);
            }
            const call: Call = { type: 'subscribe', ids: rows.map((r) => r.id) };
            calls.push(call);
            onCall?.(call);
        },
        unsubscribeRows(rows) {
            for (const row of rows) {
                if (!subscribed.delete(row.id)) {
                    violations.push(`unsubscribed without subscribe: ${row.id}`);
                }
                unsubscribedRefs.push(row);
            }
            const call: Call = { type: 'unsubscribe', ids: rows.map((r) => r.id) };
            calls.push(call);
            onCall?.(call);
        },
    };

    return {
        handlers,
        subscribed,
        unsubscribedRefs,
        calls,
        violations,
        ids: () => Array.from(subscribed.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        /** The ids of each non-empty call of this type. */
        batches: (type: Call['type']) => calls.filter((c) => c.type === type && c.ids.length).map((c) => c.ids),
    };
}

export type Recorder = ReturnType<typeof createRecorder>;

/** Sets `viewSubscription` on a grid that is already showing rows, which subscribes to the rows in view at once. */
export function subscribe(
    api: GridApi,
    recorder: Recorder,
    options: Omit<ViewSubscriptionOptions, 'subscribeRows' | 'unsubscribeRows'> = {}
): void {
    api.setGridOption('viewSubscription', { ...recorder.handlers, ...options });
}

export function setActive(api: GridApi, active: boolean): void {
    api.setGridOption('viewSubscriptionActive', active);
}

export function range(from: number, to: number): string[] {
    return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

/** Calls the api, returning the warning it throws once the grid is destroyed. */
export function tryApi(call: () => void): string | undefined {
    try {
        call();
        return undefined;
    } catch (e) {
        return (e as Error).message;
    }
}
