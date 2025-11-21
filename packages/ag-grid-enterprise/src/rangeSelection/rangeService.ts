import type {
    AgColumn,
    AgColumnGroup,
    BeanCollection,
    CellCtrl,
    CellNavigationService,
    CellPosition,
    CellRange,
    CellRangeBoundaryParams,
    CellRangeParams,
    ClearCellRangeParams,
    ColumnModel,
    CtrlsService,
    DragService,
    GridOptionsService,
    ICellRangeFeature,
    IHeaderCellComp,
    IRangeService,
    IRowModel,
    NamedBean,
    PartialCellRange,
    RowPinnedType,
    RowPosition,
    ValueService,
    VisibleColsService,
} from 'ag-grid-community';
import {
    AutoScrollService,
    BeanStub,
    _areCellsEqual,
    _areEqual,
    _exists,
    _getAbsoluteRowIndex,
    _getCellCtrlForEventTarget,
    _getFirstRow,
    _getLastRow,
    _getRowAbove,
    _getRowBelow,
    _getRowCtrlForEventTarget,
    _getRowNode,
    _getSuppressColumnSelection,
    _getSuppressMultiRanges,
    _isCellSelectionEnabled,
    _isDomLayout,
    _isRowBefore,
    _isRowNumbers,
    _isSameRow,
    _isUsingNewCellSelectionAPI,
    _last,
    _makeNull,
    _missing,
    _removeFromArray,
    _warn,
    isRowNumberCol,
} from 'ag-grid-community';

import { CellRangeFeature } from './cellRangeFeature';
import { DragListenerFeature } from './dragListenerFeature';
import { HeaderGroupCellMouseListenerFeature } from './headerGroupCellMouseListenerFeature';
import { RangeHeaderHighlightFeature } from './rangeHeaderHighlightFeature';

enum SelectionMode {
    NORMAL,
    ALL_COLUMNS,
}

interface ColumnRangeSelectionContext {
    lastCellRange?: CellRange;
    root?: AgColumn;
}

export class RangeService extends BeanStub implements NamedBean, IRangeService {
    beanName = 'rangeSvc' as const;

