import { _getClientSideRowModel } from '../api/rowModelApiUtils';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { ROW_ID_PREFIX_BOTTOM_PINNED, ROW_ID_PREFIX_TOP_PINNED } from '../entities/rowNode';
import { _createRowNodeSibling } from '../entities/rowNodeUtils';
import { _addRowHeightChangedListener, _getGrandTotalPinnedFloat, _getRowHeightForNode } from '../gridOptionsUtils';
import type { RowPinningState } from '../interfaces/gridState';
import type { IClientSideRowModel } from '../interfaces/iClientSideRowModel';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { PinnedRows, _isPinnedNodeGrandTotal, _shouldHidePinnedRows } from './manualPinnedRowUtils';

export class ManualPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private top: PinnedRows;
    private bottom: PinnedRows;
    /** Cached CSRM reference, null if not using client-side row model */
    private csrm: IClientSideRowModel | null = null;
    /** True if using server-side row model */
    private ssrm: boolean = false;
    /**
     * Determines where the grand total row should be pinned. Need a separate flag to break
     * an infinite recursion with CSRM.
     */
    private _grandTotalPinned: RowPinnedType;

    public postConstruct(): void {
        const { gos, beans } = this;
        this.top = new PinnedRows(beans, 'top');
        this.bottom = new PinnedRows(beans, 'bottom');

        // Cache row model references
        this.csrm = _getClientSideRowModel(beans) ?? null;
        this.ssrm = beans.rowModel.getType() === 'serverSide';

        const runIsRowPinned = () => {
            const isRowPinned = gos.get('isRowPinned');
            const sources: RowNode[] = [];
            if (isRowPinned && gos.get('enableRowPinning')) {
                beans.rowModel.forEachNode((node) => this.pinLoaded(node, isRowPinned(node), sources), true);
            }
            this.dispatchPinningChanged(sources);
        };

        _addRowHeightChangedListener(this, () => {
            estimateRowHeights(this.top);
            estimateRowHeights(this.bottom);
        });

        this.addManagedEventListeners({
            modelUpdated: ({ keepRenderedRows }) => {
                const sources: RowNode[] = [];
                this.emptyQueue(this.top, sources);
                this.emptyQueue(this.bottom, sources);
                this.pinGrandTotalRow();

                const topVisibilityChanged = this.top.refreshVisibility();
                const visibilityChanged = this.bottom.refreshVisibility() || topVisibilityChanged;
                const positionsChanged = this.refreshRowPositions();

                if (!keepRenderedRows || positionsChanged || visibilityChanged || sources.length) {
                    this.eventSvc.dispatchEvent({ type: 'pinnedRowsChanged' });
                }
                dispatchRowPinned(sources);
            },
            columnRowGroupChanged: () => {
                const sources = this.detachPinnedRows(isPinnedGroupRow);
                if (sources.length) {
                    this.dispatchPinningChanged(sources);
                }
            },
            rowNodeDataChanged: ({ node }) => {
                const isRowPinnable = gos.get('isRowPinnable');
                const pinnable = isRowPinnable?.(node) ?? true;

                if (!pinnable) {
                    this.pinRow(node, null);
                }
            },
            firstDataRendered: runIsRowPinned,
        });

        this.addManagedPropertyListener('pivotMode', () => {
            this.top.refreshVisibility();
            this.bottom.refreshVisibility();
            this.refreshRowPositions();
            this.eventSvc.dispatchEvent({ type: 'pinnedRowsChanged' });
        });

        this.addManagedPropertyListener('grandTotalRow', ({ currentValue }) => {
            this._grandTotalPinned = _getGrandTotalPinnedFloat(currentValue);
        });

        this.addManagedPropertyListener('isRowPinned', runIsRowPinned);
    }

    public override destroy(): void {
        this.reset(false);
        super.destroy();
    }

    public reset(dispatch = true): void {
        // The grand total row belongs to `grandTotalRow`, so only destroy clears it. Queued ids are kept:
        // a row data replace resets here and brings the rows they wait for.
        const sources = this.detachPinnedRows(dispatch ? isManuallyPinnedRow : isAnyPinnedRow);
        if (dispatch) {
            this.dispatchPinningChanged(sources);
        }
    }

    public pinRow(rowNode: RowNode, float: RowPinnedType, column?: AgColumn | null): void {
        if (float != null && rowNode.destroyed) {
            return; // Don't pin destroyed nodes (but allow unpinning)
        }

        if (rowNode.footer) {
            const level = rowNode.level;

            if (level > -1) {
                return; // Forbid pinning group footers
            }

            // Pinning grand total row is the only case in which pinned rows are not duplicates of rows
            // in the main viewport. So we have to handle them differently:
            // 1. We first set `_grandTotalPinned` to mark the location the grand total row should be pinned to.
            // 2. Then we refresh the row model to hide the sticky footer.
            // 3. We then react to the `modelUpdated` event (above) to actually add the footer to the pinned row model.
            // Otherwise we would run into either an infinite recursion of `modelUpdated` events, or be missing the `sibling`
            // on the root node.
            // Skip this path when unpinning an existing clone (called from RowNode._destroy):
            // the standard unpin path below cleans the DOM without mutating _grandTotalPinned.
            const unpinningExistingClone = float == null && rowNode.rowPinned != null;
            if (level === -1 && !unpinningExistingClone) {
                this._grandTotalPinned = float;
                // CSRM goes through reMapRows so the modelUpdated listener picks up the
                // change; SSRM has no model-update path so we apply it directly.
                const csrm = this.csrm;
                if (csrm) {
                    csrm.reMapRows();
                } else if (this.ssrm) {
                    this.pinGrandTotalRow();
                }
                return;
            }
        }

        // cell-span pinning/unpinning
        const spannedRows = column && getSpannedRows(this.beans, rowNode, column);
        const sources: RowNode[] = [];
        for (const node of spannedRows ?? [rowNode]) {
            this.collectPinChange(node, float, sources);
        }
        if (sources.length) {
            this.dispatchPinningChanged(sources);
        }
    }

    public isManual(): boolean {
        return true;
    }

    public isEmpty(floating: NonNullable<RowPinnedType>): boolean {
        return this.getContainer(floating).getDisplayedCount() === 0;
    }

    public isRowsToRender(floating: NonNullable<RowPinnedType>): boolean {
        return !this.isEmpty(floating);
    }

    public ensureRowHeightsValid(): boolean {
        const bottomChanged = ensureRowHeightsValid(this.beans, this.bottom);
        const anyChange = ensureRowHeightsValid(this.beans, this.top) || bottomChanged;
        if (anyChange) {
            this.eventSvc.dispatchEvent({ type: 'pinnedHeightChanged' });
        }

        return anyChange;
    }

    public getPinnedTopTotalHeight(): number {
        return getTotalHeight(this.top);
    }

    public getPinnedBottomTotalHeight(): number {
        return getTotalHeight(this.bottom);
    }

    public getPinnedTopRowCount(): number {
        return this.top.getDisplayedCount();
    }

    public getPinnedBottomRowCount(): number {
        return this.bottom.getDisplayedCount();
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.top.getSorted()[index];
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.bottom.getSorted()[index];
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        return this.getContainer(floating).getById(id);
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        const container = this.getContainer(floating);
        const sorted = container.getSorted(); // re-sorted in place, so the reference stays valid
        // Length re-read each pass so a callback that pins or unpins cannot read past the end.
        for (let i = 0; i < container.getSorted().length; ++i) {
            callback(sorted[i], i);
        }
    }

    public getPinnedState(): RowPinningState {
        return { top: getPinnedIds(this.top), bottom: getPinnedIds(this.bottom) };
    }

    public setPinnedState(state: RowPinningState): void {
        const { top, bottom } = this;
        const topQueued = top.queued;
        const bottomQueued = bottom.queued;
        topQueued.clear();
        bottomQueued.clear();
        for (const id of state.bottom) {
            bottomQueued.add(id);
        }
        for (const id of state.top) {
            if (!bottomQueued.has(id)) {
                topQueued.add(id); // an id listed in both containers goes to the bottom
            }
        }
        // Rows listed in the other container are moved, not detached, so they report one `rowPinned`.
        const sources = this.detachPinnedRows((n) => {
            const id = n.pinnedSibling?.id;
            return isManuallyPinnedRow(n) && (id == null || !(topQueued.has(id) || bottomQueued.has(id)));
        });
        this.emptyQueue(top, sources);
        this.emptyQueue(bottom, sources);
        this.dispatchPinningChanged(sources); // even when only the queue changed, so the saved state follows
    }

    public getGrandTotalPinned(): RowPinnedType {
        return this._grandTotalPinned;
    }

    public setGrandTotalPinned(value: RowPinnedType): void {
        this._grandTotalPinned = value;
    }

    /** Pins the queued rows the row model has loaded, leaving the rest queued. */
    private emptyQueue(container: PinnedRows, sources: RowNode[]): void {
        const { queued, floating } = container;
        const rowModel = this.beans.rowModel;
        for (const id of queued) {
            const node = rowModel.getRowNode(id);
            if (node) {
                queued.delete(id);
                this.pinLoaded(node, floating, sources);
            }
        }
    }

    private pinLoaded(node: RowNode, float: RowPinnedType, sources: RowNode[]): void {
        if (node.footer) {
            this.pinRow(node, float); // the grand total row has its own path
        } else {
            this.collectPinChange(node, float, sources);
        }
    }

    /** Accepts the pinned row or its source row. */
    private collectPinChange(node: RowNode, float: RowPinnedType, sources: RowNode[]): void {
        const pinned = node.rowPinned ? node : node.pinnedSibling;
        const source = float ? this.attachPinnedRow(node, float) : this.detachPinnedRow(pinned);
        if (source) {
            sources.push(source);
        }
    }

    private pinGrandTotalRow() {
        const { beans, _grandTotalPinned: float } = this;

        // Grand total node is the root node's sibling in both CSRM and SSRM.
        // Other row models (Infinite, Viewport) have a rootNode but never set sibling.
        const sibling = this.csrm || this.ssrm ? beans.rowModel.rootNode?.sibling : undefined;

        if (!sibling) {
            return;
        }

        const pinnedSibling = sibling.pinnedSibling;
        if (float && pinnedSibling?.rowPinned === float) {
            return;
        }
        this.detachPinnedRow(pinnedSibling);
        if (float) {
            this.getContainer(float).add(_createPinnedSibling(beans, sibling, float), false);
        }
    }

    private getContainer(floating: NonNullable<RowPinnedType>): PinnedRows {
        return floating === 'top' ? this.top : this.bottom;
    }

    private findPinnedRowNode(node: RowNode): PinnedRows | undefined {
        if (this.top.all.has(node)) {
            return this.top;
        }
        if (this.bottom.all.has(node)) {
            return this.bottom;
        }
    }

    /** Unpins without refreshing positions or dispatching, so a batch pays for those once. Returns the source row. */
    private detachPinnedRow(pinned: RowNode | undefined): RowNode | undefined {
        const container = pinned && this.findPinnedRowNode(pinned);
        if (!container) {
            return undefined;
        }
        container.delete(pinned);
        const source = pinned.pinnedSibling;
        _destroyRowNodeSibling(pinned);
        return source;
    }

    /** Detaches every pinned node matching `predicate`, hidden ones included. Returns their source rows. */
    private detachPinnedRows(predicate: (pinned: RowNode) => boolean): RowNode[] {
        // Collected first: detaching mutates the set being iterated.
        const matched: RowNode[] = [];
        collectPinnedRows(this.top, predicate, matched);
        collectPinnedRows(this.bottom, predicate, matched);
        const sources: RowNode[] = [];
        for (let i = 0, len = matched.length; i < len; ++i) {
            const source = this.detachPinnedRow(matched[i]);
            if (source) {
                sources.push(source); // a synchronous listener may already have unpinned it
            }
        }
        return sources;
    }

    /** Pins or moves without refreshing positions or dispatching. Returns the source row if anything changed. */
    private attachPinnedRow(rowNode: RowNode, float: NonNullable<RowPinnedType>): RowNode | undefined {
        const source = rowNode.rowPinned ? rowNode.pinnedSibling : rowNode;
        if (!source || source.destroyed || source.pinnedSibling?.rowPinned === float) {
            return undefined;
        }
        this.detachPinnedRow(source.pinnedSibling);
        const hidden = _shouldHidePinnedRows(this.beans, source);
        this.getContainer(float).add(_createPinnedSibling(this.beans, source, float), hidden);
        return source;
    }

    private dispatchPinningChanged(sources: RowNode[]): void {
        this.refreshRowPositions();
        this.eventSvc.dispatchEvent({ type: 'pinnedRowsChanged' });
        dispatchRowPinned(sources);
    }

    private refreshRowPositions(): boolean {
        const beans = this.beans;
        const topChanged = refreshRowPositions(beans, this.top);
        return refreshRowPositions(beans, this.bottom) || topChanged;
    }
}

