import type { RowNode } from '../../entities/rowNode';
import type { ChangedPath } from '../changedPath';
import { _forEachChangedGroupDepthFirst } from '../changedPath';
import { ChangedRowsPath } from './changedRowsPath';

// ─── Minimal stubs ────────────────────────────────────────────────────────────

function makeNode(
    id: string,
    parent: RowNode | null = null,
    opts: { pinned?: boolean; children?: RowNode[] } = {}
): RowNode {
    const rowPinned = opts.pinned ? 'top' : null;
    return {
        id,
        parent,
        level: parent ? (parent as any).level + 1 : -1,
        rowPinned,
        childrenAfterGroup: opts.children ?? null,
        destroyed: false,
        isRowPinned: () => !!rowPinned,
    } as unknown as RowNode;
}

function collectGroups(root: RowNode, path: ChangedPath | undefined): RowNode[] {
    const nodes: RowNode[] = [];
    _forEachChangedGroupDepthFirst(root, path, (n) => nodes.push(n));
    return nodes;
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ChangedRowsPath', () => {
    describe('constructor', () => {
        test('starts empty', () => {
            const root = makeNode('root');
            const path = new ChangedRowsPath();
            expect(path.hasRow(root)).toBe(false);
        });

        test('addRow(root) explicitly adds root to the path', () => {
            const root = makeNode('root');
            const path = new ChangedRowsPath();
            path.addRow(root);
            expect(path.hasRow(root)).toBe(true);
            expect(collectRows(path)).toEqual([root]);
        });
    });

    describe('addRow', () => {
        test('null or undefined rowNode is a no-op', () => {
            const path = new ChangedRowsPath();
            path.addRow(null);
            path.addRow(undefined);
            expect(collectRows(path)).toEqual([]);
        });

        test('adds direct child of root', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedRowsPath();
            path.addRow(leaf);
            expect(collectRows(path)).toEqual([leaf, root]);
        });

        test('adds leaf and its ancestry up to root', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const path = new ChangedRowsPath();
            path.addRow(leaf);
            expect(collectRows(path)).toEqual([leaf, group, root]);
        });

        test('adding same node twice does not duplicate', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedRowsPath();
            path.addRow(leaf);
            path.addRow(leaf);
            expect(collectRows(path)).toEqual([leaf, root]);
        });

        test('two siblings share the same parent — parent visited once', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf1 = makeNode('leaf1', group);
            const leaf2 = makeNode('leaf2', group);
            const path = new ChangedRowsPath();
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
            const path = new ChangedRowsPath();
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
        test('delegates to addRow — colId is ignored', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedRowsPath();
            path.addCell(leaf, 'someColumn');
            expect(path.hasRow(leaf)).toBe(true);
            expect(path.hasRow(root)).toBe(true);
            expect(collectRows(path)).toEqual([leaf, root]);
        });

        test('null or undefined colId delegates to addRow', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = new ChangedRowsPath();
            path.addCell(leaf1, null);
            path.addCell(leaf2, undefined);
            expect(path.hasRow(leaf1)).toBe(true);
            expect(path.hasRow(leaf2)).toBe(true);
            expect(path.hasRow(root)).toBe(true);
        });

        test('null or undefined rowNode is a no-op', () => {
            const path = new ChangedRowsPath();
            path.addCell(null, 'col');
            path.addCell(undefined, 'col');
            path.addCell(null, null);
            path.addCell(undefined, undefined);
            expect(collectRows(path)).toEqual([]);
        });
    });

    describe('hasRow', () => {
        test('returns false for a node not in the path', () => {
            const root = makeNode('root');
            const other = makeNode('other', root);
            const path = new ChangedRowsPath();
            expect(path.hasRow(other)).toBe(false);
        });

        test('returns true for a node that was added', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedRowsPath();
            path.addRow(leaf);
            expect(path.hasRow(leaf)).toBe(true);
        });
    });

    describe('traversal', () => {
        test('visits only changed nodes depth-first', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const unrelated = makeNode('unrelated', root);
            const path = new ChangedRowsPath();
            path.addRow(leaf);

            const visited = collectRows(path);
            expect(visited).not.toContain(unrelated);
            expect(visited).toEqual([leaf, group, root]);
        });

        test('path with no addRow visits nothing', () => {
            const path = new ChangedRowsPath();
            expect(collectRows(path)).toEqual([]);
        });

        test('undefined _forEachChangedGroupDepthFirst: visits all group nodes, skipping leaves', () => {
            const leaf1 = makeNode('leaf1');
            const leaf2 = makeNode('leaf2');
            const root = makeNode('root', null, { children: [leaf1, leaf2] });

            const visited = collectGroups(root, undefined);
            expect(visited).toContain(root);
            expect(visited).not.toContain(leaf1);
            expect(visited).not.toContain(leaf2);
        });

        test('undefined _forEachChangedGroupDepthFirst: child with childrenAfterGroup=null is skipped', () => {
            const nonGroupChild = makeNode('nonGroup');
            const root = makeNode('root', null, { children: [nonGroupChild] });

            const visited = collectGroups(root, undefined);
            expect(visited).toContain(root);
            expect(visited).not.toContain(nonGroupChild);
        });

        test('_forEachChangedGroupDepthFirst with null changedPath always does full group traversal', () => {
            const root = makeNode('root', null, { children: [makeNode('leaf1')] });

            const visitedAll: RowNode[] = [];
            _forEachChangedGroupDepthFirst(root, null, (n) => visitedAll.push(n));
            expect(visitedAll).toContain(root);
        });
    });

    describe('cache invalidation', () => {
        test('addRow after getSortedRows — new node appears in next traversal', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = new ChangedRowsPath();

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
            const path = new ChangedRowsPath();
            path.addRow(leaf);

            const first = collectRows(path);
            const second = collectRows(path);
            expect(first).toEqual(second);
        });
    });

    describe('_forEachChangedGroupDepthFirst with changedPath', () => {
        test('only visits nodes with childrenAfterGroup set', () => {
            const root = makeNode('root', null, { children: [] });
            const group = makeNode('group', root, { children: [] });
            const leaf = makeNode('leaf', group);
            const path = new ChangedRowsPath();
            path.addRow(leaf);

            // All three are in getSortedRows
            const sorted = collectRows(path);
            expect(sorted).toContain(leaf);
            expect(sorted).toContain(group);
            expect(sorted).toContain(root);

            // _forEachChangedGroupDepthFirst visits only nodes with childrenAfterGroup
            const visited: RowNode[] = [];
            _forEachChangedGroupDepthFirst(root, path, (n) => visited.push(n));
            expect(visited).toContain(root);
            expect(visited).toContain(group);
            expect(visited).not.toContain(leaf); // leaf has no childrenAfterGroup

            // Clearing childrenAfterGroup causes a node to be skipped
            (group as any).childrenAfterGroup = null;
            const visited2: RowNode[] = [];
            _forEachChangedGroupDepthFirst(root, path, (n) => visited2.push(n));
            expect(visited2).toContain(root);
            expect(visited2).not.toContain(group);
        });
    });

    describe('level changes after addRow', () => {
        test('traversal uses current levels, not levels at addRow time', () => {
            const root = makeNode('root');
            const groupA = makeNode('groupA', root);
            const groupB = makeNode('groupB', root);
            const leaf = makeNode('leaf', groupA);
            const path = new ChangedRowsPath();
            path.addRow(leaf);

            (leaf as any).parent = groupB;
            (leaf as any).level = 3;

            path.addRow(groupB);

            const visited = collectRows(path);
            expect(visited.indexOf(leaf)).toBeLessThan(visited.indexOf(groupB));
            expect(visited.indexOf(groupB)).toBeLessThan(visited.indexOf(root));
        });
    });

    describe('getSortedRows', () => {
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
                const path = new ChangedRowsPath();
                path.addRow(leaf);

                const nodes = collectRows(path);
                expect(nodes).toHaveLength(depth + 1);
                expect(nodes[0]).toBe(leaf);
                expect(nodes[nodes.length - 1]).toBe(root);
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
                const path = new ChangedRowsPath();
                for (const leaf of leaves) {
                    path.addRow(leaf);
                }

                const nodes = collectRows(path);
                expect(nodes).toHaveLength(leafCount + 1);
                expect(nodes[nodes.length - 1]).toBe(root);
                for (let i = 0; i < leafCount; i++) {
                    expect(nodes[i].level).toBeGreaterThan(root.level);
                }
            });
        });

        test('sort is stable — same-level nodes preserve input order', () => {
            const { leaves } = makeFlatTree(30);
            const path = new ChangedRowsPath();
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
                const path = new ChangedRowsPath();
                for (const leaf of leaves) {
                    path.addRow(leaf);
                }

                const nodes = collectRows(path);
                for (let i = 0; i < nodes.length - 1; i++) {
                    expect(nodes[i].level).toBeGreaterThanOrEqual(nodes[i + 1].level);
                }
                expect(nodes[nodes.length - 1]).toBe(root);
                for (const leaf of leaves) {
                    expect(nodes).toContain(leaf);
                }
            });
        });

        test('two branches at different depths — both sorted correctly', () => {
            const chain = makeChain(500);
            const root = chain[0];
            const shallowLeaf = makeNode('shallow', chain[3]);
            const path = new ChangedRowsPath();
            path.addRow(chain[500]);
            path.addRow(shallowLeaf);

            const visited = collectRows(path);
            expect(visited.indexOf(shallowLeaf)).toBeLessThan(visited.indexOf(chain[3]));
            expect(visited[0]).toBe(chain[500]);
            expect(visited[visited.length - 1]).toBe(root);
        });

        test('empty path returns empty array', () => {
            const path = new ChangedRowsPath();
            expect(collectRows(path)).toEqual([]);
        });
    });
});

