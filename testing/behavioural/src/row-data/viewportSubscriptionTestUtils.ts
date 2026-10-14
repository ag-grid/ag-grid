import type { GridApi, ViewportRow, ViewportRowRef, ViewportSubscriptionOptions } from 'ag-grid-community';

export interface Call {
    type: 'subscribe' | 'unsubscribe';
    ids: string[];
}

type Handlers = Pick<ViewportSubscriptionOptions, 'onSubscribe' | 'onUnsubscribe'>;

/** Records handler calls and checks that every subscribed row is unsubscribed exactly once. */
export function createRecorder(onCall?: (call: Call) => void) {
    const subscribed = new Map<string, ViewportRow>();
    const unsubscribedRefs: ViewportRowRef[] = [];
    const calls: Call[] = [];
    const violations: string[] = [];

    const handlers: Handlers = {
        onSubscribe(rows) {
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
        onUnsubscribe(rows) {
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

/** Sets `viewportSubscription` on a grid that is already showing rows, which subscribes to the rows in view at once. */
export function subscribe(
    api: GridApi,
    recorder: Recorder,
    options: Omit<ViewportSubscriptionOptions, 'onSubscribe' | 'onUnsubscribe'> = {}
): void {
    api.setGridOption('viewportSubscription', { ...recorder.handlers, ...options });
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
