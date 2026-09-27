import { _areEqual } from 'ag-stack';

import { _getDrawnColSpan } from '../../columns/columnUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { applyHorizontalPosition, getResolvedHorizontalOffset } from '../features/horizontalPositionUtils';
import type { CellCtrl } from './cellCtrl';

/**
 * Wires the listeners that keep a cell's width and left position in sync, including col spanning
 * (which makes width cover many columns). Height is only ever touched for row-spanned cells, and is
 * applied on attach in _initCellPosition (via legacyApplyRowSpan or _applySpanHeight), not here.
 */
export function _setupCellPosition(beans: BeanCollection, cellCtrl: CellCtrl): void {
    // Listener setup runs from the CellCtrl constructor (before the cell component attaches) so that
    // colsSpanning is available as soon as the CellCtrl exists. This is required in
    // React, where setComp() is called asynchronously, but navigation normalisation may query
    // the cell position synchronously before the first render completes.
    //
    // A row-spanned cell keeps its own height and aria-rowspan in sync (see SpannedCellCtrl's
    // constructor, which wires the refresh listeners) and must not also run the col/row span setup
    // below. Gate on isCellSpanning() rather than getCellSpan(): the latter reads cellSpan, a
    // constructor parameter property still unassigned while this runs inside super(), whereas
    // isCellSpanning() is a prototype method that resolves correctly during super().
    if (cellCtrl.isCellSpanning()) {
        return;
    }
    setupColSpan(beans, cellCtrl);
    setupRowSpan(beans, cellCtrl);
}

function setupRowSpan(beans: BeanCollection, cellCtrl: CellCtrl): void {
    cellCtrl.rowSpan = cellCtrl.column.getRowSpan(cellCtrl.rowNode);

    cellCtrl.addManagedListeners(beans.eventSvc, { newColumnsLoaded: () => onNewColumnsLoaded(beans, cellCtrl) });
}

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

function onNewColumnsLoaded(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const rowSpan = cellCtrl.column.getRowSpan(cellCtrl.rowNode);
    if (cellCtrl.rowSpan === rowSpan) {
        return;
    }

    cellCtrl.rowSpan = rowSpan;
    legacyApplyRowSpan(beans, cellCtrl, true);
}

function onDisplayColumnsChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const colsSpanning = getColSpanningList(beans, cellCtrl);

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

    cellCtrl.colsSpanning = getColSpanningList(beans, cellCtrl);

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

/** The columns the cell spans, or undefined when it covers only its own, as for a column without colSpan. */
function getColSpanningList(beans: BeanCollection, cellCtrl: CellCtrl): AgColumn[] | undefined {
    const { column, rowNode } = cellCtrl;
    const allCols = beans.visibleCols.allCols;
    const index = column.allColsIndex;
    const colSpan = index < 0 ? 1 : _getDrawnColSpan(allCols, index, rowNode);
    return colSpan > 1 ? allCols.slice(index, index + colSpan) : undefined;
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
