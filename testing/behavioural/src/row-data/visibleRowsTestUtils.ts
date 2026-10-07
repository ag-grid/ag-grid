import type { VisibleRowRef, VisibleRowsHandlers, VisibleRowsReason } from 'ag-grid-community';

export interface Call {
    type: 'subscribe' | 'unsubscribe';
    reason: VisibleRowsReason;
    ids: string[];
}

/** Records handler calls and checks that every subscribed row is unsubscribed exactly once. */
export function createRecorder(onCall?: (call: Call) => void) {
    const subscribed = new Map<string, VisibleRowRef>();
    const calls: Call[] = [];
    const violations: string[] = [];

    const handlers: VisibleRowsHandlers = {
        onSubscribe(rows, params) {
            for (const row of rows) {
                if (subscribed.has(row.id)) {
                    violations.push(`subscribed twice: ${row.id}`);
                }
                subscribed.set(row.id, row);
            }
            const call: Call = { type: 'subscribe', reason: params.reason, ids: rows.map((r) => r.id) };
            calls.push(call);
            onCall?.(call);
        },
        onUnsubscribe(rows, params) {
            for (const row of rows) {
                if (!subscribed.delete(row.id)) {
                    violations.push(`unsubscribed without subscribe: ${row.id}`);
                }
            }
            const call: Call = { type: 'unsubscribe', reason: params.reason, ids: rows.map((r) => r.id) };
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
        reasons: (type: Call['type']) => calls.filter((c) => c.type === type && c.ids.length).map((c) => c.reason),
    };
}

export function range(from: number, to: number): string[] {
    return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}
