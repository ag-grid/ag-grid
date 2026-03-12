import type { RowNode } from 'ag-grid-community';

import { _sortNodesByDepthFirst } from './sortNodesByDepthFirst';

function makeNode(id: string, level: number): RowNode {
    return { id, level } as unknown as RowNode;
}

/** Asserts the result is in deepest-first (non-increasing level) order. */
function expectDeepestFirst(nodes: RowNode[]): void {
    for (let i = 1; i < nodes.length; ++i) {
        expect(nodes[i].level).toBeLessThanOrEqual(nodes[i - 1].level);
    }
}

describe('_sortNodesByDepthFirst', () => {
    test('empty array returns same array', () => {
        const input: RowNode[] = [];
        expect(_sortNodesByDepthFirst(input)).toBe(input);
    });

    test('single element returns same array', () => {
        const input = [makeNode('a', 3)];
        expect(_sortNodesByDepthFirst(input)).toBe(input);
    });

    test('two elements already sorted returns same array', () => {
        const input = [makeNode('a', 5), makeNode('b', 2)];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input); // already deepest-first → no copy
    });

    test('two elements reversed swaps in-place', () => {
        const a = makeNode('a', 2);
        const b = makeNode('b', 5);
        const input = [a, b];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input); // swapped in-place
        expect(result).toEqual([b, a]); // deepest first
    });

    test('all same level returns same array', () => {
        const nodes = [makeNode('a', 3), makeNode('b', 3), makeNode('c', 3)];
        expect(_sortNodesByDepthFirst(nodes)).toBe(nodes);
    });

    // ── Basic sorting ─────────────────────────────────────────────────────────

    test('sorts mixed levels deepest-first', () => {
        const n0 = makeNode('n0', 0);
        const n1 = makeNode('n1', 1);
        const n2 = makeNode('n2', 2);
        const n3 = makeNode('n3', 3);
        const input = [n1, n3, n0, n2];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toEqual([n3, n2, n1, n0]);
    });

    test('preserves relative order of nodes at the same level (stable within bucket)', () => {
        const a = makeNode('a', 2);
        const b = makeNode('b', 2);
        const c = makeNode('c', 2);
        const d = makeNode('d', 0);
        const input = [a, d, b, c];
        const result = _sortNodesByDepthFirst(input);
        // a, b, c are all level 2 — should appear before d (level 0)
        // within level 2, order should be preserved (a, b, c)
        expect(result).toEqual([a, b, c, d]);
    });

    test('handles root level -1', () => {
        const root = makeNode('root', -1);
        const child = makeNode('child', 0);
        const grandchild = makeNode('grandchild', 1);
        const input = [child, root, grandchild];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toEqual([grandchild, child, root]);
    });

    test('already sorted deepest-first returns same array (early exit)', () => {
        const input = [makeNode('a', 5), makeNode('b', 3), makeNode('c', 1), makeNode('d', 0)];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input);
    });

    test('already sorted with equal adjacent levels returns same array', () => {
        const input = [makeNode('a', 5), makeNode('b', 5), makeNode('c', 3), makeNode('d', 3)];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input);
    });

    test('small unsorted array sorts in-place', () => {
        const n0 = makeNode('n0', 0);
        const n1 = makeNode('n1', 1);
        const n2 = makeNode('n2', 2);
        const input = [n0, n1, n2];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input); // sorted in-place
        expect(result).toEqual([n2, n1, n0]);
    });

    test('20 nodes across 5 levels', () => {
        const levels = [0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 2, 4, 1, 3, 0, 4, 2, 1, 3, 0];
        const nodes = levels.map((l, i) => makeNode(`n${i}`, l));
        const result = _sortNodesByDepthFirst(nodes);
        expect(result).toHaveLength(20);
        expectDeepestFirst(result);
        // All original nodes present
        expect(new Set(result)).toEqual(new Set(nodes));
    });

    test('100 nodes with random levels', () => {
        const nodes: RowNode[] = [];
        for (let i = 0; i < 100; ++i) {
            nodes.push(makeNode(`n${i}`, ((i * 7 + 3) % 10) - 1));
        }
        const result = _sortNodesByDepthFirst(nodes);
        expect(result).toHaveLength(100);
        expectDeepestFirst(result);
        expect(new Set(result)).toEqual(new Set(nodes));
    });

    test('200 levels deep triggers buffer grow', () => {
        const nodes: RowNode[] = [];
        for (let i = 0; i <= 200; ++i) {
            nodes.push(makeNode(`n${i}`, i));
        }
        const result = _sortNodesByDepthFirst(nodes);
        expect(result).toHaveLength(201);
        expectDeepestFirst(result);
        expect(result[0].level).toBe(200);
        expect(result[200].level).toBe(0);
    });

    test('500 levels deep sorts correctly', () => {
        const nodes: RowNode[] = [];
        for (let i = 0; i <= 500; ++i) {
            nodes.push(makeNode(`n${i}`, i - 1)); // levels -1 to 499
        }
        const result = _sortNodesByDepthFirst(nodes);
        expect(result).toHaveLength(501);
        expectDeepestFirst(result);
        expect(result[0].level).toBe(499);
        expect(result[500].level).toBe(-1);
    });

    test('multiple sorts reuse cleaned buckets correctly', () => {
        for (let round = 0; round < 5; ++round) {
            const nodes = [makeNode('a', round), makeNode('b', round + 2), makeNode('c', round + 1)];
            const result = _sortNodesByDepthFirst(nodes);
            expectDeepestFirst(result);
            expect(result[0].level).toBe(round + 2);
            expect(result[2].level).toBe(round);
        }
    });

    test('alternating sorted and unsorted inputs', () => {
        // Sorted input (early exit)
        const sorted = [makeNode('a', 5), makeNode('b', 3), makeNode('c', 1)];
        expect(_sortNodesByDepthFirst(sorted)).toBe(sorted);

        // Unsorted input (small array, sorted in-place)
        const unsorted = [makeNode('d', 1), makeNode('e', 5), makeNode('f', 3)];
        const result = _sortNodesByDepthFirst(unsorted);
        expect(result).toBe(unsorted); // small array sorted in-place
        expectDeepestFirst(result);

        // Another sorted input (early exit, buckets should be clean)
        const sorted2 = [makeNode('g', 4), makeNode('h', 2), makeNode('i', 0)];
        expect(_sortNodesByDepthFirst(sorted2)).toBe(sorted2);
    });

    test('root at index 0 + all same level sorts in-place', () => {
        const root = makeNode('root', -1);
        const a = makeNode('a', 0);
        const b = makeNode('b', 0);
        const c = makeNode('c', 0);
        const input = [root, a, b, c];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input); // sorted in-place
        expect(result).toEqual([a, b, c, root]);
    });

    test('root at index 0 + all same level preserves order of non-root nodes', () => {
        const root = makeNode('root', -1);
        const nodes = Array.from({ length: 20 }, (_, i) => makeNode(`n${i}`, 0));
        const input = [root, ...nodes];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input); // sorted in-place
        expect(result).toEqual([...nodes, root]);
    });

    test('root at index 0 + single non-adjacent level sorts in-place', () => {
        const root = makeNode('root', -1);
        const a = makeNode('a', 5);
        const b = makeNode('b', 5);
        const input = [root, a, b];
        const result = _sortNodesByDepthFirst(input);
        expect(result).toBe(input); // sorted in-place
        expect(result).toEqual([a, b, root]);
    });

    test('root NOT at index 0 sorts correctly', () => {
        const root = makeNode('root', -1);
        const a = makeNode('a', 0);
        const b = makeNode('b', 0);
        const input = [a, root, b];
        const result = _sortNodesByDepthFirst(input);
        expectDeepestFirst(result);
        expect(result).toBe(input); // small array, sorted in-place
        expect(result).toEqual([a, b, root]);
    });

    test('counting sort is stable: nodes at same level preserve input order', () => {
        const nodes = [
            makeNode('first-L2', 2),
            makeNode('L0', 0),
            makeNode('second-L2', 2),
            makeNode('L1', 1),
            makeNode('third-L2', 2),
        ];
        const result = _sortNodesByDepthFirst(nodes);
        // Level-2 nodes should appear in original order: first, second, third
        const level2 = result.filter((n) => n.level === 2);
        expect(level2.map((n) => n.id)).toEqual(['first-L2', 'second-L2', 'third-L2']);
    });

    test('1000 levels triggers multiple buffer reallocs and sorts correctly', () => {
        const nodes: RowNode[] = [];
        // Interleave deep and shallow nodes to prevent sorted early-exit
        for (let i = 0; i <= 1000; ++i) {
            nodes.push(makeNode(`n${i}`, i % 2 === 0 ? i : 1000 - i));
        }
        const result = _sortNodesByDepthFirst(nodes);
        expect(result).toHaveLength(1001);
        expectDeepestFirst(result);
        expect(result[0].level).toBe(1000);
        expect(result.at(-1)!.level).toBe(0);
        // All original nodes present
        expect(new Set(result)).toEqual(new Set(nodes));
    });

    test('sort after realloc still works for small arrays', () => {
        // After the 1000-level test grew the buffer, verify small sorts still work
        const a = makeNode('a', 0);
        const b = makeNode('b', 2);
        const c = makeNode('c', 1);
        const result = _sortNodesByDepthFirst([a, b, c]);
        expect(result).toEqual([b, c, a]);
    });
});
