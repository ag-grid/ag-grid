// ag-grid-enterprise v16.0.1
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var rangeController_1 = require("./rangeController");
var ClipboardService = (function () {
    function ClipboardService() {
    }
    ClipboardService.prototype.init = function () {
        this.logger = this.loggerFactory.create('ClipboardService');
    };
    ClipboardService.prototype.pasteFromClipboard = function () {
        var _this = this;
        this.logger.log('pasteFromClipboard');
        this.executeOnTempElement(function (textArea) {
            textArea.focus();
        }, function (element) {
            var text = element.value;
            _this.finishPasteFromClipboard(text);
        });
    };
    ClipboardService.prototype.copyRangeDown = function () {
        var _this = this;
        if (this.rangeController.isEmpty()) {
            return;
        }
        var cellsToFlash = {};
        var firstRowValues = null;
        var updatedRowNodes = [];
        var updatedColumnIds = [];
        var rowCallback = function (currentRow, rowNode, columns) {
            // take reference of first row, this is the one we will be using to copy from
            if (!firstRowValues) {
                firstRowValues = [];
                // two reasons for looping through columns
                columns.forEach(function (column) {
                    // reason 1 - to get the initial values to copy down
                    var value = _this.valueService.getValue(column, rowNode);
                    var processCellForClipboardFunc = _this.gridOptionsWrapper.getProcessCellForClipboardFunc();
                    value = _this.userProcessCell(rowNode, column, value, processCellForClipboardFunc, main_1.Constants.EXPORT_TYPE_DRAG_COPY);
                    firstRowValues.push(value);
                    // reason 2 - to record the columnId for refreshing
                    updatedColumnIds.push(column.getId());
                });
            }
            else {
                // otherwise we are not the first row, so copy
                updatedRowNodes.push(rowNode);
                columns.forEach(function (column, index) {
                    if (!column.isCellEditable(rowNode)) {
                        return;
                    }
                    var firstRowValue = firstRowValues[index];
                    var processCellFromClipboardFunc = _this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
                    firstRowValue = _this.userProcessCell(rowNode, column, firstRowValue, processCellFromClipboardFunc, main_1.Constants.EXPORT_TYPE_DRAG_COPY);
                    _this.valueService.setValue(rowNode, column, firstRowValue);
                    var gridCellDef = { rowIndex: currentRow.rowIndex, floating: currentRow.floating, column: column };
                    var cellId = new main_1.GridCell(gridCellDef).createId();
                    cellsToFlash[cellId] = true;
                });
            }
        };
        this.iterateActiveRanges(true, rowCallback);
        // this is very heavy, should possibly just refresh the specific cells?
        this.rowRenderer.refreshCells({ rowNodes: updatedRowNodes, columns: updatedColumnIds });
        this.dispatchFlashCells(cellsToFlash);
    };
    ClipboardService.prototype.finishPasteFromClipboard = function (data) {
        if (main_1.Utils.missingOrEmpty(data)) {
            return;
        }
        var focusedCell = this.focusedCellController.getFocusedCell();
        if (!focusedCell) {
            return;
        }
        var parsedData = this.dataToArray(data);
        if (!parsedData) {
            return;
        }
        // remove last row if empty, excel puts empty last row in
        var lastLine = parsedData[parsedData.length - 1];
        if (lastLine.length === 1 && lastLine[0] === '') {
            main_1.Utils.removeFromArray(parsedData, lastLine);
        }
        var currentRow = new main_1.GridRow(focusedCell.rowIndex, focusedCell.floating);
        var cellsToFlash = {};
        var updatedRowNodes = [];
        var updatedColumnIds = [];
        var columnsToPasteInto = this.columnController.getDisplayedColumnsStartingAt(focusedCell.column);
        var onlyOneCellInRange = parsedData.length === 1 && parsedData[0].length === 1;
        if (onlyOneCellInRange) {
            this.singleCellRange(parsedData, updatedRowNodes, currentRow, cellsToFlash, updatedColumnIds);
        }
        else {
            this.multipleCellRange(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, updatedColumnIds, main_1.Constants.EXPORT_TYPE_CLIPBOARD);
        }
        // this is very heavy, should possibly just refresh the specific cells?
        this.rowRenderer.refreshCells({ rowNodes: updatedRowNodes, columns: updatedColumnIds });
        this.dispatchFlashCells(cellsToFlash);
        this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.floating, true);
    };
    ClipboardService.prototype.multipleCellRange = function (clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, updatedColumnIds, type) {
        var _this = this;
        clipboardGridData.forEach(function (clipboardRowData) {
            // if we have come to end of rows in grid, then skip
            if (!currentRow) {
                return;
            }
            var rowNode = _this.getRowNode(currentRow);
            updatedRowNodes.push(rowNode);
            clipboardRowData.forEach(function (value, index) {
                var column = columnsToPasteInto[index];
                if (main_1.Utils.missing(column)) {
                    return;
                }
                if (!column.isCellEditable(rowNode)) {
                    return;
                }
                _this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds, type);
            });
            // move to next row down for next set of values
            currentRow = _this.cellNavigationService.getRowBelow(currentRow);
        });
        return currentRow;
    };
    ClipboardService.prototype.singleCellRange = function (parsedData, updatedRowNodes, currentRow, cellsToFlash, updatedColumnIds) {
        var _this = this;
        var value = parsedData[0][0];
        var rowCallback = function (gridRow, rowNode, columns) {
            updatedRowNodes.push(rowNode);
            columns.forEach(function (column) {
                if (column.isCellEditable(rowNode)) {
                    _this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds, main_1.Constants.EXPORT_TYPE_CLIPBOARD);
                }
            });
        };
        this.iterateActiveRanges(false, rowCallback);
    };
    ClipboardService.prototype.updateCellValue = function (rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds, type) {
        if (column.isSuppressPaste(rowNode)) {
            return;
        }
        var processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellFromClipboardFunc(), type);
        this.valueService.setValue(rowNode, column, processedValue);
        var gridCellDef = {
            rowIndex: currentRow.rowIndex,
            floating: currentRow.floating,
            column: column
        };
        var cellId = new main_1.GridCell(gridCellDef).createId();
        cellsToFlash[cellId] = true;
        if (updatedColumnIds.indexOf(column.getId()) < 0) {
            updatedColumnIds.push(column.getId());
        }
    };
    ClipboardService.prototype.copyToClipboard = function (includeHeaders) {
        if (includeHeaders === void 0) { includeHeaders = false; }
        this.logger.log("copyToClipboard: includeHeaders = " + includeHeaders);
        var selectedRowsToCopy = !this.selectionController.isEmpty()
            && !this.gridOptionsWrapper.isSuppressCopyRowsToClipboard();
        // default is copy range if exists, otherwise rows
        if (this.rangeController.isMoreThanOneCell()) {
            this.copySelectedRangeToClipboard(includeHeaders);
        }
        else if (selectedRowsToCopy) {
            // otherwise copy selected rows if they exist
            this.copySelectedRowsToClipboard(includeHeaders);
        }
        else if (this.focusedCellController.isAnyCellFocused()) {
            // if there is a focused cell, copy this
            this.copyFocusedCellToClipboard(includeHeaders);
        }
        else {
            // lastly if no focused cell, try range again. this can happen
            // if use has cellSelection turned off (so no focused cell)
            // but has a cell clicked, so there exists a cell range
            // of exactly one cell (hence the first 'if' above didn't
            // get executed).
            this.copySelectedRangeToClipboard(includeHeaders);
        }
    };
    ClipboardService.prototype.iterateActiveRanges = function (onlyFirst, rowCallback, columnCallback) {
        var _this = this;
        if (this.rangeController.isEmpty()) {
            return;
        }
        var rangeSelections = this.rangeController.getCellRanges();
        if (onlyFirst) {
            var range = rangeSelections[0];
            this.iterateActiveRange(range, rowCallback, columnCallback);
        }
        else {
            rangeSelections.forEach(function (range) { return _this.iterateActiveRange(range, rowCallback, columnCallback); });
        }
    };
    ClipboardService.prototype.iterateActiveRange = function (range, rowCallback, columnCallback) {
        // get starting and ending row, remember rowEnd could be before rowStart
        var startRow = range.start.getGridRow();
        var endRow = range.end.getGridRow();
        var startRowIsFirst = startRow.before(endRow);
        var currentRow = startRowIsFirst ? startRow : endRow;
        var lastRow = startRowIsFirst ? endRow : startRow;
        if (main_1.Utils.exists(columnCallback)) {
            columnCallback(range.columns);
        }
        while (true) {
            var rowNode = this.getRowNode(currentRow);
            rowCallback(currentRow, rowNode, range.columns);
            if (currentRow.equals(lastRow)) {
                break;
            }
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    };
    ClipboardService.prototype.copySelectedRangeToClipboard = function (includeHeaders) {
        var _this = this;
        if (includeHeaders === void 0) { includeHeaders = false; }
        if (this.rangeController.isEmpty()) {
            return;
        }
        var deliminator = this.gridOptionsWrapper.getClipboardDeliminator();
        var data = '';
        var cellsToFlash = {};
        // adds columns to the data
        var columnCallback = function (columns) {
            if (!includeHeaders) {
                return;
            }
            columns.forEach(function (column, index) {
                var value = _this.columnController.getDisplayNameForColumn(column, 'clipboard', true);
                if (index != 0) {
                    data += deliminator;
                }
                if (main_1.Utils.exists(value)) {
                    data += value;
                }
            });
            data += '\r\n';
        };
        // adds cell values to the data
        var rowCallback = function (currentRow, rowNode, columns) {
            columns.forEach(function (column, index) {
                var value = _this.valueService.getValue(column, rowNode);
                var processedValue = _this.userProcessCell(rowNode, column, value, _this.gridOptionsWrapper.getProcessCellForClipboardFunc(), main_1.Constants.EXPORT_TYPE_CLIPBOARD);
                if (index != 0) {
                    data += deliminator;
                }
                if (main_1.Utils.exists(processedValue)) {
                    data += processedValue;
                }
                var gridCellDef = { rowIndex: currentRow.rowIndex, floating: currentRow.floating, column: column };
                var cellId = new main_1.GridCell(gridCellDef).createId();
                cellsToFlash[cellId] = true;
            });
            data += '\r\n';
        };
        this.iterateActiveRanges(false, rowCallback, columnCallback);
        this.copyDataToClipboard(data);
        this.dispatchFlashCells(cellsToFlash);
    };
    ClipboardService.prototype.copyFocusedCellToClipboard = function (includeHeaders) {
        if (includeHeaders === void 0) { includeHeaders = false; }
        var focusedCell = this.focusedCellController.getFocusedCell();
        if (main_1.Utils.missing(focusedCell)) {
            return;
        }
        var currentRow = focusedCell.getGridRow();
        var rowNode = this.getRowNode(currentRow);
        var column = focusedCell.column;
        var value = this.valueService.getValue(column, rowNode);
        var processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellForClipboardFunc(), main_1.Constants.EXPORT_TYPE_CLIPBOARD);
        if (main_1._.missing(processedValue)) {
            // copy the new line character to clipboard instead of an empty string, as the 'execCommand' will ignore it.
            // this behaviour is consistent with how Excel works!
            processedValue = '\n';
        }
        var data = '';
        if (includeHeaders) {
            data = this.columnController.getDisplayNameForColumn(column, 'clipboard', true) + '\r\n';
        }
        data += processedValue.toString();
        this.copyDataToClipboard(data);
        var cellId = focusedCell.createId();
        var cellsToFlash = {};
        cellsToFlash[cellId] = true;
        this.dispatchFlashCells(cellsToFlash);
    };
    ClipboardService.prototype.dispatchFlashCells = function (cellsToFlash) {
        var _this = this;
        setTimeout(function () {
            var event = {
                type: main_1.Events.EVENT_FLASH_CELLS,
                cells: cellsToFlash,
                api: _this.gridApi,
                columnApi: _this.columnApi
            };
            _this.eventService.dispatchEvent(event);
        }, 0);
    };
    ClipboardService.prototype.userProcessCell = function (rowNode, column, value, func, type) {
        if (func) {
            var params = {
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                type: type
            };
            return func(params);
        }
        else {
            return value;
        }
    };
    ClipboardService.prototype.getRowNode = function (gridRow) {
        switch (gridRow.floating) {
            case main_1.Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case main_1.Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    ClipboardService.prototype.copySelectedRowsToClipboard = function (includeHeaders, columnKeys) {
        if (includeHeaders === void 0) { includeHeaders = false; }
        var skipHeader = !includeHeaders;
        var deliminator = this.gridOptionsWrapper.getClipboardDeliminator();
        var params = {
            columnKeys: columnKeys,
            skipHeader: skipHeader,
            skipFooters: true,
            suppressQuotes: true,
            columnSeparator: deliminator,
            onlySelected: true,
            processCellCallback: this.gridOptionsWrapper.getProcessCellForClipboardFunc()
        };
        var data = this.csvCreator.getDataAsCsv(params);
        this.copyDataToClipboard(data);
    };
    ClipboardService.prototype.copyDataToClipboard = function (data) {
        var userProvidedFunc = this.gridOptionsWrapper.getSendToClipboardFunc();
        if (main_1.Utils.exists(userProvidedFunc)) {
            var params = { data: data };
            userProvidedFunc(params);
        }
        else {
            this.executeOnTempElement(function (element) {
                element.value = data;
                element.select();
                element.focus();
                return document.execCommand('copy');
            });
        }
    };
    ClipboardService.prototype.executeOnTempElement = function (callbackNow, callbackAfter) {
        var eTempInput = document.createElement('textarea');
        eTempInput.style.width = '1px';
        eTempInput.style.height = '1px';
        eTempInput.style.top = '0px';
        eTempInput.style.left = '0px';
        eTempInput.style.position = 'absolute';
        eTempInput.style.opacity = '0.0';
        var guiRoot = this.gridCore.getRootGui();
        guiRoot.appendChild(eTempInput);
        try {
            var result = callbackNow(eTempInput);
            this.logger.log('Clipboard operation result: ' + result);
        }
        catch (err) {
            this.logger.log('Browser doesn\t support document.execComment(\'copy\') for clipboard operations');
        }
        //It needs 100 otherwise OS X seemed to not always be able to paste... Go figure...
        if (callbackAfter) {
            setTimeout(function () {
                callbackAfter(eTempInput);
                guiRoot.removeChild(eTempInput);
            }, 100);
        }
        else {
            guiRoot.removeChild(eTempInput);
        }
    };
    // From http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
    // This will parse a delimited string into an array of arrays.
    // Note: this code fixes an issue with the example posted on stack overflow where it doesn't correctly handle
    // empty values in the first cell.
    ClipboardService.prototype.dataToArray = function (strData) {
        var delimiter = this.gridOptionsWrapper.getClipboardDeliminator();
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
        // Delimiters.
        "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + delimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern matching groups.
        var arrMatches;
        // Required for handling edge case on first row copy
        var atFirstRow = true;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];
            // Handles case when first row is an empty cell, insert an empty string before delimiter
            if (atFirstRow && strMatchedDelimiter) {
                arrData[0].push("");
            }
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && strMatchedDelimiter !== delimiter) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            var strMatchedValue = void 0;
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescaped any double quotes.
                strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
            }
            else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
            atFirstRow = false;
        }
        // Return the parsed data.
        return arrData;
    };
    __decorate([
        main_1.Autowired('csvCreator'),
        __metadata("design:type", main_1.CsvCreator)
    ], ClipboardService.prototype, "csvCreator", void 0);
    __decorate([
        main_1.Autowired('loggerFactory'),
        __metadata("design:type", main_1.LoggerFactory)
    ], ClipboardService.prototype, "loggerFactory", void 0);
    __decorate([
        main_1.Autowired('selectionController'),
        __metadata("design:type", main_1.SelectionController)
    ], ClipboardService.prototype, "selectionController", void 0);
    __decorate([
        main_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ClipboardService.prototype, "rangeController", void 0);
    __decorate([
        main_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ClipboardService.prototype, "rowModel", void 0);
    __decorate([
        main_1.Autowired('pinnedRowModel'),
        __metadata("design:type", main_1.PinnedRowModel)
    ], ClipboardService.prototype, "pinnedRowModel", void 0);
    __decorate([
        main_1.Autowired('valueService'),
        __metadata("design:type", main_1.ValueService)
    ], ClipboardService.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('focusedCellController'),
        __metadata("design:type", main_1.FocusedCellController)
    ], ClipboardService.prototype, "focusedCellController", void 0);
    __decorate([
        main_1.Autowired('rowRenderer'),
        __metadata("design:type", main_1.RowRenderer)
    ], ClipboardService.prototype, "rowRenderer", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], ClipboardService.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], ClipboardService.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('cellNavigationService'),
        __metadata("design:type", main_1.CellNavigationService)
    ], ClipboardService.prototype, "cellNavigationService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ClipboardService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('gridCore'),
        __metadata("design:type", main_1.GridCore)
    ], ClipboardService.prototype, "gridCore", void 0);
    __decorate([
        main_1.Autowired('columnApi'),
        __metadata("design:type", main_1.ColumnApi)
    ], ClipboardService.prototype, "columnApi", void 0);
    __decorate([
        main_1.Autowired('gridApi'),
        __metadata("design:type", main_1.GridApi)
    ], ClipboardService.prototype, "gridApi", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ClipboardService.prototype, "init", null);
    ClipboardService = __decorate([
        main_1.Bean('clipboardService')
    ], ClipboardService);
    return ClipboardService;
}());
exports.ClipboardService = ClipboardService;
