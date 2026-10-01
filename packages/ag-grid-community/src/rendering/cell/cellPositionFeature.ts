import type { BeanCollection } from '../../context/context';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { getAnchoredPosition, getResolvedHorizontalOffset, isRightAnchored } from '../features/horizontalPositionUtils';
import type { CellCtrl } from './cellCtrl';

// Called each time the cell component attaches (initial mount and any remount).
export function _initCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    cellCtrl.drawnPosition = NaN;
    cellCtrl.drawnWidth = NaN;
    _refreshCellPosition(beans, cellCtrl);
    legacyApplyRowSpan(beans, cellCtrl);
}

export function _refreshCellRowSpan(beans: BeanCollection, cellCtrl: CellCtrl): void {
    if (cellCtrl.cellSpan !== null) {
        return;
    }
    const rowSpan = cellCtrl.column.getRowSpan(cellCtrl.rowNode);
    if (cellCtrl.legacyRowSpan === rowSpan) {
        return;
    }

    cellCtrl.legacyRowSpan = rowSpan;
    legacyApplyRowSpan(beans, cellCtrl, true);
}

/** Sizes a cell to `colSpan` columns from its own; `colSpan` is a drawn span, already stopped at the lane edge. */
export function _setCellColSpan(beans: BeanCollection, cellCtrl: CellCtrl, colSpan: number): void {
    const prev = cellCtrl.colsSpanning;
    const visibleCols = beans.visibleCols;
    const version = visibleCols.displayedColsVersion;
    if (prev === null) {
        // a column can gain a colSpan after its cell was built, so tracking starts at the first real span
        if (colSpan === 1 || cellCtrl.cellSpan !== null) {
            return;
        }
    } else if (prev.length === colSpan && cellCtrl.colsSpanningVersion === version) {
        // the same displayed columns give the same run
        return;
    }
    const start = cellCtrl.column.allColsIndex;
    cellCtrl.colsSpanning = visibleCols.allCols.slice(start, start + colSpan);
    cellCtrl.colsSpanningVersion = version;
    _refreshCellPosition(beans, cellCtrl);
}

/** Writes the cell's width and its `left`, or `right` when anchored right, where either moved. */
export function _refreshCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const eGui = cellCtrl.eGui;
    if (!eGui) {
        return;
    }
    const width = getCellWidth(cellCtrl);
    if (width !== cellCtrl.drawnWidth) {
        cellCtrl.drawnWidth = width;
        eGui.style.width = `${width}px`;
    }

    const { gos, visibleCols } = beans;
    const column = cellCtrl.column;
    const lane = column.pinnedLane;
    const isPrintLayout = cellCtrl.printLayout;
    const isRtl = gos.get('enableRtl');
    // column.left is the distance from the start edge in LTR and RTL, and a span starts at its own column
    const left = column.left;
    const offset = isPrintLayout
        ? getResolvedHorizontalOffset({ left, lane, width, isPrintLayout, isRtl, visibleCols })
        : left;
    if (offset == null) {
        return;
    }
    const rightAnchored = isRightAnchored(lane, isRtl, isPrintLayout);
    const position = getAnchoredPosition(offset, width, rightAnchored, isRtl, visibleCols);
    if (position === cellCtrl.drawnPosition) {
        return;
    }
    cellCtrl.drawnPosition = position;
    const style = cellCtrl.getRootElement().style;
    style.left = rightAnchored ? '' : `${position}px`;
    style.right = rightAnchored ? `${position}px` : '';
}

function getCellWidth(cellCtrl: CellCtrl): number {
    const { colsSpanning, column } = cellCtrl;
    if (!colsSpanning) {
        return column.actualWidth;
    }
    let width = 0;
    for (let i = 0, len = colsSpanning.length; i < len; ++i) {
        width += colsSpanning[i].actualWidth;
    }
    return width;
}

function legacyApplyRowSpan(beans: BeanCollection, cellCtrl: CellCtrl, force?: boolean): void {
    const rowSpan = cellCtrl.legacyRowSpan;
    if (rowSpan === 1 && !force) {
        return;
    }

    const eContent = cellCtrl.eGui;
    if (!eContent) {
        return;
    }
    if (rowSpan === 1) {
        // one row again: size like the neighbouring cells, whatever the row's height
        eContent.style.height = '';
        eContent.style.zIndex = '';
        return;
    }

    const singleRowHeight = _getRowHeightAsNumber(beans);
    const totalRowHeight = singleRowHeight * rowSpan;

    eContent.style.height = `${totalRowHeight}px`;
    // row-spanned cell content must sit above normal cells in the same row.
    eContent.style.zIndex = '1';
}
