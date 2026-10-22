import { _debounce, _getDocument, _getVerticalPaddingAndBorder, _observeResize } from 'ag-stack';

import type { VisibleColsService } from '../../columns/visibleColsService';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _getConfiguredRowHeight, _getRowHeightForNode, _isClientSideLoadingRow } from '../../gridOptionsUtils';
import type { IClientSideRowModel } from '../../interfaces/iClientSideRowModel';
import type { IServerSideRowModel } from '../../interfaces/iServerSideRowModel';
import type { CellCtrl } from '../cell/cellCtrl';
import type { RowCtrl } from './rowCtrl';
import { getRowTypeForNode } from './rowCtrl';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class RowAutoHeightService extends BeanStub implements NamedBean {
    beanName = 'rowAutoHeight' as const;

    private visibleCols: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.visibleCols = beans.visibleCols;
    }

    /** A displayed column has `colDef.autoHeight`, or a transposed field row's field does. */
    public get active(): boolean {
        return this.visibleCols.autoHeightCols.length !== 0 || !!this.beans.transposeSvc?.hasAutoHeightFields;
    }
    /** A cell was measured since the last pass without auto-height columns, so that pass gives rows their height back. */
    private measured = false;

    /** Requests a refresh of the row heights once a cell has been measured. */
    public requestCheckAutoHeight(): void {
        if (!this.measured) {
            return;
        }

        this._debouncedCalculateRowHeights();
    }

    private readonly _debouncedCalculateRowHeights = _debounce(this, this.calculateRowHeights.bind(this), 1);
    private calculateRowHeights() {
        if (!this.active) {
            this.releaseRowHeights();
            return;
        }
        const displayedAutoHeightCols = this.visibleCols.autoHeightCols;

        const { rowModel, pinnedRowModel } = this.beans;
        let anyNodeChanged = false;
        const updateRowHeight = (row: RowNode): void => {
            if (_isClientSideLoadingRow(this.gos, row)) {
                return;
            }

            const contentHeight = this.getRowContentHeight(row, displayedAutoHeightCols);
            if (contentHeight === undefined) {
                return;
            }
            // kept for when the row is out of view; a span's last row takes its share of the span measured above it
            row.__autoContentHeight = contentHeight;
            const newRowHeight = Math.max(contentHeight, _getConfiguredRowHeight(this.beans, row).height);
            if (newRowHeight === row.rowHeight) {
                return;
            }

            row.setRowHeight(newRowHeight);
            anyNodeChanged = true;
        };

        pinnedRowModel?.forEachPinnedRow?.('top', updateRowHeight);
        pinnedRowModel?.forEachPinnedRow?.('bottom', updateRowHeight);
        rowModel.forEachDisplayedNode?.(updateRowHeight);

        if (anyNodeChanged) {
            (rowModel as IClientSideRowModel | IServerSideRowModel).onRowHeightChanged?.();
        }
    }

    /** Gives every row auto height sized its configured height back, rows out of view included. */
    private releaseRowHeights(): void {
        this.measured = false;
        const { rowModel, pinnedRowModel } = this.beans;
        let anyNodeChanged = false;
        const releaseRowHeight = (row: RowNode | null | undefined): void => {
            if (row?.__autoContentHeight === undefined) {
                return;
            }
            // so a row reached by more than one walk below is released once
            row.__autoContentHeight = undefined;
            const rowHeight = _getRowHeightForNode(this.beans, row).height;
            if (rowHeight !== row.rowHeight) {
                row.setRowHeight(rowHeight);
                anyNodeChanged = true;
            }
        };
        // a row's footer and its pinned copy are walked through it, so they are reached hidden too
        const releaseNodeRowHeights = (row: RowNode): void => {
            releaseRowHeight(row);
            releaseRowHeight(row.sibling);
            releaseRowHeight(row.pinnedSibling);
        };

        pinnedRowModel?.forEachPinnedRow?.('top', releaseRowHeight);
        pinnedRowModel?.forEachPinnedRow?.('bottom', releaseRowHeight);
        rowModel.forEachDisplayedNode?.(releaseRowHeight);
        rowModel.forEachNode(releaseNodeRowHeights);

        if (anyNodeChanged) {
            (rowModel as IClientSideRowModel | IServerSideRowModel).onRowHeightChanged?.();
        }
    }

    /**
     * The height auto height gives `row`, its content height raised to the configured one: measured, or for a row out
     * of view the one it was last sized to. Undefined with no auto-height column displayed or nothing to go on.
     */
    public getMeasuredRowHeight(row: RowNode): number | undefined {
        if (!this.active) {
            return undefined;
        }
        let contentHeight = this.getRowContentHeight(row, this.visibleCols.autoHeightCols);
        if (contentHeight === undefined) {
            contentHeight = row.__autoContentHeight;
            // a row since turned full width has no auto-height cells, so the height it was sized to no longer applies
            if (contentHeight === undefined || getRowTypeForNode(this.beans, row) !== 'Normal') {
                return undefined;
            }
        }
        return Math.max(contentHeight, _getConfiguredRowHeight(this.beans, row).height);
    }

    /** The height the auto-height cells of `row` need, undefined while one of them is unmeasured. */
    private getRowContentHeight(row: RowNode, displayedAutoHeightCols: AgColumn[]): number | undefined {
        if (row.transposeFieldCol?.isAutoHeight()) {
            return getTallestMeasuredCell(row);
        }
        const beans = this.beans;
        let cellsHeight = 0;
        for (let i = 0, len = displayedAutoHeightCols.length; i < len; ++i) {
            const col = displayedAutoHeightCols[i];
            const cellHeight = getCellAutoHeight(beans, col, row);
            if (cellHeight === null) {
                continue;
            }

            if (cellHeight === undefined) {
                if (
                    this.visibleCols.colSpanColCount !== 0 &&
                    isColCovered(beans.rowRenderer.getRowCtrlByNode(row), col)
                ) {
                    continue;
                }
                return;
            }

            cellsHeight = Math.max(cellHeight, cellsHeight);
        }

        return cellsHeight;
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
        const colId = column.colId;
        const previousCellHeight = autoHeights[colId];

        // if the cell comp has been unmounted, delete the auto height
        if (cellHeight == undefined) {
            delete autoHeights[colId];
            // only column spanning and auto-height field rows skip a missing measurement, so only then can the row shrink
            if (
                previousCellHeight !== undefined &&
                (this.visibleCols.colSpanColCount !== 0 || rowNode.transposeFieldCol?.isAutoHeight())
            ) {
                this.requestCheckAutoHeight();
            }
            return;
        }

        autoHeights[colId] = cellHeight;
        this.measured = true;
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
        if (
            _isClientSideLoadingRow(this.gos, cellCtrl.rowNode) ||
            !cellCtrl.getConfigCell().column.isAutoHeight() ||
            !eCellWrapper
        ) {
            return false;
        }

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

    /**
     * @returns true if every rendered row is at least as tall as its centre auto-height cells, or no auto-height
     * column is displayed. A row span counts on its last row, against the share of its height that row carries.
     */
    public areRowsMeasured(): boolean {
        if (!this.active) {
            return true;
        }

        const beans = this.beans;
        const rowCtrls = beans.rowRenderer.getAllRowCtrls();
        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            const rowCtrl = rowCtrls[i];
            if (!rowCtrl.spannedRow && !isRowMeasured(beans, rowCtrl)) {
                return false;
            }
        }

        return true;
    }
}

