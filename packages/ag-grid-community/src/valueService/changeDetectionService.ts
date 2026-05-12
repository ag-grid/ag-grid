import { _getClientSideRowModel } from '../api/rowModelApiUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { RowNode } from '../entities/rowNode';
import type { CellValueChangedEvent } from '../events';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { ChangedPath } from '../utils/changedPath';

// Matches value in clipboard module
const SOURCE_PASTE = 'paste';

/**
 * limits the number of times `flush` can re-enter itself via `cellValueChanged` events fired during aggregate/refresh.
 * This should not happen but this is a safety guard against infinite loops in case of user code (e.g. aggFunc/valueGetter/cellRenderer) misbehaving and firing `cellValueChanged`
 */
const MAX_FLUSH_REPEAT = 3;

export class ChangeDetectionService extends BeanStub implements NamedBean {
    beanName = 'changeDetectionSvc' as const;

    /**
     * Nesting depth for `beginDeferred`/`endDeferred` calls.
     * Positive while a batch is active; `cellValueChanged` events are accumulated rather than flushed immediately.
     * Using a counter (not a boolean) so nested callers — e.g. `groupRowValueSetter` called from inside
     * a clipboard or fill-handle deferred block — do not prematurely flush the outer batch.
     */
    private deferredDepth = 0;

    /** Accumulated `ChangedPath` for the current batch (CSRM only). `null` until the first CSRM change arrives. */
    private batchedPath: ChangedPath | null = null;

    /** Nodes queued for direct refresh that are not in the path. */
    private batchedNodes: Set<RowNode> | null = null;

    /** Cached CSRM reference, set once in postConstruct. */
    private csrm: IClientSideRowModel | undefined;

    public override destroy(): void {
        super.destroy();
        this.batchedPath = null;
        this.batchedNodes = null;
    }

    public postConstruct(): void {
        this.csrm = _getClientSideRowModel(this.beans);
        this.addManagedEventListeners({ cellValueChanged: this.onCellValueChanged.bind(this) });
    }

    /**
     * Begin a deferred change-detection pass: subsequent `cellValueChanged` events are accumulated
     * rather than triggering individual aggregation + refresh passes. Flush happens on endDeferred().
     * Calls may be nested — flush only occurs when the outermost endDeferred() is reached.
     */
    public beginDeferred(): void {
        this.deferredDepth++;
    }

    /**
     * End a deferred pass. When the outermost call is reached (depth returns to zero), runs a single
     * aggregation pass over all accumulated changes and refreshes the affected rows in depth-first order.
     */
    public endDeferred(): void {
        const depth = this.deferredDepth;
        if (depth > 1) {
            this.deferredDepth = depth - 1;
            return;
        }
        if (depth <= 0) {
            return;
        }
        this.flush(0);
    }

    /**
     * Outermost endDeferred slow path. Keeps `deferredDepth` at 1 throughout the flush so any
     * `cellValueChanged` fired by a custom `aggFunc` / `valueGetter` / cell renderer accumulates
     * into batchedPath/batchedNodes and is processed by the re-entrance guard below, rather than
     * recursing into endDeferred mid-flush.
     */
    private flush(repeat: number): void {
        const batchedPath = this.batchedPath;
        const batchedNodes = this.batchedNodes;
        this.batchedPath = null;
        this.batchedNodes = null;

        try {
            if (batchedPath) {
                // `refresh: false` — aggStage processes the same set of rows the path loop below
                // refreshes, so skip the per-row queueing to avoid a double refresh on every group.
                this.csrm?.aggregate(batchedPath, false);
            }

            const rowRenderer = this.beans.rowRenderer;

            // `batchedNodes` and `batchedPath` are disjoint by construction: only leaf events queue
            // into `batchedNodes` (and their parent into the path); group events (including tree-data
            // data-bearing groups) go only into the path. The path only walks upward via `node.parent`,
            // so anything in `batchedNodes` (always a leaf) is never pulled into the path transitively.

            // Refresh nodes not in the path (CSRM leaves, or all nodes for non-CSRM).
            if (batchedNodes) {
                if (batchedPath?.kind === 'rows') {
                    for (const node of batchedNodes) {
                        if (!batchedPath.hasRow(node)) {
                            refreshRowAndSiblings(rowRenderer, node);
                        }
                    }
                } else {
                    for (const node of batchedNodes) {
                        refreshRowAndSiblings(rowRenderer, node);
                    }
                }
            }

            // Refresh group nodes from the path in depth-first order (deepest first).
            if (batchedPath) {
                const rows = batchedPath.getSortedRows();
                for (let i = 0, len = rows.length; i < len; ++i) {
                    refreshRowAndSiblings(rowRenderer, rows[i]);
                }
            }
        } finally {
            this.deferredDepth = 0;
        }

        // If re-entrant events accumulated during the flush, process them now.
        if (repeat < MAX_FLUSH_REPEAT && (this.batchedPath || this.batchedNodes)) {
            this.deferredDepth = 1;
            this.flush(repeat + 1);
        }
    }

    /**
     * Queues `node` for refresh on the next `endDeferred()` flush. The flush fans out to every
     * sibling via `refreshRowAndSiblings`, so callers only need to queue the primary — even when
     * only a sibling's `aggData` changed and the primary is not rendered.
     */
    public addRow(node: RowNode): void {
        let nodes = this.batchedNodes;
        if (!nodes) {
            nodes = new Set();
            this.batchedNodes = nodes;
        }
        nodes.add(node);
    }

    private onCellValueChanged(event: CellValueChangedEvent): void {
        const { gos, rowModel, changedPathFactory } = this.beans;
        if (event.source === SOURCE_PASTE || gos.get('suppressChangeDetection')) {
            return;
        }

        // rootNode is null only while the grid is being destroyed.
        if (!rowModel.rootNode) {
            return;
        }

        const node = event.node.primaryRow as RowNode;

        if (this.csrm) {
            let batchedPath = this.batchedPath;
            if (!batchedPath) {
                batchedPath = changedPathFactory?.newPath(gos.get('aggregateOnlyChangedColumns')) ?? null;
                this.batchedPath = batchedPath;
            }
            let pathNode: RowNode | null = node;
            if (!node.group) {
                // For leaf nodes, we want to mark the parent group as changed in the path
                // and add the leaf to the batch for direct refresh to run before groups.
                this.addRow(node);
                pathNode = node.parent;
            }
            batchedPath?.addCell(pathNode, event.column.getColId());
        } else {
            // Non-CSRM: no path, queue for direct refresh.
            this.addRow(node);
        }

        // If not inside an outer deferred block, flush immediately.
        // Guard re-entrance: depth=1 so any cellValueChanged fired during aggregate/refresh
        // accumulates for a follow-up pass rather than recursing.
        if (this.deferredDepth === 0) {
            this.deferredDepth = 1;
            this.endDeferred();
        }
    }
}

/** Refresh a node and all its siblings (footer, pinned, and their cross-combinations). */
const refreshRowAndSiblings = (rowRenderer: RowRenderer, node: RowNode): void => {
    const { sibling, pinnedSibling } = node;
    rowRenderer.refreshRowByNode(node);
    rowRenderer.refreshRowByNode(sibling);
    rowRenderer.refreshRowByNode(pinnedSibling);
    rowRenderer.refreshRowByNode(sibling?.pinnedSibling);
    rowRenderer.refreshRowByNode(pinnedSibling?.sibling);
};
