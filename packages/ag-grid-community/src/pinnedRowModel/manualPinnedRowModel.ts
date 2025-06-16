import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { ROW_ID_PREFIX_BOTTOM_PINNED, ROW_ID_PREFIX_TOP_PINNED } from '../entities/rowNode';
import type { RowNode } from '../entities/rowNode';
import { _createRowNodeSibling } from '../entities/rowNodeUtils';
import type { CssVariablesChanged } from '../events';
import { _getRowHeightForNode, _isClientSideRowModel } from '../gridOptionsUtils';
import type { RowPinningState } from '../interfaces/gridState';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';
import { PinnedRows, _shouldHidePinnedRows } from './manualPinnedRowUtils';

export class ManualPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private top: PinnedRows;
    private bottom: PinnedRows;
    /**
     * Determines where the grand total row should be pinned. Need a separate flag to break
     * an infinite recursion with CSRM.
     */
    private _grandTotalPinned: RowPinnedType;

    public postConstruct(): void {
        const { gos, beans } = this;
        this.top = new PinnedRows(beans, 'top');
        this.bottom = new PinnedRows(beans, 'bottom');

        const shouldHide = (node: RowNode) => _shouldHidePinnedRows(beans, node.pinnedSibling!);

        const runIsRowPinned = () => {
            const isRowPinned = gos.get('isRowPinned');
            if (isRowPinned) {
                beans.rowModel.forEachNode((node) => this.pinRow(node, isRowPinned(node)), true);
            }
            this.refreshRowPositions();
            this.dispatchRowPinnedEvents();
        };

        this.addManagedEventListeners({
            gridStylesChanged: this.onGridStylesChanges.bind(this),
            modelUpdated: () => {
                this.tryToEmptyQueues();
                this.pinGrandTotalRow();
                this.forContainers((container) => container.hide(shouldHide));
                this.refreshRowPositions();
                this.dispatchRowPinnedEvents();
            },
            columnRowGroupChanged: () => {
                this.forContainers(removeGroupRows);
                this.refreshRowPositions();
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
            this.forContainers((container) => container.hide(shouldHide));
            this.dispatchRowPinnedEvents();
        });

        this.addManagedPropertyListener('grandTotalRow', ({ currentValue }) => {
            this._grandTotalPinned =
                currentValue === 'pinnedBottom' ? 'bottom' : currentValue === 'pinnedTop' ? 'top' : null;
        });

        this.addManagedPropertyListener('isRowPinned', runIsRowPinned);
    }

    public override destroy(): void {
        this.reset(false);
        super.destroy();
    }

    public reset(dispatch = true): void {
        this.forContainers((container) => {
            const nodesToUnpin: RowNode[] = [];
            container.forEach((n) => nodesToUnpin.push(n));
            // Have to collect up the nodes to unpin because unpinning mutates the container
            nodesToUnpin.forEach((n) => this.pinRow(n, null));
            container.clear();
        });
        if (dispatch) {
            this.dispatchRowPinnedEvents();
        }
    }

    public pinRow(rowNode: RowNode, float: RowPinnedType, column?: AgColumn | null): void {
        // Forbid pinning group footers
        if (rowNode.footer && rowNode.level > -1) return;

        // Pinning grand total row is the only case in which pinned rows are not duplicates of rows
        // in the main viewport. So we have to handle them differently:
        // 1. We first set `_grandTotalPinned` to mark the location the grand total row should be pinned to.
        // 2. Then we refresh the row model to hide the sticky footer.
        // 3. We then react to the `modelUpdated` event (above) to actually add the footer to the pinned row model.
        // Otherwise we would run into either an infinite recursion of `modelUpdated` events, or be missing the `sibling`
        // on the root node.
        if (rowNode.footer && rowNode.level === -1) {
            this._grandTotalPinned = float;
            if (_isClientSideRowModel(this.gos, this.beans.rowModel)) {
                this.beans.rowModel.refreshModel({ step: 'map' });
            }
            return;
        }

        // May have been called on either the pinned row or the source row, check both
        const currentFloat = rowNode.rowPinned ?? rowNode.pinnedSibling?.rowPinned;

        // We're only switching if neither the current nor the target container are null
        const switching = currentFloat != null && float != null && float != currentFloat;
        if (switching) {
            // call unpin on pinned row, re-pin on source row, since we always want to dispatch events
            // on the source rows
            const pinned = rowNode.rowPinned ? rowNode : rowNode.pinnedSibling!;
            const source = rowNode.rowPinned ? rowNode.pinnedSibling! : rowNode;
            this.pinRow(pinned, null, column);
            this.pinRow(source, float, column);
            return;
        }

        // cell-span pinning/unpinning
        const spannedRows = column && getSpannedRows(this.beans, rowNode, column);
        if (spannedRows) {
            spannedRows.forEach((node) => this.pinRow(node, float));
            return;
        }

        // unpinning
        if (float == null) {
            // Want to act on the pinned row, not the source row
            const node = rowNode.rowPinned ? rowNode : rowNode.pinnedSibling!;
            const found = this.findPinnedRowNode(node);
            if (!found) return;

            found.delete(node);
            const source = node.pinnedSibling!;
            _destroyRowNodeSibling(node);
            this.refreshRowPositions(float);

            this.dispatchRowPinnedEvents(source);
        } else {
            // pinning
            const sibling = _createPinnedSibling(this.beans, rowNode, float);
            const container = this.getContainer(float);
            container.add(sibling);
            // Check if we should hide this row -- covers us for some asynchronicities
            // between (e.g.) applying filters and pinning rows.
            if (_shouldHidePinnedRows(this.beans, rowNode)) {
                container.hide((node) => _shouldHidePinnedRows(this.beans, node.pinnedSibling!));
            }
            this.refreshRowPositions(float);

            this.dispatchRowPinnedEvents(rowNode);
        }
    }

    public isManual(): boolean {
        return true;
    }

    public isEmpty(floating: NonNullable<RowPinnedType>): boolean {
        return this.getContainer(floating).size() === 0;
    }

    public isRowsToRender(floating: NonNullable<RowPinnedType>): boolean {
        return !this.isEmpty(floating);
    }

    public ensureRowHeightsValid(): boolean {
        let anyChange = false;
        let rowTop = 0;
        const updateRowHeight = (rowNode: RowNode) => {
            if (rowNode.rowHeightEstimated) {
                const rowHeight = _getRowHeightForNode(this.beans, rowNode);
                rowNode.setRowTop(rowTop);
                rowNode.setRowHeight(rowHeight.height);
                rowTop += rowHeight.height;
                anyChange = true;
            }
        };
        this.bottom.forEach(updateRowHeight);
        rowTop = 0;
        this.top.forEach(updateRowHeight);

        this.eventSvc.dispatchEvent({
            type: 'pinnedHeightChanged',
        });

        return anyChange;
    }

    public getPinnedTopTotalHeight(): number {
        const size = this.top.size();
        if (size === 0) return 0;

        const node = this.top.getByIndex(size - 1);
        if (node === undefined) return 0;

        return node.rowTop! + node.rowHeight!;
    }

    public getPinnedBottomTotalHeight(): number {
        const size = this.bottom.size();
        if (size === 0) return 0;

        const node = this.bottom.getByIndex(size - 1);
        if (node === undefined) return 0;

        return node.rowTop! + node.rowHeight!;
    }

    public getPinnedTopRowCount(): number {
        return this.top.size();
    }

    public getPinnedBottomRowCount(): number {
        return this.bottom.size();
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.top.getByIndex(index);
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.bottom.getByIndex(index);
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        return this.getContainer(floating).getById(id);
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        this.getContainer(floating).forEach(callback);
    }

    public getPinnedState(): RowPinningState {
        const buildState = (floating: NonNullable<RowPinnedType>) => {
            const list: string[] = [];
            this.forEachPinnedRow(floating, (node) => list.push(node.pinnedSibling!.id!));
            return list;
        };

        return {
            top: buildState('top'),
            bottom: buildState('bottom'),
        };
    }

    public setPinnedState(state: RowPinningState): void {
        this.forContainers((pinned, floating) => {
            for (const id of state[floating]) {
                const node = this.beans.rowModel.getRowNode(id);
                if (node) {
                    this.pinRow(node, floating);
                } else {
                    pinned.queue(id);
                }
            }
        });
    }

    public getGrandTotalPinned(): RowPinnedType {
        return this._grandTotalPinned;
    }

    public setGrandTotalPinned(value: RowPinnedType): void {
        this._grandTotalPinned = value;
    }

    private tryToEmptyQueues(): void {
        this.forContainers((pinned, container) => {
            const nodesToPin = new Set<RowNode>();

            pinned.forEachQueued((id) => {
                const node = this.beans.rowModel.getRowNode(id);
                if (node) {
                    nodesToPin.add(node);
                }
            });

            for (const node of nodesToPin) {
                pinned.unqueue(node.id!);
                this.pinRow(node, container);
            }
        });
    }

    private pinGrandTotalRow() {
        const rowModel = this.beans.rowModel;
        if (!_isClientSideRowModel(this.gos, rowModel)) return;

        const sibling = rowModel.rootNode?.sibling;
        if (!sibling) return;

        const float = this._grandTotalPinned;
        const pinnedSibling = sibling.pinnedSibling;
        const container = pinnedSibling && this.findPinnedRowNode(pinnedSibling);
        if (!float) {
            // unpin
            if (!container) return;
            container.delete(pinnedSibling);
            _destroyRowNodeSibling(pinnedSibling);
        } else {
            // pin
            if (container && container.floating !== float) {
                // already have pinned grand total row, need to unpin first
                container.delete(pinnedSibling);
                _destroyRowNodeSibling(pinnedSibling);
            }
            if (!container || container.floating !== float) {
                const newPinnedSibling = _createPinnedSibling(this.beans, sibling, float);
                this.getContainer(float).add(newPinnedSibling);
            }
        }
    }

    private onGridStylesChanges(e: CssVariablesChanged) {
        if (e.rowHeightChanged) {
            const estimateRowHeight = (rowNode: RowNode) => {
                rowNode.setRowHeight(rowNode.rowHeight, true);
            };
            this.forContainers((container) => container.forEach(estimateRowHeight));
        }
    }

    private getContainer(floating: NonNullable<RowPinnedType>): PinnedRows {
        return floating === 'top' ? this.top : this.bottom;
    }

    private findPinnedRowNode(node: RowNode): PinnedRows | undefined {
        if (this.top.has(node)) return this.top;
        if (this.bottom.has(node)) return this.bottom;
    }

    private refreshRowPositions(floating?: RowPinnedType): void {
        const refreshAll = (pinned: PinnedRows) => refreshRowPositions(this.beans, pinned);
        return floating == null ? this.forContainers(refreshAll) : refreshAll(this.getContainer(floating));
    }

    private forContainers(fn: (container: PinnedRows, floating: NonNullable<RowPinnedType>) => void): void {
        fn(this.top, 'top');
        fn(this.bottom, 'bottom');
    }

    private dispatchRowPinnedEvents(node?: RowNode): void {
        this.eventSvc.dispatchEvent({ type: 'pinnedRowsChanged' });
        node?.dispatchRowEvent('rowPinned');
    }
}

