import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { applyHorizontalPosition, getResolvedHorizontalOffset } from '../features/horizontalPositionUtils';
import type { CellCtrl } from './cellCtrl';

// Called each time the cell component attaches (initial mount and any remount).
export function _initCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    _onCellLeftChanged(beans, cellCtrl);
    _onCellWidthChanged(cellCtrl);
    if (cellCtrl.getCellSpan()) {
        _applySpanHeight(cellCtrl);
    } else {
        legacyApplyRowSpan(beans, cellCtrl);
    }
}

/** Sets a row-spanned cell's rendered height to cover its spanned rows. No-op when not spanning. */
export function _applySpanHeight(cellCtrl: CellCtrl): void {
    const spanHeight = cellCtrl.getCellSpan()?.getCellHeight();
    const eContent = cellCtrl.eGui;
    if (spanHeight != null && eContent) {
        eContent.style.height = `${spanHeight}px`;
    }
}

export function _refreshCellRowSpan(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const rowSpan = cellCtrl.column.getRowSpan(cellCtrl.rowNode);
    if (cellCtrl.rowSpan === rowSpan) {
        return;
    }

    cellCtrl.rowSpan = rowSpan;
    legacyApplyRowSpan(beans, cellCtrl, true);
}

/** Sizes a cell to `colSpan` columns from its own. The row's layout decides the span, so it is read once. */
export function _setCellColSpan(beans: BeanCollection, cellCtrl: CellCtrl, colSpan: number): void {
    const column = cellCtrl.column;
    let prev = cellCtrl.colsSpanning;
    if (prev === null) {
        // a column can gain a colSpan after its cell was built, so tracking starts at the first real span
        if (colSpan === 1 || cellCtrl.isCellSpanning()) {
            return;
        }
        prev = [column];
        cellCtrl.colsSpanning = prev;
        // any displayed col's width can be one this cell spans
        cellCtrl.addManagedListeners(beans.eventSvc, {
            displayedColumnsWidthChanged: () => _onCellWidthChanged(cellCtrl),
        });
    }
    const visibleCols = beans.visibleCols;
    const lane = column.pinnedLane;
    // the columns covered, never past the pinned lane, allocated only once they differ from `prev`
    let colsSpanning: AgColumn[] | null = null;
    let count = 0;
    let pointer: AgColumn | null = column;
    while (pointer !== null && count < colSpan && pointer.pinnedLane === lane) {
        if (colsSpanning === null && prev[count] !== pointer) {
            colsSpanning = prev.slice(0, count);
        }
        colsSpanning?.push(pointer);
        ++count;
        pointer = visibleCols.getColAfter(pointer);
    }
    if (colsSpanning === null) {
        if (count === prev.length) {
            return;
        }
        colsSpanning = prev.slice(0, count);
    }
    cellCtrl.colsSpanning = colsSpanning;
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
    const rowSpan = cellCtrl.rowSpan;
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
