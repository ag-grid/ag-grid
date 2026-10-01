import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { _batchCall } from './function';

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
