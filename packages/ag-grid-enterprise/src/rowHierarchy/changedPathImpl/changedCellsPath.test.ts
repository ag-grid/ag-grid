import type { RowNode } from 'ag-grid-community';

import { ChangedCellsPathImpl as ChangedCellsPath } from './changedCellsPath';

// ─── Minimal stubs ────────────────────────────────────────────────────────────

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

function collectRows(path: ChangedCellsPath): RowNode[] {
    return [...path.getSortedRows()];
}

function hasCol(path: ChangedCellsPath, node: RowNode, colId: string): boolean {
    return path.hasCellBySlot(path.getSlot(node), path.getSlot(colId));
}

function makeChain(depth: number): RowNode[] {
    const chain: RowNode[] = [makeNode('root')];
    for (let i = 1; i <= depth; ++i) {
        chain.push(makeNode(`n${i}`, chain[i - 1]));
    }
    return chain;
}

// ─── ChangedCellsPath-specific tests ─────────────────────────────────────────

describe('ChangedCellsPath', () => {
    describe('addRow — all-columns semantics', () => {
        test('getSlot returns -1 for addRow node (all columns changed)', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addRow(leaf);
            expect(path.getSlot(leaf)).toBe(-1);
            expect(path.getSlot(root)).toBe(-1);
            expect(hasCol(path, leaf, 'any')).toBe(true);
        });
    });

    describe('addCell — column tracking', () => {
        test('column is registered on the leaf and all ancestors up to root', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'value');

            expect(hasCol(path, leaf, 'value')).toBe(true);
            expect(hasCol(path, leaf, 'other')).toBe(false);
            expect(hasCol(path, group, 'value')).toBe(true);
            expect(hasCol(path, root, 'value')).toBe(true);
        });

        test('two different columns on same leaf are both tracked', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'A');
            path.addCell(leaf, 'B');

            expect(hasCol(path, leaf, 'A')).toBe(true);
            expect(hasCol(path, leaf, 'B')).toBe(true);
        });

        test('column on one sibling is not visible on the other sibling', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf1 = makeNode('leaf1', group);
            const leaf2 = makeNode('leaf2', group);
            const path = new ChangedCellsPath();
            path.addCell(leaf1, 'A');
            path.addCell(leaf2, 'B');

            expect(hasCol(path, leaf1, 'A')).toBe(true);
            expect(hasCol(path, leaf1, 'B')).toBe(false);
            expect(hasCol(path, leaf2, 'B')).toBe(true);
            expect(hasCol(path, leaf2, 'A')).toBe(false);
            expect(hasCol(path, group, 'A')).toBe(true);
            expect(hasCol(path, group, 'B')).toBe(true);
            expect(hasCol(path, root, 'A')).toBe(true);
            expect(hasCol(path, root, 'B')).toBe(true);
        });

        test('adding same column twice on same node is idempotent', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'value');
            path.addCell(leaf, 'value');
            expect(hasCol(path, leaf, 'value')).toBe(true);
        });

        test('addCell on root registers column on root', () => {
            const root = makeNode('root');
            const path = new ChangedCellsPath();
            path.addCell(root, 'A');

            expect(hasCol(path, root, 'A')).toBe(true);
            expect(collectRows(path)).toEqual([root]);
        });

        test('early-stop: second addCell with same column on cousin skips shared ancestors', () => {
            const root = makeNode('root');
            const groupA = makeNode('groupA', root);
            const groupB = makeNode('groupB', root);
            const leafA = makeNode('leafA', groupA);
            const leafB = makeNode('leafB', groupB);
            const path = new ChangedCellsPath();
            path.addCell(leafA, 'X');
            path.addCell(leafB, 'X');

            expect(hasCol(path, leafA, 'X')).toBe(true);
            expect(hasCol(path, groupA, 'X')).toBe(true);
            expect(hasCol(path, leafB, 'X')).toBe(true);
            expect(hasCol(path, groupB, 'X')).toBe(true);
            expect(hasCol(path, root, 'X')).toBe(true);
        });

        test('column propagated through all intermediate nodes in a deep chain', () => {
            const chain = makeChain(10);
            const path = new ChangedCellsPath();
            path.addCell(chain[10], 'deep');

            for (let i = 0; i <= 10; i++) {
                expect(hasCol(path, chain[i], 'deep')).toBe(true);
            }
            expect(hasCol(path, chain[5], 'other')).toBe(false);
        });
    });

    describe('getSlot + hasCellBySlot', () => {
        test('getSlot returns -1 for node not in path', () => {
            const root = makeNode('root');
            const other = makeNode('other', root);
            const path = new ChangedCellsPath();
            path.addRow(root);
            expect(path.getSlot(other)).toBe(-1);
            expect(path.hasCellBySlot(-1, path.getSlot('any'))).toBe(true);
        });

        test('getSlot returns >= 0 for cell-tracked node', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'A');
            expect(path.getSlot(leaf)).toBeGreaterThanOrEqual(0);
        });

        test('hasCellBySlot returns true for tracked column, false for untracked', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'A');
            path.addCell(leaf, 'B');
            const idx = path.getSlot(leaf);
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(path.hasCellBySlot(idx, path.getSlot('A'))).toBe(true);
            expect(path.hasCellBySlot(idx, path.getSlot('B'))).toBe(true);
            expect(path.hasCellBySlot(idx, path.getSlot('C'))).toBe(false);
        });
    });

    describe('mixed addRow/addCell usage', () => {
        test('addRow then addCell on same node — all columns still changed', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const path = new ChangedCellsPath();
            path.addRow(leaf);
            path.addCell(leaf, 'A');

            expect(hasCol(path, leaf, 'A')).toBe(true);
            expect(hasCol(path, leaf, 'anything')).toBe(true);
            expect(hasCol(path, group, 'A')).toBe(true);
            expect(hasCol(path, root, 'A')).toBe(true);
        });

        test('addCell then addRow on same node — upgrades to all columns', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'A');
            expect(path.getSlot(leaf)).toBeGreaterThanOrEqual(0);
            path.addRow(leaf);
            expect(path.getSlot(leaf)).toBe(-1);
            expect(hasCol(path, leaf, 'anything')).toBe(true);
        });

        test('addCell with colId then addCell with null colId — upgrades to all columns', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'A');
            expect(path.getSlot(leaf)).toBeGreaterThanOrEqual(0);
            path.addCell(leaf, null);
            expect(path.getSlot(leaf)).toBe(-1);
            expect(hasCol(path, leaf, 'anything')).toBe(true);
        });

        test('addCell then addRow on different node in same path', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf1 = makeNode('leaf1', group);
            const leaf2 = makeNode('leaf2', group);
            const path = new ChangedCellsPath();
            path.addCell(leaf1, 'A');
            path.addRow(leaf2);

            expect(hasCol(path, leaf1, 'A')).toBe(true);
            expect(hasCol(path, group, 'A')).toBe(true);
            expect(hasCol(path, root, 'A')).toBe(true);
            expect(path.getSlot(leaf2)).toBe(-1);
            expect(hasCol(path, leaf2, 'A')).toBe(true);
            expect(hasCol(path, leaf2, 'anything')).toBe(true);
        });

        test('addRow on ancestor does not affect cell-tracked descendant', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const path = new ChangedCellsPath();
            path.addCell(leaf, 'A');
            path.addRow(group);

            // leaf still cell-tracked
            expect(path.getSlot(leaf)).toBeGreaterThanOrEqual(0);
            expect(hasCol(path, leaf, 'A')).toBe(true);
            expect(hasCol(path, leaf, 'B')).toBe(false);
            // group upgraded to all-columns
            expect(path.getSlot(group)).toBe(-1);
            expect(hasCol(path, group, 'anything')).toBe(true);
        });

        test('addCell after addRow on sibling — both coexist', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = new ChangedCellsPath();
            path.addRow(leaf1);
            path.addCell(leaf2, 'X');

            expect(path.getSlot(leaf1)).toBe(-1);
            expect(hasCol(path, leaf1, 'anything')).toBe(true);
            const leaf2Id = path.getSlot(leaf2);
            expect(leaf2Id).toBeGreaterThanOrEqual(0);
            expect(path.hasCellBySlot(leaf2Id, path.getSlot('X'))).toBe(true);
            expect(path.hasCellBySlot(leaf2Id, path.getSlot('Y'))).toBe(false);
        });

        test('interleaved addRow and addCell on many nodes', () => {
            const root = makeNode('root');
            const nodes: RowNode[] = [];
            for (let i = 0; i < 20; i++) {
                nodes.push(makeNode(`n${i}`, root));
            }
            const path = new ChangedCellsPath();
            for (let i = 0; i < 20; i++) {
                if (i % 2 === 0) {
                    path.addRow(nodes[i]);
                } else {
                    path.addCell(nodes[i], `col${i}`);
                }
            }
            for (let i = 0; i < 20; i++) {
                expect(path.hasRow(nodes[i])).toBe(true);
                if (i % 2 === 0) {
                    expect(path.getSlot(nodes[i])).toBe(-1);
                } else {
                    expect(path.getSlot(nodes[i])).toBeGreaterThanOrEqual(0);
                    expect(hasCol(path, nodes[i], `col${i}`)).toBe(true);
                }
            }
        });
    });

    describe('many columns (word growth)', () => {
        test('handles exactly 32 columns without word growth', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 32; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const idx = path.getSlot(leaf);
            expect(idx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 32; i++) {
                expect(path.hasCellBySlot(idx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(idx, path.getSlot('col32'))).toBe(false);
        });

        test('handles 33 columns (first word growth: 1→2 words)', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 33; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const idx = path.getSlot(leaf);
            expect(idx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 33; i++) {
                expect(path.hasCellBySlot(idx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(idx, path.getSlot('col33'))).toBe(false);
        });

        test('handles 64 columns (fills 2 words exactly)', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 64; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const idx = path.getSlot(leaf);
            expect(idx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 64; i++) {
                expect(path.hasCellBySlot(idx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(idx, path.getSlot('col64'))).toBe(false);
        });

        test('handles 65 columns (word growth: 2→3 words)', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 65; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const idx = path.getSlot(leaf);
            expect(idx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 65; i++) {
                expect(path.hasCellBySlot(idx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(idx, path.getSlot('col65'))).toBe(false);
        });

        test('handles 100 columns (multiple word growths)', () => {
            const root = makeNode('root');
            const group = makeNode('group', root);
            const leaf = makeNode('leaf', group);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 100; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const leafIdx = path.getSlot(leaf);
            const groupIdx = path.getSlot(group);
            const rootIdx = path.getSlot(root);
            expect(leafIdx).toBeGreaterThanOrEqual(0);
            expect(groupIdx).toBeGreaterThanOrEqual(0);
            expect(rootIdx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 100; i++) {
                expect(path.hasCellBySlot(leafIdx, path.getSlot(`col${i}`))).toBe(true);
                expect(path.hasCellBySlot(groupIdx, path.getSlot(`col${i}`))).toBe(true);
                expect(path.hasCellBySlot(rootIdx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(leafIdx, path.getSlot('col100'))).toBe(false);
        });

        test('handles 129 columns (5 words)', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 129; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const leafIdx = path.getSlot(leaf);
            const rootIdx = path.getSlot(root);
            expect(leafIdx).toBeGreaterThanOrEqual(0);
            expect(rootIdx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 129; i++) {
                expect(path.hasCellBySlot(leafIdx, path.getSlot(`col${i}`))).toBe(true);
                expect(path.hasCellBySlot(rootIdx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(leafIdx, path.getSlot('col129'))).toBe(false);
        });

        test('word growth preserves all-columns sentinel (-1)', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = new ChangedCellsPath();
            path.addRow(leaf1);
            // Add 40 columns on leaf2, triggering word growth
            for (let i = 0; i < 40; i++) {
                path.addCell(leaf2, `col${i}`);
            }
            expect(path.getSlot(leaf1)).toBe(-1);
            expect(hasCol(path, leaf1, 'anything')).toBe(true);
            const leaf2Idx = path.getSlot(leaf2);
            expect(leaf2Idx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 40; i++) {
                expect(path.hasCellBySlot(leaf2Idx, path.getSlot(`col${i}`))).toBe(true);
            }
        });

        test('word growth with multiple rows preserves all data', () => {
            const root = makeNode('root');
            const groupA = makeNode('groupA', root);
            const groupB = makeNode('groupB', root);
            const leafA = makeNode('leafA', groupA);
            const leafB = makeNode('leafB', groupB);
            const path = new ChangedCellsPath();
            path.addCell(leafA, 'colA');
            path.addCell(leafB, 'colB');
            // Force word growth
            for (let i = 0; i < 40; i++) {
                path.addCell(leafA, `extra${i}`);
            }
            expect(hasCol(path, leafA, 'colA')).toBe(true);
            expect(hasCol(path, leafA, 'colB')).toBe(false);
            expect(hasCol(path, leafB, 'colB')).toBe(true);
            expect(hasCol(path, leafB, 'colA')).toBe(false);
            expect(hasCol(path, root, 'colA')).toBe(true);
            expect(hasCol(path, root, 'colB')).toBe(true);
        });

        test('word growth with many rows and many columns', () => {
            const root = makeNode('root');
            const leaves: RowNode[] = [];
            for (let i = 0; i < 10; i++) {
                leaves.push(makeNode(`leaf${i}`, root));
            }
            const path = new ChangedCellsPath();
            for (let i = 0; i < 10; i++) {
                for (let c = 0; c < 40; c++) {
                    path.addCell(leaves[i], `col_${i}_${c}`);
                }
            }
            for (let i = 0; i < 10; i++) {
                const idx = path.getSlot(leaves[i]);
                expect(idx).toBeGreaterThanOrEqual(0);
                for (let c = 0; c < 40; c++) {
                    expect(path.hasCellBySlot(idx, path.getSlot(`col_${i}_${c}`))).toBe(true);
                }
                const otherLeaf = (i + 1) % 10;
                expect(path.hasCellBySlot(idx, path.getSlot(`col_${otherLeaf}_0`))).toBe(false);
            }
            for (let i = 0; i < 10; i++) {
                for (let c = 0; c < 40; c++) {
                    expect(hasCol(path, root, `col_${i}_${c}`)).toBe(true);
                }
            }
        });

        test('word growth interleaved with addRow', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const leaf3 = makeNode('leaf3', root);
            const path = new ChangedCellsPath();

            for (let i = 0; i < 20; i++) {
                path.addCell(leaf1, `col${i}`);
            }
            path.addRow(leaf2);
            for (let i = 20; i < 40; i++) {
                path.addCell(leaf1, `col${i}`);
            }
            for (let i = 0; i < 10; i++) {
                path.addCell(leaf3, `other${i}`);
            }

            const leaf1Id = path.getSlot(leaf1);
            expect(leaf1Id).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 40; i++) {
                expect(path.hasCellBySlot(leaf1Id, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.getSlot(leaf2)).toBe(-1);
            expect(hasCol(path, leaf2, 'anything')).toBe(true);
            const leaf3Id = path.getSlot(leaf3);
            expect(leaf3Id).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 10; i++) {
                expect(path.hasCellBySlot(leaf3Id, path.getSlot(`other${i}`))).toBe(true);
            }
        });

        test('no false positives at 32-column boundary', () => {
            const root = makeNode('root');
            const leaf = makeNode('leaf', root);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 32; i++) {
                path.addCell(leaf, `col${i}`);
            }
            const leafIdx = path.getSlot(leaf);
            const rootIdx = path.getSlot(root);
            expect(leafIdx).toBeGreaterThanOrEqual(0);
            expect(rootIdx).toBeGreaterThanOrEqual(0);
            for (let i = 0; i < 32; i++) {
                expect(path.hasCellBySlot(leafIdx, path.getSlot(`col${i}`))).toBe(true);
            }
            expect(path.hasCellBySlot(leafIdx, path.getSlot('col32'))).toBe(false);
        });

        test('200 columns across a deep chain (7 words)', () => {
            const chain = makeChain(5);
            const path = new ChangedCellsPath();
            for (let i = 0; i < 200; i++) {
                path.addCell(chain[5], `c${i}`);
            }
            for (let n = 0; n <= 5; n++) {
                const id = path.getSlot(chain[n]);
                expect(id).toBeGreaterThanOrEqual(0);
                for (let i = 0; i < 200; i++) {
                    expect(path.hasCellBySlot(id, path.getSlot(`c${i}`))).toBe(true);
                }
            }
        });
    });

    describe('cache invalidation', () => {
        test('addCell after getSortedRows — new node appears in next traversal', () => {
            const root = makeNode('root');
            const leaf1 = makeNode('leaf1', root);
            const leaf2 = makeNode('leaf2', root);
            const path = new ChangedCellsPath();

            path.addCell(leaf1, 'value');
            collectRows(path); // triggers sort

            path.addCell(leaf2, 'value');
            const visited = collectRows(path);
            expect(visited).toContain(leaf2);
            expect(visited).toContain(leaf1);
        });
    });
});
