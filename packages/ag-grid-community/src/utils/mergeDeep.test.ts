import { _mergeDeep } from './mergeDeep';

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
