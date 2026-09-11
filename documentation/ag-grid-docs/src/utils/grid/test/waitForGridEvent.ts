import type { Page } from 'playwright/test';

import type { AgPublicEventType } from 'ag-grid-community';

/** Shallow match against the dispatched event's own properties. Every listed key must be equal. */
export type GridEventMatch = Record<string, unknown>;

export interface ArmedGridEvent {
    /** Resolves once a matching event has been dispatched since arming, then removes the listener. */
    wait(): Promise<void>;
}

let nextArmedId = 0;

/**
 * Attach a grid event listener before the action that triggers it, so the wait cannot miss an
 * event dispatched between the action and the assertion.
 *
 * Installed through `updateGridOptions`, because `api.addEventListener` requires `EventApiModule`
 * and docs examples do not register it. It therefore occupies the example's own `on<Event>`
 * callback while armed, so avoid it for an event the example under test handles.
 *
 * ```ts
 * const resized = await armGridEvent(page, 'columnResized', { finished: true, source: 'sizeColumnsToFit' });
 * await page.locator('button.add-column-button').click();
 * await resized.wait();
 * ```
 */
export async function armGridEvent(
    page: Page,
    eventType: AgPublicEventType,
    match: GridEventMatch = {},
    gridId: string = '1'
): Promise<ArmedGridEvent> {
    const token = `__agTestEvent${nextArmedId++}`;

    await page.evaluate(
        ({ token, eventType, match, gridId }) => {
            const api = (window as any).getGridApi?.(gridId);
            if (!api) {
                throw new Error(`armGridEvent: getGridApi('${gridId}') returned nothing`);
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

    return {
        async wait() {
            try {
                await page.waitForFunction((token) => (window as any)[token]?.seen === true, token);
            } finally {
                await page.evaluate((token) => {
                    (window as any)[token]?.detach();
                    delete (window as any)[token];
                }, token);
            }
        },
    };
}

/** Run `action` and resolve once the grid reports the matching event. */
export async function withGridEvent(
    page: Page,
    eventType: AgPublicEventType,
    match: GridEventMatch,
    action: () => Promise<unknown>
): Promise<void> {
    const armed = await armGridEvent(page, eventType, match);
    await action();
    await armed.wait();
}
