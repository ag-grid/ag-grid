import { expect, test } from '@jest/globals';
import { getValue, deepMerge } from './object';

test('getValue', () => {
    const obj = {
        hello: {
            world: 5,
        },
    };
    expect(getValue(obj, 'hello.world')).toBe(5);
    expect(getValue(obj, 'hello.earth')).toBe(undefined);
    expect(() => {
        getValue(obj, 'hello.crazy.world');
    }).toThrow();
    expect(getValue(obj, 'hello.crazy.world', 42)).toBe(42);
});

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
