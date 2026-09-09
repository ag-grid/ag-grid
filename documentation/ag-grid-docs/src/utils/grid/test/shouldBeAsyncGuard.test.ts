import { expect as playwrightExpect } from '@playwright/test';

import { shouldBeAsyncGuard } from './shouldBeAsyncGuard';

// The guarded `expect` that every docs-e2e spec imports from `@utils/grid/test-utils`.
const guarded = shouldBeAsyncGuard<typeof playwrightExpect>(playwrightExpect);

describe('shouldBeAsyncGuard', () => {
    test('is callable', () => {
        expect(typeof guarded).toBe('function');
    });

    // A wrapper that does not proxy Playwright's `expect` drops its statics, and every docs spec
    // calling `expect.poll(...)` then dies on `TypeError: expect.poll is not a function`.
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

    // The missing-`await` error itself is raised from a deferred `setTimeout` as an uncaught
    // exception, so it is not assertable here — the real `.spec.ts` suite is what covers it.
    test('still routes calls through the guard', () => {
        expect(() => guarded(1).toBe(1)).not.toThrow();
        expect(() => guarded(1).toBe(2)).toThrow();
    });
});
