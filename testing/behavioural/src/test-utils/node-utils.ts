import { setTimeout as __asyncSetTimeout } from 'timers/promises';
import { vitest } from 'vitest';

export const asyncSetTimeout = __asyncSetTimeout;

export async function flushFakeTimers() {
    vitest.advanceTimersByTime(10000);
    vitest.useRealTimers();
    await asyncSetTimeout(2);
}
