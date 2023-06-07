var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, Autowired, Bean, BeanStub, ChangedPath, Events, PostConstruct, Optional } from "@ag-grid-community/core";
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
                    // continue;
                }
                else if (previousChar === undefined || previousChar === delimiter || isNewline(previousChar)) {
                    // enter quoted field
                    insideQuotedField = true;
                    // continue;
                }
            }
            if (!insideQuotedField && currentChar !== '"') {
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
                var newValue = _this.processCell(rowNode, column, currentRowData[idx], EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc, true);
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
                        var value = _this.processCell(rowNode, column, _this.valueService.getValue(column, rowNode), EXPORT_TYPE_DRAG_COPY, processCellForClipboardFunc, false, true);
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
                        var firstRowValue = _this.processCell(rowNode, column, firstRowValues[index], EXPORT_TYPE_DRAG_COPY, processCellFromClipboardFunc, true);
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
        var skipGroupRows = this.clientSideRowModel != null && !this.gridOptionsService.is('enableGroupEdit') && !this.gridOptionsService.isTreeData();
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
        // if the cell is a group and the col is an aggregation, skip the cell.
        if (rowNode.group && column.isValueActive()) {
            return;
        }
        var processedValue = this.processCell(rowNode, column, value, type, this.gridOptionsService.getCallback('processCellFromClipboard'), true);
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
    ClipboardService.prototype.cutToClipboard = function (params, source) {
        if (params === void 0) { params = {}; }
        if (source === void 0) { source = 'api'; }
        if (this.gridOptionsService.is('suppressCutToClipboard')) {
            return;
        }
        var startEvent = {
            type: Events.EVENT_CUT_START,
            source: source
        };
        this.eventService.dispatchEvent(startEvent);
        this.copyOrCutToClipboard(params, true);
        var endEvent = {
            type: Events.EVENT_CUT_END,
            source: source
        };
        this.eventService.dispatchEvent(endEvent);
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
            this.rangeService.clearCellRangeCellValues({ cellEventSource: 'clipboardService' });
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
        var _this = this;
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
            var column_1 = node.rowGroupColumn;
            if (!column_1 && node.footer && node.level === -1) {
                column_1 = this.columnModel.getRowGroupColumns()[0];
            }
            return processCellForClipboard({
                value: value,
                node: node,
                column: column_1,
                type: 'clipboard',
                formatValue: function (valueToFormat) { var _a; return (_a = _this.valueFormatterService.formatValue(column_1, node, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; },
                parseValue: function (valueToParse) { return _this.valueParserService.parseValue(column_1, node, valueToParse, _this.valueService.getValue(column_1, node)); }
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
    ClipboardService.prototype.processCell = function (rowNode, column, value, type, func, canParse, canFormat) {
        var _this = this;
        var _a;
        if (func) {
            var params = {
                column: column,
                node: rowNode,
                value: value,
                type: type,
                formatValue: function (valueToFormat) { var _a; return (_a = _this.valueFormatterService.formatValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; },
                parseValue: function (valueToParse) { return _this.valueParserService.parseValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, valueToParse, _this.valueService.getValue(column, rowNode)); }
            };
            return func(params);
        }
        if (canParse && column.getColDef().useValueParserForImport) {
            return this.valueParserService.parseValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, value, this.valueService.getValue(column, rowNode));
        }
        else if (canFormat && column.getColDef().useValueFormatterForExport) {
            return (_a = this.valueFormatterService.formatValue(column, rowNode !== null && rowNode !== void 0 ? rowNode : null, value)) !== null && _a !== void 0 ? _a : value;
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
        Autowired('valueFormatterService')
    ], ClipboardService.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('valueParserService')
    ], ClipboardService.prototype, "valueParserService", void 0);
    __decorate([
        PostConstruct
    ], ClipboardService.prototype, "init", null);
    ClipboardService = ClipboardService_1 = __decorate([
        Bean('clipboardService')
    ], ClipboardService);
    return ClipboardService;
}(BeanStub));
export { ClipboardService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGlwYm9hcmQvY2xpcGJvYXJkU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBS1IsV0FBVyxFQVNYLE1BQU0sRUFVTixhQUFhLEVBV2IsUUFBUSxFQU1YLE1BQU0seUJBQXlCLENBQUM7QUFhakMsMENBQTBDO0FBQzFDLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQztBQUM3QixJQUFNLHFCQUFxQixHQUFHLFVBQVUsQ0FBQztBQUN6QyxJQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQztBQUUxQyxJQUFLLGFBQXNEO0FBQTNELFdBQUssYUFBYTtJQUFHLDJEQUFTLENBQUE7SUFBRSxpRUFBWSxDQUFBO0lBQUUsK0RBQVcsQ0FBQTtBQUFDLENBQUMsRUFBdEQsYUFBYSxLQUFiLGFBQWEsUUFBeUM7QUFBQSxDQUFDO0FBRzVEO0lBQXNDLG9DQUFRO0lBQTlDO1FBQUEscUVBby9CQztRQTk5QlcsNEJBQXNCLEdBQVcsQ0FBQyxDQUFDO1FBRW5DLHdCQUFrQixHQUFHLEtBQUssQ0FBQzs7SUE0OUJ2QyxDQUFDO3lCQXAvQlksZ0JBQWdCO0lBMkJqQiwrQkFBSSxHQUFaO1FBREEsaUJBWUM7UUFWRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFNUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLFlBQVksRUFBRTtZQUMxQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFFBQStCLENBQUM7U0FDbEU7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFBLENB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