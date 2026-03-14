import type { ChangedPath, RowNode } from 'ag-grid-community';

import { ChangedCellsPathImpl } from './changedCellsPath';
import { ChangedRowsPathImpl } from './changedRowsPath';

// ─── Shared stubs ────────────────────────────────────────────────────────────

function makeNode(id: string, parent: RowNode | null = null): RowNode {
    return {
        id,
        parent,
        level: parent ? (parent as any).level + 1 : -1,
        rowPinned: null,
        childrenAfterGroup: null,
        destroyed: false,
        isRowPinned: () => false,
    } as unknown as RowNode;
}

function collectRows(path: ChangedPath): RowNode[] {
    return [...path.getSortedRows()];
}

function makeChain(depth: number): RowNode[] {
    const chain: RowNode[] = [makeNode('root')];
    for (let i = 1; i <= depth; ++i) {
        chain.push(makeNode(`n${i}`, chain[i - 1]));
    }
    return chain;
}

function makeFlatTree(leafCount: number): { root: RowNode; leaves: RowNode[] } {
    const root = makeNode('root');
    const leaves: RowNode[] = [];
    for (let i = 0; i < leafCount; i++) {
        leaves.push(makeNode(`leaf${i}`, root));
    }
    return { root, leaves };
}

function makeWideBranchTree(branches: number, depth: number): { root: RowNode; leaves: RowNode[] } {
    const root = makeNode('root');
    const leaves: RowNode[] = [];
    for (let b = 0; b < branches; b++) {
        let parent = root;
        for (let d = 1; d <= depth; d++) {
            parent = makeNode(`b${b}_d${d}`, parent);
        }
        leaves.push(parent);
    }
    return { root, leaves };
}

// ─── Shared interface tests ──────────────────────────────────────────────────

