import type { Page } from 'playwright/test';

import type { AgPublicEventType } from 'ag-grid-community';

/** Shallow match against the dispatched event's own properties. Every listed key must be equal. */
export type GridEventMatch = Record<string, unknown>;

export interface ArmedGridEvent {
    /**
     * Resolves once the grid has dispatched a matching event since {@link armGridEvent} was called,
     * then removes the listener.
     */
    wait(): Promise<void>;
}

let nextArmedId = 0;

/**
 * Attach a grid event listener *before* the action that triggers it, so the wait can never miss an
 * event dispatched between the action and the assertion.
 *
 * This exists because sampling the DOM until it changes cannot tell "the grid has finished" from
 * "the grid is part-way through": a width read during a resize animation, or between two passes of
 * a debounced auto-size, is a real change that is not the end state. The grid says when it is done,
 * so wait for it to say so.
 *
 * The listener goes on through `updateGridOptions`, not `api.addEventListener` - the latter needs
 * `EventApiModule`, which a docs example has no reason to register. That means it occupies the
 * example's own `on<Event>` callback for the duration, so do not use it for an event the example
 * under test handles itself.
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

/**
 * Run `action` and resolve only once the grid reports the matching event. Prefer this to arming and
 * waiting by hand: it cannot be got wrong in the one way that matters, arming too late.
 */
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
