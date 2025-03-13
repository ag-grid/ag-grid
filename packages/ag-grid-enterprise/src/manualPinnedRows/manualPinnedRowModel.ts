import type {
    AgColumn,
    BeanCollection,
    CssVariablesChanged,
    IPinnedRowModel,
    RowNode,
    RowPinnedType,
} from 'ag-grid-community';
import {
    BeanStub,
    _ROW_ID_PREFIX_BOTTOM_PINNED,
    _ROW_ID_PREFIX_TOP_PINNED,
    _getRowHeightForNode,
} from 'ag-grid-community';

import { _createRowNodeSibling } from '../misc/rowNodeSiblingUtils';
import * as u from './manualPinnedRowUtils';

export class ManualPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private top = u.createPinnedRows();
    private bottom = u.createPinnedRows();

    public postConstruct(): void {
        const filterManager = this.beans.filterManager;
        const hideFilteredNodes = (node: RowNode) =>
            filterManager
                ? !filterManager.doesRowPassFilter({ rowNode: node }) ||
                  !filterManager.doesRowPassAggregateFilters({ rowNode: node })
                : false;

        this.addManagedEventListeners({
            gridStylesChanged: this.onGridStylesChanges.bind(this),
            modelUpdated: () => {
                this.tryToEmptyQueues();
                this.forContainers((container) => {
                    u.hide(this.beans, container, hideFilteredNodes);
                    u.sort(this.beans, container);
                });
                this.refreshRowPositions();
            },
            columnRowGroupChanged: () => {
                this.forContainers(removeGroupRows);
                this.refreshRowPositions();
            },
        });

        this.addManagedPropertyListener('pivotMode', (event) => {
            const hideLeaves = (node: RowNode) => (event.currentValue ? !node.group : false);
            this.forContainers((container) => u.hide(this.beans, container, hideLeaves));
            this.dispatchRowPinnedEvents();
        });
    }

    public override destroy(): void {
        this.forContainers((container) => {
            u.forEach(container, _destroyRowNodeSibling);
            u.clear(container);
        });

        super.destroy();
    }

    public pinRow(rowNode: RowNode, container: RowPinnedType, column?: AgColumn | null): void {
        // May have been called on either the pinned row or the source row, check both
        const currentContainer = rowNode.rowPinned ?? rowNode.pinnedSibling?.rowPinned;

        // We're only switching if neither the current nor the target container are null
        const switching = currentContainer != null && container != null && container != currentContainer;
        if (switching) {
            this.pinRow(rowNode, null, column);
        }

        // cell-span pinning/unpinning
        const spannedRows = column && getSpannedRows(this.beans, rowNode, column);
        if (spannedRows) {
            spannedRows.forEach((node) => this.pinRow(node, container));
            return;
        }

        // unpinning
        if (container == null) {
            // Want to act on the pinned row, not the source row
            const node = rowNode.rowPinned ? rowNode : rowNode.pinnedSibling!;
            const found = this.findPinnedRowNode(node);
            if (!found) return;

            u._delete(found, node);
            const source = node.pinnedSibling!;
            _destroyRowNodeSibling(node);
            this.refreshRowPositions(container);

            this.dispatchRowPinnedEvents(source);
        } else {
            // pinning
            const sibling = _createPinnedSibling(rowNode, this.beans, container);
            u.add(this.beans, this.getContainer(container), sibling);
            this.refreshRowPositions(container);

            this.dispatchRowPinnedEvents(rowNode);
        }
    }

    public isManual(): boolean {
        return true;
    }

    public isEmpty(floating: NonNullable<RowPinnedType>): boolean {
        return u.size(this.getContainer(floating)) === 0;
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
        u.forEach(this.bottom, updateRowHeight);
        rowTop = 0;
        u.forEach(this.top, updateRowHeight);

        this.eventSvc.dispatchEvent({
            type: 'pinnedHeightChanged',
        });

        return anyChange;
    }

    public getPinnedTopTotalHeight(): number {
        const size = u.size(this.top);
        if (size === 0) return 0;

        const node = u.getByIndex(this.top, size - 1);
        if (node === undefined) return 0;

        return node.rowTop! + node.rowHeight!;
    }

    public getPinnedBottomTotalHeight(): number {
        const size = u.size(this.bottom);
        if (size === 0) return 0;

        const node = u.getByIndex(this.bottom, size - 1);
        if (node === undefined) return 0;

        return node.rowTop! + node.rowHeight!;
    }

    public getPinnedTopRowCount(): number {
        return u.size(this.top);
    }

    public getPinnedBottomRowCount(): number {
        return u.size(this.bottom);
    }

    public getPinnedTopRow(index: number): RowNode | undefined {
        return u.getByIndex(this.top, index);
    }

    public getPinnedBottomRow(index: number): RowNode | undefined {
        return u.getByIndex(this.bottom, index);
    }

    public getPinnedRowById(id: string, floating: NonNullable<RowPinnedType>): RowNode | undefined {
        return u.getById(this.getContainer(floating), id);
    }

    public forEachPinnedRow(
        floating: NonNullable<RowPinnedType>,
        callback: (node: RowNode, index: number) => void
    ): void {
        u.forEach(this.getContainer(floating), callback);
    }

    public populatePinnedState(top: string[], bottom: string[]): void {
        const pinRows = (ids: string[], container: NonNullable<RowPinnedType>) => {
            ids.forEach((id) => {
                const node = this.beans.rowModel.getRowNode(id);
                if (node) {
                    this.pinRow(node, container);
                } else {
                    u.queue(this.getContainer(container), id);
                }
            });
        };

        pinRows(top, 'top');
        pinRows(bottom, 'bottom');
    }

    private tryToEmptyQueues(): void {
        const emptyQueue = (container: NonNullable<RowPinnedType>) => {
            const nodesToPin = new Set<RowNode>();
            const pinned = this.getContainer(container);

            u.forEachQueued(pinned, (id) => {
                const node = this.beans.rowModel.getRowNode(id);
                if (node) {
                    nodesToPin.add(node);
                }
            });

            nodesToPin.forEach((node) => {
                u.unqueue(pinned, node.id!);
                this.pinRow(node, container);
            });
        };

        emptyQueue('top');
        emptyQueue('bottom');
    }

    private onGridStylesChanges(e: CssVariablesChanged) {
        if (e.rowHeightChanged) {
            const estimateRowHeight = (rowNode: RowNode) => {
                rowNode.setRowHeight(rowNode.rowHeight, true);
            };
            u.forEach(this.bottom, estimateRowHeight);
            u.forEach(this.top, estimateRowHeight);
        }
    }

    private getContainer(container: NonNullable<RowPinnedType>): u.PinnedRows {
        return container === 'top' ? this.top : this.bottom;
    }

    private findPinnedRowNode(node: RowNode): u.PinnedRows | undefined {
        if (u.has(this.top, node)) return this.top;
        if (u.has(this.bottom, node)) return this.top;
    }

    private refreshRowPositions(container?: RowPinnedType): void {
        const sets = container == null ? ['top' as const, 'bottom' as const] : [container];
        sets.forEach((float) => refreshRowPositions(this.beans, this.getContainer(float)));
    }

    private forContainers(fn: (container: u.PinnedRows) => void): void {
        fn(this.top);
        fn(this.bottom);
    }

    private dispatchRowPinnedEvents(node?: RowNode): void {
        this.eventSvc.dispatchEvent({ type: 'rowPinnedChanged' });
        node?.dispatchRowEvent('rowPinned');
    }
}

