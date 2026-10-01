import { _areEqual, _batchCall } from 'ag-stack';

import { _getColsForRow, _getRowColSpan } from '../../columns/columnSpanUtils';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn, ColumnLane } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { RefreshRowsParams } from '../../interfaces/iCellsParams';
import type { ColumnInstanceId, ColumnPinnedType } from '../../interfaces/iColumn';
import type { CellCtrl } from '../cell/cellCtrl';
import { _refreshCellRowSpan, _setCellColSpan } from '../cell/cellPositionFeature';
import { _getCellCtrlForEventTarget, _suppressCellMouseEvent } from '../renderUtils';
import type { IRowModeFeature } from './iRowModeFeature';
import type { RowCtrl } from './rowCtrl';

interface CellCtrlListAndMap {
    list: CellCtrl[];
    map: { [key: ColumnInstanceId]: CellCtrl };
}

export class NormalRowFeature extends BeanStub implements IRowModeFeature {
    private centerCellCtrls: CellCtrlListAndMap = { list: [], map: {} };
    private leftCellCtrls: CellCtrlListAndMap = { list: [], map: {} };
    private rightCellCtrls: CellCtrlListAndMap = { list: [], map: {} };

    /** Cleared whenever a container list is replaced; rebuilt on demand by getAllCellCtrls. */
    private allCellCtrls: CellCtrl[] | null = null;

