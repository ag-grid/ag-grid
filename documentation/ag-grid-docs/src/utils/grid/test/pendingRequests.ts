import type { Page, Request } from '@playwright/test';

import { isAbandoned } from './routeGuard';

/** Bounded: an example that never goes quiet must not cost every test the full wait. */
const SETTLE_TIMEOUT_MS = 1000;
const POLL_MS = 20;

/** A request cancelled without a terminal event would otherwise stall every later settle and excuse it. */
const STALE_MS = 5000;

/** Only a data fetch can carry row data, so a font or image in flight says nothing about the race. */
const DATA_RESOURCE_TYPES = ['fetch', 'xhr'];

/** Yields a macrotask inside the page, which flushes the promise chain a delivered response resolves. */
async function flushPageTasks(page: Page): Promise<void> {
    try {
        // `react-test/test-tear-down` deliberately sets `window.setTimeout = undefined` to simulate
        // vitest removing the DOM API between tests, so this cannot assume the timer globals exist.
        await page.evaluate(
            () =>
                new Promise<void>((resolve) => {
                    if (typeof setTimeout === 'function') {
                        setTimeout(resolve);
                    } else {
                        resolve();
                    }
                })
        );
    } catch (error) {
        if (!isAbandoned(error)) {
            throw error;
        }
    }
}

/**
 * An example fetching its rows applies them in a `.then`, which must run before the grid is destroyed.
 * Keeps no reference to the page: the suite holds a tracker per describe for the whole worker run, and
 * capturing the page there would pin every closed page and its context graph.
 */
export class PendingRequests {
    private readonly startedAt = new Map<Request, number>();
    private sawDataRequest = false;

    constructor(page: Page) {
        const done = (request: Request) => this.startedAt.delete(request);
        page.on('request', (request) => {
            if (DATA_RESOURCE_TYPES.includes(request.resourceType())) {
                this.startedAt.set(request, Date.now());
                this.sawDataRequest = true;
            }
        });
        page.on('requestfinished', done);
        page.on('requestfailed', done);
    }

    /** False means a destroyed-grid warning afterwards cannot be the row-data race, so it is a real leak. */
    public async settle(page: Page): Promise<boolean> {
        // No data request in the whole test: nothing to settle, and nothing a warning could be blamed on.
        if (!this.sawDataRequest) {
            return false;
        }
        this.dropStale();
        const deadline = Date.now() + SETTLE_TIMEOUT_MS;
        let sawPending = false;
        while (Date.now() < deadline) {
            if (this.startedAt.size > 0) {
                sawPending = true;
                await new Promise((resolve) => setTimeout(resolve, POLL_MS));
                continue;
            }
            // `requestfinished` fires before the page has applied the response, and applying it can
            // start the next request - so an empty set is only quiet once a flush leaves it empty.
            await flushPageTasks(page);
            if (this.startedAt.size === 0) {
                return sawPending;
            }
        }
        await flushPageTasks(page);
        this.startedAt.clear();
        return true;
    }

    /** Aborted requests can go without a terminal event, so age them out rather than wait on them forever. */
    private dropStale(): void {
        const cutoff = Date.now() - STALE_MS;
        for (const [request, started] of this.startedAt) {
            if (started < cutoff) {
                this.startedAt.delete(request);
            }
        }
    }
}