    private rowModel: IRowModel;
    private dragSvc: DragService;
    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;
    private cellNavigation: CellNavigationService;
    private ctrlsSvc: CtrlsService;
    private valueSvc: ValueService;
    private selectionMode: SelectionMode;

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
        this.dragSvc = beans.dragSvc!;
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
        this.cellNavigation = beans.cellNavigation!;
        this.ctrlsSvc = beans.ctrlsSvc;
        this.valueSvc = beans.valueSvc;
    }

    private cellRanges: CellRange[] = [];
    private lastMouseEvent: MouseEvent | null;
    private readonly bodyScrollListener = this.onBodyScroll.bind(this);

    private lastCellHovered: CellPosition | undefined;
    private cellHasChanged: boolean;

    /** when a range is created, we mark the 'start cell' for further processing as follows:
     * 1) if dragging, then the new range is extended from the start position
     * 2) if user hits 'shift' click on a cell, the previous range is extended from the start position
     */
    private newestRangeStartCell?: CellPosition;

    private dragging = false;
    private draggingRange?: CellRange;

    /** When dragging ends, the current range will be used to intersect all other ranges */
    private intersectionRange = false;

    public autoScrollService: AutoScrollService;

    private readonly columnRangeSelectionCtx: ColumnRangeSelectionContext = {};

    public postConstruct(): void {
        const onColumnsChanged = this.onColumnsChanged.bind(this);
        const removeAllCellRanges = () => this.removeAllCellRanges();
        const refreshLastRangeStart = this.refreshLastRangeStart.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: onColumnsChanged,
            columnVisible: onColumnsChanged,
            columnValueChanged: onColumnsChanged,
            columnPivotModeChanged: removeAllCellRanges,
            columnRowGroupChanged: removeAllCellRanges,
            columnPivotChanged: removeAllCellRanges,
            columnGroupOpened: refreshLastRangeStart,
            columnMoved: refreshLastRangeStart,
            columnPinned: refreshLastRangeStart,
        });

        this.ctrlsSvc.whenReady(this, (p) => {
            const gridBodyCtrl = p.gridBodyCtrl;
            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCtrl.eBodyViewport,
                scrollAxis: 'xy',
                getVerticalPosition: () => gridBodyCtrl.scrollFeature.getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCtrl.scrollFeature.setVerticalScrollPosition(position),
                getHorizontalPosition: () => gridBodyCtrl.scrollFeature.getHScrollPosition().left,
                setHorizontalPosition: (position) => gridBodyCtrl.scrollFeature.setHorizontalScrollPosition(position),
                shouldSkipVerticalScroll: () => !_isDomLayout(this.gos, 'normal'),
                shouldSkipHorizontalScroll: () => !gridBodyCtrl.scrollFeature.isHorizontalScrollShowing(),
            });
        });
    }

    // Drag And Drop Target Methods
    public onDragStart(mouseEvent: MouseEvent): void {
        const gos = this.gos;
        if (
            !_isCellSelectionEnabled(gos) ||
            _getRowCtrlForEventTarget(gos, mouseEvent.target)?.isSuppressMouseEvent(mouseEvent)
        ) {
            return;
        }

        const { ctrlKey, metaKey, shiftKey } = mouseEvent;

        // ctrlKey for windows, metaKey for Apple
        const isMultiKey = ctrlKey || metaKey;
        const allowMulti = !_getSuppressMultiRanges(gos);
        const isMultiSelect = allowMulti ? isMultiKey : false;
        const extendRange = shiftKey && !!this.cellRanges?.length;

        if (!isMultiSelect && (!extendRange || _exists(_last(this.cellRanges).type))) {
            this.removeAllCellRanges(true);
        }

        // The browser changes the Event target of cached events when working with the ShadowDOM
        // so we need to retrieve the initial DragStartTarget.
        const startTarget = this.dragSvc.startTarget;

        if (startTarget) {
            this.updateValuesOnMove(startTarget);
        }

        if (!this.lastCellHovered) {
            return;
        }

        this.dragging = true;
        this.lastMouseEvent = mouseEvent;
        this.intersectionRange = isMultiSelect && this.getCellRangeCount(this.lastCellHovered) > 1;

        if (!extendRange) {
            this.setNewestRangeStartCell(this.lastCellHovered);
        }

        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = _last(this.cellRanges);
        } else {
            const mouseRowPosition: RowPosition = {
                rowIndex: this.lastCellHovered.rowIndex,
                rowPinned: this.lastCellHovered.rowPinned,
            };

            const columns = this.getColumnsFromModel([this.lastCellHovered.column] as AgColumn[]);

            if (!columns?.length) {
                return;
            }

            this.draggingRange = {
                startRow: mouseRowPosition,
                endRow: mouseRowPosition,
                columns,
                startColumn: this.newestRangeStartCell!.column,
            };

            this.cellRanges.push(this.draggingRange);
        }

        this.ctrlsSvc
            .getGridBodyCtrl()
            .eBodyViewport.addEventListener('scroll', this.bodyScrollListener, { passive: true });

        this.dispatchChangedEvent(true, false, this.draggingRange.id);
    }

    public onDragging(mouseEvent: MouseEvent | null): void {
        const { dragging, lastCellHovered, newestRangeStartCell, autoScrollService, cellHasChanged } = this;
        if (!dragging || !mouseEvent) {
            return;
        }

        this.updateValuesOnMove(mouseEvent.target);

        this.lastMouseEvent = mouseEvent;

        const isMouseAndStartInPinned = (position: string) =>
            lastCellHovered && lastCellHovered.rowPinned === position && newestRangeStartCell!.rowPinned === position;

        const skipVerticalScroll = isMouseAndStartInPinned('top') || isMouseAndStartInPinned('bottom');

        autoScrollService.check(mouseEvent, skipVerticalScroll);

        if (!cellHasChanged || !lastCellHovered) {
            return;
        }

        const startColumn = newestRangeStartCell?.column as AgColumn;
        const currentColumn = lastCellHovered?.column as AgColumn;

        const columns = this.calculateColumnsBetween(startColumn, currentColumn);

        if (!columns) {
            return;
        }

        const { rowIndex, rowPinned } = lastCellHovered;

        this.draggingRange!.endRow = {
            rowIndex,
            rowPinned,
        };

        this.draggingRange!.columns = columns;
        this.dispatchChangedEvent(false, false, this.draggingRange!.id);
    }

    public onDragStop(): void {
        if (!this.dragging) {
            return;
        }

        const { id } = this.draggingRange!;

        this.autoScrollService.ensureCleared();

        this.ctrlsSvc.getGridBodyCtrl().eBodyViewport.removeEventListener('scroll', this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.draggingRange = undefined;
        this.lastCellHovered = undefined;

        if (this.intersectionRange) {
            this.intersectionRange = false;
            this.intersectLastRange();
        }

        this.dispatchChangedEvent(false, true, id);
    }

    // Called for both columns loaded & column visibility events
    public onColumnsChanged(): void {
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();

        const allColumns = this.visibleCols.allCols;

        // check that the columns in each range still exist and are visible
        for (const cellRange of this.cellRanges) {
            const beforeCols = cellRange.columns;

            // remove hidden or removed cols from cell range
            cellRange.columns = cellRange.columns.filter(
                (col: AgColumn) => col.isVisible() && allColumns.indexOf(col) !== -1
            );

            const colsInRangeChanged = !_areEqual(beforeCols, cellRange.columns);

            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                this.dispatchChangedEvent(false, true, cellRange.id);
            }
        }
        // Remove empty cell ranges
        const countBefore = this.cellRanges.length;
        this.cellRanges = this.cellRanges.filter((range) => range.columns.length > 0);
        if (countBefore > this.cellRanges.length) {
            this.dispatchChangedEvent(false, true);
        }
    }

    public refreshLastRangeStart(): void {
        const lastRange = _last(this.cellRanges);

        if (!lastRange) {
            return;
        }

        this.refreshRangeStart(lastRange);
    }

    public isContiguousRange(cellRange: CellRange): boolean {
        const rangeColumns = cellRange.columns as AgColumn[];

        if (!rangeColumns.length) {
            return false;
        }

        const allColumns = this.visibleCols.allCols;
        const allPositions = rangeColumns.map((c) => allColumns.indexOf(c)).sort((a, b) => a - b);

        return _last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    }

    public getRangeStartRow(cellRange: PartialCellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            return _isRowBefore(cellRange.startRow, cellRange.endRow) ? cellRange.startRow : cellRange.endRow;
        }

        const pinnedTopRowCount = this.beans.pinnedRowModel?.getPinnedTopRowCount() ?? 0;
        const rowPinned = pinnedTopRowCount > 0 ? 'top' : null;

        return { rowIndex: 0, rowPinned };
    }

    public getRangeEndRow(cellRange: PartialCellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            return _isRowBefore(cellRange.startRow, cellRange.endRow) ? cellRange.endRow : cellRange.startRow;
        }

        const pinnedBottomRowCount = this.beans.pinnedRowModel?.getPinnedBottomRowCount() ?? 0;
        const pinnedBottom = pinnedBottomRowCount > 0;

        if (pinnedBottom) {
            return {
                rowIndex: pinnedBottomRowCount - 1,
                rowPinned: 'bottom',
            };
        }

        return {
            rowIndex: this.rowModel.getRowCount() - 1,
            rowPinned: null,
        };
    }

    public getRangeRowCount(cellRange: PartialCellRange): number {
        const beans = this.beans;
        const start = this.getRangeStartRow(cellRange);
        const end = this.getRangeEndRow(cellRange);

        const startIndex = _getAbsoluteRowIndex(beans, start);
        const endIndex = _getAbsoluteRowIndex(beans, end);

        return endIndex - startIndex + 1;
    }

    public setRangeToCell(cell: CellPosition, appendRange = false): void {
        const { gos, beans } = this;
        if (!_isCellSelectionEnabled(gos)) {
            return;
        }

        const isRowNumbersEnabled = _isRowNumbers(beans);
        if (isRowNumbersEnabled) {
            const allColumnsRange = isRowNumberCol(cell.column);
            this.setSelectionMode(allColumnsRange);
        }

        const columns = this.calculateColumnsBetween(cell.column as AgColumn, cell.column as AgColumn);

        if (!columns) {
            return;
        }

        const suppressMultiRangeSelections = _getSuppressMultiRanges(gos);

        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || _missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }

        const rowForCell: RowPosition = {
            rowIndex: cell.rowIndex,
            rowPinned: cell.rowPinned,
        };

        const cellRange: CellRange = {
            startRow: rowForCell,
            endRow: rowForCell,
            columns,
            startColumn: cell.column,
        };

        this.cellRanges.push(cellRange);

        this.setNewestRangeStartCell(cell);
        this.onDragStop();
        this.dispatchChangedEvent(true, true);
    }

    private getRangeLastColumn(cellRange: CellRange): AgColumn {
        const firstCol = cellRange.columns[0];
        const lastCol = _last(cellRange.columns);

        return (this.newestRangeStartCell?.column === firstCol ? lastCol : firstCol) as AgColumn;
    }

    public extendRangeRowCountBy(cellRange: CellRange, targetCount: number): void {
        const { beans } = this;
        const { startRow, endRow } = cellRange;

        if (!startRow || !endRow) {
            return;
        }

        let stepsMoved = 0;
        let currentRow;

        const isBottomUp = _isRowBefore(endRow, startRow);
        if (isBottomUp) {
            currentRow = startRow;
        } else {
            currentRow = endRow;
        }

        const stepFn = targetCount > 0 ? _getRowBelow : _getRowAbove;
        const stepCount = Math.abs(targetCount);

        while (stepsMoved < stepCount) {
            const nextRow = stepFn(beans, currentRow);
            if (!nextRow) {
                break;
            }
            currentRow = nextRow;
            stepsMoved++;
        }

        if (stepsMoved !== stepCount) {
            return; // Could not move the desired number of rows
        }

        const cellPosition = {
            ...currentRow,
            column: this.getRangeLastColumn(cellRange),
        };

        this.updateRangeRowBoundary({ cellRange, boundary: isBottomUp ? 'start' : 'end', cellPosition });
    }

    public extendRangeColumnCountBy(cellRange: CellRange, delta: number): void {
        const { columns, startColumn } = cellRange;

        if (delta === 0) {
            return;
        }

        const allColumns = this.getColumnsFromModel(); // ordered visible columns

        if (!allColumns) {
            return;
        }

        const lastColumn = _last(columns);
        const endColumn = startColumn === columns[0] ? lastColumn : columns[0];

        if (!lastColumn || !endColumn) {
            return;
        }

        let startIdx = allColumns.indexOf(startColumn as AgColumn);
        const endIdx = allColumns.indexOf(endColumn as AgColumn);
        const isRtlRange = endIdx < startIdx;

        if (isRtlRange) {
            // if we are anchoring to the left and the range is rtl
            // then we need to flip the start and end indices
            startIdx = endIdx;
        }

        const currentLength = columns.length;
        const targetLength = currentLength + delta;

        if (targetLength <= 0) {
            return; // can't shrink to 0 or less
        }

        const newColumns: AgColumn[] = [];

        for (let i = startIdx; i < startIdx + targetLength; i++) {
            const col = allColumns[i];
            if (!col) {
                break;
            }
            newColumns.push(col);
        }

        // Only update if length actually changed
        if (newColumns.length === targetLength) {
            if (isRtlRange) {
                // before we add changes to the range, the
                // new range start should receive focus
                const newColumnToFocus = _last(newColumns);
                cellRange.startColumn = newColumnToFocus;
                this.focusCellOnNewColumn(cellRange, newColumnToFocus);
            }
            cellRange.columns = newColumns;
            this.dispatchChangedEvent(true, true, cellRange.id);
        }
    }

    public extendLatestRangeToCell(cellPosition: CellPosition): void {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }

        const cellRange = _last(this.cellRanges);

        this.setSelectionMode(isRowNumberCol(cellPosition.column));
        this.updateRangeRowBoundary({ cellRange, boundary: 'end', cellPosition });
    }

    public updateRangeRowBoundary(params: CellRangeBoundaryParams): void {
        const { cellRange, boundary, cellPosition, silent = false } = params;
        const endColumn = cellPosition.column as AgColumn;
        const colsToAdd = this.calculateColumnsBetween(cellRange.startColumn as AgColumn, endColumn);

        if (!colsToAdd || isLastCellOfRange(cellRange, cellPosition)) {
            return;
        }

        if (boundary === 'start') {
            this.focusCellOnNewRow(cellRange, cellPosition);
        }

        cellRange.columns = colsToAdd;
        cellRange[boundary === 'start' ? 'startRow' : 'endRow'] = {
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned,
        };

        if (!silent) {
            this.dispatchChangedEvent(true, true, cellRange.id);
        }
    }

    public getRangeEdgeColumns(cellRange: CellRange): { left: AgColumn; right: AgColumn } {
        const allColumns = this.visibleCols.allCols;
        const allIndices = cellRange.columns
            .map((c: AgColumn) => allColumns.indexOf(c))
            .filter((i) => i > -1)
            .sort((a, b) => a - b);

        return {
            left: allColumns[allIndices[0]],
            right: allColumns[_last(allIndices)],
        };
    }

    // returns true if successful, false if not successful
    public extendLatestRangeInDirection(event: KeyboardEvent): CellPosition | undefined {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }

        const key = event.key;
        const ctrlKey = event.ctrlKey || event.metaKey;

        const lastRange = _last(this.cellRanges);
        const startCell = this.newestRangeStartCell;

        // find the cell that is at the furthest away corner from the starting cell
        const endCellIndex = lastRange.endRow!.rowIndex;
        const endCellFloating = lastRange.endRow!.rowPinned;
        const endCellColumn = this.getRangeLastColumn(lastRange);

        const endCell: CellPosition = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
        const newEndCell = this.cellNavigation.getNextCellToFocus(key, endCell, ctrlKey);

        // if user is at end of grid, so no cell to extend to, we return false
        if (!newEndCell) {
            return;
        }

        this.setCellRange({
            rowStartIndex: startCell.rowIndex,
            rowStartPinned: startCell.rowPinned,
            rowEndIndex: newEndCell.rowIndex,
            rowEndPinned: newEndCell.rowPinned,
            columnStart: startCell.column,
            columnEnd: newEndCell.column,
        });

        return newEndCell;
    }

    public setCellRange(params: CellRangeParams): void {
        if (!_isCellSelectionEnabled(this.gos)) {
            return;
        }

        this.removeAllCellRanges(true);
        this.addCellRange(params);
    }

    public setCellRanges(cellRanges: CellRange[]): void {
        if (_areEqual(this.cellRanges, cellRanges)) {
            return;
        }

        if (!this.verifyCellRanges(this.gos)) {
            return;
        }

        this.removeAllCellRanges(true);

        for (const cellRange of cellRanges) {
            if (cellRange.columns && cellRange.startRow) {
                const columns = this.getColumnsFromModel(cellRange.columns as AgColumn[]);
                if (!columns || columns.length === 0) {
                    continue;
                }

                cellRange.columns = columns;

                const { startRow } = cellRange;

                this.setNewestRangeStartCell({
                    rowIndex: startRow.rowIndex,
                    rowPinned: startRow.rowPinned,
                    column: cellRange.columns[0],
                });
            }

            this.cellRanges.push(cellRange);
        }

        this.dispatchChangedEvent(false, true);
    }

    public clearCellRangeCellValues(params: ClearCellRangeParams): void {
        const { beans, valueSvc, eventSvc } = this;
        const { cellEventSource = 'rangeSvc', dispatchWrapperEvents, wrapperEventSource = 'deleteKey' } = params;

        let { cellRanges } = params;

        if (dispatchWrapperEvents) {
            eventSvc.dispatchEvent({
                type: 'cellSelectionDeleteStart',
                source: wrapperEventSource,
            });
            eventSvc.dispatchEvent({
                type: 'rangeDeleteStart',
                source: wrapperEventSource,
            });
        }

        if (!cellRanges) {
            cellRanges = this.cellRanges;
        }

        for (const cellRange of cellRanges) {
            this.forEachRowInRange(cellRange, (rowPosition) => {
                const rowNode = _getRowNode(beans, rowPosition);
                if (!rowNode) {
                    return;
                }
                for (let i = 0; i < cellRange.columns.length; i++) {
                    const column = this.getColumnFromModel(cellRange.columns[i] as AgColumn);
                    if (!column?.isCellEditable(rowNode)) {
                        continue;
                    }
                    const emptyValue = valueSvc.getDeleteValue(column, rowNode);
                    rowNode.setDataValue(column, emptyValue, cellEventSource);
                }
            });
        }

        if (dispatchWrapperEvents) {
            eventSvc.dispatchEvent({
                type: 'cellSelectionDeleteEnd',
                source: wrapperEventSource,
            });
            eventSvc.dispatchEvent({
                type: 'rangeDeleteEnd',
                source: wrapperEventSource,
            });
        }
    }

    public createCellRangeFromCellRangeParams(params: CellRangeParams): CellRange | undefined {
        return this.createPartialCellRangeFromRangeParams(params, false) as CellRange | undefined;
    }

    // Range service can't normally support a range without columns, but charts can
    public createPartialCellRangeFromRangeParams(
        params: CellRangeParams,
        allowEmptyColumns: boolean
    ): PartialCellRange | undefined {
        const {
            columns: paramColumns,
            columnStart,
            columnEnd,
            rowStartIndex,
            rowStartPinned,
            rowEndIndex,
            rowEndPinned,
        } = params;
        const columnInfo = this.getColumnsFromParams(
            paramColumns as (string | AgColumn)[],
            columnStart as string | AgColumn,
            columnEnd as string | AgColumn
        );

        if (!columnInfo || (!allowEmptyColumns && columnInfo.columns.length === 0)) {
            return;
        }

        const { columns, startsOnTheRight } = columnInfo;

        const startRow = createRowPosition(rowStartIndex, rowStartPinned);
        const endRow = createRowPosition(rowEndIndex, rowEndPinned);

        return {
            startRow,
            endRow,
            columns,
            startColumn:
                this.getColumnFromModel(columnStart as AgColumn) ?? (startsOnTheRight ? _last(columns) : columns[0]),
        };
    }

    public addCellRange(params: CellRangeParams): CellRange | undefined {
        const gos = this.gos;
        if (!_isCellSelectionEnabled(gos) || !this.verifyCellRanges(gos)) {
            return;
        }

        // when creating a new range via API we should reset the selection mode
        this.setSelectionMode(false);
        const newRange = this.createCellRangeFromCellRangeParams(params);

        if (newRange) {
            if (newRange.startRow) {
                this.setNewestRangeStartCell({
                    rowIndex: newRange.startRow.rowIndex,
                    rowPinned: newRange.startRow.rowPinned,
                    column: newRange.startColumn,
                });
            }

            this.cellRanges.push(newRange);
            this.dispatchChangedEvent(false, true, newRange.id);
            return newRange;
        }
    }

    public getCellRanges(): CellRange[] {
        return this.cellRanges;
    }

    public isEmpty(): boolean {
        return this.cellRanges.length === 0;
    }

    public isMoreThanOneCell(): boolean {
        const len = this.cellRanges.length;

        if (len === 0) {
            return false;
        }
        if (len > 1) {
            return true; // Assumes a cell range must contain at least one cell
        }

        // only one range, return true if range has more than one
        const range = this.cellRanges[0];
        const startRow = this.getRangeStartRow(range);
        const endRow = this.getRangeEndRow(range);

        return (
            startRow.rowPinned !== endRow.rowPinned ||
            startRow.rowIndex !== endRow.rowIndex ||
            range.columns.length !== 1
        );
    }

    public areAllRangesAbleToMerge(): boolean {
        const rowToColumnMap = new Map<string, string[]>();
        const len = this.cellRanges.length;

        if (len <= 1) {
            return true;
        }

        for (const range of this.cellRanges) {
            this.forEachRowInRange(range, (row) => {
                const rowName = `${row.rowPinned || 'normal'}_${row.rowIndex}`;
                const columns = rowToColumnMap.get(rowName);
                const currentRangeColIds = range.columns.map((col) => col.getId());
                if (columns) {
                    const filteredColumns = currentRangeColIds.filter((col) => columns.indexOf(col) === -1);
                    columns.push(...filteredColumns);
                } else {
                    rowToColumnMap.set(rowName, currentRangeColIds);
                }
            });
        }

        let columnsString: string | undefined;

        for (const val of rowToColumnMap.values()) {
            const currentValString = val.sort().join();
            if (columnsString === undefined) {
                columnsString = currentValString;
                continue;
            }
            if (columnsString !== currentValString) {
                return false;
            }
        }

        return true;
    }

    public removeAllCellRanges(silent?: boolean): void {
        if (this.isEmpty()) {
            return;
        }

        this.onDragStop();
        this.cellRanges.length = 0;

        if (!silent) {
            this.dispatchChangedEvent(false, true);
        }
    }

    public isCellInAnyRange(cell: CellPosition): boolean {
        return this.getCellRangeCount(cell) > 0;
    }

    public isCellInSpecificRange(cell: CellPosition, range: CellRange): boolean {
        const columnInRange = range.columns?.includes(cell.column);
        const rowInRange = this.isRowInRange(cell, range);

        return columnInRange && rowInRange;
    }

    public isColumnInAnyRange(column: AgColumn | AgColumnGroup): boolean {
        const { beans, cellRanges } = this;
        const firstRow = _getFirstRow(beans);
        const lastRow = _getLastRow(beans);
        if (!firstRow || !lastRow) {
            return false;
        }

        const columns = column.isColumn ? [column] : column.getDisplayedLeafColumns();

        return findRangeContainingCols(cellRanges, columns, firstRow, lastRow) != null;
    }

    public isBottomRightCell(cellRange: CellRange, cell: CellPosition): boolean {
        const allColumns = this.visibleCols.allCols;
        const allPositions = cellRange.columns.map((c: AgColumn) => allColumns.indexOf(c)).sort((a, b) => a - b);
        const { startRow, endRow } = cellRange;
        const lastRow = _isRowBefore(startRow!, endRow!) ? endRow : startRow;

        const isRightColumn = allColumns.indexOf(cell.column as AgColumn) === _last(allPositions);
        const isLastRow =
            cell.rowIndex === lastRow!.rowIndex && _makeNull(cell.rowPinned) === _makeNull(lastRow!.rowPinned);

        return isRightColumn && isLastRow;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: CellPosition): number {
        return this.cellRanges.filter((cellRange) => this.isCellInSpecificRange(cell, cellRange)).length;
    }

    public isRowInRange(thisRow: RowPosition, cellRange: CellRange): boolean {
        const firstRow = this.getRangeStartRow(cellRange);
        const lastRow = this.getRangeEndRow(cellRange);

        // compare rowPinned with == instead of === because it can be `null` or `undefined`
        const equalsFirstRow = thisRow.rowIndex === firstRow.rowIndex && thisRow.rowPinned == firstRow.rowPinned;
        const equalsLastRow = thisRow.rowIndex === lastRow.rowIndex && thisRow.rowPinned == lastRow.rowPinned;

        if (equalsFirstRow || equalsLastRow) {
            return true;
        }

        const afterFirstRow = !_isRowBefore(thisRow, firstRow);
        const beforeLastRow = _isRowBefore(thisRow, lastRow);

        return afterFirstRow && beforeLastRow;
    }

    public intersectLastRange(fromMouseClick?: boolean) {
        // when ranges are created due to a mouse click without drag (happens in cellMouseListener)
        // this method will be called with `fromMouseClick=true`.
        if (fromMouseClick && this.dragging) {
            return;
        }
        if (_getSuppressMultiRanges(this.gos)) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        const lastRange = _last(this.cellRanges);
        const intersectionStartRow = this.getRangeStartRow(lastRange);
        const intersectionEndRow = this.getRangeEndRow(lastRange);

        const newRanges: CellRange[] = [];

        for (const range of this.cellRanges.slice(0, -1)) {
            const startRow = this.getRangeStartRow(range);
            const endRow = this.getRangeEndRow(range);
            const cols = range.columns;
            const intersectCols = cols.filter((col) => lastRange.columns.indexOf(col) === -1);
            if (intersectCols.length === cols.length) {
                // No overlapping columns, retain previous range
                newRanges.push(range);
                continue;
            }
            if (_isRowBefore(intersectionEndRow, startRow) || _isRowBefore(endRow, intersectionStartRow)) {
                // No overlapping rows, retain previous range
                newRanges.push(range);
                continue;
            }
            const rangeCountBefore = newRanges.length;
            // Top
            if (_isRowBefore(startRow, intersectionStartRow)) {
                const top: CellRange = {
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: { ...startRow },
                    endRow: _getRowAbove(this.beans, intersectionStartRow)!,
                };
                newRanges.push(top);
            }
            // Left & Right (not contiguous with columns)
            if (intersectCols.length > 0) {
                const middle: CellRange = {
                    columns: intersectCols,
                    startColumn: intersectCols.includes(lastRange.startColumn)
                        ? lastRange.startColumn
                        : intersectCols[0],
                    startRow: rowMax([{ ...intersectionStartRow }, { ...startRow }]),
                    endRow: rowMin([{ ...intersectionEndRow }, { ...endRow }]),
                };
                newRanges.push(middle);
            }
            // Bottom
            if (_isRowBefore(intersectionEndRow, endRow)) {
                newRanges.push({
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: _getRowBelow(this.beans, intersectionEndRow)!,
                    endRow: { ...endRow },
                });
            }
            if (newRanges.length - rangeCountBefore === 1) {
                // Only one range result from the intersection.
                // Copy the source range's id, since essentially we just reduced it's size
                newRanges[newRanges.length - 1].id = range.id;
            }
        }
        this.cellRanges = newRanges;

        // when this is called because of a clickEvent and the ranges were changed
        // we need to force a dragEnd event to update the UI.
        if (fromMouseClick) {
            this.dispatchChangedEvent(false, true);
        }
    }

    public createRangeHighlightFeature(
        compBean: BeanStub,
        column: AgColumn<any> | AgColumnGroup,
        headerComp: IHeaderCellComp
    ): void {
        compBean.createManagedBean(new RangeHeaderHighlightFeature(column, headerComp));
    }

    private setSelectionMode(allColumns: boolean) {
        this.selectionMode = allColumns ? SelectionMode.ALL_COLUMNS : SelectionMode.NORMAL;
    }

    private refreshRangeStart(cellRange: CellRange) {
        const { startColumn, columns } = cellRange;

        const moveColInCellRange = (colToMove: AgColumn, moveToFront: boolean) => {
            const otherCols = cellRange.columns.filter((col) => col !== colToMove);

            if (colToMove) {
                cellRange.startColumn = colToMove;
                cellRange.columns = moveToFront ? [colToMove, ...otherCols] : [...otherCols, colToMove];
            } else {
                cellRange.columns = otherCols;
            }
        };

        const { left, right } = this.getRangeEdgeColumns(cellRange);
        const shouldMoveLeftCol = startColumn === columns[0] && startColumn !== left;

        if (shouldMoveLeftCol) {
            moveColInCellRange(left, true);
            return;
        }

        const shouldMoveRightCol = startColumn === _last(columns) && startColumn === right;

        if (shouldMoveRightCol) {
            moveColInCellRange(right, false);
        }
    }

    private setNewestRangeStartCell(position: CellPosition) {
        this.newestRangeStartCell = position;
    }

    private getColumnsFromParams(
        columns?: (string | AgColumn)[],
        columnA?: string | AgColumn,
        columnB?: string | AgColumn
    ): { columns: AgColumn[]; startsOnTheRight: boolean } | undefined {
        const noColsInfo = !columns && !columnA && !columnB;
        let processedColumns: AgColumn[] | undefined;
        let startsOnTheRight = false;

        if (noColsInfo || columns) {
            processedColumns = this.getColumnsFromModel(noColsInfo ? undefined : columns);
        } else if (columnA && columnB) {
            processedColumns = this.calculateColumnsBetween(columnA, columnB);

            if (processedColumns?.length) {
                startsOnTheRight = processedColumns[0] !== this.getColumnFromModel(columnA);
            }
        }

        return processedColumns
            ? {
                  columns: processedColumns,
                  startsOnTheRight,
              }
            : undefined;
    }

    private verifyCellRanges(gos: GridOptionsService): boolean {
        const invalid = _isUsingNewCellSelectionAPI(gos) && _getSuppressMultiRanges(gos) && this.cellRanges.length > 1;
        if (invalid) {
            _warn(93);
        }

        return !invalid;
    }

    public forEachRowInRange(cellRange: CellRange, callback: (row: RowPosition) => void) {
        const topRow = this.getRangeStartRow(cellRange);
        const bottomRow = this.getRangeEndRow(cellRange);
        let currentRow: RowPosition | null = topRow;

        while (currentRow) {
            callback(currentRow);

            if (_isSameRow(currentRow, bottomRow)) {
                break;
            }
            currentRow = _getRowBelow(this.beans, currentRow);
        }
    }

    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selecting more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection my mimicking a new mouse event
    private onBodyScroll(): void {
        if (this.dragging && this.lastMouseEvent) {
            this.onDragging(this.lastMouseEvent);
        }
    }

    private updateValuesOnMove(eventTarget: EventTarget | null) {
        const cellCtrl = _getCellCtrlForEventTarget(this.gos, eventTarget);
        const cell = cellCtrl?.cellPosition;

        this.cellHasChanged = false;

        if (!cell || (this.lastCellHovered && _areCellsEqual(cell, this.lastCellHovered))) {
            return;
        }

        const editing = this.beans.editSvc?.isEditing(cellCtrl, {
            withOpenEditor: true,
        });

        if (editing) {
            this.dragSvc.cancelDrag(eventTarget as HTMLElement);
            return;
        }

        if (this.lastCellHovered) {
            this.cellHasChanged = true;
        }

        this.lastCellHovered = cell;
    }

    private dispatchChangedEvent(started: boolean, finished: boolean, id?: string): void {
        this.eventSvc.dispatchEvent({
            type: 'cellSelectionChanged',
            started,
            finished,
            id,
        });
        this.eventSvc.dispatchEvent({
            type: 'rangeSelectionChanged',
            started,
            finished,
            id,
        });
    }

    private getColumnFromModel(col: string | AgColumn): AgColumn | null {
        return typeof col === 'string' ? this.colModel.getCol(col) : col;
    }

    private getColumnsFromModel(cols?: (string | AgColumn)[]): AgColumn[] | undefined {
        const { visibleCols, beans, selectionMode } = this;
        const isRowHeaderActive = _isRowNumbers(beans);

        if (!cols || selectionMode === SelectionMode.ALL_COLUMNS) {
            cols = visibleCols.allCols;
        }

        const columns: AgColumn[] = [];

        for (const col of cols) {
            const column = this.getColumnFromModel(col);
            if (!column || (isRowHeaderActive && shouldSkipCurrentColumn(column))) {
                continue;
            }
            columns.push(column);
        }

        return columns.length ? columns : undefined;
    }

    private calculateColumnsBetween(columnA: string | AgColumn, columnB: string | AgColumn): AgColumn[] | undefined {
        const allColumns = this.visibleCols.allCols;

        const fromColumn = this.getColumnFromModel(columnA)!;
        const toColumn = this.getColumnFromModel(columnB)!;

        const isSameColumn = fromColumn === toColumn;
        const fromIndex = allColumns.indexOf(fromColumn);

        if (fromIndex < 0) {
            _warn(178, { colId: fromColumn.getId() });
            return;
        }

        const toIndex = isSameColumn ? fromIndex : allColumns.indexOf(toColumn);

        if (toIndex < 0) {
            _warn(178, { colId: toColumn.getId() });
            return;
        }

        if (isSameColumn || this.selectionMode === SelectionMode.ALL_COLUMNS) {
            return this.getColumnsFromModel([fromColumn]);
        }

        const firstIndex = Math.min(fromIndex, toIndex);
        const lastIndex = firstIndex === fromIndex ? toIndex : fromIndex;
        const columns: AgColumn[] = [];

        for (let i = firstIndex; i <= lastIndex; i++) {
            columns.push(allColumns[i]);
        }

        return this.getColumnsFromModel(columns);
    }

    private focusCellOnNewColumn(currentRange: CellRange, column: AgColumn): void {
        const { focusSvc } = this.beans;
        const focusedCell = focusSvc.getFocusedCell();

        if (!focusedCell) {
            return;
        }

        if (this.isCellInSpecificRange(focusedCell, currentRange)) {
            focusSvc.setFocusedCell({
                ...focusedCell,
                column,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: true,
            });
        }
    }

    private focusCellOnNewRow(currentRange: CellRange, row: RowPosition): void {
        const { focusSvc } = this.beans;
        const focusedCell = focusSvc.getFocusedCell();

        if (!focusedCell) {
            return;
        }

        if (this.isCellInSpecificRange(focusedCell, currentRange)) {
            focusSvc.setFocusedCell({
                ...row,
                column: focusedCell.column,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: true,
            });
        }
    }

    public createDragListenerFeature(eContainer: HTMLElement): BeanStub {
        return new DragListenerFeature(eContainer);
    }

    public createCellRangeFeature(ctrl: CellCtrl): ICellRangeFeature {
        return new CellRangeFeature(this.beans, ctrl);
    }

    public createHeaderGroupCellMouseListenerFeature(column: AgColumnGroup, eGui: HTMLElement): BeanStub {
        return new HeaderGroupCellMouseListenerFeature(column, eGui);
    }

    /**
     * Handle a user clicking column header to (de)select one or more column of cells
     * CTRL-clicking for toggling column selection + CTRL-SHIFT-clicking supported for selecting ranges of columns
     */
    public handleColumnSelection(clickedColumn: AgColumn | AgColumnGroup, event: MouseEvent | KeyboardEvent): void {
        const { gos, beans, columnRangeSelectionCtx: ctx, cellRanges } = this;
        const suppressColumnSelection = _getSuppressColumnSelection(gos);
        if (suppressColumnSelection) {
            return;
        }

        const suppressMultiRanges = _getSuppressMultiRanges(gos);
        const hasRanges = cellRanges.length > 0;

        const firstRow = _getFirstRow(beans);
        const lastRow = _getLastRow(beans);
        if (!firstRow || !lastRow) {
            // No rows yet
            return;
        }

        if (event.shiftKey) {
            // doing range selection
            const root = ctx.root;
            if (!root) {
                return;
            }

            const column = clickedColumn.isColumn ? clickedColumn : _last(clickedColumn.getLeafColumns());

            const range = findRangeContainingCols(cellRanges, [root], firstRow, lastRow);
            if (!range) {
                // when no existing range exists, clear the last cell range
                // and start from the root
                _removeFromArray(cellRanges, ctx.lastCellRange);
                this.selectColumns(this.calculateColumnsBetween(root, column)!, firstRow, lastRow);
                return;
            }

            this.updateRangeRowBoundary({ cellRange: range, boundary: 'end', cellPosition: { column, ...lastRow } });
        } else if (clickedColumn.isColumn) {
            if (hasRanges && suppressMultiRanges) {
                this.removeAllCellRanges();
            }
            const foundRange = findRangeContainingCols(cellRanges, [clickedColumn], firstRow, lastRow);

            const lastCellRange = foundRange
                ? this.deselectColumn(clickedColumn, firstRow, lastRow)
                : this.selectColumns([clickedColumn], firstRow, lastRow);

            if (lastCellRange) {
                ctx.lastCellRange = lastCellRange;
            }
            ctx.root = clickedColumn;
        } else {
            if (hasRanges && suppressMultiRanges) {
                this.removeAllCellRanges();
            }
            // clicked a column group so we want to select all leaf columns of the group
            const leafCols = clickedColumn.getDisplayedLeafColumns();
            const foundRange = findRangeContainingCols(cellRanges, leafCols, firstRow, lastRow);

            if (foundRange) {
                _removeFromArray(cellRanges, foundRange);
                ctx.root = leafCols[0];
                this.dispatchChangedEvent(true, true);
            } else {
                const addedRange = this.selectColumns(leafCols, firstRow, lastRow);
                ctx.root = leafCols[0];
                if (addedRange) {
                    ctx.lastCellRange = addedRange;
                }
            }
        }
    }

    private deselectColumn(column: AgColumn, startRow: RowPosition, endRow: RowPosition): undefined {
        for (const range of this.cellRanges) {
            if (_isSameRow(startRow, range.startRow) && _isSameRow(endRow, range.endRow)) {
                _removeFromArray(range.columns, column);
                if (range.startColumn === column) {
                    range.startColumn = range.columns[0];
                }
            }
        }

        // clean up empty ranges
        this.cellRanges = this.cellRanges.filter((r) => r.columns.length !== 0);

        this.dispatchChangedEvent(true, true);
    }

    private selectColumns(columns: AgColumn[], startRow: RowPosition, endRow: RowPosition): CellRange | undefined {
        return this.addCellRange({
            columns: columns,
            columnStart: columns[0],
            columnEnd: _last(columns),
            rowStartIndex: startRow.rowIndex,
            rowStartPinned: startRow.rowPinned,
            rowEndIndex: endRow.rowIndex,
            rowEndPinned: endRow.rowPinned,
        });
    }
}

