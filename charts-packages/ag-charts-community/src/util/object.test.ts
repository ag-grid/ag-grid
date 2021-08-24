import { describe, expect, test, it } from "@jest/globals";
import { getValue } from './object';

test('getValue', () => {
    const obj = {
        hello: {
            world: 5
        }
    };
    expect(getValue(obj, 'hello.world')).toBe(5);
    expect(getValue(obj, 'hello.earth')).toBe(undefined);
    expect(() => {
        getValue(obj, 'hello.crazy.world');
    }).toThrow();
    expect(getValue(obj, 'hello.crazy.world', 42)).toBe(42);
});