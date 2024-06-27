// enterprise-modules/clipboard/src/clipboardModule.ts
import { ModuleNames } from "@ag-grid-community/core";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";

// enterprise-modules/clipboard/src/clipboard/clipboardApi.ts
function copyToClipboard(beans, params) {
  beans.clipboardService?.copyToClipboard(params);
}
function cutToClipboard(beans, params) {
  beans.clipboardService?.cutToClipboard(params);
}
function copySelectedRowsToClipboard(beans, params) {
  beans.clipboardService?.copySelectedRowsToClipboard(params);
}
function copySelectedRangeToClipboard(beans, params) {
  beans.clipboardService?.copySelectedRangeToClipboard(params);
}
function copySelectedRangeDown(beans) {
  beans.clipboardService?.copyRangeDown();
}
function pasteFromClipboard(beans) {
  beans.clipboardService?.pasteFromClipboard();
}

// enterprise-modules/clipboard/src/clipboard/clipboardService.ts
import { BeanStub, ChangedPath, _exists, _last, _removeFromArray, _warnOnce } from "@ag-grid-community/core";
var SOURCE_PASTE = "paste";
var EXPORT_TYPE_DRAG_COPY = "dragCopy";
var EXPORT_TYPE_CLIPBOARD = "clipboard";
var apiError = (method) => `AG Grid: Unable to use the Clipboard API (navigator.clipboard.${method}()). The reason why it could not be used has been logged in the previous line. For this reason the grid has defaulted to using a workaround which doesn't perform as well. Either fix why Clipboard API is blocked, OR stop this message from appearing by setting grid property suppressClipboardApi=true (which will default the grid to using the workaround rather than the API.`;
var ClipboardService = class _ClipboardService extends BeanStub {
  constructor() {
    super(...arguments);
    this.beanName = "clipboardService";
    this.lastPasteOperationTime = 0;
    this.navigatorApiFailed = false;
  }
  wireBeans(beans) {
    this.csvCreator = beans.csvCreator;
    this.selectionService = beans.selectionService;
    this.rowModel = beans.rowModel;
    this.ctrlsService = beans.ctrlsService;
    this.valueService = beans.valueService;
    this.focusService = beans.focusService;
    this.rowRenderer = beans.rowRenderer;
    this.visibleColsService = beans.visibleColsService;
    this.funcColsService = beans.funcColsService;
    this.cellNavigationService = beans.cellNavigationService;
    this.cellPositionUtils = beans.cellPositionUtils;
    this.rowPositionUtils = beans.rowPositionUtils;
    this.rangeService = beans.rangeService;
  }
  postConstruct() {
    if (this.rowModel.getType() === "clientSide") {
      this.clientSideRowModel = this.rowModel;
    }
    this.ctrlsService.whenReady((p) => {
      this.gridCtrl = p.gridCtrl;
    });
  }
  pasteFromClipboard() {
    const allowNavigator = !this.gos.get("suppressClipboardApi");
    if (allowNavigator && !this.navigatorApiFailed && navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(this.processClipboardData.bind(this)).catch((e) => {
        _warnOnce(`${e}
${apiError("readText")}`);
        this.navigatorApiFailed = true;
        this.pasteFromClipboardLegacy();
      });
    } else {
      this.pasteFromClipboardLegacy();
    }
  }
  pasteFromClipboardLegacy() {
    let defaultPrevented = false;
    const handlePasteEvent = (e) => {
      const currentPastOperationTime = (/* @__PURE__ */ new Date()).getTime();
      if (currentPastOperationTime - this.lastPasteOperationTime < 50) {
        defaultPrevented = true;
        e.preventDefault();
      }
      this.lastPasteOperationTime = currentPastOperationTime;
    };
    this.executeOnTempElement(
      (textArea) => {
        textArea.addEventListener("paste", handlePasteEvent);
        textArea.focus({ preventScroll: true });
      },
      (element) => {
        const data = element.value;
        if (!defaultPrevented) {
          this.processClipboardData(data);
        } else {
          this.refocusLastFocusedCell();
        }
        element.removeEventListener("paste", handlePasteEvent);
      }
    );
  }
  refocusLastFocusedCell() {
    const focusedCell = this.focusService.getFocusedCell();
    if (focusedCell) {
      this.focusService.setFocusedCell({
        rowIndex: focusedCell.rowIndex,
        column: focusedCell.column,
        rowPinned: focusedCell.rowPinned,
        forceBrowserFocus: true
      });
    }
  }
  getClipboardDelimiter() {
    const delimiter = this.gos.get("clipboardDelimiter");
    return _exists(delimiter) ? delimiter : "	";
  }
  processClipboardData(data) {
    if (data == null) {
      return;
    }
    let parsedData = _ClipboardService.stringToArray(data, this.getClipboardDelimiter());
    const userFunc = this.gos.getCallback("processDataFromClipboard");
    if (userFunc) {
      parsedData = userFunc({ data: parsedData });
    }
    if (parsedData == null) {
      return;
    }
    if (this.gos.get("suppressLastEmptyLineOnPaste")) {
      this.removeLastLineIfBlank(parsedData);
    }
    const pasteOperation = (cellsToFlash, updatedRowNodes, focusedCell, changedPath) => {
      const rangeActive = this.rangeService?.isMoreThanOneCell();
      const pasteIntoRange = rangeActive && !this.hasOnlyOneValueToPaste(parsedData);
      if (pasteIntoRange) {
        this.pasteIntoActiveRange(this.rangeService, parsedData, cellsToFlash, updatedRowNodes, changedPath);
      } else {
        this.pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath);
      }
    };
    this.doPasteOperation(pasteOperation);
  }
  // This will parse a delimited string into an array of arrays.
  static stringToArray(strData, delimiter = ",") {
    const data = [];
    const isNewline = (char) => char === "\r" || char === "\n";
    let insideQuotedField = false;
    if (strData === "") {
      return [[""]];
    }
    for (let row = 0, column = 0, position = 0; position < strData.length; position++) {
      const previousChar = strData[position - 1];
      const currentChar = strData[position];
      const nextChar = strData[position + 1];
      const ensureDataExists = () => {
        if (!data[row]) {
          data[row] = [];
        }
        if (!data[row][column]) {
          data[row][column] = "";
        }
      };
      ensureDataExists();
      if (currentChar === '"') {
        if (insideQuotedField) {
          if (nextChar === '"') {
            data[row][column] += '"';
            position++;
          } else {
            insideQuotedField = false;
          }
        } else if (previousChar === void 0 || previousChar === delimiter || isNewline(previousChar)) {
          insideQuotedField = true;
        }
      }
      if (!insideQuotedField && currentChar !== '"') {
        if (currentChar === delimiter) {
          column++;
          ensureDataExists();
          continue;
        } else if (isNewline(currentChar)) {
          column = 0;
          row++;
          ensureDataExists();
          if (currentChar === "\r" && nextChar === "\n") {
            position++;
          }
          continue;
        }
      }
      data[row][column] += currentChar;
    }
    return data;
  }
  // common code to paste operations, e.g. paste to cell, paste to range, and copy range down
  doPasteOperation(pasteOperationFunc) {
    const source = "clipboard";
    this.eventService.dispatchEvent({
      type: "pasteStart",
      source
    });
    let changedPath;
    if (this.clientSideRowModel) {
      const onlyChangedColumns = this.gos.get("aggregateOnlyChangedColumns");
      changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
    }
    const cellsToFlash = {};
    const updatedRowNodes = [];
    const focusedCell = this.focusService.getFocusedCell();
    pasteOperationFunc(cellsToFlash, updatedRowNodes, focusedCell, changedPath);
    const nodesToRefresh = [...updatedRowNodes];
    if (changedPath) {
      this.clientSideRowModel.doAggregate(changedPath);
      changedPath.forEachChangedNodeDepthFirst((rowNode) => {
        nodesToRefresh.push(rowNode);
      });
    }
    this.rowRenderer.refreshCells({ rowNodes: nodesToRefresh });
    this.dispatchFlashCells(cellsToFlash);
    this.fireRowChanged(updatedRowNodes);
    this.refocusLastFocusedCell();
    const event = {
      type: "pasteEnd",
      source
    };
    this.eventService.dispatchEvent(event);
  }
  pasteIntoActiveRange(rangeService, clipboardData, cellsToFlash, updatedRowNodes, changedPath) {
    const abortRepeatingPasteIntoRows = this.getRangeSize(rangeService) % clipboardData.length != 0;
    let indexOffset = 0;
    let dataRowIndex = 0;
    const rowCallback = (currentRow, rowNode, columns, index) => {
      const atEndOfClipboardData = index - indexOffset >= clipboardData.length;
      if (atEndOfClipboardData) {
        if (abortRepeatingPasteIntoRows) {
          return;
        }
        indexOffset += dataRowIndex;
        dataRowIndex = 0;
      }
      const currentRowData = clipboardData[index - indexOffset];
      updatedRowNodes.push(rowNode);
      const processCellFromClipboardFunc = this.gos.getCallback("processCellFromClipboard");
      columns.forEach((column, idx) => {
        if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
          return;
        }
        if (idx >= currentRowData.length) {
          idx = idx % currentRowData.length;
        }
        const newValue = this.processCell(
          rowNode,
          column,
          currentRowData[idx],
          EXPORT_TYPE_DRAG_COPY,
          processCellFromClipboardFunc,
          true
        );
        rowNode.setDataValue(column, newValue, SOURCE_PASTE);
        if (changedPath) {
          changedPath.addParentNode(rowNode.parent, [column]);
        }
        const { rowIndex, rowPinned } = currentRow;
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
      });
      dataRowIndex++;
    };
    this.iterateActiveRanges(false, rowCallback);
  }
  getDisplayedColumnsStartingAt(column) {
    let currentColumn = column;
    const columns = [];
    while (currentColumn != null) {
      columns.push(currentColumn);
      currentColumn = this.visibleColsService.getColAfter(currentColumn);
    }
    return columns;
  }
  pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
    if (!focusedCell) {
      return;
    }
    const currentRow = { rowIndex: focusedCell.rowIndex, rowPinned: focusedCell.rowPinned };
    const columnsToPasteInto = this.getDisplayedColumnsStartingAt(focusedCell.column);
    if (this.isPasteSingleValueIntoRange(parsedData)) {
      this.pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath);
    } else {
      this.pasteMultipleValues(
        parsedData,
        currentRow,
        updatedRowNodes,
        columnsToPasteInto,
        cellsToFlash,
        EXPORT_TYPE_CLIPBOARD,
        changedPath
      );
    }
  }
  // if range is active, and only one cell, then we paste this cell into all cells in the active range.
  isPasteSingleValueIntoRange(parsedData) {
    return this.hasOnlyOneValueToPaste(parsedData) && this.rangeService != null && !this.rangeService.isEmpty();
  }
  pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath) {
    const value = parsedData[0][0];
    const rowCallback = (currentRow, rowNode, columns) => {
      updatedRowNodes.push(rowNode);
      columns.forEach(
        (column) => this.updateCellValue(rowNode, column, value, cellsToFlash, EXPORT_TYPE_CLIPBOARD, changedPath)
      );
    };
    this.iterateActiveRanges(false, rowCallback);
  }
  hasOnlyOneValueToPaste(parsedData) {
    return parsedData.length === 1 && parsedData[0].length === 1;
  }
  copyRangeDown() {
    if (!this.rangeService || this.rangeService.isEmpty()) {
      return;
    }
    const firstRowValues = [];
    const pasteOperation = (cellsToFlash, updatedRowNodes, focusedCell, changedPath) => {
      const processCellForClipboardFunc = this.gos.getCallback("processCellForClipboard");
      const processCellFromClipboardFunc = this.gos.getCallback("processCellFromClipboard");
      const rowCallback = (currentRow, rowNode, columns) => {
        if (!firstRowValues.length) {
          columns.forEach((column) => {
            const value = this.processCell(
              rowNode,
              column,
              this.valueService.getValue(column, rowNode),
              EXPORT_TYPE_DRAG_COPY,
              processCellForClipboardFunc,
              false,
              true
            );
            firstRowValues.push(value);
          });
        } else {
          updatedRowNodes.push(rowNode);
          columns.forEach((column, index) => {
            if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
              return;
            }
            const firstRowValue = this.processCell(
              rowNode,
              column,
              firstRowValues[index],
              EXPORT_TYPE_DRAG_COPY,
              processCellFromClipboardFunc,
              true
            );
            rowNode.setDataValue(column, firstRowValue, SOURCE_PASTE);
            if (changedPath) {
              changedPath.addParentNode(rowNode.parent, [column]);
            }
            const { rowIndex, rowPinned } = currentRow;
            const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
            cellsToFlash[cellId] = true;
          });
        }
      };
      this.iterateActiveRanges(true, rowCallback);
    };
    this.doPasteOperation(pasteOperation);
  }
  removeLastLineIfBlank(parsedData) {
    const lastLine = _last(parsedData);
    const lastLineIsBlank = lastLine && lastLine.length === 1 && lastLine[0] === "";
    if (lastLineIsBlank) {
      if (parsedData.length === 1) {
        return;
      }
      _removeFromArray(parsedData, lastLine);
    }
  }
  fireRowChanged(rowNodes) {
    if (this.gos.get("editType") !== "fullRow") {
      return;
    }
    rowNodes.forEach((rowNode) => {
      const event = {
        type: "rowValueChanged",
        node: rowNode,
        data: rowNode.data,
        rowIndex: rowNode.rowIndex,
        rowPinned: rowNode.rowPinned
      };
      this.eventService.dispatchEvent(event);
    });
  }
  pasteMultipleValues(clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, type, changedPath) {
    let rowPointer = currentRow;
    const skipGroupRows = this.clientSideRowModel != null && !this.gos.get("enableGroupEdit") && !this.gos.get("treeData");
    const getNextGoodRowNode = () => {
      while (true) {
        if (!rowPointer) {
          return null;
        }
        const res = this.rowPositionUtils.getRowNode(rowPointer);
        rowPointer = this.cellNavigationService.getRowBelow({
          rowPinned: rowPointer.rowPinned,
          rowIndex: rowPointer.rowIndex
        });
        if (res == null) {
          return null;
        }
        const skipRow = res.detail || res.footer || skipGroupRows && res.group;
        if (!skipRow) {
          return res;
        }
      }
    };
    clipboardGridData.forEach((clipboardRowData) => {
      const rowNode = getNextGoodRowNode();
      if (!rowNode) {
        return;
      }
      clipboardRowData.forEach(
        (value, index) => this.updateCellValue(rowNode, columnsToPasteInto[index], value, cellsToFlash, type, changedPath)
      );
      updatedRowNodes.push(rowNode);
    });
  }
  updateCellValue(rowNode, column, value, cellsToFlash, type, changedPath) {
    if (!rowNode || !column || !column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
      return;
    }
    if (rowNode.group && column.isValueActive()) {
      return;
    }
    const processedValue = this.processCell(
      rowNode,
      column,
      value,
      type,
      this.gos.getCallback("processCellFromClipboard"),
      true
    );
    rowNode.setDataValue(column, processedValue, SOURCE_PASTE);
    const { rowIndex, rowPinned } = rowNode;
    const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
    cellsToFlash[cellId] = true;
    if (changedPath) {
      changedPath.addParentNode(rowNode.parent, [column]);
    }
  }
  copyToClipboard(params = {}) {
    this.copyOrCutToClipboard(params);
  }
  cutToClipboard(params = {}, source = "api") {
    if (this.gos.get("suppressCutToClipboard")) {
      return;
    }
    const startEvent = {
      type: "cutStart",
      source
    };
    this.eventService.dispatchEvent(startEvent);
    this.copyOrCutToClipboard(params, true);
    const endEvent = {
      type: "cutEnd",
      source
    };
    this.eventService.dispatchEvent(endEvent);
  }
  copyOrCutToClipboard(params, cut) {
    let { includeHeaders, includeGroupHeaders } = params;
    if (includeHeaders == null) {
      includeHeaders = this.gos.get("copyHeadersToClipboard");
    }
    if (includeGroupHeaders == null) {
      includeGroupHeaders = this.gos.get("copyGroupHeadersToClipboard");
    }
    const copyParams = { includeHeaders, includeGroupHeaders };
    const shouldCopyRows = !this.gos.get("suppressCopyRowsToClipboard");
    let cellClearType = null;
    if (this.rangeService && !this.rangeService.isEmpty() && !this.shouldSkipSingleCellRange(this.rangeService)) {
      this.copySelectedRangeToClipboard(copyParams);
      cellClearType = 0 /* CellRange */;
    } else if (shouldCopyRows && !this.selectionService.isEmpty()) {
      this.copySelectedRowsToClipboard(copyParams);
      cellClearType = 1 /* SelectedRows */;
    } else if (this.focusService.isAnyCellFocused()) {
      this.copyFocusedCellToClipboard(copyParams);
      cellClearType = 2 /* FocusedCell */;
    }
    if (cut && cellClearType !== null) {
      this.clearCellsAfterCopy(cellClearType);
    }
  }
  clearCellsAfterCopy(type) {
    this.eventService.dispatchEvent({ type: "keyShortcutChangedCellStart" });
    if (type === 0 /* CellRange */) {
      this.rangeService.clearCellRangeCellValues({ cellEventSource: "clipboardService" });
    } else if (type === 1 /* SelectedRows */) {
      this.clearSelectedRows();
    } else {
      const focusedCell = this.focusService.getFocusedCell();
      if (focusedCell == null) {
        return;
      }
      const rowNode = this.rowPositionUtils.getRowNode(focusedCell);
      if (rowNode) {
        this.clearCellValue(rowNode, focusedCell.column);
      }
    }
    this.eventService.dispatchEvent({ type: "keyShortcutChangedCellEnd" });
  }
  clearSelectedRows() {
    const selected = this.selectionService.getSelectedNodes();
    const columns = this.visibleColsService.getAllCols();
    for (const row of selected) {
      for (const col of columns) {
        this.clearCellValue(row, col);
      }
    }
  }
  clearCellValue(rowNode, column) {
    if (!column.isCellEditable(rowNode)) {
      return;
    }
    const emptyValue = this.valueService.parseValue(column, rowNode, "", rowNode.getValueFromValueService(column)) ?? null;
    rowNode.setDataValue(column, emptyValue, "clipboardService");
  }
  shouldSkipSingleCellRange(rangeService) {
    return this.gos.get("suppressCopySingleCellRanges") && !rangeService.isMoreThanOneCell();
  }
  iterateActiveRanges(onlyFirst, rowCallback, columnCallback) {
    if (!this.rangeService || this.rangeService.isEmpty()) {
      return;
    }
    const cellRanges = this.rangeService.getCellRanges();
    if (onlyFirst) {
      this.iterateActiveRange(cellRanges[0], rowCallback, columnCallback, true);
    } else {
      cellRanges.forEach(
        (range, idx) => this.iterateActiveRange(range, rowCallback, columnCallback, idx === cellRanges.length - 1)
      );
    }
  }
  iterateActiveRange(range, rowCallback, columnCallback, isLastRange) {
    if (!this.rangeService) {
      return;
    }
    let currentRow = this.rangeService.getRangeStartRow(range);
    const lastRow = this.rangeService.getRangeEndRow(range);
    if (columnCallback && range.columns) {
      columnCallback(range.columns);
    }
    let rangeIndex = 0;
    let isLastRow = false;
    while (!isLastRow && currentRow != null) {
      const rowNode = this.rowPositionUtils.getRowNode(currentRow);
      isLastRow = this.rowPositionUtils.sameRow(currentRow, lastRow);
      rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
      currentRow = this.cellNavigationService.getRowBelow(currentRow);
    }
  }
  copySelectedRangeToClipboard(params = {}) {
    if (!this.rangeService || this.rangeService.isEmpty()) {
      return;
    }
    const allRangesMerge = this.rangeService.areAllRangesAbleToMerge();
    const { data, cellsToFlash } = allRangesMerge ? this.buildDataFromMergedRanges(this.rangeService, params) : this.buildDataFromRanges(this.rangeService, params);
    this.copyDataToClipboard(data);
    this.dispatchFlashCells(cellsToFlash);
  }
  buildDataFromMergedRanges(rangeService, params) {
    const columnsSet = /* @__PURE__ */ new Set();
    const ranges = rangeService.getCellRanges();
    const rowPositionsMap = /* @__PURE__ */ new Map();
    const allRowPositions = [];
    const allCellsToFlash = {};
    ranges.forEach((range) => {
      range.columns.forEach((col) => columnsSet.add(col));
      const { rowPositions, cellsToFlash } = this.getRangeRowPositionsAndCellsToFlash(rangeService, range);
      rowPositions.forEach((rowPosition) => {
        const rowPositionAsString = `${rowPosition.rowIndex}-${rowPosition.rowPinned || "null"}`;
        if (!rowPositionsMap.get(rowPositionAsString)) {
          rowPositionsMap.set(rowPositionAsString, true);
          allRowPositions.push(rowPosition);
        }
      });
      Object.assign(allCellsToFlash, cellsToFlash);
    });
    const allColumns = this.visibleColsService.getAllCols();
    const exportedColumns = Array.from(columnsSet);
    exportedColumns.sort((a, b) => {
      const posA = allColumns.indexOf(a);
      const posB = allColumns.indexOf(b);
      return posA - posB;
    });
    const data = this.buildExportParams({
      columns: exportedColumns,
      rowPositions: allRowPositions,
      includeHeaders: params.includeHeaders,
      includeGroupHeaders: params.includeGroupHeaders
    });
    return { data, cellsToFlash: allCellsToFlash };
  }
  buildDataFromRanges(rangeService, params) {
    const ranges = rangeService.getCellRanges();
    const data = [];
    const allCellsToFlash = {};
    ranges.forEach((range) => {
      const { rowPositions, cellsToFlash } = this.getRangeRowPositionsAndCellsToFlash(rangeService, range);
      Object.assign(allCellsToFlash, cellsToFlash);
      data.push(
        this.buildExportParams({
          columns: range.columns,
          rowPositions,
          includeHeaders: params.includeHeaders,
          includeGroupHeaders: params.includeGroupHeaders
        })
      );
    });
    return { data: data.join("\n"), cellsToFlash: allCellsToFlash };
  }
  getRangeRowPositionsAndCellsToFlash(rangeService, range) {
    const rowPositions = [];
    const cellsToFlash = {};
    const startRow = rangeService.getRangeStartRow(range);
    const lastRow = rangeService.getRangeEndRow(range);
    let node = startRow;
    while (node) {
      rowPositions.push(node);
      range.columns.forEach((column) => {
        const { rowIndex, rowPinned } = node;
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
      });
      if (this.rowPositionUtils.sameRow(node, lastRow)) {
        break;
      }
      node = this.cellNavigationService.getRowBelow(node);
    }
    return { rowPositions, cellsToFlash };
  }
  getCellsToFlashFromRowNodes(rowNodes) {
    const allDisplayedColumns = this.visibleColsService.getAllCols();
    const cellsToFlash = {};
    for (let i = 0; i < rowNodes.length; i++) {
      const { rowIndex, rowPinned } = rowNodes[i];
      if (rowIndex == null) {
        continue;
      }
      for (let j = 0; j < allDisplayedColumns.length; j++) {
        const column = allDisplayedColumns[j];
        const cellId = this.cellPositionUtils.createIdFromValues({ rowIndex, column, rowPinned });
        cellsToFlash[cellId] = true;
      }
    }
    return cellsToFlash;
  }
  copyFocusedCellToClipboard(params = {}) {
    const focusedCell = this.focusService.getFocusedCell();
    if (focusedCell == null) {
      return;
    }
    const cellId = this.cellPositionUtils.createId(focusedCell);
    const currentRow = { rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex };
    const column = focusedCell.column;
    const data = this.buildExportParams({
      columns: [column],
      rowPositions: [currentRow],
      includeHeaders: params.includeHeaders,
      includeGroupHeaders: params.includeGroupHeaders
    });
    this.copyDataToClipboard(data);
    this.dispatchFlashCells({ [cellId]: true });
  }
  copySelectedRowsToClipboard(params = {}) {
    const { columnKeys, includeHeaders, includeGroupHeaders } = params;
    const data = this.buildExportParams({
      columns: columnKeys,
      includeHeaders,
      includeGroupHeaders
    });
    this.copyDataToClipboard(data);
    const rowNodes = this.selectionService.getSelectedNodes() || [];
    this.dispatchFlashCells(this.getCellsToFlashFromRowNodes(rowNodes));
  }
  buildExportParams(params) {
    const { columns, rowPositions, includeHeaders = false, includeGroupHeaders = false } = params;
    const exportParams = {
      columnKeys: columns,
      rowPositions,
      skipColumnHeaders: !includeHeaders,
      skipColumnGroupHeaders: !includeGroupHeaders,
      suppressQuotes: true,
      columnSeparator: this.getClipboardDelimiter(),
      onlySelected: !rowPositions,
      processCellCallback: this.gos.getCallback("processCellForClipboard"),
      processRowGroupCallback: (params2) => this.processRowGroupCallback(params2),
      processHeaderCallback: this.gos.getCallback("processHeaderForClipboard"),
      processGroupHeaderCallback: this.gos.getCallback("processGroupHeaderForClipboard")
    };
    return this.csvCreator.getDataAsCsv(exportParams, true);
  }
  processRowGroupCallback(params) {
    const { node, column } = params;
    const isTreeData = this.gos.get("treeData");
    const isSuppressGroupMaintainValueType = this.gos.get("suppressGroupMaintainValueType");
    const getValueFromNode = () => {
      if (isTreeData || isSuppressGroupMaintainValueType || !column) {
        return node.key;
      }
      const value2 = node.groupData?.[column.getId()];
      if (!value2 || !node.rowGroupColumn || node.rowGroupColumn.getColDef().useValueFormatterForExport === false) {
        return value2;
      }
      return this.valueService.formatValue(node.rowGroupColumn, node, value2) ?? value2;
    };
    let value = getValueFromNode();
    if (params.node.footer) {
      let suffix = "";
      if (value && value.length) {
        suffix = ` ${value}`;
      }
      value = `Total${suffix}`;
    }
    const processCellForClipboard = this.gos.getCallback("processCellForClipboard");
    if (processCellForClipboard) {
      let column2 = node.rowGroupColumn;
      if (!column2 && node.footer && node.level === -1) {
        column2 = this.funcColsService.getRowGroupColumns()[0];
      }
      return processCellForClipboard({
        value,
        node,
        column: column2,
        type: "clipboard",
        formatValue: (valueToFormat) => this.valueService.formatValue(column2, node, valueToFormat) ?? valueToFormat,
        parseValue: (valueToParse) => this.valueService.parseValue(column2, node, valueToParse, this.valueService.getValue(column2, node))
      });
    }
    return value;
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  dispatchFlashCells(cellsToFlash) {
    window.setTimeout(() => {
      const event = {
        type: "flashCells",
        cells: cellsToFlash
      };
      this.eventService.dispatchEvent(event);
    }, 0);
  }
  processCell(rowNode, column, value, type, func, canParse, canFormat) {
    if (func) {
      const params = {
        column,
        node: rowNode,
        value,
        type,
        formatValue: (valueToFormat) => this.valueService.formatValue(column, rowNode ?? null, valueToFormat) ?? valueToFormat,
        parseValue: (valueToParse) => this.valueService.parseValue(
          column,
          rowNode ?? null,
          valueToParse,
          this.valueService.getValue(column, rowNode)
        )
      };
      return func(params);
    }
    if (canParse && column.getColDef().useValueParserForImport !== false) {
      return this.valueService.parseValue(
        column,
        rowNode ?? null,
        value,
        this.valueService.getValue(column, rowNode)
      );
    }
    if (canFormat && column.getColDef().useValueFormatterForExport !== false) {
      return this.valueService.formatValue(column, rowNode ?? null, value) ?? value;
    }
    return value;
  }
  copyDataToClipboard(data) {
    const userProvidedFunc = this.gos.getCallback("sendToClipboard");
    if (userProvidedFunc) {
      userProvidedFunc({ data });
      return;
    }
    const allowNavigator = !this.gos.get("suppressClipboardApi");
    if (allowNavigator && navigator.clipboard) {
      navigator.clipboard.writeText(data).catch((e) => {
        _warnOnce(`${e}
${apiError("writeText")}`);
        this.copyDataToClipboardLegacy(data);
      });
      return;
    }
    this.copyDataToClipboardLegacy(data);
  }
  copyDataToClipboardLegacy(data) {
    this.executeOnTempElement((element) => {
      const eDocument = this.gos.getDocument();
      const focusedElementBefore = this.gos.getActiveDomElement();
      element.value = data || " ";
      element.select();
      element.focus({ preventScroll: true });
      const result = eDocument.execCommand("copy");
      if (!result) {
        _warnOnce(
          "Browser did not allow document.execCommand('copy'). Ensure api.copySelectedRowsToClipboard() is invoked via a user event, i.e. button click, otherwise the browser will prevent it for security reasons."
        );
      }
      if (focusedElementBefore != null && focusedElementBefore.focus != null) {
        focusedElementBefore.focus({ preventScroll: true });
      }
    });
  }
  executeOnTempElement(callbackNow, callbackAfter) {
    const eDoc = this.gos.getDocument();
    const eTempInput = eDoc.createElement("textarea");
    eTempInput.style.width = "1px";
    eTempInput.style.height = "1px";
    eTempInput.style.top = eDoc.documentElement.scrollTop + "px";
    eTempInput.style.left = eDoc.documentElement.scrollLeft + "px";
    eTempInput.style.position = "absolute";
    eTempInput.style.opacity = "0";
    const guiRoot = this.gridCtrl.getGui();
    guiRoot.appendChild(eTempInput);
    try {
      callbackNow(eTempInput);
    } catch (err) {
      _warnOnce("Browser does not support document.execCommand('copy') for clipboard operations");
    }
    if (callbackAfter) {
      window.setTimeout(() => {
        callbackAfter(eTempInput);
        guiRoot.removeChild(eTempInput);
      }, 100);
    } else {
      guiRoot.removeChild(eTempInput);
    }
  }
  getRangeSize(rangeService) {
    const ranges = rangeService.getCellRanges();
    let startRangeIndex = 0;
    let endRangeIndex = 0;
    if (ranges.length > 0) {
      startRangeIndex = rangeService.getRangeStartRow(ranges[0]).rowIndex;
      endRangeIndex = rangeService.getRangeEndRow(ranges[0]).rowIndex;
    }
    return startRangeIndex - endRangeIndex + 1;
  }
};

// enterprise-modules/clipboard/src/version.ts
var VERSION = "32.0.0";

// enterprise-modules/clipboard/src/clipboardModule.ts
var ClipboardCoreModule = {
  version: VERSION,
  moduleName: `${ModuleNames.ClipboardModule}-core`,
  beans: [ClipboardService],
  dependantModules: [EnterpriseCoreModule, CsvExportModule]
};
var ClipboardApiModule = {
  version: VERSION,
  moduleName: `${ModuleNames.ClipboardModule}-api`,
  apiFunctions: {
    copyToClipboard,
    cutToClipboard,
    copySelectedRowsToClipboard,
    copySelectedRangeToClipboard,
    copySelectedRangeDown,
    pasteFromClipboard
  },
  dependantModules: [ClipboardCoreModule]
};
var ClipboardModule = {
  version: VERSION,
  moduleName: ModuleNames.ClipboardModule,
  dependantModules: [ClipboardCoreModule, ClipboardApiModule]
};
export {
  ClipboardModule
};
//# sourceMappingURL=main.esm.mjs.map
