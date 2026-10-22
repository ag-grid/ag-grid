import { _areEqual, _batchCall } from 'ag-stack';

import { _getColsForRow, _getRowColSpan } from '../../columns/columnSpanUtils';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn, ColumnLane } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { CellCtrl } from '../cell/cellCtrl';
import { _refreshCellRowSpan, _setCellColSpan } from '../cell/cellPositionFeature';
import { _getCellCtrlForEventTarget, _suppressCellMouseEvent } from '../renderUtils';
import type { IRowModeFeature } from './iRowModeFeature';
import type { RowCtrl } from './rowCtrl';

export class NormalRowFeature extends BeanStub implements IRowModeFeature {
    /** The lanes, each never mutated once given to the row comp. */
    private centerCellCtrls: CellCtrl[] = NO_CELLS;
    private leftCellCtrls: CellCtrl[] = NO_CELLS;
    private rightCellCtrls: CellCtrl[] = NO_CELLS;
    /** Cleared whenever a lane is replaced; rebuilt on demand by getAllCellCtrls. */
    private allCellCtrls: CellCtrl[] | null = null;
    /** Every lane's cells by column, updated with what each layout changes rather than rebuilt. */
    private readonly cellByCol = new Map<AgColumn, CellCtrl>();
    /** The `displayedColsVersion` the cells were laid out at. */
    private cellCtrlsColsVersion = -1;
    /** The cells the last layout kept only because they are focused or editing, outside the columns their lanes render. */
    private keptCellCtrls: CellCtrl[] | null = null;
    /** The drawn colSpans by `colSpanIndex`, 0 where not read yet, so a horizontal scroll asks no `colSpan` callback. */
    private colSpans: number[] | undefined = undefined;
    /** The `displayedColsVersion` `colSpans` was read at; -1 to read it again. */
    private colSpansColsVersion = -1;

    /** A change reached the row after its cells were last laid out, so mounting must lay them out again. */
    private cellsStale = true;
    private updateColumnListsPending = false;
    /** A change other than the viewport's reached the row, so its next layout includes the pinned lanes. */
    private pinnedLanesStale = true;
    private releaseKeptCellsPending = false;

    public constructor(private readonly rowCtrl: RowCtrl) {
        super();
    }

    // Cell ctrls outlive their comps: React mounts a row a task later, and a model change in between
    // must still reach the ctrls, or they render the value they were constructed with.
    public postConstruct(): void {
        this.addListenersForCellCtrls();
    }

    public initialiseComp(): void {
        // cells laid out since the last change the row heard of need no second layout on mount
        if (this.cellsStale) {
            this.updateColumnLists(!this.rowCtrl.useAnimationFrameForCreate);
        } else {
            this.giveLanes(false);
        }
        // the comp attaches its pinned sections on its first refresh; later width changes reach it as events
        this.rowCtrl.refreshPinnedCellGroupWidths();
    }

    public refreshRow(params: RefreshRowsParams): void {
        this.refreshSpans();
        const cellCtrls = this.getAllCellCtrls();
        for (let i = 0, len = cellCtrls.length; i < len; ++i) {
            cellCtrls[i].refreshCell(params);
        }

        this.rowCtrl.onNormalRowRefreshed();
    }

    public shouldCreateCellSections(): boolean {
        return true;
    }

    public prepareInitialCellCtrls(): void {
        if (this.rowCtrl.useAnimationFrameForCreate) {
            return;
        }
        this.createAllCellCtrls();
    }

    public getInitialCellCtrls(lane: ColumnLane): CellCtrl[] | undefined {
        // React can render a row whose ctrl was destroyed first, and cells made then would never be destroyed
        if (this.rowCtrl.useAnimationFrameForCreate || !this.isAlive()) {
            return undefined;
        }
        if (this.cellsStale) {
            this.createAllCellCtrls();
        }
        return this.getLane(lane);
    }

    /** Called far more often than the lists change, so the flattened result is cached, not rebuilt. */
    public getAllCellCtrls(): CellCtrl[] {
        let all = this.allCellCtrls;
        if (all === null) {
            const center = this.centerCellCtrls;
            const left = this.leftCellCtrls;
            const right = this.rightCellCtrls;
            // `concat` over a manual fill: this is cached and then read by every caller until the lists
            // change, and `new Array(n)` would leave it holey, taxing each of those reads.
            all = left.length === 0 && right.length === 0 ? center : center.concat(left, right);
            this.allCellCtrls = all;
        }
        return all;
    }

