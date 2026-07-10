import {
    AutoScrollService,
    _areEqual,
    _exists,
    _last,
    _makeNull,
    _missing,
    _removeAllFromArray,
    _removeFromArray,
} from 'ag-stack';

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
    IRowNode,
    NamedBean,
    PartialCellRange,
    RowPinnedType,
    RowPosition,
    VisibleColsService,
} from 'ag-grid-community';
import {
    BeanStub,
    KeyCode,
    _areCellsEqual,
    _getAbsoluteRowIndex,
    _getCellCtrlForEventTarget,
    _getEnableColumnSelection,
    _getFirstRow,
    _getLastRow,
    _getRowAbove,
    _getRowBelow,
    _getRowCtrlForEventTarget,
    _getRowNode,
    _getSuppressMultiRanges,
    _interpretAsRightClick,
    _isCellSelectionEnabled,
    _isDomLayout,
    _isRowBefore,
    _isSameRow,
    _isUsingNewCellSelectionAPI,
} from 'ag-grid-community';

import { CellRangeFeature } from './cellRangeFeature';
import { DragListenerFeature } from './dragListenerFeature';
import { HeaderGroupCellMouseListenerFeature } from './headerGroupCellMouseListenerFeature';
import { RangeHeaderHighlightFeature } from './rangeHeaderHighlightFeature';
import type { RangeSelectionExtension, RangeSelectionExtensionRegistry } from './rangeSelectionExtensions';

enum SelectionMode {
    NORMAL,
    ALL_COLUMNS,
}

interface ColumnRangeSelectionContext {
    lastCellRange?: CellRange;
    root?: AgColumn;
}

export class RangeService extends BeanStub implements NamedBean, IRangeService, RangeSelectionExtensionRegistry {
    beanName = 'rangeSvc' as const;

    private rowModel: IRowModel;
    private dragSvc: DragService;
    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;
    private cellNavigation: CellNavigationService;
    private ctrlsSvc: CtrlsService;
    private selectionMode: SelectionMode;
    private readonly rangeSelectionExtensions: RangeSelectionExtension[] = [];

