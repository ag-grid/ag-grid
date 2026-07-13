import { describe, expect, it } from 'vitest';

import { MultiIndexMap } from './multiIndexMap';

// The lazy store keeps its row nodes in a MultiIndexMap so it can look a node up either by its
// block-relative index or by the node reference itself. These tests pin the data-structure contract
// directly, as it previously had no coverage despite being core to lazy-store bookkeeping.
interface Item {
    index: number;
    node: object;
}

function createItem(index: number): Item {
    return { index, node: { id: index } };
}

describe('MultiIndexMap', () => {
    describe('single index', () => {
        it('sets and retrieves items by the indexed key', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            const a = createItem(0);
            const b = createItem(1);
            map.set(a);
            map.set(b);

            expect(map.getSize()).toBe(2);
            expect(map.getBy('index', 0)).toBe(a);
            expect(map.getBy('index', 1)).toBe(b);
        });

        it('returns undefined for a missing key', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            expect(map.getBy('index', 99)).toBeUndefined();
        });

        it('overwrites an existing item that shares the indexed key', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            const first = createItem(0);
            const second = createItem(0);
            map.set(first);
            map.set(second);

            expect(map.getSize()).toBe(1);
            expect(map.getBy('index', 0)).toBe(second);
        });
    });

    describe('multiple indexes', () => {
        it('finds the same item by either index', () => {
            const map = new MultiIndexMap<Item, 'index' | 'node'>('index', 'node');
            const item = createItem(5);
            map.set(item);

            expect(map.getBy('index', 5)).toBe(item);
            expect(map.getBy('node', item.node)).toBe(item);
        });

        it('delete removes the item from every index', () => {
            const map = new MultiIndexMap<Item, 'index' | 'node'>('index', 'node');
            const item = createItem(5);
            map.set(item);
            map.delete(item);

            expect(map.getBy('index', 5)).toBeUndefined();
            expect(map.getBy('node', item.node)).toBeUndefined();
            expect(map.getSize()).toBe(0);
        });

        it('getSize reports the size of the first index only', () => {
            const map = new MultiIndexMap<Item, 'index' | 'node'>('index', 'node');
            // two items colliding on `index` but distinct on `node`: the first-index map has one entry.
            map.set({ index: 0, node: { id: 'a' } });
            map.set({ index: 0, node: { id: 'b' } });

            expect(map.getSize()).toBe(1);
        });
    });

    describe('deleting a non-present item', () => {
        it('is a no-op and does not throw', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            const present = createItem(0);
            map.set(present);

            expect(() => map.delete(createItem(1))).not.toThrow();
            expect(map.getSize()).toBe(1);
            expect(map.getBy('index', 0)).toBe(present);
        });
    });

    describe('clear', () => {
        it('empties every index', () => {
            const map = new MultiIndexMap<Item, 'index' | 'node'>('index', 'node');
            const item = createItem(0);
            map.set(item);
            map.clear();

            expect(map.getSize()).toBe(0);
            expect(map.getBy('index', 0)).toBeUndefined();
            expect(map.getBy('node', item.node)).toBeUndefined();
        });
    });

    describe('iteration helpers', () => {
        it('forEach visits every item exactly once', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            const items = [createItem(0), createItem(1), createItem(2)];
            for (let i = 0, len = items.length; i < len; ++i) {
                map.set(items[i]);
            }

            const visited: Item[] = [];
            map.forEach((item) => visited.push(item));

            expect(visited).toEqual(items);
        });

        it('forEach never fires on an empty map', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            let calls = 0;
            map.forEach(() => calls++);
            expect(calls).toBe(0);
        });

        it('find returns the first matching item and short-circuits', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            const items = [createItem(0), createItem(1), createItem(2)];
            let inspected = 0;
            for (let i = 0, len = items.length; i < len; ++i) {
                map.set(items[i]);
            }

            const found = map.find((item) => {
                inspected++;
                return item.index === 1;
            });

            expect(found).toBe(items[1]);
            expect(inspected).toBe(2); // stopped after the match, did not inspect index 2
        });

        it('find returns undefined when nothing matches', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            map.set(createItem(0));
            expect(map.find((item) => item.index === 99)).toBeUndefined();
        });

        it('filter collects every matching item', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            for (let i = 0, len = 5; i < len; ++i) {
                map.set(createItem(i));
            }

            const even = map.filter((item) => item.index % 2 === 0);
            expect(even.map((item) => item.index)).toEqual([0, 2, 4]);
        });

        it('filter returns an empty array on an empty map', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            expect(map.filter(() => true)).toEqual([]);
        });

        it('handles a single-element map without over-iterating', () => {
            const map = new MultiIndexMap<Item, 'index'>('index');
            const only = createItem(0);
            map.set(only);

            const visited: Item[] = [];
            map.forEach((item) => visited.push(item));
            expect(visited).toEqual([only]);
        });
    });
});
