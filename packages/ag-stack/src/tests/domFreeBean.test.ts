// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { AgAbstractBean } from '../core/agAbstractBean';
import { AgAbstractUiBean } from '../core/agAbstractUiBean';

describe('a bean without a DOM', () => {
    it('runs a DOM-free bean, the half with no element API', () => {
        class Bean extends AgAbstractBean<any, any, any, any> {}
        const bean = new Bean();
        const handler = vi.fn();
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();
        const onDestroy = vi.fn();

        bean.addDestroyFunc(onDestroy);
        const [detach] = bean.addManagedListeners({ addEventListener, removeEventListener } as never, {
            changed: handler,
        });

        expect(addEventListener).toHaveBeenCalledWith('changed', expect.any(Function));
        detach();
        expect(removeEventListener).toHaveBeenCalledWith('changed', expect.any(Function));

        bean.destroy();
        expect(onDestroy).toHaveBeenCalledOnce();
    });

    it('constructs and destroys a bean', () => {
        class Bean extends AgAbstractUiBean<any, any, any, any, any> {}
        const bean = new Bean();
        const onDestroy = vi.fn();
        bean.addDestroyFunc(onDestroy);

        bean.destroy();

        expect(onDestroy).toHaveBeenCalledOnce();
    });

    it('subscribes to a plain emitter, where an unguarded `instanceof HTMLElement` would have thrown', () => {
        class Bean extends AgAbstractUiBean<any, any, any, any, any> {}
        const bean = new Bean();
        const handler = vi.fn();
        const addEventListener = vi.fn();
        const removeEventListener = vi.fn();

        const [destroy] = bean.addManagedListeners({ addEventListener, removeEventListener } as never, {
            changed: handler,
        });

        expect(addEventListener).toHaveBeenCalledWith('changed', expect.any(Function));
        destroy();
        expect(removeEventListener).toHaveBeenCalledWith('changed', expect.any(Function));
    });
});