function refreshRowPositions(beans: BeanCollection, container: u.PinnedRows) {
    let rowTop = 0;
    u.forEach(container, (node, index) => {
        node.setRowTop(rowTop);
        node.setRowHeight(_getRowHeightForNode(beans, node).height);
        node.setRowIndex(index);
        rowTop += node.rowHeight!;
    });
}

function _createPinnedSibling(rowNode: RowNode, beans: BeanCollection, container: NonNullable<RowPinnedType>): RowNode {
    // only create sibling node once, otherwise we have daemons and
    // the animate screws up with the daemons hanging around
    if (rowNode.pinnedSibling) {
        return rowNode.pinnedSibling;
    }

    const sibling = _createRowNodeSibling(rowNode, beans);

    sibling.setRowTop(null);
    sibling.setRowIndex(null);
    sibling.rowPinned = container;

    const prefix = container === 'top' ? _ROW_ID_PREFIX_TOP_PINNED : _ROW_ID_PREFIX_BOTTOM_PINNED;

    sibling.id = `${prefix}${container}-${rowNode.id}`;

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

function removeGroupRows(set: u.PinnedRows) {
    const rowsToRemove = new Set<RowNode>();

    u.forEach(set, (node) => {
        if (node.group) {
            rowsToRemove.add(node);
        }
    });

    rowsToRemove.forEach((node) => u._delete(set, node));
}

function getSpannedRows(beans: BeanCollection, rowNode: RowNode, column: AgColumn) {
    const { rowSpanSvc } = beans;
    const isCellSpanning = (column && rowSpanSvc?.isCellSpanning(column, rowNode)) ?? false;
    if (column && isCellSpanning) {
        const span = rowSpanSvc?.getCellSpan(column, rowNode);
        if (span) return Array.from(span.spannedNodes);
    }
}