/** Whether `rowCtrl`'s row is at least as tall as each of its centre auto-height cells. */
const isRowMeasured = (beans: BeanCollection, rowCtrl: RowCtrl): boolean => {
    const { autoHeightCols, colSpanColCount } = beans.visibleCols;
    const rowNode = rowCtrl.rowNode;
    const rowHeight = rowNode.rowHeight!;
    if (rowNode.transposeFieldCol?.isAutoHeight()) {
        const contentHeight = getTallestMeasuredCell(rowNode);
        return contentHeight !== undefined && rowHeight >= contentHeight;
    }
    for (let i = 0, len = autoHeightCols.length; i < len; ++i) {
        const col = autoHeightCols[i];
        if (col.pinnedLane !== 1) {
            continue;
        }
        const cellHeight = getCellAutoHeight(beans, col, rowNode);
        if (cellHeight === undefined) {
            if (colSpanColCount === 0 || !isColCovered(rowCtrl, col)) {
                return false;
            }
        } else if (cellHeight !== null && rowHeight < cellHeight) {
            return false;
        }
    }
    return true;
};

/**
 * A transposed field row whose field has auto height is as tall as its tallest measured cell. Its cells sit in record
 * columns, which stay virtualised, so only the records rendered are measured.
 */
const getTallestMeasuredCell = (row: RowNode): number | undefined => {
    const autoHeights = row.__autoHeights;
    if (!autoHeights) {
        return undefined;
    }
    let tallest: number | undefined;
    for (const colId of Object.keys(autoHeights)) {
        const cellHeight = autoHeights[colId];
        if (cellHeight !== undefined && (tallest === undefined || cellHeight > tallest)) {
            tallest = cellHeight;
        }
    }
    return tallest;
};

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
