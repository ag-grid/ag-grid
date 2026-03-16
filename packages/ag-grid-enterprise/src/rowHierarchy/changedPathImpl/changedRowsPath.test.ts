import type { ChangedPath, RowNode } from 'ag-grid-community';
import { _forEachChangedGroupDepthFirst } from 'ag-grid-community';

import { ChangedRowsPathImpl as ChangedRowsPath } from './changedRowsPath';

function makeNode(id: string, parent: RowNode | null = null, opts: { children?: RowNode[] } = {}): RowNode {
    return {
        id,
        parent,
        level: parent ? (parent as any).level + 1 : -1,
        rowPinned: null,
        childrenAfterGroup: opts.children ?? null,
        destroyed: false,
        isRowPinned: () => false,
    } as unknown as RowNode;
}

function collectGroups(root: RowNode, path: ChangedPath | undefined): RowNode[] {
    const nodes: RowNode[] = [];
    _forEachChangedGroupDepthFirst(root, true, path, (n) => nodes.push(n));
    return nodes;
}

function collectRows(path: ChangedPath): RowNode[] {
    return [...path.getSortedRows()];
}

describe('ChangedRowsPath', () => {
    describe('addCell delegates to addRow — colId is ignored', () => {
        test('addCell with colId tracks the row, not the column', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedRowsPath();
            path.addCell(leaf, 'someColumn');
            expect(path.hasRow(leaf)).toBe(true);
            expect(path.hasRow(root)).toBe(true);
            expect(collectRows(path)).toEqual([leaf, root]);
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
            _forEachChangedGroupDepthFirst(root, true, null, (n) => visitedAll.push(n));
            expect(visitedAll).toContain(root);
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
            _forEachChangedGroupDepthFirst(root, true, path, (n) => visited.push(n));
            expect(visited).toContain(root);
            expect(visited).toContain(group);
            expect(visited).not.toContain(leaf); // leaf has no childrenAfterGroup

            // Clearing childrenAfterGroup causes a node to be skipped
            (group as any).childrenAfterGroup = null;
            const visited2: RowNode[] = [];
            _forEachChangedGroupDepthFirst(root, true, path, (n) => visited2.push(n));
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

    describe('getSortedRows — deep chain with branch', () => {
        test('two branches at different depths — both sorted correctly', () => {
            const chain: RowNode[] = [makeNode('root')];
            for (let i = 1; i <= 500; ++i) {
                chain.push(makeNode(`n${i}`, chain[i - 1]));
            }
            const root = chain[0];
            const shallowLeaf = makeNode('shallow', chain[3]);
            const path = new ChangedRowsPath();
            path.addRow(chain[500]);
            path.addRow(shallowLeaf);

            const visited = collectRows(path);
            expect(visited.indexOf(shallowLeaf)).toBeLessThan(visited.indexOf(chain[3]));
            expect(visited[0]).toBe(chain[500]);
            expect(visited.at(-1)).toBe(root);
        });
    });
});

describe('_forEachChangedGroupDepthFirst', () => {
    test('root with no childrenAfterGroup (leaf root) is not visited', () => {
        const root = makeNode('root');
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, true, null, (n) => visited.push(n));
        expect(visited).toEqual([]);
    });

    test('root with empty children (group root) visits only root', () => {
        const root = makeNode('root', null, { children: [] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, true, null, (n) => visited.push(n));
        expect(visited).toEqual([root]);
    });

    test('leaf children (no childrenAfterGroup) are skipped', () => {
        const leaf1 = makeNode('leaf1');
        const leaf2 = makeNode('leaf2');
        const root = makeNode('root', null, { children: [leaf1, leaf2] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, true, null, (n) => visited.push(n));
        expect(visited).toEqual([root]);
    });

    test('group children are recursed depth-first and each group visited exactly once', () => {
        const leaf = makeNode('leaf');
        const group = makeNode('group', null, { children: [leaf] });
        const root = makeNode('root', null, { children: [group] });
        const visited: RowNode[] = [];
        _forEachChangedGroupDepthFirst(root, true, null, (n) => visited.push(n));
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
        _forEachChangedGroupDepthFirst(root, true, null, (n) => visited.push(n));
        expect(visited).toContain(groupA);
        expect(visited).toContain(root);
        expect(visited).not.toContain(leaf1);
        expect(visited).not.toContain(leaf2);
    });
});
