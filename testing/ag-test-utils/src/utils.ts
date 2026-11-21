import { vi } from 'vitest';

const log = console.log;
const info = console.info;

export { log, info };

/** Resolves after the next animation frame — use to wait for an animation-frame-driven re-render to settle. */
export function nextAnimationFrame(): Promise<number> {
    return new Promise(requestAnimationFrame);
}

/** Runs `action` on a fake clock, then every timer and frame it queued, so a refresh queued late is counted too. */
export async function runToIdle(action: () => void): Promise<void> {
    vi.useFakeTimers({
        toFake: [
            'setTimeout',
            'clearTimeout',
            'setInterval',
            'clearInterval',
            'requestAnimationFrame',
            'cancelAnimationFrame',
        ],
    });
    try {
        action();
        await vi.runAllTimersAsync();
    } finally {
        vi.useRealTimers();
    }
}