    public recreateCell(cellCtrl: CellCtrl): void {
        this.allCellCtrls = null;
        this.centerCellCtrls = removeCellCtrl(this.centerCellCtrls, cellCtrl);
        this.leftCellCtrls = removeCellCtrl(this.leftCellCtrls, cellCtrl);
        this.rightCellCtrls = removeCellCtrl(this.rightCellCtrls, cellCtrl);
        this.destroyCell(cellCtrl);
        this.updateColumnLists();
    }

    public destroyCells(): void {
        this.allCellCtrls = null;
        // `cellByCol` is cleared whole, so no cell needs its own entry removed
        destroyAll(this.centerCellCtrls);
        destroyAll(this.leftCellCtrls);
        destroyAll(this.rightCellCtrls);
        this.centerCellCtrls = NO_CELLS;
        this.leftCellCtrls = NO_CELLS;
        this.rightCellCtrls = NO_CELLS;
        this.cellByCol.clear();
        this.keptCellCtrls = null;
    }

    public onDisplayedColumnsChanged(): void {
        // skip animations to avoid stale valueGetters when column sets change
        this.updateColumnLists(true);
    }

    public onVirtualColumnsChanged(): void {
        this.updateColumnLists(false, true, true);
    }

    public renderFocusedCell(): void {
        // synchronous, so the cell exists before the focus change is applied to the cells
        this.updateColumnLists(true);
    }

    public onSpannedCellsUpdated(pinned: ColumnPinnedType): void {
        if (pinned && !this.rowCtrl.rowNode.rowPinned) {
            return;
        }
        this.updateColumnLists();
    }

    /** A span callback can read any of the row's data, so a data change can move the row's spans. */
    public refreshSpans(): void {
        this.colSpansColsVersion = -1;
        const visibleCols = this.beans.visibleCols;
        const rowSpanCols = visibleCols.rowSpanCols;
        for (let i = 0, len = rowSpanCols.length; i < len; ++i) {
            const cellCtrl = this.getOwnCellCtrl(rowSpanCols[i]);
            if (cellCtrl !== undefined) {
                _refreshCellRowSpan(this.beans, cellCtrl);
            }
        }
        if (visibleCols.colSpanColCount === 0) {
            return;
        }
        // a row not yet mounted lays its cells out from the new data when it mounts
        if (!this.rowCtrl.getGui()) {
            this.cellsStale = true;
            this.pinnedLanesStale = true;
            return;
        }
        this.updateColumnLists();
    }

    /** @param afterEdit the edit stays in the edit model until its stop event has been dispatched, so wait for it */
    public releaseKeptCells(afterEdit: boolean): void {
        const keptCellCtrls = this.keptCellCtrls;
        if (keptCellCtrls === null) {
            return;
        }
        if (!afterEdit) {
            // a focus change can land on a kept cell as well as leave one, and only leaving one releases it
            if (this.hasReleasableKeptCell(keptCellCtrls)) {
                this.updateColumnLists();
            }
            return;
        }
        // a batch stages one edit event per cell, so one scheduled release serves them all
        if (this.releaseKeptCellsPending) {
            return;
        }
        this.releaseKeptCellsPending = true;
        _batchCall(() => {
            this.releaseKeptCellsPending = false;
            if (!this.isAlive()) {
                return;
            }
            this.releaseKeptCells(false);
        });
    }

    private hasReleasableKeptCell(keptCellCtrls: CellCtrl[]): boolean {
        for (let i = 0, len = keptCellCtrls.length; i < len; ++i) {
            const cellCtrl = keptCellCtrls[i];
            if (!cellCtrl.isAlive() || !this.isCellKept(cellCtrl)) {
                return true;
            }
        }
        return false;
    }

    /** @param viewportOnly only the centre lane's columns can have changed */
    private updateColumnLists(suppressAnimationFrame = false, useFlushSync = false, viewportOnly = false): void {
        const { rowCtrl } = this;
        const { animationFrameSvc } = this.beans;
        const noAnimation = !animationFrameSvc?.active || suppressAnimationFrame || rowCtrl.printLayout;
        if (!viewportOnly) {
            this.pinnedLanesStale = true;
        }

        if (noAnimation) {
            this.updateColumnListsImpl(useFlushSync);
            return;
        }

        if (this.updateColumnListsPending) {
            return;
        }
        this.cellsStale = true;
        animationFrameSvc.createTask(
            () => {
                // a reader of the drawn cells may have laid the row out already
                if (!rowCtrl.isAlive() || !this.updateColumnListsPending) {
                    return;
                }
                this.updateColumnListsImpl(true);
            },
            rowCtrl.rowNode.rowIndex!,
            'p1',
            false
        );
        this.updateColumnListsPending = true;
    }

