import { _isPlainObject, _mergeDeep, _mergedEqual } from './mergeDeep';

describe('_isPlainObject', () => {
    test('plain object literals are plain', () => {
        expect(_isPlainObject({})).toBe(true);
        expect(_isPlainObject({ a: 1, b: { c: 2 } })).toBe(true);
    });

    test('null-proto records (Object.create(null)) are plain', () => {
        const record = Object.create(null);
        record.a = 1;
        expect(_isPlainObject(record)).toBe(true);
    });

    test('objects with an explicit Object.prototype proto are plain', () => {
        expect(_isPlainObject(Object.create(Object.prototype))).toBe(true);
    });

    test('null and undefined are not plain (and do not throw on getPrototypeOf)', () => {
        expect(_isPlainObject(null)).toBe(false);
        expect(_isPlainObject(undefined)).toBe(false);
    });

    test('primitives are not plain', () => {
        expect(_isPlainObject(1)).toBe(false);
        expect(_isPlainObject('x')).toBe(false);
        expect(_isPlainObject(true)).toBe(false);
        expect(_isPlainObject(Symbol('s'))).toBe(false);
        expect(_isPlainObject(10n)).toBe(false);
    });

    test('functions are not plain', () => {
        expect(_isPlainObject(() => 0)).toBe(false);
        expect(_isPlainObject(function named() {})).toBe(false);
    });

    test('arrays are not plain (Array.prototype proto)', () => {
        expect(_isPlainObject([])).toBe(false);
        expect(_isPlainObject([1, 2, 3])).toBe(false);
    });

    test('built-in object instances are not plain', () => {
        expect(_isPlainObject(new Date(0))).toBe(false);
        expect(_isPlainObject(/abc/g)).toBe(false);
        expect(_isPlainObject(new Map())).toBe(false);
        expect(_isPlainObject(new Set())).toBe(false);
    });

    test('class instances are not plain', () => {
        class Ctx {
            public x = 1;
        }
        expect(_isPlainObject(new Ctx())).toBe(false);
    });

    test('an own `constructor: Object` key does not spoof a class instance into plain', () => {
        class Ctx {
            public constructor() {
                // own `constructor` would fool a `value.constructor === Object` check, but not the proto check.
                (this as any).constructor = Object;
            }
        }
        expect(_isPlainObject(new Ctx())).toBe(false);
    });
});

