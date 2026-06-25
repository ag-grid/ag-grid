import { _areEqual, _missing } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { applyHorizontalPosition, getResolvedHorizontalOffset } from '../features/horizontalPositionUtils';
import type { CellSpan } from '../spanning/rowSpanCache';
import type { CellCtrl } from './cellCtrl';

/**
 * Takes care of:
 *  #) Cell Width (including when doing cell spanning, which makes width cover many columns)
 *  #) Cell Height (when doing row span, otherwise we don't touch the height as it's just row height)
 *  #) Cell Left (the horizontal positioning of the cell, the vertical positioning is on the row)
 */
export function _setupCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    // Listener setup runs from the CellCtrl constructor (before the cell component attaches) so that
    // getColSpanningList() is available as soon as the CellCtrl exists. This is required in
    // React, where setComp() is called asynchronously, but navigation normalisation may query
    // the cell position synchronously before the first render completes.
    const cellSpan = cellCtrl.getCellSpan();
    if (cellSpan) {
        const refreshSpanHeight = () => applySpanHeight(cellCtrl, cellSpan);
        cellCtrl.addManagedListeners(beans.eventSvc, {
            paginationChanged: refreshSpanHeight,
            recalculateRowBounds: refreshSpanHeight,
            pinnedHeightChanged: refreshSpanHeight,
        });
    } else {
        setupColSpan(beans, cellCtrl);
        setupRowSpan(beans, cellCtrl);
    }
}

function setupRowSpan(beans: BeanCollection, cellCtrl: CellCtrl): void {
    cellCtrl.rowSpan = cellCtrl.column.getRowSpan(cellCtrl.rowNode);

    cellCtrl.addManagedListeners(beans.eventSvc, { newColumnsLoaded: () => onNewColumnsLoaded(beans, cellCtrl) });
}

// Called each time the cell component attaches (initial mount and any remount).
export function _initCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    _onCellLeftChanged(beans, cellCtrl);
    _onCellWidthChanged(cellCtrl);
    const cellSpan = cellCtrl.getCellSpan();
    if (cellSpan) {
        applySpanHeight(cellCtrl, cellSpan);
    } else {
        legacyApplyRowSpan(beans, cellCtrl);
    }
}

function applySpanHeight(cellCtrl: CellCtrl, cellSpan: CellSpan): void {
    const spanHeight = cellSpan.getCellHeight();
    const eContent = cellCtrl.eGui;
    if (spanHeight != null && eContent) {
        eContent.style.height = `${spanHeight}px`;
    }
}

function onNewColumnsLoaded(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const rowSpan = cellCtrl.column.getRowSpan(cellCtrl.rowNode);
    if (cellCtrl.rowSpan === rowSpan) {
        return;
    }

    cellCtrl.rowSpan = rowSpan;
    legacyApplyRowSpan(beans, cellCtrl, true);
}

function onDisplayColumnsChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const colsSpanning = _getColSpanningList(beans, cellCtrl);

    if (!_areEqual(cellCtrl.colsSpanning, colsSpanning)) {
        cellCtrl.colsSpanning = colsSpanning;
        _onCellWidthChanged(cellCtrl);
        _onCellLeftChanged(beans, cellCtrl); // left changes when doing RTL
    }
}

function setupColSpan(beans: BeanCollection, cellCtrl: CellCtrl): void {
    // if no col span is active, then we don't set it up, as it would be wasteful of CPU
    if (cellCtrl.column.colDef.colSpan == null) {
        return;
    }

    cellCtrl.colsSpanning = _getColSpanningList(beans, cellCtrl);

    cellCtrl.addManagedListeners(beans.eventSvc, {
        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        displayedColumnsChanged: () => onDisplayColumnsChanged(beans, cellCtrl),
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
        displayedColumnsWidthChanged: () => _onCellWidthChanged(cellCtrl),
    });
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

export function _getColSpanningList(beans: BeanCollection, cellCtrl: CellCtrl): AgColumn[] {
    const { column, rowNode } = cellCtrl;
    const colSpan = column.getColSpan(rowNode);
    const colsSpanning: AgColumn[] = [];

    // if just one col, the col span is just the column we are in
    if (colSpan === 1) {
        colsSpanning.push(column);
    } else {
        let pointer: AgColumn | null = column;
        const pinned = column.getPinned();
        for (let i = 0; pointer && i < colSpan; i++) {
            colsSpanning.push(pointer);
            pointer = beans.visibleCols.getColAfter(pointer);
            if (!pointer || _missing(pointer)) {
                break;
            }
            // we do not allow col spanning to span outside of pinned areas
            if (pinned !== pointer.getPinned()) {
                break;
            }
        }
    }

    return colsSpanning;
}

export function _onCellLeftChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const eSetLeft = cellCtrl.getRootElement();
    if (!eSetLeft) {
        return;
    }
    const { gos, visibleCols } = beans;
    const left = getResolvedHorizontalOffset({
        left: getCellLeft(cellCtrl),
        pinned: cellCtrl.column.getPinned(),
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
        pinned: cellCtrl.column.getPinned(),
        width: getCellWidth(cellCtrl),
        isPrintLayout: cellCtrl.printLayout,
        isRtl: gos.get('enableRtl'),
        visibleCols,
    });
}

function legacyApplyRowSpan(beans: BeanCollection, cellCtrl: CellCtrl, force?: boolean): void {
    if (cellCtrl.rowSpan === 1 && !force) {
        return;
    }

    const eContent = cellCtrl.eGui;
    if (!eContent) {
        return;
    }

    const singleRowHeight = _getRowHeightAsNumber(beans);
    const totalRowHeight = singleRowHeight * cellCtrl.rowSpan;

    eContent.style.height = `${totalRowHeight}px`;
    // row-spanned cell content must sit above normal cells in the same row.
    eContent.style.zIndex = '1';
}
