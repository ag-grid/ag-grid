/**
          * @ag-grid-enterprise/clipboard - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.1.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');
var csvExport = require('@ag-grid-community/csv-export');

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClipboardService = /** @class */ (function (_super) {
    __extends(ClipboardService, _super);
    function ClipboardService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastPasteOperationTime = 0;
        _this.navigatorApiFailed = false;
        return _this;
    }
    ClipboardService.prototype.init = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('ClipboardService');
        if (this.rowModel.getType() === core.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
        this.ctrlsService.whenReady(function (p) {
            _this.gridCtrl = p.gridCtrl;
        });
    };
    ClipboardService.prototype.pasteFromClipboard = function () {
        var _this = this;
        this.logger.log('pasteFromClipboard');
        // Method 1 - native clipboard API, available in modern chrome browsers
        var allowNavigator = !this.gridOptionsWrapper.isSuppressClipboardApi();
        // Some browsers (Firefox) do not allow Web Applications to read from
        // the clipboard so verify if not only the ClipboardAPI is available,
        // but also if the `readText` method is public.
        if (allowNavigator && !this.navigatorApiFailed && navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
                .then(this.processClipboardData.bind(this))
                .catch(function (e) {
                core._.doOnce(function () {
                    console.warn(e);
                    console.warn('AG Grid: Unable to use the Clipboard API (navigator.clipboard.readText()). ' +
                        'The reason why it could not be used has been logged in the previous line. ' +
                        'For this reason the grid has defaulted to using a workaround which doesn\'t perform as well. ' +
                        'Either fix why Clipboard API is blocked, OR stop this message from appearing by setting grid ' +
                        'property suppressClipboardApi=true (which will default the grid to using the workaround rather than the API');
                }, 'clipboardApiError');
                _this.navigatorApiFailed = true;
                _this.pasteFromClipboardLegacy();
            });
        }
        else {
            this.pasteFromClipboardLegacy();
        }
    };
    ClipboardService.prototype.pasteFromClipboardLegacy = function () {
        var _this = this;
        // Method 2 - if modern API fails, the old school hack
        var defaultPrevented = false;
        var handlePasteEvent = function (e) {
            var currentPastOperationTime = (new Date()).getTime();
            if (currentPastOperationTime - _this.lastPasteOperationTime < 50) {
                defaultPrevented = true;
                e.preventDefault();
            }
            _this.lastPasteOperationTime = currentPastOperationTime;
        };
        this.executeOnTempElement(function (textArea) {
            textArea.addEventListener('paste', handlePasteEvent);
            textArea.focus({ preventScroll: true });
        }, function (element) {
            var data = element.value;
            if (!defaultPrevented) {
                _this.processClipboardData(data);
            }
            else {
                _this.refocusLastFocusedCell();
            }
            element.removeEventListener('paste', handlePasteEvent);
        });
    };
    ClipboardService.prototype.refocusLastFocusedCell = function () {
        var focusedCell = this.focusService.getFocusedCell();
        if (focusedCell) {
            this.focusService.setFocusedCell({
                rowIndex: focusedCell.rowIndex,
                column: focusedCell.column,
                rowPinned: focusedCell.rowPinned,
                forceBrowserFocus: true
            });
        }
    };
    ClipboardService.prototype.processClipboardData = function (data) {
        var _this = this;
        if (data == null) {
            return;
        }
        var parsedData = core._.stringToArray(data, this.gridOptionsWrapper.getClipboardDelimiter());
        var userFunc = this.gridOptionsWrapper.getProcessDataFromClipboardFunc();
        if (userFunc) {
            parsedData = userFunc({ data: parsedData });
        }
        if (parsedData == null) {
            return;
        }
        if (this.gridOptionsWrapper.isSuppressLastEmptyLineOnPaste()) {
            this.removeLastLineIfBlank(parsedData);
        }
        var pasteOperation = function (cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
            var rangeActive = _this.rangeService && _this.rangeService.isMoreThanOneCell();
            var pasteIntoRange = rangeActive && !_this.hasOnlyOneValueToPaste(parsedData);
            if (pasteIntoRange) {
                _this.pasteIntoActiveRange(parsedData, cellsToFlash, updatedRowNodes, changedPath);
            }
            else {
                _this.pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath);
            }
        };
        this.doPasteOperation(pasteOperation);
    };
    // common code to paste operations, e.g. paste to cell, paste to range, and copy range down
    ClipboardService.prototype.doPasteOperation = function (pasteOperationFunc) {
        var api = this.gridOptionsWrapper.getApi();
        var columnApi = this.gridOptionsWrapper.getColumnApi();
        var source = 'clipboard';
        this.eventService.dispatchEvent({
            type: core.Events.EVENT_PASTE_START,
            api: api,
            columnApi: columnApi,
            source: source
        });
        var changedPath;
        if (this.clientSideRowModel) {
            var onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            changedPath = new core.ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
        }
        var cellsToFlash = {};
        var updatedRowNodes = [];
        var focusedCell = this.focusService.getFocusedCell();
        pasteOperationFunc(cellsToFlash, updatedRowNodes, focusedCell, changedPath);
        if (changedPath) {
            this.clientSideRowModel.doAggregate(changedPath);
        }
        this.rowRenderer.refreshCells();
        this.dispatchFlashCells(cellsToFlash);
        this.fireRowChanged(updatedRowNodes);
        // if using the clipboard hack with a temp element, then the focus has been lost,
        // so need to put it back. otherwise paste operation loosed focus on cell and keyboard
        // navigation stops.
        this.refocusLastFocusedCell();
        var event = {
            type: core.Events.EVENT_PASTE_END,
            source: source
        };
        this.eventService.dispatchEvent(event);
    };
    ClipboardService.prototype.pasteIntoActiveRange = function (clipboardData, cellsToFlash, updatedRowNodes, changedPath) {
        var _this = this;
        // true if clipboard data can be evenly pasted into range, otherwise false
        var abortRepeatingPasteIntoRows = this.getRangeSize() % clipboardData.length != 0;
        var indexOffset = 0;
        var dataRowIndex = 0;
        var rowCallback = function (currentRow, rowNode, columns, index) {
            var atEndOfClipboardData = index - indexOffset >= clipboardData.length;
            if (atEndOfClipboardData) {
                if (abortRepeatingPasteIntoRows) {
                    return;
                }
                // increment offset and reset data index to repeat paste of data
                indexOffset += dataRowIndex;
                dataRowIndex = 0;
            }
            var currentRowData = clipboardData[index - indexOffset];
            // otherwise we are not the first row, so copy
            updatedRowNodes.push(rowNode);
            var processCellFromClipboardFunc = _this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
            columns.forEach(function (column, idx) {
                if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
                    return;
                }
                // repeat data for columns we don't have data for - happens when to range is bigger than copied data range
                if (idx >= currentRowData.length) {
                    idx = idx % currentRowData.length;
                }
                var newValue = _this.processCell(rowNode, column, currentRowData[idx], core.Constants.EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc);
                rowNode.setDataValue(column, newValue, core.Constants.SOURCE_PASTE);
                if (changedPath) {
                    changedPath.addParentNode(rowNode.parent, [column]);
                }
                var cellId = _this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
                cellsToFlash[cellId] = true;
            });
            dataRowIndex++;
        };
        this.iterateActiveRanges(false, rowCallback);
    };
    ClipboardService.prototype.pasteStartingFromFocusedCell = function (parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
        if (!focusedCell) {
            return;
        }
        var currentRow = { rowIndex: focusedCell.rowIndex, rowPinned: focusedCell.rowPinned };
        var columnsToPasteInto = this.columnModel.getDisplayedColumnsStartingAt(focusedCell.column);
        if (this.isPasteSingleValueIntoRange(parsedData)) {
            this.pasteSingleValueIntoRange(parsedData, updatedRowNodes, cellsToFlash, changedPath);
        }
        else {
            this.pasteMultipleValues(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, core.Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
        }
    };
    // if range is active, and only one cell, then we paste this cell into all cells in the active range.
    ClipboardService.prototype.isPasteSingleValueIntoRange = function (parsedData) {
        return this.hasOnlyOneValueToPaste(parsedData)
            && this.rangeService != null
            && !this.rangeService.isEmpty();
    };
    ClipboardService.prototype.pasteSingleValueIntoRange = function (parsedData, updatedRowNodes, cellsToFlash, changedPath) {
        var _this = this;
        var value = parsedData[0][0];
        var rowCallback = function (currentRow, rowNode, columns) {
            updatedRowNodes.push(rowNode);
            columns.forEach(function (column) {
                return _this.updateCellValue(rowNode, column, value, cellsToFlash, core.Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
            });
        };
        this.iterateActiveRanges(false, rowCallback);
    };
    ClipboardService.prototype.hasOnlyOneValueToPaste = function (parsedData) {
        return parsedData.length === 1 && parsedData[0].length === 1;
    };
    ClipboardService.prototype.copyRangeDown = function () {
        var _this = this;
        if (!this.rangeService || this.rangeService.isEmpty()) {
            return;
        }
        var firstRowValues = [];
        var pasteOperation = function (cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
            var processCellForClipboardFunc = _this.gridOptionsWrapper.getProcessCellForClipboardFunc();
            var processCellFromClipboardFunc = _this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
            var rowCallback = function (currentRow, rowNode, columns) {
                // take reference of first row, this is the one we will be using to copy from
                if (!firstRowValues.length) {
                    // two reasons for looping through columns
                    columns.forEach(function (column) {
                        // get the initial values to copy down
                        var value = _this.processCell(rowNode, column, _this.valueService.getValue(column, rowNode), core.Constants.EXPORT_TYPE_DRAG_COPY, processCellForClipboardFunc);
                        firstRowValues.push(value);
                    });
                }
                else {
                    // otherwise we are not the first row, so copy
                    updatedRowNodes.push(rowNode);
                    columns.forEach(function (column, index) {
                        if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
                            return;
                        }
                        var firstRowValue = _this.processCell(rowNode, column, firstRowValues[index], core.Constants.EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc);
                        rowNode.setDataValue(column, firstRowValue, core.Constants.SOURCE_PASTE);
                        if (changedPath) {
                            changedPath.addParentNode(rowNode.parent, [column]);
                        }
                        var cellId = _this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
                        cellsToFlash[cellId] = true;
                    });
                }
            };
            _this.iterateActiveRanges(true, rowCallback);
        };
        this.doPasteOperation(pasteOperation);
    };
    ClipboardService.prototype.removeLastLineIfBlank = function (parsedData) {
        // remove last row if empty, excel puts empty last row in
        var lastLine = core._.last(parsedData);
        var lastLineIsBlank = lastLine && lastLine.length === 1 && lastLine[0] === '';
        if (lastLineIsBlank) {
            // do not remove the last empty line when that is the only line pasted
            if (parsedData.length === 1) {
                return;
            }
            core._.removeFromArray(parsedData, lastLine);
        }
    };
    ClipboardService.prototype.fireRowChanged = function (rowNodes) {
        var _this = this;
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            return;
        }
        rowNodes.forEach(function (rowNode) {
            var event = {
                type: core.Events.EVENT_ROW_VALUE_CHANGED,
                node: rowNode,
                data: rowNode.data,
                rowIndex: rowNode.rowIndex,
                rowPinned: rowNode.rowPinned
            };
            _this.eventService.dispatchEvent(event);
        });
    };
    ClipboardService.prototype.pasteMultipleValues = function (clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, type, changedPath) {
        var _this = this;
        var rowPointer = currentRow;
        // if doing CSRM and NOT tree data, then it means groups are aggregates, which are read only,
        // so we should skip them when doing paste operations.
        var skipGroupRows = this.clientSideRowModel != null && !this.gridOptionsWrapper.isTreeData();
        var getNextGoodRowNode = function () {
            while (true) {
                if (!rowPointer) {
                    return null;
                }
                var res = _this.rowPositionUtils.getRowNode(rowPointer);
                // move to next row down for next set of values
                rowPointer = _this.cellNavigationService.getRowBelow({ rowPinned: rowPointer.rowPinned, rowIndex: rowPointer.rowIndex });
                // if no more rows, return null
                if (res == null) {
                    return null;
                }
                // skip details rows and footer rows, never paste into them as they don't hold data
                var skipRow = res.detail || res.footer || (skipGroupRows && res.group);
                // skipping row means we go into the next iteration of the while loop
                if (!skipRow) {
                    return res;
                }
            }
        };
        clipboardGridData.forEach(function (clipboardRowData) {
            var rowNode = getNextGoodRowNode();
            // if we have come to end of rows in grid, then skip
            if (!rowNode) {
                return;
            }
            clipboardRowData.forEach(function (value, index) {
                return _this.updateCellValue(rowNode, columnsToPasteInto[index], value, cellsToFlash, type, changedPath);
            });
            updatedRowNodes.push(rowNode);
        });
    };
    ClipboardService.prototype.updateCellValue = function (rowNode, column, value, cellsToFlash, type, changedPath) {
        if (!rowNode ||
            !column ||
            !column.isCellEditable(rowNode) ||
            column.isSuppressPaste(rowNode)) {
            return;
        }
        var processedValue = this.processCell(rowNode, column, value, type, this.gridOptionsWrapper.getProcessCellFromClipboardFunc());
        rowNode.setDataValue(column, processedValue, core.Constants.SOURCE_PASTE);
        var cellId = this.cellPositionUtils.createIdFromValues(rowNode.rowIndex, column, rowNode.rowPinned);
        cellsToFlash[cellId] = true;
        if (changedPath) {
            changedPath.addParentNode(rowNode.parent, [column]);
        }
    };
    ClipboardService.prototype.copyToClipboard = function (params) {
        if (params === void 0) { params = {}; }
        var includeHeaders = params.includeHeaders, includeGroupHeaders = params.includeGroupHeaders;
        this.logger.log("copyToClipboard: includeHeaders = " + includeHeaders);
        // don't override 'includeHeaders' if it has been explicitly set to 'false'
        if (includeHeaders == null) {
            includeHeaders = this.gridOptionsWrapper.isCopyHeadersToClipboard();
        }
        if (includeGroupHeaders == null) {
            includeGroupHeaders = this.gridOptionsWrapper.isCopyGroupHeadersToClipboard();
        }
        var copyParams = { includeHeaders: includeHeaders, includeGroupHeaders: includeGroupHeaders };
        var shouldCopyRows = !this.gridOptionsWrapper.isSuppressCopyRowsToClipboard();
        // Copy priority is Range > Row > Focus
        if (this.rangeService && !this.rangeService.isEmpty() && !this.shouldSkipSingleCellRange()) {
            this.copySelectedRangeToClipboard(copyParams);
        }
        else if (shouldCopyRows && !this.selectionService.isEmpty()) {
            this.copySelectedRowsToClipboard(copyParams);
        }
        else if (this.focusService.isAnyCellFocused()) {
            this.copyFocusedCellToClipboard(copyParams);
        }
    };
    ClipboardService.prototype.shouldSkipSingleCellRange = function () {
        return this.gridOptionsWrapper.isSuppressCopySingleCellRanges() && !this.rangeService.isMoreThanOneCell();
    };
    ClipboardService.prototype.iterateActiveRanges = function (onlyFirst, rowCallback, columnCallback) {
        var _this = this;
        if (!this.rangeService || this.rangeService.isEmpty()) {
            return;
        }
        var cellRanges = this.rangeService.getCellRanges();
        if (onlyFirst) {
            this.iterateActiveRange(cellRanges[0], rowCallback, columnCallback, true);
        }
        else {
            cellRanges.forEach(function (range, idx) { return _this.iterateActiveRange(range, rowCallback, columnCallback, idx === cellRanges.length - 1); });
        }
    };
    ClipboardService.prototype.iterateActiveRange = function (range, rowCallback, columnCallback, isLastRange) {
        if (!this.rangeService) {
            return;
        }
        var currentRow = this.rangeService.getRangeStartRow(range);
        var lastRow = this.rangeService.getRangeEndRow(range);
        if (columnCallback && range.columns) {
            columnCallback(range.columns);
        }
        var rangeIndex = 0;
        var isLastRow = false;
        // the currentRow could be missing if the user sets the active range manually, and sets a range
        // that is outside of the grid (eg. sets range rows 0 to 100, but grid has only 20 rows).
        while (!isLastRow && currentRow != null) {
            var rowNode = this.rowPositionUtils.getRowNode(currentRow);
            isLastRow = this.rowPositionUtils.sameRow(currentRow, lastRow);
            rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    };
    ClipboardService.prototype.copySelectedRangeToClipboard = function (params) {
        if (params === void 0) { params = {}; }
        if (!this.rangeService || this.rangeService.isEmpty()) {
            return;
        }
        var allRangesMerge = this.rangeService.areAllRangesAbleToMerge();
        var _a = allRangesMerge ? this.buildDataFromMergedRanges(params) : this.buildDataFromRanges(params), data = _a.data, cellsToFlash = _a.cellsToFlash;
        this.copyDataToClipboard(data);
        this.dispatchFlashCells(cellsToFlash);
    };
    ClipboardService.prototype.buildDataFromMergedRanges = function (params) {
        var _this = this;
        var columnsSet = new Set();
        var ranges = this.rangeService.getCellRanges();
        var rowPositionsMap = new Map();
        var allRowPositions = [];
        var allCellsToFlash = {};
        ranges.forEach(function (range) {
            range.columns.forEach(function (col) { return columnsSet.add(col); });
            var _a = _this.getRangeRowPositionsAndCellsToFlash(range), rowPositions = _a.rowPositions, cellsToFlash = _a.cellsToFlash;
            rowPositions.forEach(function (rowPosition) {
                var rowPositionAsString = rowPosition.rowIndex + "-" + (rowPosition.rowPinned || 'null');
                if (!rowPositionsMap.get(rowPositionAsString)) {
                    rowPositionsMap.set(rowPositionAsString, true);
                    allRowPositions.push(rowPosition);
                }
            });
            Object.assign(allCellsToFlash, cellsToFlash);
        });
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var exportedColumns = Array.from(columnsSet);
        exportedColumns.sort(function (a, b) {
            var posA = allColumns.indexOf(a);
            var posB = allColumns.indexOf(b);
            return posA - posB;
        });
        var data = this.buildExportParams({
            columns: exportedColumns,
            rowPositions: allRowPositions,
            includeHeaders: params.includeHeaders,
            includeGroupHeaders: params.includeGroupHeaders,
        });
        return { data: data, cellsToFlash: allCellsToFlash };
    };
    ClipboardService.prototype.buildDataFromRanges = function (params) {
        var _this = this;
        var ranges = this.rangeService.getCellRanges();
        var data = [];
        var allCellsToFlash = {};
        ranges.forEach(function (range) {
            var _a = _this.getRangeRowPositionsAndCellsToFlash(range), rowPositions = _a.rowPositions, cellsToFlash = _a.cellsToFlash;
            Object.assign(allCellsToFlash, cellsToFlash);
            data.push(_this.buildExportParams({
                columns: range.columns,
                rowPositions: rowPositions,
                includeHeaders: params.includeHeaders,
                includeGroupHeaders: params.includeGroupHeaders,
            }));
        });
        return { data: data.join('\n'), cellsToFlash: allCellsToFlash };
    };
    ClipboardService.prototype.getRangeRowPositionsAndCellsToFlash = function (range) {
        var _this = this;
        var rowPositions = [];
        var cellsToFlash = {};
        var startRow = this.rangeService.getRangeStartRow(range);
        var lastRow = this.rangeService.getRangeEndRow(range);
        var node = startRow;
        while (node) {
            rowPositions.push(node);
            range.columns.forEach(function (column) {
                var cellId = _this.cellPositionUtils.createIdFromValues(node.rowIndex, column, node.rowPinned);
                cellsToFlash[cellId] = true;
            });
            if (this.rowPositionUtils.sameRow(node, lastRow)) {
                break;
            }
            node = this.cellNavigationService.getRowBelow(node);
        }
        return { rowPositions: rowPositions, cellsToFlash: cellsToFlash };
    };
    ClipboardService.prototype.copyFocusedCellToClipboard = function (params) {
        var _a;
        if (params === void 0) { params = {}; }
        var focusedCell = this.focusService.getFocusedCell();
        if (focusedCell == null) {
            return;
        }
        var cellId = this.cellPositionUtils.createId(focusedCell);
        var currentRow = { rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex };
        var column = focusedCell.column;
        var data = this.buildExportParams({
            columns: [column],
            rowPositions: [currentRow],
            includeHeaders: params.includeHeaders,
            includeGroupHeaders: params.includeGroupHeaders
        });
        this.copyDataToClipboard(data);
        this.dispatchFlashCells((_a = {}, _a[cellId] = true, _a));
    };
    ClipboardService.prototype.copySelectedRowsToClipboard = function (params) {
        if (params === void 0) { params = {}; }
        var columnKeys = params.columnKeys, includeHeaders = params.includeHeaders, includeGroupHeaders = params.includeGroupHeaders;
        var data = this.buildExportParams({
            columns: columnKeys,
            includeHeaders: includeHeaders,
            includeGroupHeaders: includeGroupHeaders
        });
        this.copyDataToClipboard(data);
    };
    ClipboardService.prototype.buildExportParams = function (params) {
        var columns = params.columns, rowPositions = params.rowPositions, _a = params.includeHeaders, includeHeaders = _a === void 0 ? false : _a, _b = params.includeGroupHeaders, includeGroupHeaders = _b === void 0 ? false : _b;
        var exportParams = {
            columnKeys: columns,
            rowPositions: rowPositions,
            skipColumnHeaders: !includeHeaders,
            skipColumnGroupHeaders: !includeGroupHeaders,
            suppressQuotes: true,
            columnSeparator: this.gridOptionsWrapper.getClipboardDelimiter(),
            onlySelected: !rowPositions,
            processCellCallback: this.gridOptionsWrapper.getProcessCellForClipboardFunc(),
            processRowGroupCallback: function (params) { return params.node.key; },
            processHeaderCallback: this.gridOptionsWrapper.getProcessHeaderForClipboardFunc(),
            processGroupHeaderCallback: this.gridOptionsWrapper.getProcessGroupHeaderForClipboardFunc()
        };
        return this.csvCreator.getDataAsCsv(exportParams);
    };
    ClipboardService.prototype.dispatchFlashCells = function (cellsToFlash) {
        var _this = this;
        window.setTimeout(function () {
            var event = {
                type: core.Events.EVENT_FLASH_CELLS,
                cells: cellsToFlash
            };
            _this.eventService.dispatchEvent(event);
        }, 0);
    };
    ClipboardService.prototype.processCell = function (rowNode, column, value, type, func) {
        if (func) {
            var params = {
                column: column,
                node: rowNode,
                value: value,
                type: type,
            };
            return func(params);
        }
        return value;
    };
    ClipboardService.prototype.copyDataToClipboard = function (data) {
        var _this = this;
        var userProvidedFunc = this.gridOptionsWrapper.getSendToClipboardFunc();
        // method 1 - user provided func
        if (userProvidedFunc) {
            userProvidedFunc({ data: data });
            return;
        }
        // method 2 - native clipboard API, available in modern chrome browsers
        var allowNavigator = !this.gridOptionsWrapper.isSuppressClipboardApi();
        if (allowNavigator && navigator.clipboard) {
            navigator.clipboard.writeText(data).catch(function (e) {
                core._.doOnce(function () {
                    console.warn(e);
                    console.warn('AG Grid: Unable to use the Clipboard API (navigator.clipboard.writeText()). ' +
                        'The reason why it could not be used has been logged in the previous line. ' +
                        'For this reason the grid has defaulted to using a workaround which doesn\'t perform as well. ' +
                        'Either fix why Clipboard API is blocked, OR stop this message from appearing by setting grid ' +
                        'property suppressClipboardApi=true (which will default the grid to using the workaround rather than the API.');
                }, 'clipboardApiError');
                _this.copyDataToClipboardLegacy(data);
            });
            return;
        }
        this.copyDataToClipboardLegacy(data);
    };
    ClipboardService.prototype.copyDataToClipboardLegacy = function (data) {
        var _this = this;
        // method 3 - if all else fails, the old school hack
        this.executeOnTempElement(function (element) {
            var eDocument = _this.gridOptionsWrapper.getDocument();
            var focusedElementBefore = eDocument.activeElement;
            element.value = data || ' '; // has to be non-empty value or execCommand will not do anything
            element.select();
            element.focus({ preventScroll: true });
            var result = eDocument.execCommand('copy');
            if (!result) {
                console.warn('AG Grid: Browser did not allow document.execCommand(\'copy\'). Ensure ' +
                    'api.copySelectedRowsToClipboard() is invoked via a user event, i.e. button click, otherwise ' +
                    'the browser will prevent it for security reasons.');
            }
            if (focusedElementBefore != null && focusedElementBefore.focus != null) {
                focusedElementBefore.focus({ preventScroll: true });
            }
        });
    };
    ClipboardService.prototype.executeOnTempElement = function (callbackNow, callbackAfter) {
        var eDoc = this.gridOptionsWrapper.getDocument();
        var eTempInput = eDoc.createElement('textarea');
        eTempInput.style.width = '1px';
        eTempInput.style.height = '1px';
        // removing items from the DOM causes the document element to scroll to the
        // position where the element was positioned. Here we set scrollTop / scrollLeft
        // to prevent the document element from scrolling when we remove it from the DOM.
        eTempInput.style.top = eDoc.documentElement.scrollTop + 'px';
        eTempInput.style.left = eDoc.documentElement.scrollLeft + 'px';
        eTempInput.style.position = 'absolute';
        eTempInput.style.opacity = '0';
        var guiRoot = this.gridCtrl.getGui();
        guiRoot.appendChild(eTempInput);
        try {
            callbackNow(eTempInput);
        }
        catch (err) {
            console.warn('AG Grid: Browser does not support document.execCommand(\'copy\') for clipboard operations');
        }
        //It needs 100 otherwise OS X seemed to not always be able to paste... Go figure...
        if (callbackAfter) {
            window.setTimeout(function () {
                callbackAfter(eTempInput);
                guiRoot.removeChild(eTempInput);
            }, 100);
        }
        else {
            guiRoot.removeChild(eTempInput);
        }
    };
    ClipboardService.prototype.getRangeSize = function () {
        var ranges = this.rangeService.getCellRanges();
        var startRangeIndex = 0;
        var endRangeIndex = 0;
        if (ranges.length > 0) {
            startRangeIndex = this.rangeService.getRangeStartRow(ranges[0]).rowIndex;
            endRangeIndex = this.rangeService.getRangeEndRow(ranges[0]).rowIndex;
        }
        return startRangeIndex - endRangeIndex + 1;
    };
    __decorate([
        core.Autowired('csvCreator')
    ], ClipboardService.prototype, "csvCreator", void 0);
    __decorate([
        core.Autowired('loggerFactory')
    ], ClipboardService.prototype, "loggerFactory", void 0);
    __decorate([
        core.Autowired('selectionService')
    ], ClipboardService.prototype, "selectionService", void 0);
    __decorate([
        core.Optional('rangeService')
    ], ClipboardService.prototype, "rangeService", void 0);
    __decorate([
        core.Autowired('rowModel')
    ], ClipboardService.prototype, "rowModel", void 0);
    __decorate([
        core.Autowired('ctrlsService')
    ], ClipboardService.prototype, "ctrlsService", void 0);
    __decorate([
        core.Autowired('valueService')
    ], ClipboardService.prototype, "valueService", void 0);
    __decorate([
        core.Autowired('focusService')
    ], ClipboardService.prototype, "focusService", void 0);
    __decorate([
        core.Autowired('rowRenderer')
    ], ClipboardService.prototype, "rowRenderer", void 0);
    __decorate([
        core.Autowired('columnModel')
    ], ClipboardService.prototype, "columnModel", void 0);
    __decorate([
        core.Autowired('cellNavigationService')
    ], ClipboardService.prototype, "cellNavigationService", void 0);
    __decorate([
        core.Autowired('cellPositionUtils')
    ], ClipboardService.prototype, "cellPositionUtils", void 0);
    __decorate([
        core.Autowired('rowPositionUtils')
    ], ClipboardService.prototype, "rowPositionUtils", void 0);
    __decorate([
        core.PostConstruct
    ], ClipboardService.prototype, "init", null);
    ClipboardService = __decorate([
        core.Bean('clipboardService')
    ], ClipboardService);
    return ClipboardService;
}(core.BeanStub));

var ClipboardModule = {
    moduleName: core.ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [
        core$1.EnterpriseCoreModule,
        csvExport.CsvExportModule
    ]
};

exports.ClipboardModule = ClipboardModule;