describe('_mergeDeep', () => {
    test('_mergeDeep does not allow prototype pollution', () => {
        const BAD_JSON = JSON.parse('{"__proto__":{"polluted":true}}');
        const victim = {};
        try {
            _mergeDeep(victim, BAD_JSON);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
        // @ts-expect-error polluted could be there
        expect(victim.polluted).toBeUndefined();
    });

    test('_mergeDeep with array source copies elements by index', () => {
        const dest: any = {};
        _mergeDeep(dest, ['a', 'b', 'c']);
        expect(dest).toEqual({ 0: 'a', 1: 'b', 2: 'c' });
    });

    test('_mergeDeep with null or undefined source is a no-op', () => {
        const dest = { a: 1 };
        _mergeDeep(dest, null);
        _mergeDeep(dest, undefined);
        expect(dest).toEqual({ a: 1 });
    });

    test('_mergeDeep with empty-string source is a no-op (filtered by _exists)', () => {
        const dest = { a: 1 };
        _mergeDeep(dest, '' as any);
        expect(dest).toEqual({ a: 1 });
    });

    test('skips all three prototype-pollution keys (__proto__, constructor, prototype)', () => {
        const bad = JSON.parse('{"__proto__":1,"constructor":2,"prototype":3,"x":99}');
        const victim: any = {};
        _mergeDeep(victim, bad);
        expect(victim).toEqual({ x: 99 });
        expect(Object.getPrototypeOf(victim)).toBe(Object.prototype);
    });

    test('empty source object is a no-op', () => {
        const dest = { a: 1 };
        _mergeDeep(dest, {});
        expect(dest).toEqual({ a: 1 });
    });

    test('empty source array is a no-op', () => {
        const dest = { a: 1 };
        _mergeDeep(dest, [] as any);
        expect(dest).toEqual({ a: 1 });
    });

    test('same reference for dest and source is a no-op (every key short-circuits)', () => {
        const o = { a: 1, b: { c: 2 } };
        _mergeDeep(o, o);
        expect(o).toEqual({ a: 1, b: { c: 2 } });
    });

    test('functions are copied as-is (not recursed into)', () => {
        const fn = () => 42;
        const dest: any = {};
        _mergeDeep(dest, { fn, x: 1 });
        expect(dest.fn).toBe(fn);
        expect(dest.x).toBe(1);
    });

    test('class / Date / RegExp instances are copied by reference (constructor !== Object)', () => {
        const date = new Date(0);
        const rx = /abc/g;
        const dest: any = {};
        _mergeDeep(dest, { date, rx }, true, true);
        expect(dest.date).toBe(date);
        expect(dest.rx).toBe(rx);
    });

    test('NaN value assigns (NaN === NaN is false → no early-exit)', () => {
        const dest: any = { x: Number.NaN };
        _mergeDeep(dest, { x: Number.NaN, y: 1 });
        expect(Number.isNaN(dest.x)).toBe(true);
        expect(dest.y).toBe(1);
    });

    test('copyUndefined=false skips undefined values', () => {
        const dest: any = { a: 1, b: 2 };
        _mergeDeep(dest, { a: undefined, b: 3, c: undefined, d: 4 }, false);
        expect(dest).toEqual({ a: 1, b: 3, d: 4 });
    });

    test('copyUndefined=true assigns undefined values', () => {
        const dest: any = { a: 1, b: 2 };
        _mergeDeep(dest, { a: undefined, b: 3 }, true);
        expect(dest).toEqual({ a: undefined, b: 3 });
    });

    test('null in source replaces nested object', () => {
        const dest: any = { a: { x: 1 } };
        _mergeDeep(dest, { a: null });
        expect(dest).toEqual({ a: null });
    });

    test('source object replaces destination array', () => {
        const dest: any = { x: [1, 2] };
        _mergeDeep(dest, { x: { a: 1 } });
        expect(dest.x).toEqual({ a: 1 });
    });

    test('source array recurses into destination object, setting numeric keys (does not replace)', () => {
        const dest: any = { x: { a: 1 } };
        _mergeDeep(dest, { x: [1, 2] });
        expect(dest.x).toEqual({ a: 1, 0: 1, 1: 2 });
    });

    test('makeCopyOfSimpleObjects=true clones nested plain objects (no shared reference)', () => {
        const source = { cfg: { nested: { value: 1 } } };
        const dest: any = {};
        _mergeDeep(dest, source, true, true);
        expect(dest.cfg).toEqual({ nested: { value: 1 } });
        expect(dest.cfg).not.toBe(source.cfg);
        expect(dest.cfg.nested).not.toBe(source.cfg.nested);
    });

    test('makeCopyOfSimpleObjects=true with existing dest object merges into it (no re-init)', () => {
        const existingInner = { existing: 1 };
        const dest: any = { cfg: existingInner };
        _mergeDeep(dest, { cfg: { added: 2 } }, true, true);
        expect(dest.cfg).toBe(existingInner);
        expect(dest.cfg).toEqual({ existing: 1, added: 2 });
    });

    test('makeCopyOfSimpleObjects=true with array source copies the array reference (constructor !== Object)', () => {
        const arr = [1, 2, 3];
        const dest: any = {};
        _mergeDeep(dest, { list: arr }, true, true);
        expect(dest.list).toBe(arr);
    });
});

describe('_mergedEqual', () => {
    test('same ref is equal', () => {
        const o = { a: 1, b: { c: 2 } };
        expect(_mergedEqual(o, o)).toBe(true);
    });

    test('null vs object is not equal', () => {
        expect(_mergedEqual(null, { a: 1 })).toBe(false);
        expect(_mergedEqual({ a: 1 }, null)).toBe(false);
    });

    test('array vs object is not equal', () => {
        expect(_mergedEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });

    test('shallow value equality', () => {
        expect(_mergedEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
        expect(_mergedEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    test('different key counts are not equal (no skip)', () => {
        expect(_mergedEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
        expect(_mergedEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    test('same key count but different keys are not equal (no skip)', () => {
        expect(_mergedEqual({ a: 1 }, { b: 1 })).toBe(false);
    });

    test('deep value equality', () => {
        expect(_mergedEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
        expect(_mergedEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);
    });

    test('arrays compare by element identity (matches _mergeDeep semantics)', () => {
        expect(_mergedEqual({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
        expect(_mergedEqual({ a: [1, 2] }, { a: [1, 3] })).toBe(false);
    });

    test('mutation inside a shared object referenced from an array is NOT detected', () => {
        // Documenting limitation: arrays do not recurse — as deepMerge was always like this
        const shared = { x: 1 };
        const a = { arr: [shared] };
        const b = { arr: [shared] };
        expect(_mergedEqual(a, b)).toBe(true);
        shared.x = 2;
        expect(_mergedEqual(a, b)).toBe(true);
    });

    describe('non-plain object values (symmetry with _mergeDeep reference-assign)', () => {
        // `_mergeDeep` only deep-merges plain objects; it assigns non-plain objects by reference. So
        // `_mergedEqual` must treat them as equal only when reference-equal, never by enumerable keys.
        test('different Date instances (no enumerable keys) are not equal', () => {
            expect(_mergedEqual({ d: new Date(0) }, { d: new Date(0) })).toBe(false);
        });

        test('same Date reference is equal', () => {
            const d = new Date(0);
            expect(_mergedEqual({ d }, { d })).toBe(true);
        });

        test('different Map instances are not equal', () => {
            expect(_mergedEqual({ m: new Map([['a', 1]]) }, { m: new Map([['a', 1]]) })).toBe(false);
        });

        test('different class instances with identical fields are not equal', () => {
            class Ctx {
                public x = 1;
            }
            expect(_mergedEqual({ c: new Ctx() }, { c: new Ctx() })).toBe(false);
        });

        test('Object.create(null) records are plain — deep-compared by content (like `{}`)', () => {
            const makeRecord = (a: number) => {
                const r: any = Object.create(null);
                r.a = a;
                return r;
            };
            // Null-proto records are plain data objects (the grid uses them to avoid prototype pollution),
            // so they deep-compare like `{}`: equal by content, not only by reference.
            expect(_mergedEqual({ r: makeRecord(1) }, { r: makeRecord(1) })).toBe(true);
            expect(_mergedEqual({ r: makeRecord(1) }, { r: makeRecord(2) })).toBe(false);
            // A null-proto object vs a plain `{}` with the same content are also merged-equal.
            expect(_mergedEqual(makeRecord(1), { a: 1 })).toBe(true);
        });

        test('constructor cannot be spoofed: own `constructor: Object` key does not make a class instance plain', () => {
            class Ctx {
                public x = 1;
                public constructor() {
                    // own `constructor` would fool a `value.constructor === Object` check, but not the proto check.
                    (this as any).constructor = Object;
                }
            }
            expect(_mergedEqual({ c: new Ctx() }, { c: new Ctx() })).toBe(false);
        });

        test('plain-object nested values still deep-compare', () => {
            expect(_mergedEqual({ p: { a: 1 } }, { p: { a: 1 } })).toBe(true);
            expect(_mergedEqual({ p: { a: 1 } }, { p: { a: 2 } })).toBe(false);
        });
    });

    describe('topLevelSkipKey', () => {
        test('skip key present in both with same other keys → equal regardless of skip value', () => {
            expect(_mergedEqual({ a: 1, children: [] }, { a: 1, children: [{ x: 1 }] }, 'children')).toBe(true);
        });

        test('skip key absent in both behaves like a normal compare', () => {
            expect(_mergedEqual({ a: 1 }, { a: 1 }, 'children')).toBe(true);
            expect(_mergedEqual({ a: 1 }, { a: 2 }, 'children')).toBe(false);
        });

        test('skip key only in a, other keys equal → still equal', () => {
            expect(_mergedEqual({ a: 1, children: [] }, { a: 1 }, 'children')).toBe(true);
        });

        test('skip key only in b, other keys equal → still equal', () => {
            expect(_mergedEqual({ a: 1 }, { a: 1, children: [] }, 'children')).toBe(true);
        });

        test('extra non-skip key in b is detected even with same total counts', () => {
            // a: { a:1, children:[] }    → non-skip keys = {a}, count=1
            // b: { a:1, b:2 }            → non-skip keys = {a, b}, count=2
            expect(_mergedEqual({ a: 1, children: [] }, { a: 1, b: 2 }, 'children')).toBe(false);
        });

        test('extra non-skip key in a is detected', () => {
            expect(_mergedEqual({ a: 1, b: 2, children: [] }, { a: 1, children: [] }, 'children')).toBe(false);
        });

        test('differing non-skip nested value still compares', () => {
            expect(_mergedEqual({ a: { x: 1 }, children: [] }, { a: { x: 2 }, children: [] }, 'children')).toBe(false);
        });
    });
});
