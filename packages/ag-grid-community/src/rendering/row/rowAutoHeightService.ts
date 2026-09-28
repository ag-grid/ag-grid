import { _debounce, _getDocument, _getVerticalPaddingAndBorder, _observeResize } from 'ag-stack';

import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _getRowHeightForNode, _isClientSideLoadingRow } from '../../gridOptionsUtils';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IServerSideRowModel } from '../../interfaces/iServerSideRowModel';
import type { CellCtrl } from '../cell/cellCtrl';
import type { RowCtrl } from './rowCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowAutoHeightService extends BeanStub implements NamedBean {
    beanName = 'rowAutoHeight' as const;

    /** grid columns have colDef.autoHeight set */
    public active: boolean;
    private wasEverActive = false;

    /**
     * If row height has been active, request a refresh of the row heights.
     */
    public requestCheckAutoHeight(): void {
        if (!this.wasEverActive) {
            return;
        }

        this._debouncedCalculateRowHeights();
    }

    private readonly _debouncedCalculateRowHeights = _debounce(this, this.calculateRowHeights.bind(this), 1);
    private calculateRowHeights() {
        const { visibleCols, rowModel, pinnedRowModel } = this.beans;
        const displayedAutoHeightCols = visibleCols.autoHeightCols;

        let anyNodeChanged = false;
        const updateDisplayedRowHeights = (row: RowNode) => {
            if (_isClientSideLoadingRow(this.gos, row)) {
                return;
            }

            const newRowHeight = this.getRowAutoHeight(row, displayedAutoHeightCols);
            if (newRowHeight == null || newRowHeight === row.rowHeight) {
                return;
            }

            row.setRowHeight(newRowHeight);
            anyNodeChanged = true;
        };

        pinnedRowModel?.forEachPinnedRow?.('top', updateDisplayedRowHeights);
        pinnedRowModel?.forEachPinnedRow?.('bottom', updateDisplayedRowHeights);
        rowModel.forEachDisplayedNode?.(updateDisplayedRowHeights);

        if (anyNodeChanged) {
            (rowModel as IClientSideRowModel | IServerSideRowModel).onRowHeightChanged?.();
        }
    }

    private getRowAutoHeight(row: RowNode, displayedAutoHeightCols: AgColumn[]): number | undefined {
        let rowHeight = _getRowHeightForNode(this.beans, row).height;

        for (const col of displayedAutoHeightCols) {
            const cellHeight = getCellAutoHeight(this.beans, col, row);
            if (cellHeight === null) {
                continue;
            }

            if (cellHeight === undefined) {
                if (
                    this.beans.visibleCols.colSpanActive &&
                    isColCovered(this.beans.rowRenderer.getRowCtrlByNode(row), col)
                ) {
                    continue;
                }
                return;
            }

            rowHeight = Math.max(cellHeight, rowHeight);
        }

        return rowHeight;
    }

    /**
     * Set the cell height into the row node, and request a refresh of the row heights if there's been a change.
     * @param rowNode the node to set the auto height on
     * @param cellHeight the height to set, undefined if the cell has just been destroyed
     * @param column the column of the cell
     */
    private setRowAutoHeight(rowNode: RowNode, cellHeight: number | undefined, column: AgColumn): void {
        rowNode.__autoHeights ??= {};
        const autoHeights = rowNode.__autoHeights;
        const colId = column.getId();
        const previousCellHeight = autoHeights[colId];

        // if the cell comp has been unmounted, delete the auto height
        if (cellHeight == undefined) {
            delete autoHeights[colId];
            // only column spanning skips a missing measurement, so only then can the row shrink
            if (previousCellHeight !== undefined && this.beans.visibleCols.colSpanActive) {
                this.requestCheckAutoHeight();
            }
            return;
        }

        autoHeights[colId] = cellHeight;
        if (previousCellHeight !== cellHeight) {
            this.requestCheckAutoHeight();
        }
    }

    /**
     * If required, sets up observers to continuously measure changes in the cell height.
     * @param cellCtrl the cellCtrl of the cell
     * @param eCellWrapper the HTMLElement to track the height of
     * @param compBean the component bean to add the destroy/cleanup function to
     * @returns whether or not auto height has been set up on this cell
     */
    public setupCellAutoHeight(cellCtrl: CellCtrl, eCellWrapper: HTMLElement | undefined, compBean: BeanStub): boolean {
        if (_isClientSideLoadingRow(this.gos, cellCtrl.rowNode) || !cellCtrl.column.isAutoHeight() || !eCellWrapper) {
            return false;
        }

        this.wasEverActive = true;

        const eParentCell = eCellWrapper.parentElement!;
        const { rowNode, column } = cellCtrl;
        const beans = this.beans;

        const measureHeight = (timesCalled: number) => {
            if (this.beans.editSvc?.isEditing(cellCtrl)) {
                return;
            }
            // because of the retry's below, it's possible the retry's go beyond
            // the rows life.
            if (!cellCtrl.isAlive() || !compBean.isAlive()) {
                return;
            }

            const extraHeight = _getVerticalPaddingAndBorder(eParentCell);

            const wrapperHeight = eCellWrapper.offsetHeight;
            const autoHeight = wrapperHeight + extraHeight;

            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = _getDocument(beans);
                const notYetInDom = !doc?.contains(eCellWrapper);

                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                const possiblyNoContentYet = autoHeight == 0;

                if (notYetInDom || possiblyNoContentYet) {
                    window.setTimeout(() => measureHeight(timesCalled + 1), 0);
                    return;
                }
            }

            this.setRowAutoHeight(rowNode, autoHeight, column);
        };

        const listener = () => measureHeight(0);

        // do once to set size in case size doesn't change, common when cell is blank
        listener();

        const destroyResizeObserver = _observeResize(beans, eCellWrapper, listener);

        compBean.addDestroyFunc(() => {
            destroyResizeObserver();
            this.setRowAutoHeight(rowNode, undefined, column);
        });
        return true;
    }

    public setAutoHeightActive(active: boolean): void {
        this.active = active;
    }

    /**
     * @returns true if every rendered row is at least as tall as its centre auto-height cells, or no auto-height
     * column is displayed. A row span counts on its last row, against the share of its height that row carries.
     */
    public areRowsMeasured(): boolean {
        if (!this.active) {
            return true;
        }

        const beans = this.beans;
        const { rowRenderer, visibleCols } = beans;
        const { autoHeightCols, colSpanActive } = visibleCols;
        const rowCtrls = rowRenderer.getAllRowCtrls();
        for (let r = 0, rowCount = rowCtrls.length; r < rowCount; ++r) {
            const rowCtrl = rowCtrls[r];
            if (rowCtrl.spannedRow) {
                continue;
            }
            const rowNode = rowCtrl.rowNode;
            const rowHeight = rowNode.rowHeight!;
            for (let c = 0, colCount = autoHeightCols.length; c < colCount; ++c) {
                const col = autoHeightCols[c];
                if (col.pinnedLane !== 1) {
                    continue;
                }
                const cellHeight = getCellAutoHeight(beans, col, rowNode);
                if (cellHeight === undefined) {
                    if (!colSpanActive || !isColCovered(rowCtrl, col)) {
                        return false;
                    }
                } else if (cellHeight !== null && rowHeight < cellHeight) {
                    return false;
                }
            }
        }

        return true;
    }
}

/** Whether another cell's colSpan covers `col` in the rendered row, so `col` has no cell of its own to measure. */
const isColCovered = (rowCtrl: RowCtrl | undefined, col: AgColumn): boolean => {
    const cellCtrl = rowCtrl?.getCellCtrl(col);
    return cellCtrl != null && cellCtrl.column !== col;
};

/** The height `row` needs for `col`, or its share of a row span; null when another row carries it. */
const getCellAutoHeight = (beans: BeanCollection, col: AgColumn, row: RowNode): number | null | undefined => {
    const cellSpan = beans.rowSpanSvc?.getCellSpan(col, row);
    return cellSpan ? cellSpan.getRowAutoHeight(row) : row.__autoHeights?.[col.colId];
};
