var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { _, Autowired, Bean, BeanStub, ChangedPath, Events, PostConstruct, Optional, } from "@ag-grid-community/core";
// Matches value in changeDetectionService
var SOURCE_PASTE = 'paste';
var EXPORT_TYPE_DRAG_COPY = 'dragCopy';
var EXPORT_TYPE_CLIPBOARD = 'clipboard';
var CellClearType;
(function (CellClearType) {
    CellClearType[CellClearType["CellRange"] = 0] = "CellRange";
    CellClearType[CellClearType["SelectedRows"] = 1] = "SelectedRows";
    CellClearType[CellClearType["FocusedCell"] = 2] = "FocusedCell";
})(CellClearType || (CellClearType = {}));
;
var ClipboardService = /** @class */ (function (_super) {
    __extends(ClipboardService, _super);
    function ClipboardService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastPasteOperationTime = 0;
        _this.navigatorApiFailed = false;
        return _this;
    }
    ClipboardService_1 = ClipboardService;
    ClipboardService.prototype.init = function () {
        var _this = this;
        this.logger = this.loggerFactory.create('ClipboardService');
        if (this.rowModel.getType() === 'clientSide') {
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
        var allowNavigator = !this.gridOptionsService.is('suppressClipboardApi');
        // Some browsers (Firefox) do not allow Web Applications to read from
        // the clipboard so verify if not only the ClipboardAPI is available,
        // but also if the `readText` method is public.
        if (allowNavigator && !this.navigatorApiFailed && navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText()
                .then(this.processClipboardData.bind(this))
                .catch(function (e) {
                _.doOnce(function () {
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
    ClipboardService.prototype.getClipboardDelimiter = function () {
        var delimiter = this.gridOptionsService.get('clipboardDelimiter');
        return _.exists(delimiter) ? delimiter : '\t';
    };
    ClipboardService.prototype.processClipboardData = function (data) {
        var _this = this;
        if (data == null) {
            return;
        }
        var parsedData = ClipboardService_1.stringToArray(data, this.getClipboardDelimiter());
        var userFunc = this.gridOptionsService.getCallback('processDataFromClipboard');
        if (userFunc) {
            parsedData = userFunc({ data: parsedData });
        }
        if (parsedData == null) {
            return;
        }
        if (this.gridOptionsService.is('suppressLastEmptyLineOnPaste')) {
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
    // This will parse a delimited string into an array of arrays.
    ClipboardService.stringToArray = function (strData, delimiter) {
        if (delimiter === void 0) { delimiter = ','; }
        var data = [];
        var isNewline = function (char) { return char === '\r' || char === '\n'; };
        var insideQuotedField = false;
        if (strData === '') {
            return [['']];
        }
        var _loop_1 = function (row, column, position) {
            var previousChar = strData[position - 1];
            var currentChar = strData[position];
            var nextChar = strData[position + 1];
            var ensureDataExists = function () {
                if (!data[row]) {
                    // create row if it doesn't exist
                    data[row] = [];
                }
                if (!data[row][column]) {
                    // create column if it doesn't exist
                    data[row][column] = '';
                }
            };
            ensureDataExists();
            if (currentChar === '"') {
                if (insideQuotedField) {
                    if (nextChar === '"') {
                        // unescape double quote
                        data[row][column] += '"';
                        position++;
                    }
                    else {
                        // exit quoted field
                        insideQuotedField = false;
                    }
                    return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
                }
                else if (previousChar === undefined || previousChar === delimiter || isNewline(previousChar)) {
                    // enter quoted field
                    insideQuotedField = true;
                    return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
                }
            }
            if (!insideQuotedField) {
                if (currentChar === delimiter) {
                    // move to next column
                    column++;
                    ensureDataExists();
                    return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
                }
                else if (isNewline(currentChar)) {
                    // move to next row
                    column = 0;
                    row++;
                    ensureDataExists();
                    if (currentChar === '\r' && nextChar === '\n') {
                        // skip over second newline character if it exists
                        position++;
                    }
                    return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
                }
            }
            // add current character to current column
            data[row][column] += currentChar;
            out_row_1 = row;
            out_column_1 = column;
            out_position_1 = position;
        };
        var out_row_1, out_column_1, out_position_1;
        // iterate over each character, keep track of current row and column (of the returned array)
        for (var row = 0, column = 0, position = 0; position < strData.length; position++) {
            _loop_1(row, column, position);
            row = out_row_1;
            column = out_column_1;
            position = out_position_1;
        }
        return data;
    };
    // common code to paste operations, e.g. paste to cell, paste to range, and copy range down
    ClipboardService.prototype.doPasteOperation = function (pasteOperationFunc) {
        var api = this.gridOptionsService.api;
        var columnApi = this.gridOptionsService.columnApi;
        var source = 'clipboard';
        this.eventService.dispatchEvent({
            type: Events.EVENT_PASTE_START,
            api: api,
            columnApi: columnApi,
            source: source
        });
        var changedPath;
        if (this.clientSideRowModel) {
            var onlyChangedColumns = this.gridOptionsService.is('aggregateOnlyChangedColumns');
            changedPath = new ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
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
            type: Events.EVENT_PASTE_END,
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
            var processCellFromClipboardFunc = _this.gridOptionsService.getCallback('processCellFromClipboard');
            columns.forEach(function (column, idx) {
                if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
                    return;
                }
                // repeat data for columns we don't have data for - happens when to range is bigger than copied data range
                if (idx >= currentRowData.length) {
                    idx = idx % currentRowData.length;
                }
                var newValue = _this.processCell(rowNode, column, currentRowData[idx], EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc);
                rowNode.setDataValue(column, newValue, SOURCE_PASTE);
                if (changedPath) {
                    changedPath.addParentNode(rowNode.parent, [column]);
                }
                var rowIndex = currentRow.rowIndex, rowPinned = currentRow.rowPinned;
                var cellId = _this.cellPositionUtils.createIdFromValues({ rowIndex: rowIndex, column: column, rowPinned: rowPinned });
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
            this.pasteMultipleValues(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, EXPORT_TYPE_CLIPBOARD, changedPath);
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
                return _this.updateCellValue(rowNode, column, value, cellsToFlash, EXPORT_TYPE_CLIPBOARD, changedPath);
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
            var processCellForClipboardFunc = _this.gridOptionsService.getCallback('processCellForClipboard');
            var processCellFromClipboardFunc = _this.gridOptionsService.getCallback('processCellFromClipboard');
            var rowCallback = function (currentRow, rowNode, columns) {
                // take reference of first row, this is the one we will be using to copy from
                if (!firstRowValues.length) {
                    // two reasons for looping through columns
                    columns.forEach(function (column) {
                        // get the initial values to copy down
                        var value = _this.processCell(rowNode, column, _this.valueService.getValue(column, rowNode), EXPORT_TYPE_DRAG_COPY, processCellForClipboardFunc);
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
                        var firstRowValue = _this.processCell(rowNode, column, firstRowValues[index], EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc);
                        rowNode.setDataValue(column, firstRowValue, SOURCE_PASTE);
                        if (changedPath) {
                            changedPath.addParentNode(rowNode.parent, [column]);
                        }
                        var rowIndex = currentRow.rowIndex, rowPinned = currentRow.rowPinned;
                        var cellId = _this.cellPositionUtils.createIdFromValues({ rowIndex: rowIndex, column: column, rowPinned: rowPinned });
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
        var lastLine = _.last(parsedData);
        var lastLineIsBlank = lastLine && lastLine.length === 1 && lastLine[0] === '';
        if (lastLineIsBlank) {
            // do not remove the last empty line when that is the only line pasted
            if (parsedData.length === 1) {
                return;
            }
            _.removeFromArray(parsedData, lastLine);
        }
    };
    ClipboardService.prototype.fireRowChanged = function (rowNodes) {
        var _this = this;
        if (this.gridOptionsService.get('editType') !== 'fullRow') {
            return;
        }
        rowNodes.forEach(function (rowNode) {
            var event = {
                type: Events.EVENT_ROW_VALUE_CHANGED,
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
        var skipGroupRows = this.clientSideRowModel != null && !this.gridOptionsService.isTreeData();
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
        var processedValue = this.processCell(rowNode, column, value, type, this.gridOptionsService.getCallback('processCellFromClipboard'));
        rowNode.setDataValue(column, processedValue, SOURCE_PASTE);
        var rowIndex = rowNode.rowIndex, rowPinned = rowNode.rowPinned;
        var cellId = this.cellPositionUtils.createIdFromValues({ rowIndex: rowIndex, column: column, rowPinned: rowPinned });
        cellsToFlash[cellId] = true;
        if (changedPath) {
            changedPath.addParentNode(rowNode.parent, [column]);
        }
    };
    ClipboardService.prototype.copyToClipboard = function (params) {
        if (params === void 0) { params = {}; }
        this.copyOrCutToClipboard(params);
    };
    ClipboardService.prototype.cutToClipboard = function (params) {
        if (params === void 0) { params = {}; }
        this.copyOrCutToClipboard(params, true);
    };
    ClipboardService.prototype.copyOrCutToClipboard = function (params, cut) {
        var includeHeaders = params.includeHeaders, includeGroupHeaders = params.includeGroupHeaders;
        this.logger.log("copyToClipboard: includeHeaders = " + includeHeaders);
        // don't override 'includeHeaders' if it has been explicitly set to 'false'
        if (includeHeaders == null) {
            includeHeaders = this.gridOptionsService.is('copyHeadersToClipboard');
        }
        if (includeGroupHeaders == null) {
            includeGroupHeaders = this.gridOptionsService.is('copyGroupHeadersToClipboard');
        }
        var copyParams = { includeHeaders: includeHeaders, includeGroupHeaders: includeGroupHeaders };
        var shouldCopyRows = !this.gridOptionsService.is('suppressCopyRowsToClipboard');
        var cellClearType = null;
        // Copy priority is Range > Row > Focus
        if (this.rangeService && !this.rangeService.isEmpty() && !this.shouldSkipSingleCellRange()) {
            this.copySelectedRangeToClipboard(copyParams);
            cellClearType = CellClearType.CellRange;
        }
        else if (shouldCopyRows && !this.selectionService.isEmpty()) {
            this.copySelectedRowsToClipboard(copyParams);
            cellClearType = CellClearType.SelectedRows;
        }
        else if (this.focusService.isAnyCellFocused()) {
            this.copyFocusedCellToClipboard(copyParams);
            cellClearType = CellClearType.FocusedCell;
        }
        if (cut && cellClearType !== null) {
            this.clearCellsAfterCopy(cellClearType);
        }
    };
    ClipboardService.prototype.clearCellsAfterCopy = function (type) {
        this.eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_START });
        if (type === CellClearType.CellRange) {
            this.rangeService.clearCellRangeCellValues(undefined, 'clipboardService');
        }
        else if (type === CellClearType.SelectedRows) {
            this.clearSelectedRows();
        }
        else {
            var focusedCell = this.focusService.getFocusedCell();
            if (focusedCell == null) {
                return;
            }
            var rowNode = this.rowPositionUtils.getRowNode(focusedCell);
            if (rowNode) {
                this.clearCellValue(rowNode, focusedCell.column);
            }
        }
        this.eventService.dispatchEvent({ type: Events.EVENT_KEY_SHORTCUT_CHANGED_CELL_END });
    };
    ClipboardService.prototype.clearSelectedRows = function () {
        var e_1, _a, e_2, _b;
        var selected = this.selectionService.getSelectedNodes();
        var columns = this.columnModel.getAllDisplayedColumns();
        try {
            for (var selected_1 = __values(selected), selected_1_1 = selected_1.next(); !selected_1_1.done; selected_1_1 = selected_1.next()) {
                var row = selected_1_1.value;
                try {
                    for (var columns_1 = (e_2 = void 0, __values(columns)), columns_1_1 = columns_1.next(); !columns_1_1.done; columns_1_1 = columns_1.next()) {
                        var col = columns_1_1.value;
                        this.clearCellValue(row, col);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (columns_1_1 && !columns_1_1.done && (_b = columns_1.return)) _b.call(columns_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (selected_1_1 && !selected_1_1.done && (_a = selected_1.return)) _a.call(selected_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    ClipboardService.prototype.clearCellValue = function (rowNode, column) {
        if (!column.isCellEditable(rowNode)) {
            return;
        }
        rowNode.setDataValue(column, null, 'clipboardService');
    };
    ClipboardService.prototype.shouldSkipSingleCellRange = function () {
        return this.gridOptionsService.is('suppressCopySingleCellRanges') && !this.rangeService.isMoreThanOneCell();
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
                var _a = node, rowIndex = _a.rowIndex, rowPinned = _a.rowPinned;
                var cellId = _this.cellPositionUtils.createIdFromValues({ rowIndex: rowIndex, column: column, rowPinned: rowPinned });
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
        var _this = this;
        var columns = params.columns, rowPositions = params.rowPositions, _a = params.includeHeaders, includeHeaders = _a === void 0 ? false : _a, _b = params.includeGroupHeaders, includeGroupHeaders = _b === void 0 ? false : _b;
        var exportParams = {
            columnKeys: columns,
            rowPositions: rowPositions,
            skipColumnHeaders: !includeHeaders,
            skipColumnGroupHeaders: !includeGroupHeaders,
            suppressQuotes: true,
            columnSeparator: this.getClipboardDelimiter(),
            onlySelected: !rowPositions,
            processCellCallback: this.gridOptionsService.getCallback('processCellForClipboard'),
            processRowGroupCallback: function (params) { return _this.processRowGroupCallback(params); },
            processHeaderCallback: this.gridOptionsService.getCallback('processHeaderForClipboard'),
            processGroupHeaderCallback: this.gridOptionsService.getCallback('processGroupHeaderForClipboard')
        };
        return this.csvCreator.getDataAsCsv(exportParams, true);
    };
    ClipboardService.prototype.processRowGroupCallback = function (params) {
        var node = params.node;
        var key = node.key;
        var value = key != null ? key : '';
        if (params.node.footer) {
            var suffix = '';
            if (key && key.length) {
                suffix = " " + key;
            }
            value = "Total" + suffix;
        }
        var processCellForClipboard = this.gridOptionsService.getCallback('processCellForClipboard');
        if (processCellForClipboard) {
            var column = node.rowGroupColumn;
            if (!column && node.footer && node.level === -1) {
                column = this.columnModel.getRowGroupColumns()[0];
            }
            return processCellForClipboard({
                value: value,
                node: node,
                column: column,
                type: 'clipboard'
            });
        }
        return value;
    };
    ClipboardService.prototype.dispatchFlashCells = function (cellsToFlash) {
        var _this = this;
        window.setTimeout(function () {
            var event = {
                type: Events.EVENT_FLASH_CELLS,
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
        var userProvidedFunc = this.gridOptionsService.getCallback('sendToClipboard');
        // method 1 - user provided func
        if (userProvidedFunc) {
            userProvidedFunc({ data: data });
            return;
        }
        // method 2 - native clipboard API, available in modern chrome browsers
        var allowNavigator = !this.gridOptionsService.is('suppressClipboardApi');
        if (allowNavigator && navigator.clipboard) {
            navigator.clipboard.writeText(data).catch(function (e) {
                _.doOnce(function () {
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
            var eDocument = _this.gridOptionsService.getDocument();
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
        var eDoc = this.gridOptionsService.getDocument();
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
    var ClipboardService_1;
    __decorate([
        Autowired('csvCreator')
    ], ClipboardService.prototype, "csvCreator", void 0);
    __decorate([
        Autowired('loggerFactory')
    ], ClipboardService.prototype, "loggerFactory", void 0);
    __decorate([
        Autowired('selectionService')
    ], ClipboardService.prototype, "selectionService", void 0);
    __decorate([
        Optional('rangeService')
    ], ClipboardService.prototype, "rangeService", void 0);
    __decorate([
        Autowired('rowModel')
    ], ClipboardService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], ClipboardService.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('valueService')
    ], ClipboardService.prototype, "valueService", void 0);
    __decorate([
        Autowired('focusService')
    ], ClipboardService.prototype, "focusService", void 0);
    __decorate([
        Autowired('rowRenderer')
    ], ClipboardService.prototype, "rowRenderer", void 0);
    __decorate([
        Autowired('columnModel')
    ], ClipboardService.prototype, "columnModel", void 0);
    __decorate([
        Autowired('cellNavigationService')
    ], ClipboardService.prototype, "cellNavigationService", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], ClipboardService.prototype, "cellPositionUtils", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], ClipboardService.prototype, "rowPositionUtils", void 0);
    __decorate([
        PostConstruct
    ], ClipboardService.prototype, "init", null);
    ClipboardService = ClipboardService_1 = __decorate([
        Bean('clipboardService')
    ], ClipboardService);
    return ClipboardService;
}(BeanStub));
export { ClipboardService };
