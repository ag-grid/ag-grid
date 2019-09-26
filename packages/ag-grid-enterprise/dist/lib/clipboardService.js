// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var rangeController_1 = require("./rangeController");
var ClipboardService = /** @class */ (function () {
    function ClipboardService() {
        this.pasteOperationActive = false;
    }
    ClipboardService.prototype.isPasteOperationActive = function () {
        return this.pasteOperationActive;
    };
    ClipboardService.prototype.registerGridCore = function (gridCore) {
        this.gridCore = gridCore;
    };
    ClipboardService.prototype.init = function () {
        this.logger = this.loggerFactory.create('ClipboardService');
        if (this.rowModel.getType() === ag_grid_community_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
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
            if (ag_grid_community_1._.missingOrEmpty(data)) {
                return;
            }
            var parsedData = _this.dataToArray(data);
            var userFunc = _this.gridOptionsWrapper.getProcessDataFromClipboardFunc();
            if (userFunc) {
                parsedData = userFunc({ data: parsedData });
            }
            if (ag_grid_community_1._.missingOrEmpty(parsedData)) {
                return;
            }
            _this.eventService.dispatchEvent({
                type: ag_grid_community_1.Events.EVENT_PASTE_START,
                api: _this.gridOptionsWrapper.getApi(),
                columnApi: _this.gridOptionsWrapper.getColumnApi(),
                source: 'clipboard'
            });
            var singleCellInClipboard = parsedData.length == 1 && parsedData[0].length == 1;
            var rangeActive = _this.rangeController.isMoreThanOneCell();
            rangeActive && !singleCellInClipboard ?
                _this.pasteIntoActiveRange(parsedData) : _this.pasteStartingFromFocusedCell(parsedData);
            _this.eventService.dispatchEvent({
                type: ag_grid_community_1.Events.EVENT_PASTE_END,
                api: _this.gridOptionsWrapper.getApi(),
                columnApi: _this.gridOptionsWrapper.getColumnApi(),
                source: 'clipboard'
            });
        });
    };
    ClipboardService.prototype.pasteIntoActiveRange = function (clipboardData) {
        var _this = this;
        var cellsToFlash = {};
        var updatedRowNodes = [];
        var updatedColumnIds = [];
        var focusedCell = this.focusedCellController.getFocusedCell();
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
                if (!column.isCellEditable(rowNode)) {
                    return;
                }
                // repeat data for columns we don't have data for - happens when to range is bigger than copied data range
                if (idx >= currentRowData.length) {
                    idx = idx % currentRowData.length;
                }
                var firstRowValue = currentRowData[idx];
                var processCellFromClipboardFunc = _this.gridOptionsWrapper.getProcessCellFromClipboardFunc();
                firstRowValue = _this.userProcessCell(rowNode, column, firstRowValue, processCellFromClipboardFunc, ag_grid_community_1.Constants.EXPORT_TYPE_DRAG_COPY);
                _this.valueService.setValue(rowNode, column, firstRowValue);
                var cellPosition = {
                    rowIndex: currentRow.rowIndex,
                    rowPinned: currentRow.rowPinned,
                    column: column
                };
                var cellId = _this.cellPositionUtils.createId(cellPosition);
                cellsToFlash[cellId] = true;
            });
            dataRowIndex++;
        };
        this.iterateActiveRanges(false, rowCallback);
        this.rowRenderer.refreshCells({ rowNodes: updatedRowNodes, columns: updatedColumnIds });
        this.dispatchFlashCells(cellsToFlash);
        if (focusedCell) {
            this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.rowPinned, true);
        }
        this.fireRowChanged(updatedRowNodes);
    };
    ClipboardService.prototype.pasteStartingFromFocusedCell = function (parsedData) {
        var focusedCell = this.focusedCellController.getFocusedCell();
        if (!focusedCell) {
            return;
        }
        // some parts of the grid logic shouldn't execute when paste operation
        // in progress, so we flag when paste is in progress. used by changeDetectionService
        // (as we don't want the grid refreshing for every cell, due to CellValueChanged event)
        //
        // NOTE - it is only pasteStartingFromFocusedCell where we want the ChangeDetectionService
        // to stand down, as it is only this method which does clientSideRowModel.doAggregate()
        // (the pasteIntoActiveRange or copyRangeDown do NOT do this). in the future this class needs
        // to be refactored, so that all these methods do the same (hopefully with common logic)
        // and then this flag is turned on / off at a higher level. i am not doing the refactor now
        // as this is a critical code fix going into a patch release.
        this.pasteOperationActive = true;
        // remove last row if empty, excel puts empty last row in
        var lastLine = ag_grid_community_1._.last(parsedData);
        if (lastLine && lastLine.length === 1 && lastLine[0] === '') {
            ag_grid_community_1._.removeFromArray(parsedData, lastLine);
        }
        var currentRow = { rowIndex: focusedCell.rowIndex, rowPinned: focusedCell.rowPinned };
        var cellsToFlash = {};
        var updatedRowNodes = [];
        var updatedColumnIds = [];
        var columnsToPasteInto = this.columnController.getDisplayedColumnsStartingAt(focusedCell.column);
        var onlyOneValueToPaste = parsedData.length === 1 && parsedData[0].length === 1;
        var changedPath;
        if (this.clientSideRowModel) {
            var onlyChangedColumns = this.gridOptionsWrapper.isAggregateOnlyChangedColumns();
            changedPath = new ag_grid_community_1.ChangedPath(onlyChangedColumns, this.clientSideRowModel.getRootNode());
        }
        if (onlyOneValueToPaste) {
            this.pasteSingleValue(parsedData, updatedRowNodes, cellsToFlash, updatedColumnIds, changedPath);
        }
        else {
            this.pasteMultipleValues(parsedData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, updatedColumnIds, ag_grid_community_1.Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
        }
        if (changedPath) {
            this.clientSideRowModel.doAggregate(changedPath);
        }
        this.rowRenderer.refreshCells({ rowNodes: updatedRowNodes, columns: updatedColumnIds });
        this.dispatchFlashCells(cellsToFlash);
        this.focusedCellController.setFocusedCell(focusedCell.rowIndex, focusedCell.column, focusedCell.rowPinned, true);
        this.fireRowChanged(updatedRowNodes);
        // unset the paste active operation
        this.pasteOperationActive = false;
    };
    ClipboardService.prototype.copyRangeDown = function () {
        var _this = this;
        if (this.rangeController.isEmpty()) {
            return;
        }
        this.eventService.dispatchEvent({
            type: ag_grid_community_1.Events.EVENT_PASTE_START,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            source: 'rangeDown'
        });
        var cellsToFlash = {};
        var firstRowValues = [];
        var updatedRowNodes = [];
        var updatedColumnIds = [];
        var rowCallback = function (currentRow, rowNode, columns, index, isLastRow) {
            // take reference of first row, this is the one we will be using to copy from
            if (!firstRowValues.length) {
                // two reasons for looping through columns
                columns.forEach(function (column) {
                    // reason 1 - to get the initial values to copy down
                    var value = _this.valueService.getValue(column, rowNode);
                    var processCellForClipboardFunc = _this.gridOptionsWrapper.getProcessCellForClipboardFunc();
                    value = _this.userProcessCell(rowNode, column, value, processCellForClipboardFunc, ag_grid_community_1.Constants.EXPORT_TYPE_DRAG_COPY);
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
                    firstRowValue = _this.userProcessCell(rowNode, column, firstRowValue, processCellFromClipboardFunc, ag_grid_community_1.Constants.EXPORT_TYPE_DRAG_COPY);
                    _this.valueService.setValue(rowNode, column, firstRowValue);
                    var cellPosition = {
                        rowIndex: currentRow.rowIndex,
                        rowPinned: currentRow.rowPinned,
                        column: column
                    };
                    var cellId = _this.cellPositionUtils.createId(cellPosition);
                    cellsToFlash[cellId] = true;
                });
            }
        };
        this.iterateActiveRanges(true, rowCallback);
        // this is very heavy, should possibly just refresh the specific cells?
        this.rowRenderer.refreshCells({ rowNodes: updatedRowNodes, columns: updatedColumnIds });
        this.dispatchFlashCells(cellsToFlash);
        this.fireRowChanged(updatedRowNodes);
        this.eventService.dispatchEvent({
            type: ag_grid_community_1.Events.EVENT_PASTE_END,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            source: 'rangeDown'
        });
    };
    ClipboardService.prototype.fireRowChanged = function (rowNodes) {
        var _this = this;
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            return;
        }
        rowNodes.forEach(function (rowNode) {
            var event = {
                type: ag_grid_community_1.Events.EVENT_ROW_VALUE_CHANGED,
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
    ClipboardService.prototype.pasteMultipleValues = function (clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, updatedColumnIds, type, changedPath) {
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
                    _this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds, type, changedPath);
                });
                // move to next row down for next set of values
                currentRow = _this.cellNavigationService.getRowBelow({ rowPinned: currentRow.rowPinned, rowIndex: currentRow.rowIndex });
            }
        });
        return currentRow;
    };
    ClipboardService.prototype.pasteSingleValue = function (parsedData, updatedRowNodes, cellsToFlash, updatedColumnIds, changedPath) {
        var _this = this;
        var value = parsedData[0][0];
        var rowCallback = function (currentRow, rowNode, columns) {
            updatedRowNodes.push(rowNode);
            columns.forEach(function (column) {
                _this.updateCellValue(rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds, ag_grid_community_1.Constants.EXPORT_TYPE_CLIPBOARD, changedPath);
            });
        };
        this.iterateActiveRanges(false, rowCallback);
    };
    ClipboardService.prototype.updateCellValue = function (rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds, type, changedPath) {
        if (!rowNode || !currentRow) {
            return;
        }
        if (!column.isCellEditable(rowNode)) {
            return;
        }
        if (column.isSuppressPaste(rowNode)) {
            return;
        }
        var processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellFromClipboardFunc(), type);
        this.valueService.setValue(rowNode, column, processedValue);
        var cellPosition = {
            rowIndex: currentRow.rowIndex,
            rowPinned: currentRow.rowPinned,
            column: column
        };
        var cellId = this.cellPositionUtils.createId(cellPosition);
        cellsToFlash[cellId] = true;
        if (updatedColumnIds.indexOf(column.getId()) < 0) {
            updatedColumnIds.push(column.getId());
        }
        if (changedPath && !rowNode.isRowPinned()) {
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
        var currentRow = this.rangeController.getRangeStartRow(range);
        var lastRow = this.rangeController.getRangeEndRow(range);
        if (columnCallback && ag_grid_community_1._.exists(columnCallback) && range.columns) {
            columnCallback(range.columns);
        }
        var rangeIndex = 0;
        var isLastRow = false;
        // the currentRow could be missing if the user sets the active range manually, and sets a range
        // that is outside of the grid (eg. sets range rows 0 to 100, but grid has only 20 rows).
        while (!isLastRow && !ag_grid_community_1._.missing(currentRow) && currentRow) {
            var rowNode = this.rowPositionUtils.getRowNode(currentRow);
            isLastRow = currentRow.rowIndex === lastRow.rowIndex && currentRow.rowIndex === lastRow.rowIndex;
            rowCallback(currentRow, rowNode, range.columns, rangeIndex++, isLastRow && isLastRange);
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
                var processedValue = _this.userProcessHeader(column, value, _this.gridOptionsWrapper.getProcessHeaderForClipboardFunc());
                if (index != 0) {
                    data += deliminator;
                }
                if (ag_grid_community_1._.exists(processedValue)) {
                    data += processedValue;
                }
            });
            data += '\r\n';
        };
        // adds cell values to the data
        var rowCallback = function (currentRow, rowNode, columns, index, isLastRow) {
            columns.forEach(function (column, index) {
                var value = _this.valueService.getValue(column, rowNode);
                var processedValue = _this.userProcessCell(rowNode, column, value, _this.gridOptionsWrapper.getProcessCellForClipboardFunc(), ag_grid_community_1.Constants.EXPORT_TYPE_CLIPBOARD);
                if (index != 0) {
                    data += deliminator;
                }
                if (ag_grid_community_1._.exists(processedValue)) {
                    data += processedValue;
                }
                var cellPosition = {
                    rowIndex: currentRow.rowIndex,
                    rowPinned: currentRow.rowPinned,
                    column: column
                };
                var cellId = _this.cellPositionUtils.createId(cellPosition);
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
        if (ag_grid_community_1._.missing(focusedCell)) {
            return;
        }
        var cellId = this.cellPositionUtils.createId(focusedCell);
        var currentRow = { rowPinned: focusedCell.rowPinned, rowIndex: focusedCell.rowIndex };
        var rowNode = this.rowPositionUtils.getRowNode(currentRow);
        var column = focusedCell.column;
        var value = this.valueService.getValue(column, rowNode);
        var processedValue = this.userProcessCell(rowNode, column, value, this.gridOptionsWrapper.getProcessCellForClipboardFunc(), ag_grid_community_1.Constants.EXPORT_TYPE_CLIPBOARD);
        if (ag_grid_community_1._.missing(processedValue)) {
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
                type: ag_grid_community_1.Events.EVENT_FLASH_CELLS,
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
        else {
            return value;
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
            processCellCallback: this.gridOptionsWrapper.getProcessCellForClipboardFunc(),
            processHeaderCallback: this.gridOptionsWrapper.getProcessHeaderForClipboardFunc()
        };
        var data = this.csvCreator.getDataAsCsv(params);
        this.copyDataToClipboard(data);
    };
    ClipboardService.prototype.copyDataToClipboard = function (data) {
        var userProvidedFunc = this.gridOptionsWrapper.getSendToClipboardFunc();
        if (userProvidedFunc && ag_grid_community_1._.exists(userProvidedFunc)) {
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
            var lastItem = ag_grid_community_1._.last(arrData);
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
        ag_grid_community_1.Autowired('csvCreator'),
        __metadata("design:type", ag_grid_community_1.CsvCreator)
    ], ClipboardService.prototype, "csvCreator", void 0);
    __decorate([
        ag_grid_community_1.Autowired('loggerFactory'),
        __metadata("design:type", ag_grid_community_1.LoggerFactory)
    ], ClipboardService.prototype, "loggerFactory", void 0);
    __decorate([
        ag_grid_community_1.Autowired('selectionController'),
        __metadata("design:type", ag_grid_community_1.SelectionController)
    ], ClipboardService.prototype, "selectionController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ClipboardService.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ClipboardService.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], ClipboardService.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('focusedCellController'),
        __metadata("design:type", ag_grid_community_1.FocusedCellController)
    ], ClipboardService.prototype, "focusedCellController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowRenderer'),
        __metadata("design:type", ag_grid_community_1.RowRenderer)
    ], ClipboardService.prototype, "rowRenderer", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ClipboardService.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ClipboardService.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('cellNavigationService'),
        __metadata("design:type", ag_grid_community_1.CellNavigationService)
    ], ClipboardService.prototype, "cellNavigationService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ClipboardService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnApi'),
        __metadata("design:type", ag_grid_community_1.ColumnApi)
    ], ClipboardService.prototype, "columnApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], ClipboardService.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('cellPositionUtils'),
        __metadata("design:type", ag_grid_community_1.CellPositionUtils)
    ], ClipboardService.prototype, "cellPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowPositionUtils'),
        __metadata("design:type", ag_grid_community_1.RowPositionUtils)
    ], ClipboardService.prototype, "rowPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ClipboardService.prototype, "init", null);
    ClipboardService = __decorate([
        ag_grid_community_1.Bean('clipboardService')
    ], ClipboardService);
    return ClipboardService;
}());
exports.ClipboardService = ClipboardService;