    private updateColumnListsImpl(useFlushSync: boolean): void {
        this.updateColumnListsPending = false;
        this.createAllCellCtrls();
        this.giveLanes(useFlushSync);
    }

    private giveLanes(useFlushSync: boolean): void {
        const rowGui = this.rowCtrl.getGui();
        if (!rowGui) {
            return;
        }
        const { leftCellCtrls, centerCellCtrls, rightCellCtrls, cellCtrlsColsVersion } = this;
        rowGui.rowComp.setCellCtrls(leftCellCtrls, centerCellCtrls, rightCellCtrls, useFlushSync, cellCtrlsColsVersion);
    }

    private createAllCellCtrls(): void {
        this.cellsStale = false;
        const { rowCtrl, beans } = this;
        const { rowNode, printLayout } = rowCtrl;
        const visibleCols = beans.visibleCols;
        const prevCenter = this.centerCellCtrls;
        const prevLeft = this.leftCellCtrls;
        const prevRight = this.rightCellCtrls;
        const colSpans = this.getColSpans();
        const colsVersion = visibleCols.displayedColsVersion;
        // laid out against the same columns, so each lane is already in `allColsIndex` order
        const inOrder = this.cellCtrlsColsVersion === colsVersion;
        this.cellCtrlsColsVersion = colsVersion;
        // other columns leave the pinned lanes out of `allColsIndex` order, so they are laid out again too
        const pinned = this.pinnedLanesStale || !inOrder || printLayout;
        this.pinnedLanesStale = false;
        this.keptCellCtrls = pinned ? null : keptOutsideCenter(this.keptCellCtrls);
        const focused = beans.focusSvc.getFocusedCell()?.column as AgColumn | undefined;
        // a focused cell may need drawing outside the columns its lane renders, and only in that lane
        const focusedCol = focused?.displayed ? focused : null;

        const centerCols = printLayout
            ? getColsForRow(rowNode, visibleCols.allCols, colSpans)
            : beans.colViewport.getColsWithinViewport(rowNode, colSpans);
        this.centerCellCtrls = this.createCellCtrls(prevCenter, centerCols, colSpans, 1, inOrder, focusedCol);
        if (printLayout) {
            // Print layout flows every column through the centre, so the pinned ctrls are orphaned.
            this.leftCellCtrls = this.destroyLane(prevLeft);
            this.rightCellCtrls = this.destroyLane(prevRight);
        } else if (pinned) {
            const leftCols = getColsForRow(rowNode, visibleCols.leftCols, colSpans);
            this.leftCellCtrls = this.createCellCtrls(prevLeft, leftCols, colSpans, 0, inOrder, focusedCol);

            const rightCols = getColsForRow(rowNode, visibleCols.rightCols, colSpans);
            this.rightCellCtrls = this.createCellCtrls(prevRight, rightCols, colSpans, 2, inOrder, focusedCol);
        }
        if (
            this.centerCellCtrls !== prevCenter ||
            this.leftCellCtrls !== prevLeft ||
            this.rightCellCtrls !== prevRight
        ) {
            this.allCellCtrls = null;
        }
    }

    private getLane(lane: ColumnLane): CellCtrl[] {
        if (lane === 1) {
            return this.centerCellCtrls;
        }
        return lane === 0 ? this.leftCellCtrls : this.rightCellCtrls;
    }

    public getCellCtrl(column: AgColumn): CellCtrl | undefined {
        const visibleCols = this.beans.visibleCols;
        if (visibleCols.colSpanColCount === 0) {
            return this.getOwnCellCtrl(column);
        }
        if (this.updateColumnListsPending && this.rowCtrl.isAlive()) {
            // a pending layout runs a frame later, and whoever reads the drawn cells needs it now
            this.updateColumnListsImpl(false);
        }
        const cellCtrl = this.getOwnCellCtrl(column);
        if (cellCtrl !== undefined) {
            return cellCtrl;
        }
        if (this.cellCtrlsColsVersion !== visibleCols.displayedColsVersion) {
            // laid out against other columns, so the lanes are not in `allColsIndex` order
            const all = this.getAllCellCtrls();
            return findLastSpanning(all, column, 0, all.length);
        }
        const list = this.getLane(this.rowCtrl.laneFor(column));
        const end = firstCellFrom(list, column.allColsIndex + 1);
        // only a kept cell can sit inside another cell's span, so otherwise the nearest start is the only candidate
        return findLastSpanning(list, column, this.keptCellCtrls !== null ? 0 : Math.max(end - 1, 0), end);
    }