describe.each([
    { label: 'ChangedRowsPath', create: () => new ChangedRowsPathImpl() },
    { label: 'ChangedCellsPath', create: () => new ChangedCellsPathImpl() },
])('$label — shared ChangedPath interface', ({ create }) => {
    describe('addRow', () => {
        test('null or undefined rowNode is a no-op', () => {
            const path = create();
            path.addRow(null);
            path.addRow(undefined);
            expect(collectRows(path)).toEqual([]);
        });

        test('adds direct child of root', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = create();
            path.addRow(leaf);
            expect(collectRows(path)).toEqual([leaf, root]);
        });

        test('adds leaf and its ancestry up to root', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const path = create();
            path.addRow(leaf);
            expect(collectRows(path)).toEqual([leaf, group, root]);
        });

        test('adding same node twice does not duplicate', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = create();
            path.addRow(leaf);
            path.addRow(leaf);
            expect(collectRows(path)).toEqual([leaf, root]);
        });

        test('two siblings share the same parent — parent visited once', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf1 = makeNode('leaf1', group);
            const leaf2 = makeNode('leaf2', group);
            const path = create();
            path.addRow(leaf1);
            path.addRow(leaf2);

            const visited = collectRows(path);
            expect(visited.filter((n) => n === group)).toHaveLength(1);
            expect(visited.indexOf(leaf1)).toBeLessThan(visited.indexOf(group));
            expect(visited.indexOf(leaf2)).toBeLessThan(visited.indexOf(group));
            expect(visited.indexOf(group)).toBeLessThan(visited.indexOf(root));
        });

        test('two separate subtrees both visited', () => {
            const root = makeNode('root');
            const groupA = makeNode('groupA', root);
            const groupB = makeNode('groupB', root);
            const leafA = makeNode('leafA', groupA);
            const leafB = makeNode('leafB', groupB);
            const path = create();
            path.addRow(leafA);
            path.addRow(leafB);

            const visited = collectRows(path);
            expect(visited).toContain(leafA);
            expect(visited).toContain(groupA);
            expect(visited).toContain(leafB);
            expect(visited).toContain(groupB);
            expect(visited).toContain(root);
            expect(visited.indexOf(leafA)).toBeLessThan(visited.indexOf(groupA));
            expect(visited.indexOf(leafB)).toBeLessThan(visited.indexOf(groupB));
        });
    });

    describe('addCell', () => {
        test('null or undefined rowNode is a no-op', () => {
            const path = create();
            path.addCell(null, 'col');
            path.addCell(undefined, 'col');
            path.addCell(null, null);
            path.addCell(undefined, undefined);
            expect(collectRows(path)).toEqual([]);
        });

        test('null or undefined colId delegates to addRow', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = create();
            path.addCell(leaf1, null);
            path.addCell(leaf2, undefined);
            expect(path.hasRow(leaf1)).toBe(true);
            expect(path.hasRow(leaf2)).toBe(true);
            expect(path.hasRow(root)).toBe(true);
        });
    });

    describe('hasRow', () => {
        test('returns false for a node not in the path', () => {
            const root = makeNode('root');
            const other = makeNode('other', root);
            const path = create();
            expect(path.hasRow(other)).toBe(false);
        });

        test('returns true for a node that was added', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = create();
            path.addRow(leaf);
            expect(path.hasRow(leaf)).toBe(true);
        });
    });

    describe('getSortedRows', () => {
        test('empty path returns empty array', () => {
            const path = create();
            expect(collectRows(path)).toEqual([]);
        });

        describe.each([
            { label: 'linear chain depth=1 (2 nodes)', depth: 1 },
            { label: 'linear chain depth=2 (3 nodes)', depth: 2 },
            { label: 'linear chain depth=5 (6 nodes)', depth: 5 },
            { label: 'linear chain depth=15 (16 nodes, insertion sort boundary)', depth: 15 },
            { label: 'linear chain depth=16 (17 nodes, counting sort)', depth: 16 },
            { label: 'linear chain depth=31 (32 nodes)', depth: 31 },
            { label: 'linear chain depth=99 (100 nodes)', depth: 99 },
            { label: 'linear chain depth=500 (501 nodes, triggers buffer grow)', depth: 500 },
        ])('$label', ({ depth }) => {
            test('sorts deepest-first', () => {
                const chain = makeChain(depth);
                const root = chain[0];
                const leaf = chain[depth];
                const path = create();
                path.addRow(leaf);

                const nodes = collectRows(path);
                expect(nodes).toHaveLength(depth + 1);
                expect(nodes[0]).toBe(leaf);
                expect(nodes.at(-1)).toBe(root);
                for (let i = 0; i < nodes.length - 1; i++) {
                    expect(nodes[i].level).toBeGreaterThanOrEqual(nodes[i + 1].level);
                }
            });
        });

        describe.each([
            { label: 'flat 2 leaves (3 nodes, 2 levels)', leafCount: 2 },
            { label: 'flat 15 leaves (16 nodes, insertion sort boundary, 2 levels)', leafCount: 15 },
            { label: 'flat 16 leaves (17 nodes, sortRotate)', leafCount: 16 },
            { label: 'flat 31 leaves (32 nodes, sortRotate)', leafCount: 31 },
            { label: 'flat 99 leaves (100 nodes, sortRotate)', leafCount: 99 },
        ])('$label', ({ leafCount }) => {
            test('sorts deepest-first — all leaves before root', () => {
                const { root, leaves } = makeFlatTree(leafCount);
                const path = create();
                for (const leaf of leaves) {
                    path.addRow(leaf);
                }

                const nodes = collectRows(path);
                expect(nodes).toHaveLength(leafCount + 1);
                expect(nodes.at(-1)).toBe(root);
                for (let i = 0; i < leafCount; i++) {
                    expect(nodes[i].level).toBeGreaterThan(root.level);
                }
            });
        });

        test('sort is stable — same-level nodes preserve input order', () => {
            const { leaves } = makeFlatTree(30);
            const path = create();
            for (const leaf of leaves) {
                path.addRow(leaf);
            }

            const nodes = collectRows(path);
            for (let i = 0; i < leaves.length; i++) {
                expect(nodes[i]).toBe(leaves[i]);
            }
        });

        describe.each([
            { label: '5 branches depth=3 (16 nodes, insertion sort boundary)', branches: 5, depth: 3 },
            { label: '4 branches depth=4 (17 nodes, counting sort)', branches: 4, depth: 4 },
            { label: '6 branches depth=5 (31 nodes, multi-level)', branches: 6, depth: 5 },
            { label: '10 branches depth=10 (101 nodes, multi-level)', branches: 10, depth: 10 },
        ])('wide tree: $label', ({ branches, depth }) => {
            test('sorts deepest-first with multiple levels', () => {
                const { root, leaves } = makeWideBranchTree(branches, depth);
                const path = create();
                for (const leaf of leaves) {
                    path.addRow(leaf);
                }

                const nodes = collectRows(path);
                for (let i = 0; i < nodes.length - 1; i++) {
                    expect(nodes[i].level).toBeGreaterThanOrEqual(nodes[i + 1].level);
                }
                expect(nodes.at(-1)).toBe(root);
                for (const leaf of leaves) {
                    expect(nodes).toContain(leaf);
                }
            });
        });
    });

    describe('cache invalidation', () => {
        test('addRow after getSortedRows — new node appears in next traversal', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = create();

            path.addRow(leaf1);
            const firstVisit = collectRows(path);
            expect(firstVisit).toEqual([leaf1, root]);

            path.addRow(leaf2);
            const secondVisit = collectRows(path);
            expect(secondVisit).toContain(leaf2);
            expect(secondVisit).toContain(leaf1);
            expect(secondVisit).toContain(root);
        });

        test('multiple reads without mutation reuse cached order', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = create();
            path.addRow(leaf);

            const first = collectRows(path);
            const second = collectRows(path);
            expect(first).toEqual(second);
        });
    });
});
