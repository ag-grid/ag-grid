import { expect as playwrightExpect } from '@playwright/test';

import { shouldBeAsyncGuard } from './shouldBeAsyncGuard';

// The guarded `expect` that every docs-e2e spec imports from `@utils/grid/test-utils`.
const guarded = shouldBeAsyncGuard<typeof playwrightExpect>(playwrightExpect);

describe('shouldBeAsyncGuard', () => {
    test('is callable', () => {
        expect(typeof guarded).toBe('function');
    });

    // AG-18466: the wrapper used to return a bare function, so every static off Playwright's
    // `expect` was `undefined` and `expect.poll(...)` threw `TypeError: expect.poll is not a function`.
    test('forwards expect.poll', async () => {
        expect(typeof guarded.poll).toBe('function');

        await guarded.poll(() => 3).toBeLessThan(150);
    });

    test('forwards the rest of the static surface', () => {
        // `not` is a matcher namespace object rather than a function, hence presence not callability.
        expect(guarded.not).toBeDefined();

        for (const name of ['soft', 'configure', 'extend', 'objectContaining', 'any', 'anything'] as const) {
            expect(typeof guarded[name]).toBe('function');
        }
    });

    // The `apply` trap must still route calls through the missing-`await` guard. The guard's own error
    // is raised from a deferred `setTimeout` as an uncaught exception, so it is not assertable here —
    // its remaining coverage is the unchanged guard body plus the real spec suite.
    test('still routes calls through the guard', () => {
        expect(() => guarded(1).toBe(1)).not.toThrow();
        expect(() => guarded(1).toBe(2)).toThrow();
    });
});
