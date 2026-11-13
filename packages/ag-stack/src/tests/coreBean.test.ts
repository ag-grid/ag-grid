// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { AgAbstractBean } from '../core/agAbstractBean';

describe('a bean without a DOM', () => {
    it('subscribes to a plain emitter and runs its destroy functions', () => {
        class Bean extends AgAbstractBean<any, any, any, any> {}
        const bean = new Bean();
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        const onDestroy = vi.fn();

        bean.addDestroyFunc(onDestroy);
        const [detach] = bean.addManagedListeners({ addEventListener, removeEventListener }, { changed: vi.fn() });

        expect(addEventListener).toHaveBeenCalledWith('changed', expect.any(Function));
        detach();
        expect(removeEventListener).toHaveBeenCalledWith('changed', expect.any(Function));

        bean.destroy();
        expect(onDestroy).toHaveBeenCalledOnce();
    });
});