    public getOwnCellCtrl(column: AgColumn): CellCtrl | undefined {
        return this.cellByCol.get(column);
    }

    /** Emptied when the displayed columns change, as every colDef change does, and when the row's data changes;
     *  `undefined`, and released, while no column spans. */
    public getColSpans(): number[] | undefined {
        const visibleCols = this.beans.visibleCols;
        if (visibleCols.colSpanColCount === 0) {
            this.colSpans = undefined;
            return undefined;
        }
        const colsVersion = visibleCols.displayedColsVersion;
        let colSpans = this.colSpans;
        if (colSpans !== undefined && this.colSpansColsVersion === colsVersion) {
            return colSpans;
        }
        this.colSpansColsVersion = colsVersion;
        const len = visibleCols.colSpanColCount;
        if (colSpans?.length !== len) {
            colSpans = new Array(len).fill(0);
            this.colSpans = colSpans;
        } else {
            colSpans.fill(0);
        }
        return colSpans;
    }

    /** Keeps `prev` when the rebuild produced the same cells, so an unchanged lane is not re-rendered.
     *  @param inOrder `prev` was laid out against the current columns, so it is in `allColsIndex` order */
    private createCellCtrls(
        prev: CellCtrl[],
        cols: AgColumn[],
        colSpans: number[] | undefined,
        lane: ColumnLane,
        inOrder: boolean,
        focusedCol: AgColumn | null
    ): CellCtrl[] {
        const { rowCtrl, beans, cellByCol } = this;
        const prevLen = prev.length;
        if (!inOrder) {
            for (let i = 0; i < prevLen; ++i) {
                prev[i].diffIndex = i;
            }
        }
        // copied from `prev` at the first cell that differs, so an unchanged lane allocates nothing
        let list: CellCtrl[] | null = null;
        let sameLen = 0;
        let reusedCount = 0;
        let prevIndex = 0;

        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            let cellCtrl: CellCtrl | undefined;
            if (inOrder) {
                const allColsIndex = col.allColsIndex;
                while (prevIndex < prevLen && prev[prevIndex].column.allColsIndex < allColsIndex) {
                    ++prevIndex;
                }
                if (prevIndex < prevLen && prev[prevIndex].column === col) {
                    cellCtrl = prev[prevIndex++];
                }
            } else {
                cellCtrl = cellByCol.get(col);
                // the map holds every lane, and a cell drawn in another lane is not this lane's to reuse
                if (cellCtrl !== undefined && prev[cellCtrl.diffIndex] !== cellCtrl) {
                    cellCtrl = undefined;
                }
            }

            if (cellCtrl !== undefined) {
                // for spanned cells, if the span ref has changed, need to hard refresh cell
                if (rowCtrl.isCorrectCtrlForSpan(cellCtrl)) {
                    ++reusedCount;
                } else {
                    this.destroyCell(cellCtrl);
                    cellCtrl = undefined;
                }
            }

            if (cellCtrl === undefined) {
                cellCtrl = rowCtrl.getNewCellCtrl(col);
                if (!cellCtrl) {
                    continue;
                }
                cellByCol.set(col, cellCtrl);
            }

            if (list !== null) {
                list.push(cellCtrl);
            } else if (sameLen < prevLen && prev[sameLen] === cellCtrl) {
                ++sameLen;
            } else {
                list = prev.slice(0, sameLen);
                list.push(cellCtrl);
            }

            if (colSpans === undefined && cellCtrl.colsSpanning === null) {
                continue;
            }
            // with no column spanning left the row walks no colSpans, so a cell that spanned covers its own column
            const colSpanIndex = col.colSpanIndex;
            _setCellColSpan(beans, cellCtrl, colSpans === undefined || colSpanIndex < 0 ? 1 : colSpans[colSpanIndex]);
        }