function refreshRowPositions(beans: BeanCollection, container: PinnedRows) {
    let rowTop = 0;
    container.forEach((node, index) => {
        node.setRowTop(rowTop);
        if (node.rowHeightEstimated || node.rowHeight == null) {
            node.setRowHeight(_getRowHeightForNode(beans, node).height);
        }
        node.setRowIndex(index);
        rowTop += node.rowHeight!;
    });
}

function _createPinnedSibling(beans: BeanCollection, rowNode: RowNode, floating: NonNullable<RowPinnedType>): RowNode {
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
}

/** Expect to be passed the pinned node, not the original node. Therefore `sibling` is the original. */
function _destroyRowNodeSibling(rowNode: RowNode): void {
    if (!rowNode.pinnedSibling) {
        return;
    }

    rowNode.rowPinned = null;
    rowNode.setRowTop(null);
    rowNode.setRowIndex(null);

    const mainNode = rowNode.pinnedSibling;
    rowNode.pinnedSibling = undefined as any;

    if (mainNode) {
        mainNode.pinnedSibling = undefined as any;
        mainNode.rowPinned = null;
    }
}

function removeGroupRows(set: PinnedRows) {
    const rowsToRemove = new Set<RowNode>();
    set.forEach((node) => {
        if (node.group) {
            rowsToRemove.add(node);
        }
    });

    rowsToRemove.forEach((node) => {
        set.delete(node);
    });
}

function getSpannedRows(beans: BeanCollection, rowNode: RowNode, column: AgColumn) {
    const { rowSpanSvc } = beans;
    const isCellSpanning = (column && rowSpanSvc?.isCellSpanning(column, rowNode)) ?? false;
    if (column && isCellSpanning) {
        const span = rowSpanSvc?.getCellSpan(column, rowNode);
        if (span) return Array.from(span.spannedNodes);
    }
}
