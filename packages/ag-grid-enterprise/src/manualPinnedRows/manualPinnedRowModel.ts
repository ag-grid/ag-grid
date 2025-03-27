import type {
    AgColumn,
    BeanCollection,
    CssVariablesChanged,
    GridOptions,
    IPinnedRowModel,
    RowNode,
    RowPinnedType,
    RowPinningState,
} from 'ag-grid-community';
import {
    BeanStub,
    _ROW_ID_PREFIX_BOTTOM_PINNED,
    _ROW_ID_PREFIX_TOP_PINNED,
    _getGrandTotalRow,
    _getRowHeightForNode,
    _isClientSideRowModel,
} from 'ag-grid-community';

import { _createRowNodeSibling } from '../misc/rowNodeSiblingUtils';
import { PinnedRows, _shouldHidePinnedRows } from './manualPinnedRowUtils';

export class ManualPinnedRowModel extends BeanStub implements IPinnedRowModel {
    private top: PinnedRows;
    private bottom: PinnedRows;

    public postConstruct(): void {
        const { gos, beans } = this;
        this.top = new PinnedRows(beans);
        this.bottom = new PinnedRows(beans);

        const pinGrandTotalRow = (grandTotalRow: GridOptions['grandTotalRow']) => {
            const rowModel = beans.rowModel;
            if (!_isClientSideRowModel(gos, rowModel)) return;

            const sibling = rowModel.rootNode!.sibling;

            if (grandTotalRow === 'pinnedBottom') {
                this.pinRow(sibling, 'bottom');
            } else if (grandTotalRow === 'pinnedTop') {
                this.pinRow(sibling, 'top');
            }
        };

        const shouldHide = (node: RowNode) => _shouldHidePinnedRows(beans, node.pinnedSibling!);

        this.addManagedEventListeners({
            gridStylesChanged: this.onGridStylesChanges.bind(this),
            modelUpdated: () => {
                this.tryToEmptyQueues();
                this.forContainers((container) => {
                    container.hide(shouldHide);
                    container.sort();
                });
                this.refreshRowPositions();
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
            firstDataRendered: () => {
                // Initialise pinning of grand total row
                pinGrandTotalRow(_getGrandTotalRow(gos));

                // Initialise pinned rows
                const isRowPinned = gos.get('isRowPinned');
                if (isRowPinned) {
                    beans.rowModel.forEachNode((node) => {
                        const float = isRowPinned(node);
                        if (float) {
                            this.pinRow(node, float);
                        }
                    });
                }
            },
        });

        this.addManagedPropertyListener('pivotMode', () => {
            this.forContainers((container) => container.hide(shouldHide));
            this.dispatchRowPinnedEvents();
        });

        this.addManagedPropertyListener('grandTotalRow', (e) => pinGrandTotalRow(e.currentValue));
    }

    public override destroy(): void {
        this.reset(false);
        super.destroy();
    }

    public reset(dispatch = true): void {
        this.forContainers((container) => {
            container.forEach(_destroyRowNodeSibling);
            container.clear();
        });
        if (dispatch) {
            this.dispatchRowPinnedEvents();
        }
    }

    public pinRow(rowNode: RowNode, float: RowPinnedType, column?: AgColumn | null): void {
        // Forbid pinning group footers
        if (rowNode.footer && rowNode.level > -1) return;

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

        // When pinning the grand total row (i.e. the footer of the root node) we refresh the model
        // so the original grand total row is hidden. This is the only case in which pinned rows are
        // not duplicates of rows in the main viewport.
        if (rowNode.footer && rowNode.level === -1) {
            if (_isClientSideRowModel(this.gos, this.beans.rowModel)) {
                this.beans.rowModel.refreshModel({ step: 'map' });
            }
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
        node.setRowHeight(_getRowHeightForNode(beans, node).height);
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

    const prefix = floating === 'top' ? _ROW_ID_PREFIX_TOP_PINNED : _ROW_ID_PREFIX_BOTTOM_PINNED;

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