    private updateColumnListsPending = false;
    private setCellCtrlsPending = false;
    /** A change reached the row after its cells were last laid out, so mounting must lay them out again. */
    private cellsStale = true;
    /** The drawn colSpans by `allColsIndex`, 0 where not read yet, so a horizontal scroll asks no `colSpan` callback. */
    private colSpans: number[] | null = null;
    /** The `displayedColsVersion` `colSpans` was read at; -1 to read it again. */
    private colSpansColsVersion = -1;
    /** The `displayedColsVersion` the cells were laid out at. */
    private cellCtrlsColsVersion = -1;
    private releaseKeptCellsPending = false;
    /** The last layout kept a cell only because it is focused or editing, outside the columns its lane renders. */
    private hasKeptCells = false;

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
        if (!this.cellsStale) {
            this.setCellCtrls(false);
            return;
        }
        this.updateColumnLists(!this.rowCtrl.useAnimationFrameForCreate);
    }

    public refreshRow(params: RefreshRowsParams): void {
        this.refreshSpans();
        for (const cellCtrl of this.getAllCellCtrls()) {
            cellCtrl.refreshCell(params);
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

    public getInitialCellCtrls(_containerType: RowContainerType): CellCtrl[] | null {
        if (this.rowCtrl.useAnimationFrameForCreate) {
            return null;
        }
        if (this.cellsStale) {
            this.createAllCellCtrls();
        }
        return this.getAllCellCtrls();
    }

    /** Called far more often than the lists change, so the flattened result is cached, not rebuilt. */
    public getAllCellCtrls(): CellCtrl[] {
        let all = this.allCellCtrls;
        if (all === null) {
            const center = this.centerCellCtrls.list;
            const left = this.leftCellCtrls.list;
            const right = this.rightCellCtrls.list;
            // `concat` over a manual fill: this is cached and then read by every caller until the lists
            // change, and `new Array(n)` would leave it holey, taxing each of those reads.
            all = left.length === 0 && right.length === 0 ? center : center.concat(left, right);
            this.allCellCtrls = all;
        }
        return all;
    }

    public recreateCell(cellCtrl: CellCtrl): void {
        this.allCellCtrls = null;
        this.centerCellCtrls = this.removeCellCtrl(this.centerCellCtrls, cellCtrl);
        this.leftCellCtrls = this.removeCellCtrl(this.leftCellCtrls, cellCtrl);
        this.rightCellCtrls = this.removeCellCtrl(this.rightCellCtrls, cellCtrl);
        cellCtrl.destroy();
        this.updateColumnLists();
    }

    public destroyCells(): void {
        this.allCellCtrls = null;
        this.centerCellCtrls = destroyCellCtrls(this.centerCellCtrls);
        this.leftCellCtrls = destroyCellCtrls(this.leftCellCtrls);
        this.rightCellCtrls = destroyCellCtrls(this.rightCellCtrls);
    }

    public onDisplayedColumnsChanged(): void {
        // skip animations to avoid stale valueGetters when column sets change
        this.updateColumnLists(true);
        this.beans.rowAutoHeight?.requestCheckAutoHeight();
    }

    public onVirtualColumnsChanged(): void {
        this.updateColumnLists(false, true);
    }

    public renderFocusedCell(): void {
        // synchronous, so the cell exists before the focus change is applied to the cells
        this.updateColumnLists(true);
    }

    public onColumnMoved(): void {
        this.updateColumnLists();
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
        if (!visibleCols.colSpanActive) {
            return;
        }
        // a row not yet mounted lays its cells out from the new data when it mounts
        if (!this.rowCtrl.getGui()) {
            this.cellsStale = true;
            return;
        }
        this.updateCellsIfChanged();
    }

    /** @param afterEdit the edit stays in the edit model until its stop event has been dispatched, so wait for it */
    public releaseKeptCells(afterEdit: boolean): void {
        if (!this.hasKeptCells) {
            return;
        }
        if (!afterEdit) {
            this.updateCellsIfChanged();
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

    private updateCellsIfChanged(): void {
        this.updateColumnLists(false, false, true);
    }

    /** @param ifChanged tell the row comp only when the cells changed: nothing else it renders can have moved */
    private updateColumnLists(suppressAnimationFrame = false, useFlushSync = false, ifChanged = false): void {
        const { rowCtrl } = this;
        const { animationFrameSvc } = this.beans;
        const noAnimation = !animationFrameSvc?.active || suppressAnimationFrame || rowCtrl.printLayout;
        this.setCellCtrlsPending ||= !ifChanged;

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
        const setCellCtrls = this.setCellCtrlsPending;
        this.setCellCtrlsPending = false;
        if (!this.createAllCellCtrls() && !setCellCtrls) {
            return;
        }
        this.setCellCtrls(useFlushSync);
    }

    private setCellCtrls(useFlushSync: boolean): void {
        const rowGui = this.rowCtrl.getGui();

        if (!rowGui) {
            return;
        }

        rowGui.rowComp.setCellCtrls(this.getAllCellCtrls(), useFlushSync, this.cellCtrlsColsVersion);
        this.rowCtrl.refreshPinnedCellGroupWidths();
    }

    /** @returns whether any lane's cells changed */
    private createAllCellCtrls(): boolean {
        this.cellsStale = false;
        const { rowCtrl, beans } = this;
        const rowNode = rowCtrl.rowNode;
        const visibleCols = beans.visibleCols;
        const prevCenter = this.centerCellCtrls;
        const prevLeft = this.leftCellCtrls;
        const prevRight = this.rightCellCtrls;
        const colSpans = visibleCols.colSpanActive ? this.getColSpans() : null;
        this.cellCtrlsColsVersion = visibleCols.displayedColsVersion;
        this.hasKeptCells = false;
        if (rowCtrl.printLayout) {
            const printCols = getColsForRow(rowNode, visibleCols.allCols, colSpans);
            this.centerCellCtrls = this.createCellCtrls(prevCenter, printCols, colSpans, 1);
            // Print layout flows every column through the centre, so the pinned ctrls are orphaned.
            this.leftCellCtrls = destroyCellCtrls(prevLeft);
            this.rightCellCtrls = destroyCellCtrls(prevRight);
        } else {
            const centerCols = beans.colViewport.getColsWithinViewport(rowNode, colSpans);
            this.centerCellCtrls = this.createCellCtrls(prevCenter, centerCols, colSpans, 1);

            const leftCols = getColsForRow(rowNode, visibleCols.leftCols, colSpans);
            this.leftCellCtrls = this.createCellCtrls(prevLeft, leftCols, colSpans, 0);

            const rightCols = getColsForRow(rowNode, visibleCols.rightCols, colSpans);
            this.rightCellCtrls = this.createCellCtrls(prevRight, rightCols, colSpans, 2);
        }
        const changed =
            this.centerCellCtrls !== prevCenter || this.leftCellCtrls !== prevLeft || this.rightCellCtrls !== prevRight;
        if (changed) {
            this.allCellCtrls = null;
        }
        return changed;
    }

    public getCellCtrl(column: AgColumn, skipColSpanSearch: boolean): CellCtrl | undefined {
        const visibleCols = this.beans.visibleCols;
        if (skipColSpanSearch || !visibleCols.colSpanActive) {
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
        const lane = this.rowCtrl.laneFor(column);
        let list: CellCtrl[];
        if (lane === 1) {
            list = this.centerCellCtrls.list;
        } else if (lane === 0) {
            list = this.leftCellCtrls.list;
        } else {
            list = this.rightCellCtrls.list;
        }
        const end = firstCellFrom(list, column.allColsIndex + 1);
        // only a kept cell can sit inside another cell's span, so otherwise the nearest start is the only candidate
        return findLastSpanning(list, column, this.hasKeptCells ? 0 : Math.max(end - 1, 0), end);
    }

    private getOwnCellCtrl(column: AgColumn): CellCtrl | undefined {
        const id = column.instanceId;
        return this.centerCellCtrls.map[id] ?? this.leftCellCtrls.map[id] ?? this.rightCellCtrls.map[id];
    }

    /** Emptied when the displayed columns change, which every colDef change also does. */
    private getColSpans(): number[] {
        const visibleCols = this.beans.visibleCols;
        const colsVersion = visibleCols.displayedColsVersion;
        let colSpans = this.colSpans;
        if (colSpans !== null && this.colSpansColsVersion === colsVersion) {
            return colSpans;
        }
        this.colSpansColsVersion = colsVersion;
        const len = visibleCols.allCols.length;
        if (colSpans?.length !== len) {
            colSpans = new Array(len).fill(0);
            this.colSpans = colSpans;
        } else {
            colSpans.fill(0);
        }
        return colSpans;
    }

    /** Keeps `prev` when the rebuild produced the same cells, so an unchanged lane is not re-rendered. */
    private createCellCtrls(
        prev: CellCtrlListAndMap,
        cols: AgColumn[],
        colSpans: number[] | null,
        lane: ColumnLane
    ): CellCtrlListAndMap {
        const { rowCtrl, beans } = this;
        const res: CellCtrlListAndMap = {
            list: [],
            map: {},
        };

        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            // we use instanceId's rather than colId as it's possible there is a Column with same Id,
            // but it's referring to a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg pivot_0, pivot_1 etc
            const colInstanceId = col.instanceId;
            let cellCtrl: CellCtrl | undefined = prev.map[colInstanceId];

            // for spanned cells, if the span ref has changed, need to hard refresh cell
            if (cellCtrl && !rowCtrl.isCorrectCtrlForSpan(cellCtrl)) {
                cellCtrl.destroy();
                cellCtrl = undefined;
            }

            cellCtrl ??= rowCtrl.getNewCellCtrl(col);

            if (!cellCtrl) {
                continue;
            }

            res.list.push(cellCtrl);
            res.map[colInstanceId] = cellCtrl;
            if (colSpans === null && cellCtrl.colsSpanning === null) {
                continue;
            }
            // with no column spanning left the row walks no colSpans, so a cell that spanned covers its own column
            _setCellColSpan(beans, cellCtrl, colSpans === null ? 1 : colSpans[col.allColsIndex]);
        }

        let keptCells: CellCtrl[] | null = null;
        for (const prevCellCtrl of prev.list) {
            const colInstanceId = prevCellCtrl.column.instanceId;
            // a cell in the result is reused, and one in the wrong span was destroyed above
            if (res.map[colInstanceId] != null || !prevCellCtrl.isAlive()) {
                continue;
            }

            const keepCell = !this.isCellEligibleToBeRemoved(prevCellCtrl, lane);

            if (keepCell) {
                this.addKeptCell(res, colInstanceId, prevCellCtrl);
                keptCells ??= [];
                keptCells.push(prevCellCtrl);
            } else {
                prevCellCtrl.destroy();
            }
        }

        const focusedCell = beans.focusSvc.getFocusedCell();
        const focusedCol = focusedCell?.column as AgColumn | undefined;
        // if a cell is focused, might need to be force rendered if it belongs to this lane
        if (focusedCol && rowCtrl.laneFor(focusedCol) === lane) {
            const focusedColInstanceId = focusedCol.instanceId;
            const focusedCellCtrl = res.map[focusedColInstanceId];

            // if focused col is visible, and there's no cell here for it, try to create one
            if (!focusedCellCtrl && focusedCol.displayed) {
                const cellCtrl = this.createFocusedCellCtrl();
                if (cellCtrl) {
                    this.addKeptCell(res, focusedColInstanceId, cellCtrl);
                    keptCells ??= [];
                    keptCells.push(cellCtrl);
                }
            }
        }

        if (keptCells !== null) {
            // sized once all are placed, so each stops short of the next cell, kept or not
            for (let i = 0, len = keptCells.length; i < len; ++i) {
                this.setKeptCellColSpan(res.list, keptCells[i], colSpans);
            }
        }

        return _areEqual(prev.list, res.list) ? prev : res;
    }

    private addKeptCell(res: CellCtrlListAndMap, colInstanceId: ColumnInstanceId, cellCtrl: CellCtrl): void {
        this.hasKeptCells = true;
        const list = res.list;
        // `allColsIndex` is display order in every layout, and the list is already in that order
        list.splice(firstCellFrom(list, cellCtrl.column.allColsIndex), 0, cellCtrl);
        res.map[colInstanceId] = cellCtrl;
    }

    private setKeptCellColSpan(list: CellCtrl[], cellCtrl: CellCtrl, colSpans: number[] | null): void {
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

    private isCellEligibleToBeRemoved(cellCtrl: CellCtrl, lane: ColumnLane): boolean {
        const REMOVE_CELL = true;
        const KEEP_CELL = false;

        // always remove the cell if it's not rendered or if it's in the wrong lane
        const { column } = cellCtrl;
        if (this.rowCtrl.laneFor(column) !== lane) {
            return REMOVE_CELL;
        }

        // if cell is in wrong span container, remove it
        if (!this.rowCtrl.isCorrectCtrlForSpan(cellCtrl)) {
            return REMOVE_CELL;
        }

        // we want to try and keep editing and focused cells
        const { editSvc } = this.beans;
        const editing = editSvc?.isEditing(cellCtrl);
        const focused = cellCtrl.isCellFocused();

        const mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            return column.displayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;
    }

    private removeCellCtrl(prev: CellCtrlListAndMap, cellCtrlToRemove: CellCtrl): CellCtrlListAndMap {
        const res: CellCtrlListAndMap = {
            list: [],
            map: {},
        };
        for (const cellCtrl of prev.list) {
            if (cellCtrl === cellCtrlToRemove) {
                continue;
            }
            res.list.push(cellCtrl);
            res.map[cellCtrl.column.instanceId] = cellCtrl;
        }
        return res;
    }

    public isSuppressMouseEvent(mouseEvent: MouseEvent): boolean {
        const cellCtrl = _getCellCtrlForEventTarget(this.gos, mouseEvent.target);
        return cellCtrl != null && _suppressCellMouseEvent(this.gos, cellCtrl.column, this.rowCtrl.rowNode, mouseEvent);
    }

    private addListenersForCellCtrls(): void {
        const { rowCtrl } = this;
        this.addManagedListeners(rowCtrl.rowNode, {
            rowIndexChanged: () => {
                for (const cellCtrl of this.getAllCellCtrls()) {
                    cellCtrl.onRowIndexChanged();
                }
            },
            cellChanged: (event) => {
                this.refreshSpans();
                for (const cellCtrl of this.getAllCellCtrls()) {
                    cellCtrl.onCellChanged(event);
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

/** The columns of a pinned lane (or every lane, in print layout) starting a cell in `rowNode`. */
const getColsForRow = (rowNode: RowNode, cols: AgColumn[], colSpans: number[] | null): AgColumn[] =>
    colSpans === null ? cols : _getColsForRow(rowNode, cols, colSpans, null, null);

/** Destroys every ctrl in a lane and returns the empty replacement. */
const destroyCellCtrls = (ctrls: CellCtrlListAndMap): CellCtrlListAndMap => {
    if (ctrls.list.length === 0) {
        return ctrls;
    }
    for (const c of ctrls.list) {
        c.destroy();
    }
    return { list: [], map: {} };
};

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
