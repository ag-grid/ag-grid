import { setTimeout as __asyncSetTimeout } from 'timers/promises';

export const asyncSetTimeout = __asyncSetTimeout;

export async function flushJestTimers() {
    jest.advanceTimersByTime(10000);
    jest.useRealTimers();
    await asyncSetTimeout(1);
}
