// enterprise-modules/range-selection/src/rangeSelectionModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/range-selection/src/rangeSelection/rangeSelectionApi.ts
function getCellRanges(beans) {
  return beans.rangeService?.getCellRanges() ?? null;
}
function addCellRange(beans, params) {
  beans.rangeService?.addCellRange(params);
}
function clearRangeSelection(beans) {
  beans.rangeService?.removeAllCellRanges();
}

// enterprise-modules/range-selection/src/rangeSelection/rangeService.ts
import {
  AutoScrollService,
  BeanStub,
  CellCtrl,
  _areEqual,
  _exists,
  _existsAndNotEmpty,
  _getCtrlForEventTarget,
  _includes,
  _last,
  _makeNull,
  _missing,
  _shallowCompare,
  _warnOnce
} from "@ag-grid-community/core";
var RangeService = class extends BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "rangeService";
    this.cellRanges = [];
    this.bodyScrollListener = this.onBodyScroll.bind(this);
    this.dragging = false;
    this.intersectionRange = false;
  }
  wireBeans(beans) {
    this.rowModel = beans.rowModel;
    this.dragService = beans.dragService;
    this.columnModel = beans.columnModel;
    this.visibleColsService = beans.visibleColsService;
    this.cellNavigationService = beans.cellNavigationService;
    this.pinnedRowModel = beans.pinnedRowModel;
    this.rowPositionUtils = beans.rowPositionUtils;
    this.cellPositionUtils = beans.cellPositionUtils;
    this.ctrlsService = beans.ctrlsService;
    this.valueService = beans.valueService;
  }
  postConstruct() {
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
      columnPinned: refreshLastRangeStart
    });
    this.ctrlsService.whenReady((p) => {
      const gridBodyCtrl = p.gridBodyCtrl;
      this.autoScrollService = new AutoScrollService({
        scrollContainer: gridBodyCtrl.getBodyViewportElement(),
        scrollAxis: "xy",
        getVerticalPosition: () => gridBodyCtrl.getScrollFeature().getVScrollPosition().top,
        setVerticalPosition: (position) => gridBodyCtrl.getScrollFeature().setVerticalScrollPosition(position),
        getHorizontalPosition: () => gridBodyCtrl.getScrollFeature().getHScrollPosition().left,
        setHorizontalPosition: (position) => gridBodyCtrl.getScrollFeature().setHorizontalScrollPosition(position),
        shouldSkipVerticalScroll: () => !this.gos.isDomLayout("normal"),
        shouldSkipHorizontalScroll: () => !gridBodyCtrl.getScrollFeature().isHorizontalScrollShowing()
      });
    });
  }
  // Called for both columns loaded & column visibility events
  onColumnsChanged() {
    this.refreshLastRangeStart();
    const allColumns = this.visibleColsService.getAllCols();
    this.cellRanges.forEach((cellRange) => {
      const beforeCols = cellRange.columns;
      cellRange.columns = cellRange.columns.filter(
        (col) => col.isVisible() && allColumns.indexOf(col) !== -1
      );
      const colsInRangeChanged = !_areEqual(beforeCols, cellRange.columns);
      if (colsInRangeChanged) {
        this.dispatchChangedEvent(false, true, cellRange.id);
      }
    });
    const countBefore = this.cellRanges.length;
    this.cellRanges = this.cellRanges.filter((range) => range.columns.length > 0);
    if (countBefore > this.cellRanges.length) {
      this.dispatchChangedEvent(false, true);
    }
  }
  refreshLastRangeStart() {
    const lastRange = _last(this.cellRanges);
    if (!lastRange) {
      return;
    }
    this.refreshRangeStart(lastRange);
  }
  isContiguousRange(cellRange) {
    const rangeColumns = cellRange.columns;
    if (!rangeColumns.length) {
      return false;
    }
    const allColumns = this.visibleColsService.getAllCols();
    const allPositions = rangeColumns.map((c) => allColumns.indexOf(c)).sort((a, b) => a - b);
    return _last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
  }
  getRangeStartRow(cellRange) {
    if (cellRange.startRow && cellRange.endRow) {
      return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ? cellRange.startRow : cellRange.endRow;
    }
    const rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? "top" : null;
    return { rowIndex: 0, rowPinned };
  }
  getRangeEndRow(cellRange) {
    if (cellRange.startRow && cellRange.endRow) {
      return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ? cellRange.endRow : cellRange.startRow;
    }
    const pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
    const pinnedBottom = pinnedBottomRowCount > 0;
    if (pinnedBottom) {
      return {
        rowIndex: pinnedBottomRowCount - 1,
        rowPinned: "bottom"
      };
    }
    return {
      rowIndex: this.rowModel.getRowCount() - 1,
      rowPinned: null
    };
  }
  setRangeToCell(cell, appendRange = false) {
    if (!this.gos.get("enableRangeSelection")) {
      return;
    }
    const columns = this.calculateColumnsBetween(cell.column, cell.column);
    if (!columns) {
      return;
    }
    const suppressMultiRangeSelections = this.gos.get("suppressMultiRangeSelection");
    if (suppressMultiRangeSelections || !appendRange || _missing(this.cellRanges)) {
      this.removeAllCellRanges(true);
    }
    const rowForCell = {
      rowIndex: cell.rowIndex,
      rowPinned: cell.rowPinned
    };
    const cellRange = {
      startRow: rowForCell,
      endRow: rowForCell,
      columns,
      startColumn: cell.column
    };
    this.cellRanges.push(cellRange);
    this.setNewestRangeStartCell(cell);
    this.onDragStop();
    this.dispatchChangedEvent(true, true);
  }
  extendLatestRangeToCell(cellPosition) {
    if (this.isEmpty() || !this.newestRangeStartCell) {
      return;
    }
    const cellRange = _last(this.cellRanges);
    this.updateRangeEnd(cellRange, cellPosition);
  }
  updateRangeEnd(cellRange, cellPosition, silent = false) {
    const endColumn = cellPosition.column;
    const colsToAdd = this.calculateColumnsBetween(cellRange.startColumn, endColumn);
    if (!colsToAdd || this.isLastCellOfRange(cellRange, cellPosition)) {
      return;
    }
    cellRange.columns = colsToAdd;
    cellRange.endRow = { rowIndex: cellPosition.rowIndex, rowPinned: cellPosition.rowPinned };
    if (!silent) {
      this.dispatchChangedEvent(true, true, cellRange.id);
    }
  }
  refreshRangeStart(cellRange) {
    const { startColumn, columns } = cellRange;
    const moveColInCellRange = (colToMove, moveToFront) => {
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
      return;
    }
  }
  getRangeEdgeColumns(cellRange) {
    const allColumns = this.visibleColsService.getAllCols();
    const allIndices = cellRange.columns.map((c) => allColumns.indexOf(c)).filter((i) => i > -1).sort((a, b) => a - b);
    return {
      left: allColumns[allIndices[0]],
      right: allColumns[_last(allIndices)]
    };
  }
  // returns true if successful, false if not successful
  extendLatestRangeInDirection(event) {
    if (this.isEmpty() || !this.newestRangeStartCell) {
      return;
    }
    const key = event.key;
    const ctrlKey = event.ctrlKey || event.metaKey;
    const lastRange = _last(this.cellRanges);
    const startCell = this.newestRangeStartCell;
    const firstCol = lastRange.columns[0];
    const lastCol = _last(lastRange.columns);
    const endCellIndex = lastRange.endRow.rowIndex;
    const endCellFloating = lastRange.endRow.rowPinned;
    const endCellColumn = startCell.column === firstCol ? lastCol : firstCol;
    const endCell = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
    const newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell, ctrlKey);
    if (!newEndCell) {
      return;
    }
    this.setCellRange({
      rowStartIndex: startCell.rowIndex,
      rowStartPinned: startCell.rowPinned,
      rowEndIndex: newEndCell.rowIndex,
      rowEndPinned: newEndCell.rowPinned,
      columnStart: startCell.column,
      columnEnd: newEndCell.column
    });
    return newEndCell;
  }
  setCellRange(params) {
    if (!this.gos.get("enableRangeSelection")) {
      return;
    }
    this.removeAllCellRanges(true);
    this.addCellRange(params);
  }
  setCellRanges(cellRanges) {
    if (_shallowCompare(this.cellRanges, cellRanges)) {
      return;
    }
    this.removeAllCellRanges(true);
    cellRanges.forEach((newRange) => {
      if (newRange.columns && newRange.startRow) {
        this.setNewestRangeStartCell({
          rowIndex: newRange.startRow.rowIndex,
          rowPinned: newRange.startRow.rowPinned,
          column: newRange.columns[0]
        });
      }
      this.cellRanges.push(newRange);
    });
    this.dispatchChangedEvent(false, true);
  }
  setNewestRangeStartCell(position) {
    this.newestRangeStartCell = position;
  }
  clearCellRangeCellValues(params) {
    let { cellRanges } = params;
    const { cellEventSource = "rangeService", dispatchWrapperEvents, wrapperEventSource = "deleteKey" } = params;
    if (dispatchWrapperEvents) {
      const startEvent = {
        type: "rangeDeleteStart",
        source: wrapperEventSource
      };
      this.eventService.dispatchEvent(startEvent);
    }
    if (!cellRanges) {
      cellRanges = this.cellRanges;
    }
    cellRanges.forEach((cellRange) => {
      this.forEachRowInRange(cellRange, (rowPosition) => {
        const rowNode = this.rowPositionUtils.getRowNode(rowPosition);
        if (!rowNode) {
          return;
        }
        for (let i = 0; i < cellRange.columns.length; i++) {
          const column = this.columnModel.getCol(cellRange.columns[i]);
          if (!column || !column.isCellEditable(rowNode)) {
            continue;
          }
          const emptyValue = this.valueService.parseValue(column, rowNode, "", rowNode.getValueFromValueService(column)) ?? null;
          rowNode.setDataValue(column, emptyValue, cellEventSource);
        }
      });
    });
    if (dispatchWrapperEvents) {
      const endEvent = {
        type: "rangeDeleteEnd",
        source: wrapperEventSource
      };
      this.eventService.dispatchEvent(endEvent);
    }
  }
  createCellRangeFromCellRangeParams(params) {
    return this.createPartialCellRangeFromRangeParams(params, false);
  }
  // Range service can't normally support a range without columns, but charts can
  createPartialCellRangeFromRangeParams(params, allowEmptyColumns) {
    let columns;
    let startsOnTheRight = false;
    if (params.columns) {
      columns = params.columns.map((c) => this.columnModel.getCol(c)).filter((c) => c);
    } else {
      const columnStart = this.columnModel.getCol(params.columnStart);
      const columnEnd = this.columnModel.getCol(params.columnEnd);
      if (!columnStart || !columnEnd) {
        return;
      }
      columns = this.calculateColumnsBetween(columnStart, columnEnd);
      if (columns && columns.length) {
        startsOnTheRight = columns[0] !== columnStart;
      }
    }
    if (!columns || !allowEmptyColumns && columns.length === 0) {
      return;
    }
    const startRow = params.rowStartIndex != null ? {
      rowIndex: params.rowStartIndex,
      rowPinned: params.rowStartPinned || null
    } : void 0;
    const endRow = params.rowEndIndex != null ? {
      rowIndex: params.rowEndIndex,
      rowPinned: params.rowEndPinned || null
    } : void 0;
    return {
      startRow,
      endRow,
      columns,
      startColumn: startsOnTheRight ? _last(columns) : columns[0]
    };
  }
  addCellRange(params) {
    if (!this.gos.get("enableRangeSelection")) {
      return;
    }
    const newRange = this.createCellRangeFromCellRangeParams(params);
    if (newRange) {
      if (newRange.startRow) {
        this.setNewestRangeStartCell({
          rowIndex: newRange.startRow.rowIndex,
          rowPinned: newRange.startRow.rowPinned,
          column: newRange.startColumn
        });
      }
      this.cellRanges.push(newRange);
      this.dispatchChangedEvent(false, true, newRange.id);
    }
  }
  getCellRanges() {
    return this.cellRanges;
  }
  isEmpty() {
    return this.cellRanges.length === 0;
  }
  isMoreThanOneCell() {
    const len = this.cellRanges.length;
    if (len === 0) {
      return false;
    }
    if (len > 1) {
      return true;
    }
    const range = this.cellRanges[0];
    const startRow = this.getRangeStartRow(range);
    const endRow = this.getRangeEndRow(range);
    return startRow.rowPinned !== endRow.rowPinned || startRow.rowIndex !== endRow.rowIndex || range.columns.length !== 1;
  }
  areAllRangesAbleToMerge() {
    const rowToColumnMap = /* @__PURE__ */ new Map();
    const len = this.cellRanges.length;
    if (len <= 1)
      return true;
    this.cellRanges.forEach((range) => {
      this.forEachRowInRange(range, (row) => {
        const rowName = `${row.rowPinned || "normal"}_${row.rowIndex}`;
        const columns = rowToColumnMap.get(rowName);
        const currentRangeColIds = range.columns.map((col) => col.getId());
        if (columns) {
          const filteredColumns = currentRangeColIds.filter((col) => columns.indexOf(col) === -1);
          columns.push(...filteredColumns);
        } else {
          rowToColumnMap.set(rowName, currentRangeColIds);
        }
      });
    });
    let columnsString;
    for (const val of rowToColumnMap.values()) {
      const currentValString = val.sort().join();
      if (columnsString === void 0) {
        columnsString = currentValString;
        continue;
      }
      if (columnsString !== currentValString) {
        return false;
      }
    }
    return true;
  }
  forEachRowInRange(cellRange, callback) {
    const topRow = this.getRangeStartRow(cellRange);
    const bottomRow = this.getRangeEndRow(cellRange);
    let currentRow = topRow;
    while (currentRow) {
      callback(currentRow);
      if (this.rowPositionUtils.sameRow(currentRow, bottomRow)) {
        break;
      }
      currentRow = this.cellNavigationService.getRowBelow(currentRow);
    }
  }
  removeAllCellRanges(silent) {
    if (this.isEmpty()) {
      return;
    }
    this.onDragStop();
    this.cellRanges.length = 0;
    if (!silent) {
      this.dispatchChangedEvent(false, true);
    }
  }
  // as the user is dragging outside of the panel, the div starts to scroll, which in turn
  // means we are selection more (or less) cells, but the mouse isn't moving, so we recalculate
  // the selection my mimicking a new mouse event
  onBodyScroll() {
    if (this.dragging && this.lastMouseEvent) {
      this.onDragging(this.lastMouseEvent);
    }
  }
  isCellInAnyRange(cell) {
    return this.getCellRangeCount(cell) > 0;
  }
  isCellInSpecificRange(cell, range) {
    const columnInRange = range.columns !== null && _includes(range.columns, cell.column);
    const rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
    return columnInRange && rowInRange;
  }
  isLastCellOfRange(cellRange, cell) {
    const { startRow, endRow } = cellRange;
    const lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
    const isLastRow = cell.rowIndex === lastRow.rowIndex && cell.rowPinned === lastRow.rowPinned;
    const rangeFirstIndexColumn = cellRange.columns[0];
    const rangeLastIndexColumn = _last(cellRange.columns);
    const lastRangeColumn = cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
    const isLastColumn = cell.column === lastRangeColumn;
    return isLastColumn && isLastRow;
  }
  isBottomRightCell(cellRange, cell) {
    const allColumns = this.visibleColsService.getAllCols();
    const allPositions = cellRange.columns.map((c) => allColumns.indexOf(c)).sort((a, b) => a - b);
    const { startRow, endRow } = cellRange;
    const lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
    const isRightColumn = allColumns.indexOf(cell.column) === _last(allPositions);
    const isLastRow = cell.rowIndex === lastRow.rowIndex && _makeNull(cell.rowPinned) === _makeNull(lastRow.rowPinned);
    return isRightColumn && isLastRow;
  }
  // returns the number of ranges this cell is in
  getCellRangeCount(cell) {
    if (this.isEmpty()) {
      return 0;
    }
    return this.cellRanges.filter((cellRange) => this.isCellInSpecificRange(cell, cellRange)).length;
  }
  isRowInRange(rowIndex, rowPinned, cellRange) {
    const firstRow = this.getRangeStartRow(cellRange);
    const lastRow = this.getRangeEndRow(cellRange);
    const thisRow = { rowIndex, rowPinned: rowPinned || null };
    const equalsFirstRow = thisRow.rowIndex === firstRow.rowIndex && thisRow.rowPinned == firstRow.rowPinned;
    const equalsLastRow = thisRow.rowIndex === lastRow.rowIndex && thisRow.rowPinned == lastRow.rowPinned;
    if (equalsFirstRow || equalsLastRow) {
      return true;
    }
    const afterFirstRow = !this.rowPositionUtils.before(thisRow, firstRow);
    const beforeLastRow = this.rowPositionUtils.before(thisRow, lastRow);
    return afterFirstRow && beforeLastRow;
  }
  getDraggingRange() {
    return this.draggingRange;
  }
  onDragStart(mouseEvent) {
    if (!this.gos.get("enableRangeSelection")) {
      return;
    }
    const { ctrlKey, metaKey, shiftKey } = mouseEvent;
    const isMultiKey = ctrlKey || metaKey;
    const allowMulti = !this.gos.get("suppressMultiRangeSelection");
    const isMultiSelect = allowMulti ? isMultiKey : false;
    const extendRange = shiftKey && _existsAndNotEmpty(this.cellRanges);
    if (!isMultiSelect && (!extendRange || _exists(_last(this.cellRanges).type))) {
      this.removeAllCellRanges(true);
    }
    const startTarget = this.dragService.getStartTarget();
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
    if (this.cellRanges.length > 0) {
      this.draggingRange = _last(this.cellRanges);
    } else {
      const mouseRowPosition = {
        rowIndex: this.lastCellHovered.rowIndex,
        rowPinned: this.lastCellHovered.rowPinned
      };
      this.draggingRange = {
        startRow: mouseRowPosition,
        endRow: mouseRowPosition,
        columns: [this.lastCellHovered.column],
        startColumn: this.newestRangeStartCell.column
      };
      this.cellRanges.push(this.draggingRange);
    }
    this.ctrlsService.getGridBodyCtrl().addScrollEventListener(this.bodyScrollListener);
    this.dispatchChangedEvent(true, false, this.draggingRange.id);
  }
  intersectLastRange(fromMouseClick) {
    if (fromMouseClick && this.dragging) {
      return;
    }
    if (this.gos.get("suppressMultiRangeSelection")) {
      return;
    }
    if (this.isEmpty()) {
      return;
    }
    const rowPosUtils = this.rowPositionUtils;
    const lastRange = _last(this.cellRanges);
    const intersectionStartRow = this.getRangeStartRow(lastRange);
    const intersectionEndRow = this.getRangeEndRow(lastRange);
    const newRanges = [];
    this.cellRanges.slice(0, -1).forEach((range) => {
      const startRow = this.getRangeStartRow(range);
      const endRow = this.getRangeEndRow(range);
      const cols = range.columns;
      const intersectCols = cols.filter((col) => lastRange.columns.indexOf(col) === -1);
      if (intersectCols.length === cols.length) {
        newRanges.push(range);
        return;
      }
      if (rowPosUtils.before(intersectionEndRow, startRow) || rowPosUtils.before(endRow, intersectionStartRow)) {
        newRanges.push(range);
        return;
      }
      const rangeCountBefore = newRanges.length;
      if (rowPosUtils.before(startRow, intersectionStartRow)) {
        const top = {
          columns: [...cols],
          startColumn: lastRange.startColumn,
          startRow: { ...startRow },
          endRow: this.cellNavigationService.getRowAbove(intersectionStartRow)
        };
        newRanges.push(top);
      }
      if (intersectCols.length > 0) {
        const middle = {
          columns: intersectCols,
          startColumn: _includes(intersectCols, lastRange.startColumn) ? lastRange.startColumn : intersectCols[0],
          startRow: this.rowMax([{ ...intersectionStartRow }, { ...startRow }]),
          endRow: this.rowMin([{ ...intersectionEndRow }, { ...endRow }])
        };
        newRanges.push(middle);
      }
      if (rowPosUtils.before(intersectionEndRow, endRow)) {
        newRanges.push({
          columns: [...cols],
          startColumn: lastRange.startColumn,
          startRow: this.cellNavigationService.getRowBelow(intersectionEndRow),
          endRow: { ...endRow }
        });
      }
      if (newRanges.length - rangeCountBefore === 1) {
        newRanges[newRanges.length - 1].id = range.id;
      }
    });
    this.cellRanges = newRanges;
    if (fromMouseClick) {
      this.dispatchChangedEvent(false, true);
    }
  }
  rowMax(rows) {
    let max;
    rows.forEach((row) => {
      if (max === void 0 || this.rowPositionUtils.before(max, row)) {
        max = row;
      }
    });
    return max;
  }
  rowMin(rows) {
    let min;
    rows.forEach((row) => {
      if (min === void 0 || this.rowPositionUtils.before(row, min)) {
        min = row;
      }
    });
    return min;
  }
  updateValuesOnMove(eventTarget) {
    const cellCtrl = _getCtrlForEventTarget(this.gos, eventTarget, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
    const cell = cellCtrl?.getCellPosition();
    this.cellHasChanged = false;
    if (!cell || this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered)) {
      return;
    }
    if (this.lastCellHovered) {
      this.cellHasChanged = true;
    }
    this.lastCellHovered = cell;
  }
  onDragging(mouseEvent) {
    if (!this.dragging || !mouseEvent) {
      return;
    }
    this.updateValuesOnMove(mouseEvent.target);
    this.lastMouseEvent = mouseEvent;
    const cellPosition = this.lastCellHovered;
    const isMouseAndStartInPinned = (position) => cellPosition && cellPosition.rowPinned === position && this.newestRangeStartCell.rowPinned === position;
    const skipVerticalScroll = isMouseAndStartInPinned("top") || isMouseAndStartInPinned("bottom");
    this.autoScrollService.check(mouseEvent, skipVerticalScroll);
    if (!this.cellHasChanged) {
      return;
    }
    const columns = this.calculateColumnsBetween(
      this.newestRangeStartCell.column,
      cellPosition.column
    );
    if (!columns) {
      return;
    }
    this.draggingRange.endRow = {
      rowIndex: cellPosition.rowIndex,
      rowPinned: cellPosition.rowPinned
    };
    this.draggingRange.columns = columns;
    this.dispatchChangedEvent(false, false, this.draggingRange.id);
  }
  onDragStop() {
    if (!this.dragging) {
      return;
    }
    const { id } = this.draggingRange;
    this.autoScrollService.ensureCleared();
    this.ctrlsService.getGridBodyCtrl().removeScrollEventListener(this.bodyScrollListener);
    this.lastMouseEvent = null;
    this.dragging = false;
    this.draggingRange = void 0;
    this.lastCellHovered = void 0;
    if (this.intersectionRange) {
      this.intersectionRange = false;
      this.intersectLastRange();
    }
    this.dispatchChangedEvent(false, true, id);
  }
  dispatchChangedEvent(started, finished, id) {
    const event = {
      type: "rangeSelectionChanged",
      started,
      finished,
      id
    };
    this.eventService.dispatchEvent(event);
  }
  calculateColumnsBetween(columnFrom, columnTo) {
    const allColumns = this.visibleColsService.getAllCols();
    const isSameColumn = columnFrom === columnTo;
    const fromIndex = allColumns.indexOf(columnFrom);
    const logMissing = (column) => _warnOnce(`column ${column.getId()} is not visible`);
    if (fromIndex < 0) {
      logMissing(columnFrom);
      return;
    }
    const toIndex = isSameColumn ? fromIndex : allColumns.indexOf(columnTo);
    if (toIndex < 0) {
      logMissing(columnTo);
      return;
    }
    if (isSameColumn) {
      return [columnFrom];
    }
    const firstIndex = Math.min(fromIndex, toIndex);
    const lastIndex = firstIndex === fromIndex ? toIndex : fromIndex;
    const columns = [];
    for (let i = firstIndex; i <= lastIndex; i++) {
      columns.push(allColumns[i]);
    }
    return columns;
  }
};