    public wireBeans(beans: BeanCollection) {
        this.rowModel = beans.rowModel;
        this.dragSvc = beans.dragSvc!;
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
        this.cellNavigation = beans.cellNavigation!;
        this.ctrlsSvc = beans.ctrlsSvc;
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
                scrollContainer: gridBodyCtrl.eGridViewport,
                scrollAxis: 'xy',
                getVerticalPosition: () => gridBodyCtrl.scrollFeature.getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCtrl.scrollFeature.setVerticalScrollPosition(position),
                getHorizontalPosition: () => gridBodyCtrl.scrollFeature.getHScrollPosition().left,
                setHorizontalPosition: (position) => gridBodyCtrl.scrollFeature.setHorizontalScrollPosition(position),
                shouldSkipVerticalScroll: () => !_isDomLayout(this.gos, 'normal'),
                shouldSkipHorizontalScroll: () => !gridBodyCtrl.scrollFeature.isHorizontalScrollShowing(),
                getTopOffset: () => gridBodyCtrl.getTopPinnedRowsOffset(),
                getBottomOffset: () => gridBodyCtrl.getBottomPinnedRowsOffset(),
            });
        });
    }

    public registerRangeSelectionExtension(extension: RangeSelectionExtension): void {
        if (this.rangeSelectionExtensions.includes(extension)) {
            return;
        }
        this.rangeSelectionExtensions.push(extension);
    }

    public unregisterRangeSelectionExtension(extension: RangeSelectionExtension): void {
        _removeFromArray(this.rangeSelectionExtensions, extension);
    }

    private shouldSuppressRangeSelection(eventTarget: EventTarget | null): boolean {
        return this.rangeSelectionExtensions.some((extension) => extension.shouldSuppressRangeSelection?.(eventTarget));
    }

    private shouldSkipColumn(column: AgColumn): boolean {
        return this.rangeSelectionExtensions.some((extension) => extension.shouldSkipColumn?.(column));
    }

    private isAllColumnsSelectionCell(cellPosition: CellPosition): boolean {
        return this.rangeSelectionExtensions.some((extension) => extension.isAllColumnsSelectionCell?.(cellPosition));
    }

    private isAllColumnsRange(range: CellRange, allColumns: AgColumn[]): boolean {
        return this.rangeSelectionExtensions.some((extension) => extension.isAllColumnsRange?.(range, allColumns));
    }

    private updateSelectionModeForCell(cellPosition: CellPosition): void {
        this.setSelectionMode(this.isAllColumnsSelectionCell(cellPosition));
    }

    // Drag And Drop Target Methods
    public onDragStart(mouseEvent: MouseEvent): void {
        const gos = this.gos;
        const target = mouseEvent.target as HTMLElement | null;
        if (!_isCellSelectionEnabled(gos) || _getRowCtrlForEventTarget(gos, target)?.isSuppressMouseEvent(mouseEvent)) {
            return;
        }
        if (this.shouldSuppressRangeSelection(target)) {
            return;
        }

        const { shiftKey } = mouseEvent;
        const isMultiRange = this.isMultiRange(mouseEvent);

        const extendRange = shiftKey && !!this.cellRanges?.length;

        if (!isMultiRange && (!extendRange || _exists(_last(this.cellRanges).type))) {
            this.removeAllCellRanges(true);
        }

        // the browser changes the event target of cached events when working with the Shadow DOM
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
        this.intersectionRange = isMultiRange && this.getCellRangeCount(this.lastCellHovered) > 1;

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
            .eGridViewport.addEventListener('scroll', this.bodyScrollListener, { passive: true });

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
            lastCellHovered?.rowPinned === position && newestRangeStartCell!.rowPinned === position;

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

        this.ctrlsSvc.getGridBodyCtrl().eGridViewport.removeEventListener('scroll', this.bodyScrollListener);
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

    // Called for both columns loaded and column visibility events
    public onColumnsChanged(): void {
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();

        // check that the columns in each range still exist and are visible
        for (const cellRange of this.cellRanges) {
            const beforeCols = cellRange.columns;

            // remove hidden or removed cols from cell range (`displayed` ⇔ in allCols)
            cellRange.columns = cellRange.columns.filter((col: AgColumn) => col.isVisible() && col.displayed);

            const colsInRangeChanged = !_areEqual(beforeCols, cellRange.columns);

            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                this.dispatchChangedEvent(false, true, cellRange.id);
            }
        }
        // remove empty cell ranges
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
        const len = rangeColumns.length;

        if (!len) {
            return false;
        }

        // Contiguous ⇔ displayed positions span exactly `len` slots with no gaps. Single min/max
        // pass — no sort, no intermediate array (was O(n log n) + alloc).
        let min = rangeColumns[0].allColsIndex;
        let max = min;
        for (let i = 1; i < len; ++i) {
            const idx = rangeColumns[i].allColsIndex;
            if (idx < min) {
                min = idx;
            } else if (idx > max) {
                max = idx;
            }
        }

        return max - min + 1 === len;
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

    public handleCellMouseDown(event: MouseEvent, cell: CellPosition): void {
        const isMultiKey = event.ctrlKey || event.metaKey;
        this.handleCellSelectionInput(cell, {
            target: event.target as HTMLElement | null,
            shiftKey: event.shiftKey,
            isRightClick: _interpretAsRightClick(this.beans, event),
            isMultiRange: this.isMultiRange(event),
            isMultiKey,
            preventDefault: () => event.preventDefault(),
        });
    }

    public handleCellKeyboardSelect(event: KeyboardEvent, cell: CellPosition): void {
        const isMultiKey = event.ctrlKey || event.metaKey;
        this.handleCellSelectionInput(cell, {
            target: event.target as HTMLElement | null,
            shiftKey: event.shiftKey,
            // keyboard selection should never be interpreted as a right click.
            isRightClick: false,
            isMultiRange: this.isMultiRangeForKeyState(isMultiKey),
            isMultiKey,
            preventDefault: () => event.preventDefault(),
        });
    }

    private handleCellSelectionInput(
        cell: CellPosition,
        params: {
            target: HTMLElement | null;
            shiftKey: boolean;
            isRightClick: boolean;
            isMultiRange: boolean;
            isMultiKey: boolean;
            preventDefault: () => void;
        }
    ): void {
        const { target, shiftKey, isRightClick, isMultiRange, isMultiKey, preventDefault } = params;

        if (this.shouldSuppressRangeSelection(target)) {
            return;
        }

        const isAllColumnsCell = this.isAllColumnsSelectionCell(cell);
        if (isAllColumnsCell) {
            preventDefault();
        }

        if (shiftKey) {
            return this.extendLatestRangeToCell(cell);
        }

        if (isAllColumnsCell && isRightClick) {
            return;
        }

        this.updateSelectionModeForCell(cell);
        const columns = this.calculateColumnsBetween(cell.column as AgColumn, cell.column as AgColumn);
        if (!columns) {
            return;
        }

        const containingRange = isAllColumnsCell
            ? this.findContainingRange({
                  columns,
                  startRow: cell,
                  endRow: cell,
              })
            : undefined;
        const isMultiRangeRemoval = isAllColumnsCell && !!containingRange && isMultiRange && isMultiKey;

        if (isMultiRangeRemoval && containingRange) {
            this.removeRowFromAllColumnsRange(cell, containingRange);
        } else {
            this.setRangeToCell(cell, isMultiRange);
        }
    }

    private isMultiRange(event: MouseEvent): boolean {
        // ctrlKey for Windows, metaKey for Apple
        return this.isMultiRangeForKeyState(event.ctrlKey || event.metaKey);
    }

    private isMultiRangeForKeyState(isMultiKey: boolean): boolean {
        const { editingWithRanges, allowMulti } = this.getMultiRangeContext();
        return editingWithRanges || (allowMulti ? isMultiKey : false);
    }

    private getMultiRangeContext(): {
        editingWithRanges: boolean;
        suppressMultiRanges: boolean;
        allowMulti: boolean;
    } {
        const { gos, editSvc } = this.beans;
        const editingWithRanges = !!editSvc?.isEditing() && !!editSvc?.isRangeSelectionEnabledWhileEditing();
        const suppressMultiRanges = _getSuppressMultiRanges(gos) && !editingWithRanges;

        return {
            editingWithRanges,
            suppressMultiRanges,
            allowMulti: !suppressMultiRanges,
        };
    }

    private removeRowFromAllColumnsRange(cell: CellPosition, containingRange: CellRange): void {
        const { beans, cellRanges } = this;
        const firstRow = _getFirstRow(beans);
        const lastRow = _getLastRow(beans);
        const startRow = this.getRangeStartRow(containingRange);
        const endRow = this.getRangeEndRow(containingRange);

        if (!startRow && _isSameRow(firstRow!, cell)) {
            // we've clicked the first row, so the top edge of the range should be moved down
            replaceEdgeRow(containingRange, _getRowBelow(beans, firstRow!), 'top');
        } else if (!endRow && _isSameRow(lastRow!, cell)) {
            // we've clicked the last row, so the bottom edge of the range should be moved up
            replaceEdgeRow(containingRange, _getRowAbove(beans, lastRow!), 'bottom');
        } else if (_isSameRow(startRow, endRow)) {
            // there's only one row in the range, so we remove the range entirely
            _removeFromArray(cellRanges, containingRange);
        } else if (_isSameRow(startRow, cell)) {
            // we've clicked the top row of the range, so the top edge of the range should be moved down
            replaceEdgeRow(containingRange, _getRowBelow(beans, cell), 'top');
        } else if (_isSameRow(endRow, cell)) {
            // we've clicked the bottom row of the range, so the bottom edge of the range should be moved up
            replaceEdgeRow(containingRange, _getRowAbove(beans, cell), 'bottom');
        } else {
            const rowAbove = _getRowAbove(beans, cell);
            const rowBelow = _getRowBelow(beans, cell);

            // have to set both because start row could come after end row
            containingRange.startRow = startRow;
            containingRange.endRow = rowAbove ?? undefined;

            cellRanges.push({
                ...containingRange,
                startRow: rowBelow ?? undefined,
                endRow,
            });
        }

        this.dispatchChangedEvent(true, true);
    }

    public setRangeToCell(cell: CellPosition, appendRange = false): void {
        const { gos } = this;
        if (!_isCellSelectionEnabled(gos)) {
            return;
        }

        this.updateSelectionModeForCell(cell);

        const columns = this.calculateColumnsBetween(cell.column as AgColumn, cell.column as AgColumn);

        if (!columns) {
            return;
        }

        const { suppressMultiRanges } = this.getMultiRangeContext();

        // if not appending, then clear previous range selections
        if (suppressMultiRanges || !appendRange || _missing(this.cellRanges)) {
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

        const startColumn = this.ensureRangeStartColumn(cellRange);
        if (!startColumn) {
            return;
        }

        this.cellRanges.push(cellRange);

        this.setNewestRangeStartCell({ ...cell, column: startColumn });
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
            return; // could not move the desired number of rows
        }

        const cellPosition = {
            ...currentRow,
            column: this.getRangeLastColumn(cellRange),
        };

        this.updateRangeRowBoundary({ cellRange, boundary: isBottomUp ? 'start' : 'end', cellPosition });
    }

    public extendRangeColumnCountBy(cellRange: CellRange, delta: number): void {
        const { columns } = cellRange;

        if (delta === 0) {
            return;
        }

        const allColumns = this.getColumnsFromModel(); // ordered visible columns

        if (!allColumns) {
            return;
        }

        const rangeStartColumn = this.ensureRangeStartColumn(cellRange);
        if (!rangeStartColumn) {
            return;
        }

        const lastColumn = _last(columns);
        const endColumn = rangeStartColumn === columns[0] ? lastColumn : columns[0];

        if (!lastColumn || !endColumn) {
            return;
        }

        let startIdx = allColumns.indexOf(rangeStartColumn);
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

        // only update if length actually changed
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

        this.updateSelectionModeForCell(cellPosition);
        this.updateRangeRowBoundary({ cellRange, boundary: 'end', cellPosition });
    }

    public extendRangeToCell(cellRange: CellRange, cellPosition: CellPosition): void {
        if (!cellRange) {
            return;
        }

        this.updateSelectionModeForCell(cellPosition);
        this.updateRangeRowBoundary({ cellRange, boundary: 'end', cellPosition });
    }

    public updateRangeRowBoundary(params: CellRangeBoundaryParams): void {
        const { cellRange, boundary, cellPosition, silent = false } = params;
        const endColumn = cellPosition.column as AgColumn;
        const startColumn = this.ensureRangeStartColumn(cellRange);
        if (!startColumn) {
            return;
        }

        const colsToAdd = this.calculateColumnsBetween(startColumn, endColumn);

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
        const cols = cellRange.columns;
        let minIdx = -1;
        let maxIdx = -1;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const idx = (cols[i] as AgColumn).allColsIndex;
            if (idx > -1) {
                if (minIdx === -1 || idx < minIdx) {
                    minIdx = idx;
                }
                if (idx > maxIdx) {
                    maxIdx = idx;
                }
            }
        }

        return {
            left: allColumns[minIdx],
            right: allColumns[maxIdx],
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

        // do not extend range into row number columns
        if (this.shouldSkipColumn(newEndCell.column as AgColumn)) {
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

        // normalise the selection mode so explicit column lists are respected.
        this.setSelectionMode(false);

        this.removeAllCellRanges(true);
        const allDataColumns = this.getColumnsFromModel(this.visibleCols.allCols) ?? [];
        let hasAllColumnsRange = false;

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

            if (!hasAllColumnsRange && allDataColumns.length > 0 && this.isAllColumnsRange(cellRange, allDataColumns)) {
                hasAllColumnsRange = true;
            }

            this.cellRanges.push(cellRange);
        }

        // restore all-columns selection mode if any range spans all data columns.
        this.setSelectionMode(hasAllColumnsRange);

        this.dispatchChangedEvent(false, true);
    }

    public clearCellRangeCellValues(params: ClearCellRangeParams): void {
        const { beans, eventSvc } = this;
        const {
            cellEventSource = 'rangeSvc',
            dispatchWrapperEvents,
            wrapperEventSource = 'deleteKey',
            restoreSourceInBatch,
        } = params;

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

        const { valueSvc, editSvc } = beans;
        const batch = !!editSvc?.isBatchEditing();

        const { changeDetectionSvc } = beans;
        changeDetectionSvc?.beginDeferred();
        try {
            this.forEachEditableCellInRanges(cellRanges, (rowNode, column) => {
                if (restoreSourceInBatch && batch) {
                    editSvc?.batchResetToSourceValue({ rowNode, column });
                    return;
                }
                const deleteValue = valueSvc.getDeleteValue(column, rowNode);
                rowNode.setDataValue(column, deleteValue, cellEventSource);
            });
        } finally {
            changeDetectionSvc?.endDeferred();
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

    // range service can't normally support a range without columns, but charts can
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
            return true; // assumes a cell range must contain at least one cell
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
        const { beans } = this;
        const firstRow = _getFirstRow(beans);
        const lastRow = _getLastRow(beans);
        if (!firstRow || !lastRow) {
            return false;
        }

        const columns = column.isColumn ? [column] : column.getDisplayedLeafColumns();

        return this.findContainingRange({ columns, startRow: firstRow, endRow: lastRow }, true) != null;
    }

    private findContainingRange(
        { columns, startRow, endRow }: Omit<CellRange, 'startColumn'>,
        matchOnly = false
    ): CellRange | undefined {
        // iterating backwards since we're likely interested in the most recently added range
        const ranges = this.cellRanges;
        for (let i = ranges.length - 1; i >= 0; i--) {
            const range = ranges[i];
            const hasCols = columns.every((c) => range.columns.includes(c));

            let condition: boolean;
            if (matchOnly) {
                condition = _isSameRow(range.startRow, startRow) && _isSameRow(range.endRow, endRow);
            } else {
                const isStartBeforeOrEqual = startRow && this.isRowInRange(startRow, range);
                const isEndAfterOrEqual = endRow && this.isRowInRange(endRow, range);
                condition = !!isStartBeforeOrEqual && !!isEndAfterOrEqual;
            }

            if (hasCols && condition) {
                return range;
            }
        }
    }

    public isBottomRightCell(cellRange: CellRange, cell: CellPosition): boolean {
        const cols = cellRange.columns as AgColumn[];
        let maxIdx = -1;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const idx = cols[i].allColsIndex;
            if (idx > maxIdx) {
                maxIdx = idx;
            }
        }
        const { startRow, endRow } = cellRange;
        const lastRow = _isRowBefore(startRow!, endRow!) ? endRow : startRow;

        const isRightColumn = (cell.column as AgColumn).allColsIndex === maxIdx;
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

        const equalsFirstRow = _isSameRow(thisRow, firstRow);
        const equalsLastRow = _isSameRow(thisRow, lastRow);

        if (equalsFirstRow || equalsLastRow) {
            return true;
        }

        const afterFirstRow = !_isRowBefore(thisRow, firstRow);
        const beforeLastRow = _isRowBefore(thisRow, lastRow);

        return afterFirstRow && beforeLastRow;
    }

    public intersectLastRange(fromMouseClick?: boolean) {
        // When ranges are created due to a mouse click without drag (happens in cellMouseListener)
        // this method will be called with `fromMouseClick=true`.
        // Range selection while editing relies on overlapping ranges to preserve editor overlays.
        const { editingWithRanges, suppressMultiRanges } = this.getMultiRangeContext();
        if (editingWithRanges || suppressMultiRanges || (fromMouseClick && this.dragging) || this.isEmpty()) {
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
                // no overlapping columns, retain previous range
                newRanges.push(range);
                continue;
            }
            if (_isRowBefore(intersectionEndRow, startRow) || _isRowBefore(endRow, intersectionStartRow)) {
                // no overlapping rows, retain previous range
                newRanges.push(range);
                continue;
            }
            const rangeCountBefore = newRanges.length;
            // top
            if (_isRowBefore(startRow, intersectionStartRow)) {
                const top: CellRange = {
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: { ...startRow },
                    endRow: _getRowAbove(this.beans, intersectionStartRow)!,
                };
                newRanges.push(top);
            }
            // left & right (not contiguous with columns)
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
            // bottom
            if (_isRowBefore(intersectionEndRow, endRow)) {
                newRanges.push({
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: _getRowBelow(this.beans, intersectionEndRow)!,
                    endRow: { ...endRow },
                });
            }
            if (newRanges.length - rangeCountBefore === 1) {
                // only one range results from the intersection.
                // copy the source range's id, since essentially we just reduced its size.
                newRanges[newRanges.length - 1].id = range.id;
            }
        }
        this.cellRanges = newRanges;

        // when this is called because of a click event and the ranges were changed
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
        const { columns } = cellRange;
        const startColumn = this.ensureRangeStartColumn(cellRange);

        if (!startColumn) {
            return;
        }

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
        const { suppressMultiRanges } = this.getMultiRangeContext();
        const invalid = _isUsingNewCellSelectionAPI(gos) && suppressMultiRanges && this.cellRanges.length > 1;
        if (invalid) {
            this.warn(93);
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

    private forEachEditableCellInRanges(
        cellRanges: CellRange[],
        callback: (rowNode: IRowNode, column: AgColumn) => void
    ): void {
        const { beans } = this;
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
                    callback(rowNode, column);
                }
            });
        }
    }

    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selecting more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection by mimicking a new mouse event
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

        const editSvc = this.beans.editSvc;
        const editing = editSvc?.isEditing(cellCtrl, {
            withOpenEditor: true,
        });

        if (editing && !editSvc?.isRangeSelectionEnabledWhileEditing()) {
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

    private getColumnFromModel(col: string | AgColumn): AgColumn | undefined {
        return typeof col === 'string' ? this.colModel.getCol(col) : col;
    }

    private getColumnsFromModel(cols?: (string | AgColumn)[]): AgColumn[] | undefined {
        const { visibleCols, selectionMode } = this;

        if (!cols || selectionMode === SelectionMode.ALL_COLUMNS) {
            cols = visibleCols.allCols;
        }

        const columns: AgColumn[] = [];

        for (const col of cols) {
            const column = this.getColumnFromModel(col);
            if (!column || this.shouldSkipColumn(column)) {
                continue;
            }
            columns.push(column);
        }

        return columns.length ? columns : undefined;
    }

    private ensureRangeStartColumn(cellRange: CellRange): AgColumn | undefined {
        const startColumn = this.getRangeStartColumn(
            cellRange.columns as AgColumn[],
            cellRange.startColumn as AgColumn
        );
        if (!startColumn) {
            return;
        }

        cellRange.startColumn = startColumn;
        return startColumn;
    }

    private getRangeStartColumn(columns: AgColumn[], preferredStartColumn?: AgColumn): AgColumn | undefined {
        const firstColumn = columns[0];
        const lastColumn = _last(columns);

        if (!firstColumn || !lastColumn) {
            return;
        }

        if (!preferredStartColumn || columns.includes(preferredStartColumn)) {
            return preferredStartColumn ?? firstColumn;
        }

        const preferredStartIndex = preferredStartColumn.allColsIndex;
        const firstIndex = firstColumn.allColsIndex;
        const lastIndex = lastColumn.allColsIndex;

        if (preferredStartIndex < 0 || firstIndex < 0 || lastIndex < 0) {
            return firstColumn;
        }

        return preferredStartIndex - firstIndex <= lastIndex - preferredStartIndex ? firstColumn : lastColumn;
    }

    private calculateColumnsBetween(columnA: string | AgColumn, columnB: string | AgColumn): AgColumn[] | undefined {
        const allColumns = this.visibleCols.allCols;

        const fromColumn = this.getColumnFromModel(columnA)!;
        const toColumn = this.getColumnFromModel(columnB)!;

        const isSameColumn = fromColumn === toColumn;
        const fromIndex = fromColumn.allColsIndex;

        if (fromIndex < 0) {
            this.warn(178, { colId: fromColumn.getId() });
            return;
        }

        const toIndex = isSameColumn ? fromIndex : toColumn.allColsIndex;

        if (toIndex < 0) {
            this.warn(178, { colId: toColumn.getId() });
            return;
        }

        if (isSameColumn || this.selectionMode === SelectionMode.ALL_COLUMNS) {
            return this.getColumnsFromModel([fromColumn]);
        }

        const firstIndex = Math.min(fromIndex, toIndex);
        const lastIndex = firstIndex === fromIndex ? toIndex : fromIndex;

        return this.getColumnsFromModel(allColumns.slice(firstIndex, lastIndex + 1));
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
        if (!_getEnableColumnSelection(gos)) {
            return;
        }

        const { suppressMultiRanges, editingWithRanges } = this.getMultiRangeContext();
        const hasRanges = cellRanges.length > 0;
        const isMeta = event.ctrlKey || event.metaKey;
        const allowToggle = !editingWithRanges || isMeta;

        const firstRow = _getFirstRow(beans);
        const lastRow = _getLastRow(beans);
        if (!firstRow || !lastRow) {
            // no rows yet
            return;
        }

        if ((event as KeyboardEvent).key === KeyCode.ENTER) {
            event.preventDefault();
        }

        if (event.shiftKey) {
            // extend a column range from the stored root to the clicked column.
            const root = ctx.root;
            if (!root) {
                return;
            }

            const column = clickedColumn.isColumn ? clickedColumn : _last(clickedColumn.getLeafColumns());

            const range = this.findContainingRange({ columns: [root], startRow: firstRow, endRow: lastRow }, true);
            if (!range) {
                // when no existing range exists, clear the last cell range
                // and start from the root
                _removeFromArray(cellRanges, ctx.lastCellRange);
                this.selectColumns(this.calculateColumnsBetween(root, column)!, firstRow, lastRow);
                return;
            }

            this.updateRangeRowBoundary({ cellRange: range, boundary: 'end', cellPosition: { column, ...lastRow } });
            return;
        }

        // clicking a header selects or toggles a full-column range (all rows).
        if (hasRanges && (suppressMultiRanges || (!isMeta && !editingWithRanges))) {
            this.removeAllCellRanges(true);
        }

        const toggleColumns = (columns: AgColumn[], root: AgColumn): void => {
            const foundRange = this.findContainingRange({ columns, startRow: firstRow, endRow: lastRow }, true);

            if (foundRange && allowToggle) {
                this.deselectColumnsFromRange(foundRange, columns);
            } else {
                const addedRange = this.selectColumns(columns, firstRow, lastRow);
                if (addedRange) {
                    ctx.lastCellRange = addedRange;
                }
            }

            ctx.root = root;
        };

        if (clickedColumn.isColumn) {
            toggleColumns([clickedColumn], clickedColumn);
        } else {
            // column groups select all leaf columns as a single range.
            const leafCols = clickedColumn.getDisplayedLeafColumns();
            toggleColumns(leafCols, leafCols[0]);
        }
    }

    private deselectColumnsFromRange(range: CellRange, columns: AgColumn[]): undefined {
        _removeAllFromArray(range.columns as AgColumn[], columns);
        if (columns.includes(range.startColumn as AgColumn)) {
            range.startColumn = range.columns[0];
        }

        if (range.columns.length === 0) {
            // clean up empty range
            _removeFromArray(this.cellRanges, range);
        }

        this.dispatchChangedEvent(true, true);
    }

    private selectColumns(columns: AgColumn[], startRow: RowPosition, endRow: RowPosition): CellRange | undefined {
        return this.addCellRange({
            columns,
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

function replaceEdgeRow(range: CellRange, row: RowPosition | null, topOrBottom: 'top' | 'bottom') {
    let key: 'startRow' | 'endRow';
    if (topOrBottom === 'top') {
        key = !range.startRow || !range.endRow || _isRowBefore(range.startRow, range.endRow) ? 'startRow' : 'endRow';
    } else {
        key = !range.startRow || !range.endRow || _isRowBefore(range.startRow, range.endRow) ? 'endRow' : 'startRow';
    }
    range[key] = row ?? undefined;
}