// ─── Standalone traversal functions ───────────────────────────────────────────

describe('_forEachChangedGroupDepthFirst', () => {
    test('root with no childrenAfterGroup (leaf root) is not visited', () => {
        const root = makeNode('root');
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, null, (n) => visited.push(n));
        expect(visited).toEqual([]);
    });

    test('root with empty children (group root) visits only root', () => {
        const root = makeNode('root', null, { children: [] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, null, (n) => visited.push(n));
        expect(visited).toEqual([root]);
    });

    test('leaf children (no childrenAfterGroup) are skipped', () => {
        const leaf1 = makeNode('leaf1');
        const leaf2 = makeNode('leaf2');
        const root = makeNode('root', null, { children: [leaf1, leaf2] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, null, (n) => visited.push(n));
        expect(visited).toEqual([root]);
    });

    test('group children are recursed depth-first and each group visited exactly once', () => {
        const leaf = makeNode('leaf');
        const group = makeNode('group', null, { children: [leaf] });
        const root = makeNode('root', null, { children: [group] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, null, (n) => visited.push(n));
        expect(visited).toHaveLength(2);
        expect(visited).not.toContain(leaf);
        expect(visited.indexOf(group)).toBeLessThan(visited.indexOf(root));
    });

    test('mixed tree visits only group nodes', () => {
        const leaf1 = makeNode('leaf1');
        const leaf2 = makeNode('leaf2');
        const groupA = makeNode('groupA', null, { children: [leaf1] });
        const root = makeNode('root', null, { children: [groupA, leaf2] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, null, (n) => visited.push(n));
        expect(visited).toContain(groupA);
        expect(visited).toContain(root);
        expect(visited).not.toContain(leaf1);
        expect(visited).not.toContain(leaf2);
    });
});