// enterprise-modules/range-selection/src/rangeSelection/selectionHandleFactory.ts
import { BeanStub as BeanStub2, SelectionHandleType as SelectionHandleType4 } from "@ag-grid-community/core";

// enterprise-modules/range-selection/src/rangeSelection/agFillHandle.ts
import { SelectionHandleType as SelectionHandleType2, _last as _last3, _toStringOrNull, _warnOnce as _warnOnce2 } from "@ag-grid-community/core";

// enterprise-modules/range-selection/src/rangeSelection/abstractSelectionHandle.ts
import { Component, SelectionHandleType, _isVisible, _last as _last2, _setDisplayed } from "@ag-grid-community/core";
var AbstractSelectionHandle = class extends Component {
  constructor() {
    super(...arguments);
    this.changedCalculatedValues = false;
    this.dragging = false;
    this.shouldDestroyOnEndDragging = false;
  }
  wireBeans(beans) {
    this.dragService = beans.dragService;
    this.rangeService = beans.rangeService;
    this.mouseEventService = beans.mouseEventService;
    this.rowPositionUtils = beans.rowPositionUtils;
    this.cellPositionUtils = beans.cellPositionUtils;
    this.ctrlsService = beans.ctrlsService;
  }
  postConstruct() {
    this.dragService.addDragSource({
      dragStartPixels: 0,
      eElement: this.getGui(),
      onDragStart: this.onDragStart.bind(this),
      onDragging: (e) => {
        this.dragging = true;
        this.rangeService.autoScrollService.check(e);
        if (this.changedCalculatedValues) {
          this.onDrag(e);
          this.changedCalculatedValues = false;
        }
      },
      onDragStop: (e) => {
        this.dragging = false;
        this.onDragEnd(e);
        this.clearValues();
        this.rangeService.autoScrollService.ensureCleared();
        document.body.classList.remove(this.getDraggingCssClass());
        if (this.shouldDestroyOnEndDragging) {
          this.destroy();
        }
      }
    });
    this.addManagedElementListeners(this.getGui(), { mousedown: this.preventRangeExtension.bind(this) });
  }
  isDragging() {
    return this.dragging;
  }
  getCellCtrl() {
    return this.cellCtrl;
  }
  setCellCtrl(cellComp) {
    this.cellCtrl = cellComp;
  }
  getCellRange() {
    return this.cellRange;
  }
  setCellRange(range) {
    this.cellRange = range;
  }
  getRangeStartRow() {
    return this.rangeStartRow;
  }
  setRangeStartRow(row) {
    this.rangeStartRow = row;
  }
  getRangeEndRow() {
    return this.rangeEndRow;
  }
  setRangeEndRow(row) {
    this.rangeEndRow = row;
  }
  getLastCellHovered() {
    return this.lastCellHovered;
  }
  preventRangeExtension(e) {
    e.stopPropagation();
  }
  onDragStart(e) {
    [this.cellHoverListener] = this.addManagedElementListeners(this.ctrlsService.get("gridCtrl").getGui(), {
      mousemove: this.updateValuesOnMove.bind(this)
    });
    document.body.classList.add(this.getDraggingCssClass());
  }
  getDraggingCssClass() {
    return `ag-dragging-${this.type === SelectionHandleType.FILL ? "fill" : "range"}-handle`;
  }
  updateValuesOnMove(e) {
    const cell = this.mouseEventService.getCellPositionForEvent(e);
    if (!cell || this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered)) {
      return;
    }
    this.lastCellHovered = cell;
    this.changedCalculatedValues = true;
  }
  getType() {
    return this.type;
  }
  refresh(cellCtrl) {
    const oldCellComp = this.getCellCtrl();
    const eGui = this.getGui();
    const cellRange = _last2(this.rangeService.getCellRanges());
    const start = cellRange.startRow;
    const end = cellRange.endRow;
    if (start && end) {
      const isBefore = this.rowPositionUtils.before(end, start);
      if (isBefore) {
        this.setRangeStartRow(end);
        this.setRangeEndRow(start);
      } else {
        this.setRangeStartRow(start);
        this.setRangeEndRow(end);
      }
    }
    if (oldCellComp !== cellCtrl || !_isVisible(eGui)) {
      this.setCellCtrl(cellCtrl);
      const eParentOfValue = cellCtrl.getComp().getParentOfValue();
      if (eParentOfValue) {
        eParentOfValue.appendChild(eGui);
      }
    }
    this.setCellRange(cellRange);
  }
  clearValues() {
    this.lastCellHovered = void 0;
    this.removeListeners();
  }
  removeListeners() {
    if (this.cellHoverListener) {
      this.cellHoverListener();
      this.cellHoverListener = void 0;
    }
  }
  destroy() {
    if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
      _setDisplayed(this.getGui(), false);
      this.shouldDestroyOnEndDragging = true;
      return;
    }
    this.shouldDestroyOnEndDragging = false;
    super.destroy();
    this.removeListeners();
    const eGui = this.getGui();
    if (eGui.parentElement) {
      eGui.parentElement.removeChild(eGui);
    }
  }
};

