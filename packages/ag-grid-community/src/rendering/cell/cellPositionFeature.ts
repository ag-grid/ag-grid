import type { BeanCollection } from '../../context/context';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { applyHorizontalPosition, getResolvedHorizontalOffset } from '../features/horizontalPositionUtils';
import type { CellCtrl } from './cellCtrl';

// Called each time the cell component attaches (initial mount and any remount).
export function _initCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    _onCellLeftChanged(beans, cellCtrl);
    _onCellWidthChanged(cellCtrl);
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
        // any displayed col's width can be one this cell spans
        cellCtrl.addManagedListeners(beans.eventSvc, {
            displayedColumnsWidthChanged: () => _onCellWidthChanged(cellCtrl),
        });
    } else if (prev.length === colSpan && cellCtrl.colsSpanningVersion === version) {
        // the same displayed columns give the same run
        return;
    }
    const start = cellCtrl.column.allColsIndex;
    cellCtrl.colsSpanning = visibleCols.allCols.slice(start, start + colSpan);
    cellCtrl.colsSpanningVersion = version;
    _onCellWidthChanged(cellCtrl);
    _onCellLeftChanged(beans, cellCtrl); // left changes when doing RTL
}

export function _onCellWidthChanged(cellCtrl: CellCtrl): void {
    const eContent = cellCtrl.eGui;
    if (!eContent) {
        return;
    }
    eContent.style.width = `${getCellWidth(cellCtrl)}px`;
}

function getCellWidth(cellCtrl: CellCtrl): number {
    const { colsSpanning, column } = cellCtrl;
    if (!colsSpanning) {
        return column.getActualWidth();
    }
    let width = 0;
    for (let i = 0, len = colsSpanning.length; i < len; ++i) {
        width += colsSpanning[i].actualWidth;
    }
    return width;
}

export function _onCellLeftChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const eSetLeft = cellCtrl.getRootElement();
    if (!eSetLeft) {
        return;
    }
    const { gos, visibleCols } = beans;
    const left = getResolvedHorizontalOffset({
        left: getCellLeft(cellCtrl),
        lane: cellCtrl.column.pinnedLane,
        width: getCellWidth(cellCtrl),
        isPrintLayout: cellCtrl.printLayout,
        isRtl: gos.get('enableRtl'),
        visibleCols,
    });
    if (left == null) {
        return;
    }

    setHorizontalPosition(beans, cellCtrl, eSetLeft, left);
}

function getCellLeft(cellCtrl: CellCtrl): number | null {
    // column.getLeft() is "distance from start edge" — in both LTR and RTL,
    // the cell's column is the start-edge column of any col-spanning range.
    return cellCtrl.column.getLeft();
}

function setHorizontalPosition(beans: BeanCollection, cellCtrl: CellCtrl, eSetLeft: HTMLElement, left: number): void {
    const { gos, visibleCols } = beans;
    applyHorizontalPosition(eSetLeft, {
        offset: left,
        lane: cellCtrl.column.pinnedLane,
        width: getCellWidth(cellCtrl),
        isPrintLayout: cellCtrl.printLayout,
        isRtl: gos.get('enableRtl'),
        visibleCols,
    });
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