/** The grand total row is driven by the `grandTotalRow` option, not manual row-pinning state. */
const isManuallyPinnedRow = (pinned: RowNode): boolean => !_isPinnedNodeGrandTotal(pinned);

const isAnyPinnedRow = (): boolean => true;

const isPinnedGroupRow = (pinned: RowNode): boolean => !!pinned.group && isManuallyPinnedRow(pinned);

const getPinnedIds = (container: PinnedRows): string[] => {
    const ids: string[] = [];
    for (const node of container.all) {
        const id = node.pinnedSibling?.id;
        if (id != null && isManuallyPinnedRow(node)) {
            ids.push(id);
        }
    }
    for (const id of container.queued) {
        ids.push(id);
    }
    return ids;
};

const dispatchRowPinned = (sources: RowNode[]): void => {
    for (let i = 0, len = sources.length; i < len; ++i) {
        sources[i].dispatchRowEvent('rowPinned');
    }
};

const estimateRowHeights = (container: PinnedRows): void => {
    for (const rowNode of container.all) {
        rowNode.setRowHeight(rowNode.rowHeight, true);
    }
};

const collectPinnedRows = (container: PinnedRows, predicate: (pinned: RowNode) => boolean, out: RowNode[]): void => {
    for (const node of container.all) {
        if (predicate(node)) {
            out.push(node);
        }
    }
};

