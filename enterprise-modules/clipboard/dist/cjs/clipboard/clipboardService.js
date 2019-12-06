"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var ClipboardService = /** @class */ (function () {
    function ClipboardService() {
    }
    ClipboardService.prototype.registerGridCore = function (gridCore) {
        this.gridCore = gridCore;
    };
    ClipboardService.prototype.init = function () {
        this.logger = this.loggerFactory.create('ClipboardService');
        if (this.rowModel.getType() === core_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
    };
    ClipboardService.prototype.pasteFromClipboard = function () {
        var _this = this;
        this.logger.log('pasteFromClipboard');
        this.executeOnTempElement(function (textArea) {
            textArea.focus();
        }, function (element) {
            var data = element.value;
            if (core_1._.missingOrEmpty(data)) {
                return;
            }
            var parsedData = _this.dataToArray(data);
            var userFunc = _this.gridOptionsWrapper.getProcessDataFromClipboardFunc();
            if (userFunc) {
                parsedData = userFunc({ data: parsedData });
            }
            if (core_1._.missingOrEmpty(parsedData)) {
                return;
            }
            var pasteOperation = function (cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
                var singleCellInClipboard = parsedData.length == 1 && parsedData[0].length == 1;
                var rangeActive = _this.rangeController && _this.rangeController.isMoreThanOneCell();
                var pasteIntoRange = rangeActive && !singleCellInClipboard;
                if (pasteIntoRange) {
                    _this.pasteIntoActiveRange(parsedData, cellsToFlash, updatedRowNodes, changedPath);
                }
                else {
                    _this.pasteStartingFromFocusedCell(parsedData, cellsToFlash, updatedRowNodes, focusedCell, changedPath);
                }
            };
            _this.doPasteOperation(pasteOperation);
        });
    };
    // common code to paste operations, eg past to cell, paste to range, and copy range down
    ClipboardService.prototype.doPasteOperation = function (pasteOperationFunc) {
        this.eventService.dispatchEvent({
            type: core_1.Events.EVENT_PASTE_START,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            source: 'clipboard'
        });
        var changedPath;
        if (this.clientSideRowModel) {
            var onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            changedPath = new core_1.ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
        }
        var cellsToFlash = {};
        var updatedRowNodes = [];
        var focusedCell = this.focusedCellController.getFocusedCell();
        pasteOperationFunc(cellsToFlash, updatedRowNodes, focusedCell, changedPath);
        if (changedPath) {
            this.clientSideRowModel.doAggregate(changedPath);
        }
        this.rowRenderer.refreshCells();
        this.dispatchFlashCells(cellsToFlash);
        this.fireRowChanged(updatedRowNodes);
        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.rowPinned, true);
        }
        this.eventService.dispatchEvent({
            type: core_1.Events.EVENT_PASTE_END,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            source: 'clipboard'
        });
    };
    ClipboardService.prototype.pasteIntoActiveRange = function (clipboardData, cellsToFlash, updatedRowNodes, changedPath) {
        var _this = this;
        // true if clipboard data can be evenly pasted into range, otherwise false
        var abortRepeatingPasteIntoRows = this.rangeSize() % clipboardData.length != 0;
        var indexOffset = 0, dataRowIndex = 0;
        var rowCallback = function (currentRow, rowNode, columns, index, isLastRow) {
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
            columns.forEach(function (column, idx) {
                if (!column.isCellEditable(rowNode) || column.isSuppressPaste(rowNode)) {
                    return;
                }
                // repeat data for columns we don't have data for - happens when to range is bigger than copied data range
                if (idx >= currentRowData.length) {
                    idx = idx % currentRowData.length;
                }
                var newValue = currentRowData[idx];
                var processCellFromClipboardFunc = _this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
                newValue = _this.userProcessCell(rowNode, column, newValue, processCellFromClipboardFunc, core_1.Constants.EXPORT_TYPE_DRAG_COPY);
                _this.valueService.setValue(rowNode, column, newValue, core_1.Constants.SOURCE_PASTE);
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
        var columnsToPasteInto = this.columnController.getDisplayedColumnsStartingAt(focusedCell.column);
        var onlyOneValueToPaste = parsedData.length === 1 && parsedData[0].length === 1;
        if (onlyOneValueToPaste) {
            this.pasteSingleValue(parsedData, updatedRowNodes, cellsToFlash, changedPath);
        }
        else {
            this.pasteMultipleValues(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, core_1.Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
        }
    };
    ClipboardService.prototype.copyRangeDown = function () {
        var _this = this;
        if (!this.rangeController || this.rangeController.isEmpty()) {
            return;
        }
        var firstRowValues = [];
        var pasteOperation = function (cellsToFlash, updatedRowNodes, focusedCell, changedPath) {
            var rowCallback = function (currentRow, rowNode, columns, index, isLastRow) {
                // take reference of first row, this is the one we will be using to copy from
                if (!firstRowValues.length) {
                    // two reasons for looping through columns
                    columns.forEach(function (column) {
                        // get the initial values to copy down
                        var value = _this.valueService.getValue(column, rowNode);
                        var processCellForClipboardFunc = _this.gridOptionsWrapper.getProcessCellForClipboardFunc();
                        value = _this.userProcessCell(rowNode, column, value, processCellForClipboardFunc, core_1.Constants.EXPORT_TYPE_DRAG_COPY);
                        firstRowValues.push(value);
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
                        firstRowValue = _this.userProcessCell(rowNode, column, firstRowValue, processCellFromClipboardFunc, core_1.Constants.EXPORT_TYPE_DRAG_COPY);
                        _this.valueService.setValue(rowNode, column, firstRowValue, core_1.Constants.SOURCE_PASTE);
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
    ClipboardService.prototype.fireRowChanged = function (rowNodes) {
        var _this = this;
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            return;
        }
        rowNodes.forEach(function (rowNode) {
            var event = {
                type: core_1.Events.EVENT_ROW_VALUE_CHANGED,
                node: rowNode,
                data: rowNode.data,
                rowIndex: rowNode.rowIndex,
                rowPinned: rowNode.rowPinned,
                context: _this.gridOptionsWrapper.getContext(),
                api: _this.gridOptionsWrapper.getApi(),
                columnApi: _this.gridOptionsWrapper.getColumnApi()
            };
            _this.eventService.dispatchEvent(event);
        });
    };
    ClipboardService.prototype.pasteMultipleValues = function (clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, type, changedPath) {
        var _this = this;
        clipboardGridData.forEach(function (clipboardRowData) {
            // if we have come to end of rows in grid, then skip
            if (!currentRow) {
                return;
            }
            var rowNode = _this.rowPositionUtils.getRowNode(currentRow);
            if (rowNode) {
                updatedRowNodes.push(rowNode);
                clipboardRowData.forEach(function (value, index) {
                    var column = columnsToPasteInto[index];
                    _this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, type, changedPath);
                });
                // move to next row down for next set of values
                currentRow = _this.cellNavigationService.getRowBelow({ rowPinned: currentRow.rowPinned, rowIndex: currentRow.rowIndex });
            }
        });
        return currentRow;
    };
    ClipboardService.prototype.pasteSingleValue = function (parsedData, updatedRowNodes, cellsToFlash, changedPath) {
        var _this = this;
        var value = parsedData[0][0];
        var rowCallback = function (currentRow, rowNode, columns) {
            updatedRowNodes.push(rowNode);
            columns.forEach(function (column) {
                _this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, core_1.Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
            });
        };
        this.iterateActiveRanges(false, rowCallback);
    };
    ClipboardService.prototype.updateCellValue = function (rowNode, column, value, currentRow, cellsToFlash, type, changedPath) {
        if (!rowNode ||
            !currentRow ||
            !column ||
            !column.isCellEditable ||
            column.isSuppressPaste(rowNode)) {
            return;
        }
        var processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellFromClipboardFunc(), type);
        this.valueService.setValue(rowNode, column, processedValue, core_1.Constants.SOURCE_PASTE);
        var cellId = this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
        cellsToFlash[cellId] = true;
        if (changedPath) {
            changedPath.addParentNode(rowNode.parent, [column]);
        }
    };
    ClipboardService.prototype.copyToClipboard = function (includeHeaders) {
        this.logger.log("copyToClipboard: includeHeaders = " + includeHeaders);
        // don't override 'includeHeaders' if it has been explicitly set to 'false'
        if (typeof includeHeaders === 'undefined') {
            includeHeaders = this.gridOptionsWrapper.isCopyHeadersToClipboard();
        }
        var selectedRowsToCopy = !this.selectionController.isEmpty()
            && !this.gridOptionsWrapper.isSuppressCopyRowsToClipboard();
        // default is copy range if exists, otherwise rows
        if (this.rangeController && this.rangeController.isMoreThanOneCell()) {
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
        if (!this.rangeController || this.rangeController.isEmpty()) {
            return;
        }
        var cellRanges = this.rangeController.getCellRanges();
        if (onlyFirst) {
            var range = cellRanges[0];
            this.iterateActiveRange(range, rowCallback, columnCallback, true);
        }
        else {
            cellRanges.forEach(function (range, idx) { return _this.iterateActiveRange(range, rowCallback, columnCallback, idx === cellRanges.length - 1); });
        }
    };
    ClipboardService.prototype.iterateActiveRange = function (range, rowCallback, columnCallback, isLastRange) {
        if (!this.rangeController) {
            return;
        }
        var currentRow = this.rangeController.getRangeStartRow(range);
        var lastRow = this.rangeController.getRangeEndRow(range);
        if (columnCallback && core_1._.exists(columnCallback) && range.columns) {
            columnCallback(range.columns);
        }
        var rangeIndex = 0;
        var isLastRow = false;
        // the currentRow could be missing if the user sets the active range manually, and sets a range
        // that is outside of the grid (eg. sets range rows 0 to 100, but grid has only 20 rows).
        while (!isLastRow && !core_1._.missing(currentRow) && currentRow) {
            var rowNode = this.rowPositionUtils.getRowNode(currentRow);
            isLastRow = this.rowPositionUtils.sameRow(currentRow, lastRow);
            rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    };
    ClipboardService.prototype.copySelectedRangeToClipboard = function (includeHeaders) {
        var _this = this;
        if (includeHeaders === void 0) { includeHeaders = false; }
        if (!this.rangeController || this.rangeController.isEmpty()) {
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
                var processedValue = _this.userProcessHeader(column, value, _this.gridOptionsWrapper.getProcessHeaderForClipboardFunc());
                if (index != 0) {
                    data += deliminator;
                }
                if (core_1._.exists(processedValue)) {
                    data += processedValue;
                }
            });
            data += '\r\n';
        };
        // adds cell values to the data
        var rowCallback = function (currentRow, rowNode, columns, index, isLastRow) {
            columns.forEach(function (column, index) {
                var value = _this.valueService.getValue(column, rowNode);
                var processedValue = _this.userProcessCell(rowNode, column, value, _this.gridOptionsWrapper.getProcessCellForClipboardFunc(), core_1.Constants.EXPORT_TYPE_CLIPBOARD);
                if (index != 0) {
                    data += deliminator;
                }
                if (core_1._.exists(processedValue)) {
                    data += processedValue;
                }
                var cellId = _this.cellPositionUtils.createIdFromValues(currentRow.rowIndex, column, currentRow.rowPinned);
                cellsToFlash[cellId] = true;
            });
            if (!isLastRow) {
                data += '\r\n';
            }
        };
        this.iterateActiveRanges(false, rowCallback, columnCallback);
        this.copyDataToClipboard(data);
        this.dispatchFlashCells(cellsToFlash);
    };
    ClipboardService.prototype.copyFocusedCellToClipboard = function (includeHeaders) {
        var _a;
        if (includeHeaders === void 0) { includeHeaders = false; }
        var focusedCell = this.focusedCellController.getFocusedCell();
        if (core_1._.missing(focusedCell)) {
            return;
        }
        var cellId = this.cellPositionUtils.createId(focusedCell);
        var currentRow = { rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex };
        var rowNode = this.rowPositionUtils.getRowNode(currentRow);
        var column = focusedCell.column;
        var value = this.valueService.getValue(column, rowNode);
        var processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellForClipboardFunc(), core_1.Constants.EXPORT_TYPE_CLIPBOARD);
        if (core_1._.missing(processedValue)) {
            // copy the new line character to clipboard instead of an empty string, as the 'execCommand' will ignore it.
            // this behaviour is consistent with how Excel works!
            processedValue = '\t';
        }
        var data = '';
        if (includeHeaders) {
            var headerValue = this.columnController.getDisplayNameForColumn(column, 'clipboard', true);
            data = this.userProcessHeader(column, headerValue, this.gridOptionsWrapper.getProcessHeaderForClipboardFunc());
            data += '\r\n';
        }
        data += processedValue.toString();
        this.copyDataToClipboard(data);
        this.dispatchFlashCells((_a = {}, _a[cellId] = true, _a));
    };
    ClipboardService.prototype.dispatchFlashCells = function (cellsToFlash) {
        var _this = this;
        window.setTimeout(function () {
            var event = {
                type: core_1.Events.EVENT_FLASH_CELLS,
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
        return value;
    };
    ClipboardService.prototype.userProcessHeader = function (column, value, func) {
        if (func) {
            var params = {
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            return func(params);
        }
        return value;
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
            processCellCallback: this.gridOptionsWrapper.getProcessCellForClipboardFunc(),
            processHeaderCallback: this.gridOptionsWrapper.getProcessHeaderForClipboardFunc()
        };
        var data = this.csvCreator.getDataAsCsv(params);
        this.copyDataToClipboard(data);
    };
    ClipboardService.prototype.copyDataToClipboard = function (data) {
        var userProvidedFunc = this.gridOptionsWrapper.getSendToClipboardFunc();
        if (userProvidedFunc && core_1._.exists(userProvidedFunc)) {
            var params = { data: data };
            userProvidedFunc(params);
        }
        else {
            this.executeOnTempElement(function (element) {
                element.value = data;
                element.select();
                element.focus();
                var result = document.execCommand('copy');
                if (!result) {
                    console.warn('ag-grid: Browser did not allow document.execCommand(\'copy\'). Ensure ' +
                        'api.copySelectedRowsToClipboard() is invoked via a user event, i.e. button click, otherwise ' +
                        'the browser will prevent it for security reasons.');
                }
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
            callbackNow(eTempInput);
        }
        catch (err) {
            console.warn('ag-grid: Browser does not support document.execCommand(\'copy\') for clipboard operations');
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
    // From http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
    // This will parse a delimited string into an array of arrays.
    // Note: this code fixes an issue with the example posted on stack overflow where it doesn't correctly handle
    // empty values in the first cell.
    ClipboardService.prototype.dataToArray = function (strData) {
        var delimiter = this.gridOptionsWrapper.getClipboardDeliminator();
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
        // Delimiters.
        '(\\' + delimiter + '|\\r?\\n|\\r|^)' +
            // Quoted fields.
            '(?:"([^\"]*(?:""[^\"]*)*)"|' +
            // Standard fields.
            '([^\\' + delimiter + '\\r\\n]*))'), "gi");
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
            if ((atFirstRow && strMatchedDelimiter) || !arrMatches.index && arrMatches[0].charAt(0) === delimiter) {
                arrData[0].push('');
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
                strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
            }
            else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            var lastItem = core_1._.last(arrData);
            if (lastItem) {
                lastItem.push(strMatchedValue);
            }
            atFirstRow = false;
        }
        // Return the parsed data.
        return arrData;
    };
    ClipboardService.prototype.rangeSize = function () {
        var ranges = this.rangeController.getCellRanges();
        var startRangeIndex;
        var endRangeIndex;
        if (ranges.length > 0) {
            startRangeIndex = 0;
            endRangeIndex = 0;
        }
        else {
            startRangeIndex = this.rangeController.getRangeStartRow(ranges[0]).rowIndex;
            endRangeIndex = this.rangeController.getRangeEndRow(ranges[0]).rowIndex;
        }
        return startRangeIndex - endRangeIndex + 1;
    };
    __decorate([
        core_1.Autowired('csvCreator')
    ], ClipboardService.prototype, "csvCreator", void 0);
    __decorate([
        core_1.Autowired('loggerFactory')
    ], ClipboardService.prototype, "loggerFactory", void 0);
    __decorate([
        core_1.Autowired('selectionController')
    ], ClipboardService.prototype, "selectionController", void 0);
    __decorate([
        core_1.Optional('rangeController')
    ], ClipboardService.prototype, "rangeController", void 0);
    __decorate([
        core_1.Autowired('rowModel')
    ], ClipboardService.prototype, "rowModel", void 0);
    __decorate([
        core_1.Autowired('valueService')
    ], ClipboardService.prototype, "valueService", void 0);
    __decorate([
        core_1.Autowired('focusedCellController')
    ], ClipboardService.prototype, "focusedCellController", void 0);
    __decorate([
        core_1.Autowired('rowRenderer')
    ], ClipboardService.prototype, "rowRenderer", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], ClipboardService.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('eventService')
    ], ClipboardService.prototype, "eventService", void 0);
    __decorate([
        core_1.Autowired('cellNavigationService')
    ], ClipboardService.prototype, "cellNavigationService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ClipboardService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], ClipboardService.prototype, "columnApi", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], ClipboardService.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('cellPositionUtils')
    ], ClipboardService.prototype, "cellPositionUtils", void 0);
    __decorate([
        core_1.Autowired('rowPositionUtils')
    ], ClipboardService.prototype, "rowPositionUtils", void 0);
    __decorate([
        core_1.PostConstruct
    ], ClipboardService.prototype, "init", null);
    ClipboardService = __decorate([
        core_1.Bean('clipboardService')
    ], ClipboardService);
    return ClipboardService;
}());
exports.ClipboardService = ClipboardService;
//# sourceMappingURL=clipboardService.js.map