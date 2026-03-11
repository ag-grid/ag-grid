/**
 * ChangedPath CSRM pipeline benchmark.
 * Compares new bitfield-based ChangedCellsPath against the old object-keyed implementation.
 *
 * Run with:
 *   yarn nx benchmark ag-behavioural-testing -- src/services/benchmarks/changedPath.bench.ts
 */
import { bench, describe } from 'vitest';

import type { RowNode } from 'ag-grid-community';
import {
    ChangedCellsPath,
    ChangedRowsPath,
    _forEachChangedGroupDepthFirst,
    _forEachChangedNodeDepthFirst,
} from 'ag-grid-community';

import { SimplePRNG } from '../../test-utils';

interface OldPathItem {
    rowNode: RowNode;
    children: OldPathItem[] | null;
}

/** Simplified old ChangedPath from latest — object-keyed, string-keyed column tracking. */
class OldChangedPath {
    private readonly keepingColumns: boolean;
    private readonly pathRoot: OldPathItem;
    private nodeIdsToColumns: { [nodeId: string]: { [colId: string]: boolean } } = {};
    private mapToItems: { [id: string]: OldPathItem } = {};

    constructor(keepingColumns: boolean, rootNode: RowNode) {
        this.keepingColumns = keepingColumns;
        this.pathRoot = { rowNode: rootNode, children: null };
        this.mapToItems[rootNode.id!] = this.pathRoot;
    }

    addParentNode(rowNode: RowNode | null, colIds: string[]): void {
        if (!rowNode) {
            return;
        }
        // Create path items
        let pointer: RowNode = rowNode;
        let newEntryCount = 0;
        while (!this.mapToItems[pointer.id!]) {
            this.mapToItems[pointer.id!] = { rowNode: pointer, children: null };
            newEntryCount++;
            pointer = pointer.parent!;
        }
        // Link path items
        pointer = rowNode;
        for (let i = 0; i < newEntryCount; i++) {
            const thisItem = this.mapToItems[pointer.id!];
            const parentItem = this.mapToItems[pointer.parent!.id!];
            if (!parentItem.children) {
                parentItem.children = [];
            }
            parentItem.children.push(thisItem);
            pointer = pointer.parent!;
        }
        // Populate columns
        if (this.keepingColumns && colIds) {
            pointer = rowNode;
            while (pointer) {
                if (!this.nodeIdsToColumns[pointer.id!]) {
                    this.nodeIdsToColumns[pointer.id!] = {};
                }
                for (const col of colIds) {
                    this.nodeIdsToColumns[pointer.id!][col] = true;
                }
                pointer = pointer.parent!;
            }
        }
    }

    canSkip(rowNode: RowNode): boolean {
        return !this.mapToItems[rowNode.id!];
    }

    getValueColumnsForNode(rowNode: RowNode, colIds: string[]): string[] {
        if (!this.keepingColumns) {
            return colIds;
        }
        const colsForThisNode = this.nodeIdsToColumns[rowNode.id!];
        return colIds.filter((col) => colsForThisNode[col]);
    }

    forEachChangedNodeDepthFirst(callback: (rowNode: RowNode) => void): void {
        this._dfs(this.pathRoot, callback);
    }

    private _dfs(item: OldPathItem, callback: (rowNode: RowNode) => void): void {
        if (item.children) {
            for (const child of item.children) {
                this._dfs(child, callback);
            }
        }
        callback(item.rowNode);
    }
}

let nodeCounter = 0;
function makeNode(id: string, parent: RowNode | null = null): RowNode {
    return {
        id: `${id}_${nodeCounter++}`,
        parent,
        level: parent ? parent.level + 1 : -1,
        childrenAfterGroup: null,
        destroyed: false,
    } as unknown as RowNode;
}

function buildTree(childrenPerGroup: number, depth: number) {
    const root = makeNode('root', null);
    (root as any).childrenAfterGroup = [];
    const allNodes: RowNode[] = [root];
    const leaves: RowNode[] = [];

    function build(parent: RowNode, level: number, prefix: string): void {
        for (let g = 0; g < childrenPerGroup; g++) {
            const id = `${prefix}-${g}`;
            if (level < depth) {
                const node = makeNode(id, parent);
                (node as any).childrenAfterGroup = [];
                allNodes.push(node);
                (parent.childrenAfterGroup as RowNode[]).push(node);
                build(node, level + 1, id);
            } else {
                const leaf = makeNode(id, parent);
                allNodes.push(leaf);
                leaves.push(leaf);
                (parent.childrenAfterGroup as RowNode[]).push(leaf);
            }
        }
    }

    build(root, 1, 'n');
    return { root, allNodes, leaves };
}

const colIds = ['value', 'count', 'sum'];

// ~21k nodes, 7 levels deep, 2000 changed leaves
const tree = buildTree(4, 7);
const prng = new SimplePRNG(0xc4a3b1d9);
const shuffled = tree.leaves.slice();
prng.shuffle(shuffled);
const changed = shuffled.slice(0, 2000);
const allNodes = tree.allNodes;

