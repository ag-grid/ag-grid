import type { VisibleRowRef, VisibleRowsHandlers } from 'ag-grid-community';

export interface Call {
    type: 'subscribe' | 'unsubscribe';
    ids: string[];
}

/** Records handler calls and checks that every subscribed row is unsubscribed exactly once. */
export function createRecorder(onCall?: (call: Call) => void) {
    const subscribed = new Map<string, VisibleRowRef>();
    const calls: Call[] = [];
    const violations: string[] = [];

    const handlers: VisibleRowsHandlers = {
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
            }
            const call: Call = { type: 'unsubscribe', ids: rows.map((r) => r.id) };
            calls.push(call);
            onCall?.(call);
        },
    };

    return {
        handlers,
        subscribed,
        calls,
        violations,
        ids: () => Array.from(subscribed.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        /** The ids of each non-empty call of this type. */
        batches: (type: Call['type']) => calls.filter((c) => c.type === type && c.ids.length).map((c) => c.ids),
    };
}

export function range(from: number, to: number): string[] {
    return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}