        let keptCells: CellCtrl[] | null = null;
        if (reusedCount < prevLen) {
            list ??= prev.slice(0, sameLen);
            for (let i = 0, len = list.length; i < len; ++i) {
                list[i].diffIndex = i;
            }
            for (let i = 0; i < prevLen; ++i) {
                const prevCellCtrl = prev[i];
                // a cell in the result is reused, and one in the wrong span was destroyed above
                if (list[prevCellCtrl.diffIndex] === prevCellCtrl || !prevCellCtrl.isAlive()) {
                    continue;
                }
                if (rowCtrl.laneFor(prevCellCtrl.column) !== lane || !this.isCellKept(prevCellCtrl)) {
                    this.destroyCell(prevCellCtrl);
                } else {
                    keptCells ??= [];
                    keptCells.push(prevCellCtrl);
                }
            }
            if (keptCells !== null) {
                for (let i = 0, keptLen = keptCells.length; i < keptLen; ++i) {
                    this.addKeptCell(list, keptCells[i]);
                }
            }
        }

        if (focusedCol !== null && rowCtrl.laneFor(focusedCol) === lane && !hasOwnCell(list ?? prev, focusedCol)) {
            const cellCtrl = this.createFocusedCellCtrl();
            if (cellCtrl) {
                cellByCol.set(focusedCol, cellCtrl);
                list ??= prev.slice();
                this.addKeptCell(list, cellCtrl);
                keptCells ??= [];
                keptCells.push(cellCtrl);
            }
        }

        if (list === null) {
            return prev;
        }
        if (keptCells !== null) {
            // sized once all are placed, so each stops short of the next cell, kept or not
            for (let i = 0, keptLen = keptCells.length; i < keptLen; ++i) {
                this.setKeptCellColSpan(list, keptCells[i], colSpans);
            }
        }
        return _areEqual(prev, list) ? prev : list;
    }

    private addKeptCell(list: CellCtrl[], cellCtrl: CellCtrl): void {
        this.keptCellCtrls ??= [];
        this.keptCellCtrls.push(cellCtrl);
        // `allColsIndex` is display order in every layout, and the list is already in that order
        list.splice(firstCellFrom(list, cellCtrl.column.allColsIndex), 0, cellCtrl);
    }

    private setKeptCellColSpan(list: CellCtrl[], cellCtrl: CellCtrl, colSpans: number[] | undefined): void {
        // a kept cell is outside the lane walk; its lane is a slice of `allCols`, so the drawn colSpan is the same
        const colIndex = cellCtrl.column.allColsIndex;
        let colSpan = _getRowColSpan(this.rowCtrl.rowNode, this.beans.visibleCols.allCols, colIndex, colSpans);
        // a cell a span covers must not also cover the cell after that span
        const next = list[list.indexOf(cellCtrl) + 1];
        if (next !== undefined) {
            colSpan = Math.min(colSpan, next.column.allColsIndex - colIndex);
        }
        _setCellColSpan(this.beans, cellCtrl, colSpan);
    }

    private createFocusedCellCtrl(): CellCtrl | undefined {
        const { rowCtrl } = this;
        const { focusSvc, rowSpanSvc } = this.beans;
        const focusedCell = focusSvc.getFocusedCell();
        if (!focusedCell) {
            return undefined;
        }

        const focusedSpan = rowSpanSvc?.getCellSpan(focusedCell.column as AgColumn, rowCtrl.rowNode);
        if (focusedSpan) {
            // if span is focused, and the focused row is not the first in this span, don't create ctrl
            if (focusedSpan.firstNode !== rowCtrl.rowNode || !focusedSpan.doesSpanContain(focusedCell)) {
                return undefined;
            }
        } else if (!focusSvc.isRowFocused(rowCtrl.rowNode.rowIndex!, rowCtrl.rowNode.rowPinned)) {
            // if no span, and the focused cell is not in this row, don't create ctrl
            return undefined;
        }

        return rowCtrl.getNewCellCtrl(focusedCell.column as AgColumn);
    }

    /** A focused or editing cell stays while its column is displayed and its span is unchanged. */
    private isCellKept(cellCtrl: CellCtrl): boolean {
        if (!cellCtrl.column.displayed || !this.rowCtrl.isCorrectCtrlForSpan(cellCtrl)) {
            return false;
        }
        return !!this.beans.editSvc?.isEditing(cellCtrl) || cellCtrl.isCellFocused();
    }

    private destroyLane(cellCtrls: CellCtrl[]): CellCtrl[] {
        for (let i = 0, len = cellCtrls.length; i < len; ++i) {
            this.destroyCell(cellCtrls[i]);
        }
        return NO_CELLS;
    }

    private destroyCell(cellCtrl: CellCtrl): void {
        const column = cellCtrl.column;
        // a column whose pin changed may already map to its cell in the new lane
        if (this.cellByCol.get(column) === cellCtrl) {
            this.cellByCol.delete(column);
        }
        cellCtrl.destroy();
    }

    public isSuppressMouseEvent(mouseEvent: MouseEvent): boolean {
        const cellCtrl = _getCellCtrlForEventTarget(this.gos, mouseEvent.target);
        return cellCtrl != null && _suppressCellMouseEvent(this.gos, cellCtrl.column, this.rowCtrl.rowNode, mouseEvent);
    }

    private addListenersForCellCtrls(): void {
        const { rowCtrl } = this;
        this.addManagedListeners(rowCtrl.rowNode, {
            rowIndexChanged: () => {
                const cellCtrls = this.getAllCellCtrls();
                for (let i = 0, len = cellCtrls.length; i < len; ++i) {
                    cellCtrls[i].onRowIndexChanged();
                }
            },
            cellChanged: (event) => {
                this.refreshSpans();
                const cellCtrls = this.getAllCellCtrls();
                for (let i = 0, len = cellCtrls.length; i < len; ++i) {
                    cellCtrls[i].onCellChanged(event);
                }
            },
        });
        // a colDef update can add, change or drop a legacy `rowSpan`
        this.addManagedEventListeners({
            newColumnsLoaded: () => {
                const beans = this.beans;
                const cellCtrls = this.getAllCellCtrls();
                for (let i = 0, len = cellCtrls.length; i < len; ++i) {
                    _refreshCellRowSpan(beans, cellCtrls[i]);
                }
            },
        });
    }
}

