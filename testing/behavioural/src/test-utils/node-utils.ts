import { setTimeout as __asyncSetTimeout } from 'timers/promises';
import { vitest } from 'vitest';

export const asyncSetTimeout = __asyncSetTimeout;

/**
 * Missing-module errors are debounced and batched (50ms window) before being logged/captured. Await this
 * after creating a grid to let that combined error fire, before asserting on it.
 */
// eslint-disable-next-line no-restricted-syntax -- waits out the grid's 50ms missing-module report debounce window
export const waitForMissingModuleReports = () => asyncSetTimeout(60);

export async function flushFakeTimers() {
    vitest.advanceTimersByTime(10000);
    vitest.useRealTimers();
    // eslint-disable-next-line no-restricted-syntax -- waits for the real timer queue to drain after switching off fake timers
    await asyncSetTimeout(2);
}
