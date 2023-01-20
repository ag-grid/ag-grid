import { expect, test } from '@jest/globals';
import { deepMerge } from './object';

test('deepMerge', () => {
    const target = {
        x: 1,
        y: null,
        z: {
            a: [0],
            b: {
                c: 4,
            },
            d: {},
        },
    };
    const source = {
        y: 2,
        z: {
            a: [3],
            d: [],
        },
    };
    expect(deepMerge(target, source)).toEqual({
        x: 1,
        y: 2,
        z: {
            a: [3],
            b: {
                c: 4,
            },
            d: [],
        },
    });
});
