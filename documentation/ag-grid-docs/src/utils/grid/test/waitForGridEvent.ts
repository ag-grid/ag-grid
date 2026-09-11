import type { Page } from 'playwright/test';

import type { AgPublicEventType } from 'ag-grid-community';

/** Shallow match against the dispatched event's own properties. Every listed key must be equal. */
type GridEventMatch = Record<string, unknown>;

let nextArmedId = 0;

/**
 * Run `action` and resolve once the grid dispatches a matching event. The listener is attached
 * before `action` runs, so the wait cannot miss an event dispatched before it starts.
 *
 * Attached through `updateGridOptions`, because `api.addEventListener` requires `EventApiModule`
 * and docs examples do not register it. It therefore occupies the example's own `on<Event>`
 * callback while armed, so avoid it for an event the example under test handles.
 *
 * ```ts
 * await withGridEvent(page, 'columnResized', { finished: true, source: 'sizeColumnsToFit' }, () =>
 *     page.locator('button.add-column-button').click()
 * );
 * ```
 */
export async function withGridEvent(
    page: Page,
    eventType: AgPublicEventType,
    match: GridEventMatch,
    action: () => Promise<unknown>,
    gridId: string = '1'
): Promise<void> {
    const token = `__agTestEvent${nextArmedId++}`;

    await page.evaluate(
        ({ token, eventType, match, gridId }) => {
            const api = (window as any).getGridApi?.(gridId);
            if (!api) {
                throw new Error(`withGridEvent: getGridApi('${gridId}') returned nothing`);
            }

            const callbackKey = `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;
            (window as any)[token] = {
                seen: false,
                detach: () => api.updateGridOptions({ [callbackKey]: undefined }),
            };

            api.updateGridOptions({
                [callbackKey]: (event: any) => {
                    if (Object.entries(match).every(([key, value]) => event[key] === value)) {
                        (window as any)[token].seen = true;
                    }
                },
            });
        },
        { token, eventType, match, gridId }
    );

    try {
        await action();
        await page.waitForFunction((token) => (window as any)[token]?.seen === true, token);
    } finally {
        await page.evaluate((token) => {
            (window as any)[token]?.detach();
            delete (window as any)[token];
        }, token);
    }
}