// enterprise-modules/range-selection/src/rangeSelection/utils.ts
function findLineByLeastSquares(values) {
  const len = values.length;
  let maxDecimals = 0;
  if (len <= 1) {
    return values;
  }
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const splitExponent = value.toString().split("e-");
    if (splitExponent.length > 1) {
      maxDecimals = Math.max(maxDecimals, parseInt(splitExponent[1], 10));
      continue;
    }
    if (Math.floor(value) === value) {
      continue;
    }
    maxDecimals = Math.max(maxDecimals, value.toString().split(".")[1].length);
  }
  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_xx = 0;
  let y = 0;
  for (let x = 0; x < len; x++) {
    y = values[x];
    sum_x += x;
    sum_y += y;
    sum_xx += x * x;
    sum_xy += x * y;
  }
  const m = (len * sum_xy - sum_x * sum_y) / (len * sum_xx - sum_x * sum_x);
  const b = sum_y / len - m * sum_x / len;
  const result = [];
  for (let x = 0; x <= len; x++) {
    result.push(parseFloat((x * m + b).toFixed(maxDecimals)));
  }
  return result;
}

// enterprise-modules/range-selection/src/rangeSelection/agFillHandle.ts
var AgFillHandle = class extends AbstractSelectionHandle {
  constructor() {
    super(
      /* html */
      `<div class="ag-fill-handle"></div>`
    );
    this.markedCells = [];
    this.cellValues = [];
    this.isUp = false;
    this.isLeft = false;
    this.isReduce = false;
    this.type = SelectionHandleType2.FILL;
  }
  wireBeans(beans) {
    super.wireBeans(beans);
    this.valueService = beans.valueService;
    this.navigationService = beans.navigationService;
    this.cellNavigationService = beans.cellNavigationService;
    this.visibleColsService = beans.visibleColsService;
  }
  updateValuesOnMove(e) {
    super.updateValuesOnMove(e);
    if (!this.initialXY) {
      this.initialXY = this.mouseEventService.getNormalisedPosition(e);
    }
    const { x, y } = this.initialXY;
    const { x: newX, y: newY } = this.mouseEventService.getNormalisedPosition(e);
    const diffX = Math.abs(x - newX);
    const diffY = Math.abs(y - newY);
    const allowedDirection = this.getFillHandleDirection();
    let direction;
    if (allowedDirection === "xy") {
      direction = diffX > diffY ? "x" : "y";
    } else {
      direction = allowedDirection;
    }
    if (direction !== this.dragAxis) {
      this.dragAxis = direction;
      this.changedCalculatedValues = true;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDrag(_e) {
    if (!this.initialPosition) {
      const cellCtrl = this.getCellCtrl();
      if (!cellCtrl) {
        return;
      }
      this.initialPosition = cellCtrl.getCellPosition();
    }
    const lastCellHovered = this.getLastCellHovered();
    if (lastCellHovered) {
      this.markPathFrom(this.initialPosition, lastCellHovered);
    }
  }
  onDragEnd(e) {
    this.initialXY = null;
    if (!this.markedCells.length) {
      return;
    }
    const isX = this.dragAxis === "x";
    const initialRange = this.getCellRange();
    const colLen = initialRange.columns.length;
    const rangeStartRow = this.getRangeStartRow();
    const rangeEndRow = this.getRangeEndRow();
    let finalRange;
    if (!this.isUp && !this.isLeft) {
      finalRange = this.rangeService.createCellRangeFromCellRangeParams({
        rowStartIndex: rangeStartRow.rowIndex,
        rowStartPinned: rangeStartRow.rowPinned,
        columnStart: initialRange.columns[0],
        rowEndIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked.rowIndex,
        rowEndPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked.rowPinned,
        columnEnd: isX ? this.lastCellMarked.column : initialRange.columns[colLen - 1]
      });
    } else {
      const startRow = isX ? rangeStartRow : this.lastCellMarked;
      finalRange = this.rangeService.createCellRangeFromCellRangeParams({
        rowStartIndex: startRow.rowIndex,
        rowStartPinned: startRow.rowPinned,
        columnStart: isX ? this.lastCellMarked.column : initialRange.columns[0],
        rowEndIndex: rangeEndRow.rowIndex,
        rowEndPinned: rangeEndRow.rowPinned,
        columnEnd: initialRange.columns[colLen - 1]
      });
    }
    if (finalRange) {
      this.raiseFillStartEvent();
      this.handleValueChanged(initialRange, finalRange, e);
      this.rangeService.setCellRanges([finalRange]);
      this.raiseFillEndEvent(initialRange, finalRange);
    }
  }
  getFillHandleDirection() {
    const direction = this.gos.get("fillHandleDirection");
    if (!direction) {
      return "xy";
    }
    if (direction !== "x" && direction !== "y" && direction !== "xy") {
      _warnOnce2(`valid values for fillHandleDirection are 'x', 'y' and 'xy'. Default to 'xy'.`);
      return "xy";
    }
    return direction;
  }
  raiseFillStartEvent() {
    const fillStartEvent = {
      type: "fillStart"
    };
    this.eventService.dispatchEvent(fillStartEvent);
  }
  raiseFillEndEvent(initialRange, finalRange) {
    const fillEndEvent = {
      type: "fillEnd",
      initialRange,
      finalRange
    };
    this.eventService.dispatchEvent(fillEndEvent);
  }
  handleValueChanged(initialRange, finalRange, e) {
    const initialRangeEndRow = this.rangeService.getRangeEndRow(initialRange);
    const initialRangeStartRow = this.rangeService.getRangeStartRow(initialRange);
    const finalRangeEndRow = this.rangeService.getRangeEndRow(finalRange);
    const finalRangeStartRow = this.rangeService.getRangeStartRow(finalRange);
    const isVertical = this.dragAxis === "y";
    if (this.isReduce && !this.gos.get("suppressClearOnFillReduction")) {
      const columns = isVertical ? initialRange.columns : initialRange.columns.filter((col) => finalRange.columns.indexOf(col) < 0);
      const startRow = isVertical ? this.cellNavigationService.getRowBelow(finalRangeEndRow) : finalRangeStartRow;
      if (startRow) {
        this.clearCellsInRange(startRow, initialRangeEndRow, columns);
      }
      return;
    }
    const values = [];
    const initialValues = [];
    const initialNonAggregatedValues = [];
    const initialFormattedValues = [];
    let withinInitialRange = true;
    let idx = 0;
    const resetValues = () => {
      values.length = 0;
      initialValues.length = 0;
      initialNonAggregatedValues.length = 0;
      initialFormattedValues.length = 0;
      idx = 0;
    };
    const iterateAcrossCells = (column, columns) => {
      let currentRow = this.isUp ? initialRangeEndRow : initialRangeStartRow;
      let finished = false;
      if (isVertical) {
        withinInitialRange = true;
        resetValues();
      }
      while (!finished && currentRow) {
        const rowNode = this.rowPositionUtils.getRowNode(currentRow);
        if (!rowNode) {
          break;
        }
        if (isVertical && column) {
          fillValues(values, column, rowNode, () => {
            return !this.rowPositionUtils.sameRow(
              currentRow,
              this.isUp ? initialRangeStartRow : initialRangeEndRow
            );
          });
        } else if (columns) {
          withinInitialRange = true;
          resetValues();
          columns.forEach(
            (col) => fillValues(
              values,
              col,
              rowNode,
              () => col !== (this.isLeft ? initialRange.columns[0] : _last3(initialRange.columns))
            )
          );
        }
        finished = this.rowPositionUtils.sameRow(currentRow, this.isUp ? finalRangeStartRow : finalRangeEndRow);
        currentRow = this.isUp ? this.cellNavigationService.getRowAbove(currentRow) : this.cellNavigationService.getRowBelow(currentRow);
      }
    };
    const fillValues = (currentValues, col, rowNode, updateInitialSet) => {
      let currentValue;
      let skipValue = false;
      if (withinInitialRange) {
        currentValue = this.valueService.getValue(col, rowNode);
        initialValues.push(currentValue);
        initialNonAggregatedValues.push(this.valueService.getValue(col, rowNode, void 0, true));
        initialFormattedValues.push(this.valueService.formatValue(col, rowNode, currentValue));
        withinInitialRange = updateInitialSet();
      } else {
        const { value, fromUserFunction, sourceCol, sourceRowNode } = this.processValues({
          event: e,
          values: currentValues,
          initialValues,
          initialNonAggregatedValues,
          initialFormattedValues,
          col,
          rowNode,
          idx: idx++
        });
        currentValue = value;
        if (col.isCellEditable(rowNode)) {
          const cellValue = this.valueService.getValue(col, rowNode);
          if (!fromUserFunction) {
            if (sourceCol && sourceCol.getColDef()?.useValueFormatterForExport !== false) {
              currentValue = this.valueService.formatValue(sourceCol, sourceRowNode, currentValue) ?? currentValue;
            }
            if (col.getColDef().useValueParserForImport !== false) {
              currentValue = this.valueService.parseValue(
                col,
                rowNode,
                // if no sourceCol, then currentValue is a number
                sourceCol ? currentValue : _toStringOrNull(currentValue),
                cellValue
              );
            }
          }
          if (!fromUserFunction || cellValue !== currentValue) {
            rowNode.setDataValue(col, currentValue, "rangeService");
          } else {
            skipValue = true;
          }
        }
      }
      if (!skipValue) {
        currentValues.push({
          value: currentValue,
          column: col,
          rowNode
        });
      }
    };
    if (isVertical) {
      initialRange.columns.forEach((col) => {
        iterateAcrossCells(col);
      });
    } else {
      const columns = this.isLeft ? [...finalRange.columns].reverse() : finalRange.columns;
      iterateAcrossCells(void 0, columns);
    }
  }
  clearCellsInRange(startRow, endRow, columns) {
    const cellRange = {
      startRow,
      endRow,
      columns,
      startColumn: columns[0]
    };
    this.rangeService.clearCellRangeCellValues({ cellRanges: [cellRange] });
  }
  processValues(params) {
    const { event, values, initialValues, initialNonAggregatedValues, initialFormattedValues, col, rowNode, idx } = params;
    const userFillOperation = this.gos.getCallback("fillOperation");
    const isVertical = this.dragAxis === "y";
    let direction;
    if (isVertical) {
      direction = this.isUp ? "up" : "down";
    } else {
      direction = this.isLeft ? "left" : "right";
    }
    if (userFillOperation) {
      const params2 = {
        event,
        values: values.map(({ value }) => value),
        initialValues,
        initialNonAggregatedValues,
        initialFormattedValues,
        currentIndex: idx,
        currentCellValue: this.valueService.getValue(col, rowNode),
        direction,
        column: col,
        rowNode
      };
      const userResult = userFillOperation(params2);
      if (userResult !== false) {
        return { value: userResult, fromUserFunction: true };
      }
    }
    const allNumbers = !values.some(({ value }) => {
      const asFloat = parseFloat(value);
      return isNaN(asFloat) || asFloat.toString() !== value.toString();
    });
    if (event.altKey || !allNumbers) {
      if (allNumbers && initialValues.length === 1) {
        const multiplier = this.isUp || this.isLeft ? -1 : 1;
        return { value: parseFloat(_last3(values).value) + 1 * multiplier, fromUserFunction: false };
      }
      const { value, column: sourceCol, rowNode: sourceRowNode } = values[idx % values.length];
      return { value, fromUserFunction: false, sourceCol, sourceRowNode };
    }
    return {
      value: _last3(findLineByLeastSquares(values.map(({ value }) => Number(value)))),
      fromUserFunction: false
    };
  }
  clearValues() {
    this.clearMarkedPath();
    this.clearCellValues();
    this.lastCellMarked = void 0;
    super.clearValues();
  }
  clearMarkedPath() {
    this.markedCells.forEach((cell) => {
      if (!cell.isAlive()) {
        return;
      }
      const comp = cell.getComp();
      comp.addOrRemoveCssClass("ag-selection-fill-top", false);
      comp.addOrRemoveCssClass("ag-selection-fill-right", false);
      comp.addOrRemoveCssClass("ag-selection-fill-bottom", false);
      comp.addOrRemoveCssClass("ag-selection-fill-left", false);
    });
    this.markedCells.length = 0;
    this.isUp = false;
    this.isLeft = false;
    this.isReduce = false;
  }
  clearCellValues() {
    this.cellValues.length = 0;
  }
  markPathFrom(initialPosition, currentPosition) {
    this.clearMarkedPath();
    this.clearCellValues();
    if (this.dragAxis === "y") {
      if (this.rowPositionUtils.sameRow(currentPosition, initialPosition)) {
        return;
      }
      const isBefore = this.rowPositionUtils.before(currentPosition, initialPosition);
      const rangeStartRow = this.getRangeStartRow();
      const rangeEndRow = this.getRangeEndRow();
      if (isBefore && (currentPosition.rowPinned == rangeStartRow.rowPinned && currentPosition.rowIndex >= rangeStartRow.rowIndex || rangeStartRow.rowPinned != rangeEndRow.rowPinned && currentPosition.rowPinned == rangeEndRow.rowPinned && currentPosition.rowIndex <= rangeEndRow.rowIndex)) {
        this.reduceVertical(initialPosition, currentPosition);
        this.isReduce = true;
      } else {
        this.extendVertical(initialPosition, currentPosition, isBefore);
        this.isReduce = false;
      }
    } else {
      const initialColumn = initialPosition.column;
      const currentColumn = currentPosition.column;
      if (initialColumn === currentColumn) {
        return;
      }
      const displayedColumns = this.visibleColsService.getAllCols();
      const initialIndex = displayedColumns.indexOf(initialColumn);
      const currentIndex = displayedColumns.indexOf(currentColumn);
      if (currentIndex <= initialIndex && currentIndex >= displayedColumns.indexOf(this.getCellRange().columns[0])) {
        this.reduceHorizontal(initialPosition, currentPosition);
        this.isReduce = true;
      } else {
        this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
        this.isReduce = false;
      }
    }
    this.lastCellMarked = currentPosition;
  }
  extendVertical(initialPosition, endPosition, isMovingUp) {
    const { navigationService, rangeService } = this;
    let row = initialPosition;
    do {
      const cellRange = this.getCellRange();
      const colLen = cellRange.columns.length;
      for (let i = 0; i < colLen; i++) {
        const column = cellRange.columns[i];
        const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
        const cellPos = { ...rowPos, column };
        const cellInRange = rangeService.isCellInSpecificRange(cellPos, cellRange);
        const isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);
        if (isMovingUp) {
          this.isUp = true;
        }
        if (!isInitialRow) {
          const cell = navigationService.getCellByPosition(cellPos);
          if (cell) {
            this.markedCells.push(cell);
            const cellCtrl = cell.getComp();
            if (!cellInRange) {
              cellCtrl.addOrRemoveCssClass("ag-selection-fill-left", i === 0);
              cellCtrl.addOrRemoveCssClass("ag-selection-fill-right", i === colLen - 1);
            }
            cellCtrl.addOrRemoveCssClass(
              isMovingUp ? "ag-selection-fill-top" : "ag-selection-fill-bottom",
              this.rowPositionUtils.sameRow(row, endPosition)
            );
          }
        }
      }
      if (this.rowPositionUtils.sameRow(row, endPosition)) {
        break;
      }
    } while (
      // tslint:disable-next-line
      row = isMovingUp ? this.cellNavigationService.getRowAbove(row) : this.cellNavigationService.getRowBelow(row)
    );
  }
  reduceVertical(initialPosition, endPosition) {
    let row = initialPosition;
    do {
      const cellRange = this.getCellRange();
      const colLen = cellRange.columns.length;
      const isLastRow = this.rowPositionUtils.sameRow(row, endPosition);
      for (let i = 0; i < colLen; i++) {
        const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
        const celPos = { ...rowPos, column: cellRange.columns[i] };
        const cell = this.navigationService.getCellByPosition(celPos);
        if (cell) {
          this.markedCells.push(cell);
          const cellComp = cell.getComp();
          cellComp.addOrRemoveCssClass(
            "ag-selection-fill-bottom",
            this.rowPositionUtils.sameRow(row, endPosition)
          );
        }
      }
      if (isLastRow) {
        break;
      }
    } while (row = this.cellNavigationService.getRowAbove(row));
  }
  extendHorizontal(initialPosition, endPosition, isMovingLeft) {
    const allCols = this.visibleColsService.getAllCols();
    const startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
    const endCol = allCols.indexOf(
      isMovingLeft ? this.getCellRange().columns[0] : endPosition.column
    );
    const offset = isMovingLeft ? 0 : 1;
    const colsToMark = allCols.slice(startCol + offset, endCol + offset);
    const rangeStartRow = this.getRangeStartRow();
    const rangeEndRow = this.getRangeEndRow();
    colsToMark.forEach((column) => {
      let row = rangeStartRow;
      let isLastRow = false;
      do {
        isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
        const cell = this.navigationService.getCellByPosition({
          rowIndex: row.rowIndex,
          rowPinned: row.rowPinned,
          column
        });
        if (cell) {
          this.markedCells.push(cell);
          const cellComp = cell.getComp();
          cellComp.addOrRemoveCssClass(
            "ag-selection-fill-top",
            this.rowPositionUtils.sameRow(row, rangeStartRow)
          );
          cellComp.addOrRemoveCssClass(
            "ag-selection-fill-bottom",
            this.rowPositionUtils.sameRow(row, rangeEndRow)
          );
          if (isMovingLeft) {
            this.isLeft = true;
            cellComp.addOrRemoveCssClass("ag-selection-fill-left", column === colsToMark[0]);
          } else {
            cellComp.addOrRemoveCssClass("ag-selection-fill-right", column === _last3(colsToMark));
          }
        }
        row = this.cellNavigationService.getRowBelow(row);
      } while (!isLastRow);
    });
  }
  reduceHorizontal(initialPosition, endPosition) {
    const allCols = this.visibleColsService.getAllCols();
    const startCol = allCols.indexOf(endPosition.column);
    const endCol = allCols.indexOf(initialPosition.column);
    const colsToMark = allCols.slice(startCol, endCol);
    const rangeStartRow = this.getRangeStartRow();
    const rangeEndRow = this.getRangeEndRow();
    colsToMark.forEach((column) => {
      let row = rangeStartRow;
      let isLastRow = false;
      do {
        isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
        const cell = this.navigationService.getCellByPosition({
          rowIndex: row.rowIndex,
          rowPinned: row.rowPinned,
          column
        });
        if (cell) {
          this.markedCells.push(cell);
          const cellComp = cell.getComp();
          cellComp.addOrRemoveCssClass("ag-selection-fill-right", column === colsToMark[0]);
        }
        row = this.cellNavigationService.getRowBelow(row);
      } while (!isLastRow);
    });
  }
  refresh(cellCtrl) {
    const cellRange = this.rangeService.getCellRanges()[0];
    const isColumnRange = !cellRange.startRow || !cellRange.endRow;
    if (isColumnRange) {
      this.destroy();
      return;
    }
    super.refresh(cellCtrl);
  }
};

// enterprise-modules/range-selection/src/rangeSelection/agRangeHandle.ts
import { CellRangeType, SelectionHandleType as SelectionHandleType3, _last as _last4 } from "@ag-grid-community/core";
var AgRangeHandle = class extends AbstractSelectionHandle {
  constructor() {
    super(
      /* html */
      `<div class="ag-range-handle"></div>`
    );
    this.type = SelectionHandleType3.RANGE;
    this.rangeFixed = false;
  }
  onDrag(e) {
    const lastCellHovered = this.getLastCellHovered();
    if (!lastCellHovered) {
      return;
    }
    const cellRanges = this.rangeService.getCellRanges();
    const lastRange = _last4(cellRanges);
    if (!this.rangeFixed) {
      this.fixRangeStartEnd(lastRange);
      this.rangeFixed = true;
    }
    this.endPosition = {
      rowIndex: lastCellHovered.rowIndex,
      rowPinned: lastCellHovered.rowPinned,
      column: lastCellHovered.column
    };
    if (cellRanges.length === 2 && cellRanges[0].type === CellRangeType.DIMENSION && lastRange.type === CellRangeType.VALUE) {
      const rowChanged = !this.rowPositionUtils.sameRow(
        this.endPosition,
        this.rangeService.getRangeEndRow(lastRange)
      );
      if (rowChanged) {
        this.rangeService.updateRangeEnd(
          cellRanges[0],
          {
            ...this.endPosition,
            column: cellRanges[0].columns[0]
          },
          true
        );
      }
    }
    this.rangeService.extendLatestRangeToCell(this.endPosition);
  }
  onDragEnd(e) {
    const cellRange = _last4(this.rangeService.getCellRanges());
    this.fixRangeStartEnd(cellRange);
    this.rangeFixed = false;
  }
  fixRangeStartEnd(cellRange) {
    const startRow = this.rangeService.getRangeStartRow(cellRange);
    const endRow = this.rangeService.getRangeEndRow(cellRange);
    const column = cellRange.columns[0];
    cellRange.startRow = startRow;
    cellRange.endRow = endRow;
    cellRange.startColumn = column;
  }
};

// enterprise-modules/range-selection/src/rangeSelection/selectionHandleFactory.ts
var SelectionHandleFactory = class extends BeanStub2 {
  constructor() {
    super(...arguments);
    this.beanName = "selectionHandleFactory";
  }
  createSelectionHandle(type) {
    return this.createBean(type === SelectionHandleType4.RANGE ? new AgRangeHandle() : new AgFillHandle());
  }
};

// enterprise-modules/range-selection/src/version.ts
var VERSION = "32.0.2";

// enterprise-modules/range-selection/src/rangeSelectionModule.ts
var RangeSelectionCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.RangeSelectionModule}-core`,
  beans: [RangeService, SelectionHandleFactory],
  dependantModules: [EnterpriseCoreModule]
};
var RangeSelectionApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames.RangeSelectionModule}-api`,
  apiFunctions: {
    getCellRanges,
    addCellRange,
    clearRangeSelection
  },
  dependantModules: [RangeSelectionCoreModule]
};
var RangeSelectionModule = {
  version: VERSION,
  moduleName: ModuleNames.RangeSelectionModule,
  dependantModules: [RangeSelectionCoreModule, RangeSelectionApiModule]
};
export {
  RangeSelectionModule
};
