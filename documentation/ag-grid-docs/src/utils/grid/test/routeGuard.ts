import type { Route } from '@playwright/test';

/**
 * Playwright's wording for a request the browser no longer wants an answer to: the page navigated, the
 * example reloaded, or the test ended with the fetch still in flight. Matched on the message because these
 * arrive as plain errors, and only these - anything else is a real fault in a handler and must still fail.
 */
const ABANDONED = /has been disposed|Target page, context or browser has been closed|Request context disposed/;

const isAbandoned = (error: unknown): boolean => ABANDONED.test(error instanceof Error ? error.message : '');

/**
 * Runs a route handler, abandoning it if the request stops mattering part-way through. A `test.skip` or
 * `test.fixme` inside a test body is the usual way here: the fixture has already navigated, so the page
 * closes with the example's own modules still arriving, and every call in the handler then rejects. That
 * is the test declining to run, not a fault, and reporting it as one hides which tests are really skipped.
 */
export function whileTheRequestMatters(handler: (route: Route) => Promise<void>) {
    return async (route: Route): Promise<void> => {
        try {
            await handler(route);
        } catch (error) {
            if (!isAbandoned(error)) {
                throw error;
            }
            await route.abort('aborted').catch(() => undefined);
        }
    };
}