const refreshRowPositions = (beans: BeanCollection, container: PinnedRows): boolean => {
    const order = container.getSorted();
    let rowTop = 0;
    let changed = false;
    for (let i = 0, len = order.length; i < len; ++i) {
        const node = order[i];
        changed ||= node.rowTop !== rowTop;
        node.setRowTop(rowTop);

        if (node.rowHeightEstimated || node.rowHeight == null) {
            const rowHeight = _getRowHeightForNode(beans, node).height;
            changed ||= node.rowHeight !== rowHeight;
            node.setRowHeight(rowHeight);
        }

        node.setRowIndex(i);
        rowTop += node.rowHeight!;
    }
    return changed;
};

const ensureRowHeightsValid = (beans: BeanCollection, container: PinnedRows): boolean => {
    const order = container.getSorted();
    let rowTop = 0;
    let changed = false;
    for (let i = 0, len = order.length; i < len; ++i) {
        const node = order[i];
        if (node.rowHeightEstimated) {
            const rowHeight = _getRowHeightForNode(beans, node).height;
            node.setRowTop(rowTop);
            node.setRowHeight(rowHeight);
            rowTop += rowHeight;
            changed = true;
        }
    }
    return changed;
};

const _createPinnedSibling = (
    beans: BeanCollection,
    rowNode: RowNode,
    floating: NonNullable<RowPinnedType>
): RowNode => {
    // only create sibling node once, otherwise we have daemons and
    // the animate screws up with the daemons hanging around
    if (rowNode.pinnedSibling) {
        return rowNode.pinnedSibling;
    }

    const sibling = _createRowNodeSibling(rowNode, beans);

    sibling.setRowTop(null);
    sibling.setRowIndex(null);
    sibling.rowPinned = floating;

    const prefix = floating === 'top' ? ROW_ID_PREFIX_TOP_PINNED : ROW_ID_PREFIX_BOTTOM_PINNED;

    sibling.id = `${prefix}${floating}-${rowNode.id}`;

    // get both header and footer to reference each other as siblings
    sibling.pinnedSibling = rowNode;
    rowNode.pinnedSibling = sibling;

    return sibling;
};

/** Expect to be passed the pinned node, not the original node. Therefore `pinnedSibling` is the original. */
const _destroyRowNodeSibling = (rowNode: RowNode): void => {
    const mainNode = rowNode.pinnedSibling;
    if (!mainNode) {
        return;
    }
    rowNode._destroy(false); // while still pinned, so it leaves the source row's footer and detail rows alone
    rowNode.rowPinned = null;

    rowNode.pinnedSibling = undefined;
    mainNode.pinnedSibling = undefined;
    mainNode.rowPinned = null;
};

const getSpannedRows = (beans: BeanCollection, rowNode: RowNode, column: AgColumn) => {
    const rowSpanSvc = beans.rowSpanSvc;
    return rowSpanSvc?.isCellSpanning(column, rowNode)
        ? rowSpanSvc.getCellSpan(column, rowNode)?.spannedNodes
        : undefined;
};

const getTotalHeight = (container: PinnedRows): number => {
    const node = container.getSorted().at(-1);
    return node ? node.rowTop! + node.rowHeight! : 0;
};