function createRowPosition(rowIndex: number | null, rowPinned?: RowPinnedType): RowPosition | undefined {
    return rowIndex != null ? { rowIndex, rowPinned } : undefined;
}

function rowMax(rows: RowPosition[]): RowPosition | undefined {
    let max: RowPosition | undefined;
    for (const row of rows) {
        if (max === undefined || _isRowBefore(max, row)) {
            max = row;
        }
    }
    return max;
}

function rowMin(rows: RowPosition[]): RowPosition | undefined {
    let min: RowPosition | undefined;
    for (const row of rows) {
        if (min === undefined || _isRowBefore(row, min)) {
            min = row;
        }
    }
    return min;
}

function shouldSkipCurrentColumn(currentColumn: AgColumn): boolean {
    return isRowNumberCol(currentColumn);
}

function isLastCellOfRange(cellRange: CellRange, cell: CellPosition): boolean {
    const { startRow, endRow } = cellRange;
    const lastRow = _isRowBefore(startRow!, endRow!) ? endRow : startRow;
    const isLastRow = cell.rowIndex === lastRow!.rowIndex && cell.rowPinned === lastRow!.rowPinned;
    const rangeFirstIndexColumn = cellRange.columns[0];
    const rangeLastIndexColumn = _last(cellRange.columns);
    const lastRangeColumn =
        cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
    const isLastColumn = cell.column === lastRangeColumn;

    return isLastColumn && isLastRow;
}

function findRangeContainingCols(
    ranges: readonly CellRange[],
    cols: AgColumn[],
    startRow: RowPosition,
    endRow: RowPosition
): CellRange | undefined {
    // iterating backwards since we're likely interested in the most recently added range
    for (let i = ranges.length - 1; i >= 0; i--) {
        const range = ranges[i];
        const hasCols = cols.every((c) => range.columns.includes(c));
        const sameRows = _isSameRow(range.startRow, startRow) && _isSameRow(range.endRow, endRow);

        if (hasCols && sameRows) {
            return range;
        }
    }
}