/** Shared by every empty lane, as a lane list is never mutated. */
export const NO_CELLS: CellCtrl[] = [];

/** The columns of a pinned lane (or every lane, in print layout) starting a cell in `rowNode`. */
const getColsForRow = (rowNode: RowNode, cols: AgColumn[], colSpans: number[] | undefined): AgColumn[] =>
    colSpans === undefined ? cols : _getColsForRow(rowNode, cols, colSpans, null, null);

/** The kept cells of the pinned lanes, which a layout of the centre lane alone leaves as they are. */
const keptOutsideCenter = (keptCellCtrls: CellCtrl[] | null): CellCtrl[] | null => {
    if (keptCellCtrls === null) {
        return null;
    }
    let res: CellCtrl[] | null = null;
    for (let i = 0, len = keptCellCtrls.length; i < len; ++i) {
        const cellCtrl = keptCellCtrls[i];
        if (cellCtrl.column.pinnedLane !== 1) {
            res ??= [];
            res.push(cellCtrl);
        }
    }
    return res;
};

const destroyAll = (cellCtrls: CellCtrl[]): void => {
    for (let i = 0, len = cellCtrls.length; i < len; ++i) {
        cellCtrls[i].destroy();
    }
};

/** A copy of the lane without `cellCtrl`, as a list given to the row comp is never mutated. */
const removeCellCtrl = (cellCtrls: CellCtrl[], cellCtrl: CellCtrl): CellCtrl[] => {
    const index = cellCtrls.indexOf(cellCtrl);
    if (index < 0) {
        return cellCtrls;
    }
    const res = cellCtrls.slice();
    res.splice(index, 1);
    return res;
};

/** Whether a lane in `allColsIndex` order has a cell for `column` itself. */
const hasOwnCell = (cellCtrls: CellCtrl[], column: AgColumn): boolean =>
    cellCtrls[firstCellFrom(cellCtrls, column.allColsIndex)]?.column === column;

/** The index of the first of `list`, in `allColsIndex` order, whose column is at `allColsIndex` or after it. */
const firstCellFrom = (list: CellCtrl[], allColsIndex: number): number => {
    let low = 0;
    let high = list.length;
    while (low < high) {
        const mid = (low + high) >>> 1;
        if (list[mid].column.allColsIndex < allColsIndex) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
};

/** The last of `cellCtrls` in `[start, end)` whose drawn colSpan covers `column`. */
const findLastSpanning = (
    cellCtrls: CellCtrl[],
    column: AgColumn,
    start: number,
    end: number
): CellCtrl | undefined => {
    for (let i = end - 1; i >= start; --i) {
        const cellCtrl = cellCtrls[i];
        if (cellCtrl.colsSpanning?.includes(column)) {
            return cellCtrl;
        }
    }
    return undefined;
};
