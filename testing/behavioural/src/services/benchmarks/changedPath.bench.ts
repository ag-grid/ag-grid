/**
 * ChangedPath CSRM pipeline benchmark — mirrors real-life scenarios.
 *
 * Scenario A (changeDetectionService): single cell edit triggers addCell once, then full pipeline.
 * Scenario B (clipboardService paste): paste 500 cells across different rows/columns, then pipeline.
 * Scenario C (ChangedRowsPath): addRow per changed row (no column tracking), then pipeline.
 *
 * Run with:
 *   ./behave.sh "changedPath.bench" --bench
 */
import { bench, suite } from 'vitest';

import type { RowNode } from 'ag-grid-community';
import {
    ChangedCellsPath,
    ChangedRowsPath,
    _forEachChangedGroupDepthFirst,
    _forEachChangedNodeDepthFirst,
} from 'ag-grid-community';

import { SimplePRNG } from '../../test-utils';

// ── Stubs ─────────────────────────────────────────────────────────────────────

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

// ── Tree builder ──────────────────────────────────────────────────────────────

function buildTree(groupsPerLevel: number, levels: number, leavesPerLeafGroup: number) {
    const root = makeNode('root', null);
    (root as any).childrenAfterGroup = [];
    const allNodes: RowNode[] = [root];
    const leaves: RowNode[] = [];

    function build(parent: RowNode, level: number, prefix: string): void {
        for (let g = 0; g < groupsPerLevel; g++) {
            const id = `${prefix}-${g}`;
            if (level < levels) {
                const node = makeNode(id, parent);
                (node as any).childrenAfterGroup = [];
                allNodes.push(node);
                (parent.childrenAfterGroup as RowNode[]).push(node);
                build(node, level + 1, id);
            } else {
                for (let l = 0; l < leavesPerLeafGroup; l++) {
                    const leaf = makeNode(`${id}-l${l}`, parent);
                    allNodes.push(leaf);
                    leaves.push(leaf);
                    (parent.childrenAfterGroup as RowNode[]).push(leaf);
                }
            }
        }
    }

    build(root, 1, 'n');
    return { root, allNodes, leaves };
}

// ── Pipeline helpers ──────────────────────────────────────────────────────────

function runPipeline(path: ChangedRowsPath | ChangedCellsPath, root: RowNode, allNodes: RowNode[]): void {
    // Filter stage
    _forEachChangedNodeDepthFirst(root, path, () => {});
    // Sort stage: membership checks on all rows
    let n = 0;
    for (let i = 0; i < allNodes.length; i++) {
        if (path.hasRow(allNodes[i])) {
            n++;
        }
    }
    // Aggregation stage
    _forEachChangedGroupDepthFirst(root, path, () => {
        n++;
    });
    // Pivot stage
    _forEachChangedGroupDepthFirst(root, path, () => {});
    void n;
}

function runPipelineWithColumnChecks(
    path: ChangedCellsPath,
    root: RowNode,
    allNodes: RowNode[],
    colIds: string[]
): void {
    // Filter stage
    _forEachChangedNodeDepthFirst(root, path, () => {});
    // Sort stage: membership checks on all rows
    let n = 0;
    for (let i = 0; i < allNodes.length; i++) {
        if (path.hasRow(allNodes[i])) {
            n++;
        }
    }
    // Aggregation stage: check per-column changes (real aggregation skips unchanged columns)
    const colSlots = colIds.map((id) => path.getSlot(id));
    _forEachChangedGroupDepthFirst(root, path, (rowNode) => {
        const rowSlot = path.getSlot(rowNode);
        for (let c = 0; c < colSlots.length; c++) {
            if (path.hasCellBySlot(rowSlot, colSlots[c])) {
                n++;
            }
        }
    });
    // Pivot stage
    _forEachChangedGroupDepthFirst(root, path, () => {});
    void n;
}

// ── Fixture: 500 changed, 10 levels ──────────────────────────────────────────

const tree = buildTree(2, 10, 4);
const prng = new SimplePRNG(0xc4a3b1d9);
const shuffled = tree.leaves.slice();
prng.shuffle(shuffled);
const changed = shuffled.slice(0, Math.min(500, shuffled.length));

const colIds3 = ['value', 'count', 'sum'];
const colIds25 = Array.from({ length: 25 }, (_, i) => `col${i}`);
const allNodes = tree.allNodes;
const tag = `500/${allNodes.length} nodes, 10 levels`;

// ── Benchmarks ───────────────────────────────────────────────────────────────

suite(`CSRM pipeline — ${tag}`, () => {
    bench('ChangedRowsPath: addRow (no column tracking)', () => {
        const path = new ChangedRowsPath();
        for (let i = 0; i < changed.length; i++) {
            path.addRow(changed[i]);
        }
        runPipeline(path, tree.root, allNodes);
    });

    bench('ChangedCellsPath: paste 500 cells, 3 columns', () => {
        const path = new ChangedCellsPath();
        for (let i = 0; i < changed.length; i++) {
            path.addCell(changed[i], colIds3[i % colIds3.length]);
        }
        runPipelineWithColumnChecks(path, tree.root, allNodes, colIds3);
    });

    bench('ChangedCellsPath: paste 500 cells, 25 columns', () => {
        const path = new ChangedCellsPath();
        for (let i = 0; i < changed.length; i++) {
            path.addCell(changed[i], colIds25[i % colIds25.length]);
        }
        runPipelineWithColumnChecks(path, tree.root, allNodes, colIds25);
    });

    bench('ChangedCellsPath: single cell edit', () => {
        const path = new ChangedCellsPath();
        path.addCell(changed[0], colIds3[0]);
        runPipelineWithColumnChecks(path, tree.root, allNodes, colIds3);
    });
});
