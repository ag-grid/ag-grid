import { _getClientSideRowModel } from '../api/rowModelApiUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { CellValueChangedEvent } from '../events';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { ChangedPath } from '../utils/changedPath';

// Matches value in clipboard module
const SOURCE_PASTE = 'paste';

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
        if (this.deferredDepth === 0) {
            return;
        }
        if (--this.deferredDepth > 0) {
            return;
        }

        // Snapshot and clear accumulated state.
        const path = this.batchedPath;
        const nodes = this.batchedNodes;
        this.batchedPath = null;
        this.batchedNodes = null;

        if (path) {
            this.csrm?.doAggregate(path);
        }

        const { rowRenderer } = this.beans;

        // Refresh nodes not in the path (CSRM leaves, or all nodes for non-CSRM).
        if (nodes) {
            for (const node of nodes) {
                refreshRowAndSiblings(rowRenderer, node);
            }
        }

        // Refresh group nodes from the path in depth-first order (deepest first).
        if (path) {
            const rows = path.getSortedRows();
            for (let i = 0, len = rows.length; i < len; ++i) {
                refreshRowAndSiblings(rowRenderer, rows[i]);
            }
        }

        // Aggregate-dependent columns (e.g. Show Values As) read totals that just changed, so their cells in the
        // rendered rows NOT refreshed above are now stale — the edit flow re-aggregates without a full model
        // refresh, so nothing else does this. The refreshed rows are skipped via the `nodes`/`path` O(1) lookups
        // (they already flashed their own moved cells); the rest refresh on change per `enableCellChangeFlash`.
        this.beans.showValuesAsSvc?.refreshRenderedCellsExcept(nodes, path);

        // If re-entrant events accumulated during the flush, process them now.
        if (this.batchedPath || this.batchedNodes) {
            this.deferredDepth = 1;
            this.endDeferred();
        }
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
                const nodes = (this.batchedNodes ??= new Set());
                nodes.add(node);
                pathNode = node.parent;
            }
            batchedPath?.addCell(pathNode, (event.column as AgColumn).colId);
        } else {
            // Non-CSRM: no path, queue for direct refresh.
            const nodes = (this.batchedNodes ??= new Set());
            nodes.add(node);
        }

        // If not inside an outer deferred block, flush immediately.
        // Guard re-entrance: depth=1 so any cellValueChanged fired during doAggregate/refresh
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