describe(`CSRM pipeline — ${changed.length} changed / ${allNodes.length} total`, () => {
    bench('NEW: ChangedCellsPath (bit-field)', () => {
        const path = new ChangedCellsPath();
        for (let i = 0; i < changed.length; i++) {
            for (let c = 0; c < colIds.length; c++) {
                path.addCell(changed[i], colIds[c]);
            }
        }
        _forEachChangedNodeDepthFirst(tree.root, path, () => {});
        let n = 0;
        for (let i = 0; i < allNodes.length; i++) {
            if (path.hasRow(allNodes[i])) {
                n++;
            }
        }
        const colSlots = colIds.map((id) => path.getSlot(id));
        _forEachChangedGroupDepthFirst(tree.root, path, (rowNode) => {
            const rowSlot = path.getSlot(rowNode);
            for (let c = 0; c < colIds.length; c++) {
                if (path.hasCellBySlot(rowSlot, colSlots[c])) {
                    n++;
                }
            }
        });
        _forEachChangedGroupDepthFirst(tree.root, path, () => {});
        void n;
    });

    bench('NEW: ChangedRowsPath (Set-based)', () => {
        const path = new ChangedRowsPath();
        for (let i = 0; i < changed.length; i++) {
            path.addRow(changed[i]);
        }
        _forEachChangedNodeDepthFirst(tree.root, path, () => {});
        let n = 0;
        for (let i = 0; i < allNodes.length; i++) {
            if (path.hasRow(allNodes[i])) {
                n++;
            }
        }
        _forEachChangedGroupDepthFirst(tree.root, path, () => {
            n++;
        });
        _forEachChangedGroupDepthFirst(tree.root, path, () => {});
        void n;
    });

    bench('OLD: ChangedPath (object-keyed columns)', () => {
        const path = new OldChangedPath(true, tree.root);
        for (let i = 0; i < changed.length; i++) {
            path.addParentNode(changed[i], colIds);
        }
        path.forEachChangedNodeDepthFirst(() => {});
        let n = 0;
        for (let i = 0; i < allNodes.length; i++) {
            if (!path.canSkip(allNodes[i])) {
                n++;
            }
        }
        path.forEachChangedNodeDepthFirst((rowNode) => {
            const valueCols = path.getValueColumnsForNode(rowNode, colIds);
            n += valueCols.length;
        });
        path.forEachChangedNodeDepthFirst(() => {});
        void n;
    });

    bench('OLD: ChangedPath (object-keyed)', () => {
        const path = new OldChangedPath(false, tree.root);
        for (let i = 0; i < changed.length; i++) {
            path.addParentNode(changed[i], colIds);
        }
        path.forEachChangedNodeDepthFirst(() => {});
        let n = 0;
        for (let i = 0; i < allNodes.length; i++) {
            if (!path.canSkip(allNodes[i])) {
                n++;
            }
        }
        path.forEachChangedNodeDepthFirst((rowNode) => {
            const valueCols = path.getValueColumnsForNode(rowNode, colIds);
            n += valueCols.length;
        });
        path.forEachChangedNodeDepthFirst(() => {});
        void n;
    });
});

// ─── Many-columns benchmark (tests variable stride) ─────────────────────────

const manyColIds = Array.from({ length: 50 }, (_, i) => `col${i}`);
const smallTree = buildTree(3, 4);
const smallPrng = new SimplePRNG(0xabcd1234);
const smallShuffled = smallTree.leaves.slice();
smallPrng.shuffle(smallShuffled);
const smallChanged = smallShuffled.slice(0, 50);

describe(`Many columns (${manyColIds.length} cols) — ${smallChanged.length} changed / ${smallTree.allNodes.length} total`, () => {
    bench('NEW: ChangedCellsPath (50 columns, bitfield)', () => {
        const path = new ChangedCellsPath();
        for (let i = 0; i < smallChanged.length; i++) {
            for (let c = 0; c < manyColIds.length; c++) {
                path.addCell(smallChanged[i], manyColIds[c]);
            }
        }
        let n = 0;
        const colSlots = manyColIds.map((id) => path.getSlot(id));
        _forEachChangedGroupDepthFirst(smallTree.root, path, (rowNode) => {
            const rowSlot = path.getSlot(rowNode);
            for (let c = 0; c < manyColIds.length; c++) {
                if (path.hasCellBySlot(rowSlot, colSlots[c])) {
                    n++;
                }
            }
        });
        void n;
    });

    bench('OLD: ChangedPath (50 columns, object-keyed)', () => {
        const path = new OldChangedPath(true, smallTree.root);
        for (let i = 0; i < smallChanged.length; i++) {
            path.addParentNode(smallChanged[i], manyColIds);
        }
        let n = 0;
        path.forEachChangedNodeDepthFirst((rowNode) => {
            const valueCols = path.getValueColumnsForNode(rowNode, manyColIds);
            n += valueCols.length;
        });
        void n;
    });
});
