// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { LocalEventService } from '../events/localEventService';

describe('LocalEventService without a DOM', () => {
    it('dispatches synchronously', () => {
        const svc = new LocalEventService<'changed'>();
        const listener = vi.fn();
        svc.addEventListener('changed', listener);

        svc.dispatchEvent({ type: 'changed' });

        expect(listener).toHaveBeenCalledOnce();
    });

    it('dispatches asynchronously, where a `window.setTimeout` would have thrown', async () => {
        const svc = new LocalEventService<'changed'>();
        const listener = vi.fn();
        svc.addEventListener('changed', listener, true);

        svc.dispatchEvent({ type: 'changed' });
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(listener).toHaveBeenCalledOnce();
    });

    it('dispatches an event carrying a source event where the host has no `Event` global', () => {
        vi.stubGlobal('Event', undefined);
        try {
            const svc = new LocalEventService<'changed'>();
            const listener = vi.fn();
            svc.addEventListener('changed', listener);

            svc.dispatchEvent({ type: 'changed', event: {} } as { type: 'changed' });

            expect(listener).toHaveBeenCalledOnce();
        } finally {
            vi.unstubAllGlobals();
        }
    });
});
