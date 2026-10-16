import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { _batchCall, _waitUntil } from './function';

describe('_batchCall', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('runs the whole batch when a callback throws, and rethrows the first error', () => {
        const ran: string[] = [];

        _batchCall(() => {
            ran.push('first');
        });
        _batchCall(() => {
            ran.push('second');
            throw new Error('second failed');
        });
        _batchCall(() => {
            ran.push('third');
            throw new Error('third failed');
        });
        _batchCall(() => {
            ran.push('fourth');
        });

        expect(() => vi.runAllTimers()).toThrow('second failed');
        expect(ran, 'a throw must not drop the callbacks queued behind it').toEqual([
            'first',
            'second',
            'third',
            'fourth',
        ]);
    });

    // `undefined` is a legal thing to throw, so it cannot double as the "no error" sentinel.
    test('rethrows a falsy thrown value rather than treating it as no error', () => {
        const after = vi.fn();

        _batchCall(() => {
            throw undefined;
        });
        _batchCall(after);

        let threw = false;
        try {
            vi.runAllTimers();
        } catch {
            threw = true;
        }

        expect(threw, 'a thrown `undefined` must still propagate').toBe(true);
        expect(after, 'the rest of the batch still runs').toHaveBeenCalledTimes(1);
    });

    test('a throwing batch leaves nothing pending, so the next call is still scheduled', () => {
        expect(() => {
            _batchCall(() => {
                throw new Error('boom');
            });
            vi.runAllTimers();
        }).toThrow('boom');

        const afterThrow = vi.fn();
        _batchCall(afterThrow);
        vi.runAllTimers();

        expect(afterThrow).toHaveBeenCalledTimes(1);
    });
});

describe('_waitUntil', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const createBean = () => {
        let destroyFuncs: (() => void)[] = [];
        return {
            getDestroyFuncs: () => destroyFuncs,
            addDestroyFunc: (func: () => void) => destroyFuncs.push(func),
            removeDestroyFunc: (func: () => void) => {
                destroyFuncs = destroyFuncs.filter((f) => f !== func);
            },
            destroy: () => {
                for (const func of destroyFuncs) {
                    func();
                }
                destroyFuncs = [];
            },
        };
    };

    test('a finished wait leaves nothing registered on its bean, however often it waits', () => {
        const bean = createBean();
        let ready = false;
        const callback = vi.fn();
        for (let i = 0; i < 3; ++i) {
            _waitUntil(bean, () => ready, callback);
        }
        _waitUntil(bean, () => true, callback);
        ready = true;
        vi.advanceTimersByTime(10);

        expect(callback).toHaveBeenCalledTimes(4);
        expect(bean.getDestroyFuncs()).toEqual([]);
        expect(vi.getTimerCount()).toBe(0);
    });

    test('stops as its bean is destroyed, without calling back', () => {
        const bean = createBean();
        const callback = vi.fn();
        _waitUntil(bean, () => false, callback, 1000);
        vi.advanceTimersByTime(50);
        bean.destroy();

        expect(vi.getTimerCount()).toBe(0);
        vi.advanceTimersByTime(2000);
        expect(callback).not.toHaveBeenCalled();
    });
});
