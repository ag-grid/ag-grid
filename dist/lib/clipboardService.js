// ag-grid-enterprise v4.0.7
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var rangeController_1 = require("./rangeController");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var main_8 = require("ag-grid/main");
var main_9 = require("ag-grid/main");
var main_10 = require("ag-grid/main");
var main_11 = require("ag-grid/main");
var main_12 = require("ag-grid/main");
var main_13 = require("ag-grid/main");
var main_14 = require("ag-grid/main");
var main_15 = require("ag-grid/main");
var main_16 = require("ag-grid/main");
var main_17 = require("ag-grid/main");
var main_18 = require("ag-grid/main");
var main_19 = require("ag-grid/main");
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
        this.forEachRangeRow(function (currentRow, rowNode, columns) {
            // take reference of first row, this is the one we will be using to copy from
            if (!firstRowValues) {
                firstRowValues = [];
                columns.forEach(function (column) {
                    var value = _this.valueService.getValue(column, rowNode);
                    firstRowValues.push(value);
                });
            }
            else {
                // otherwise we are not the first row, so copy
                columns.forEach(function (column, index) {
                    if (!column.isCellEditable(rowNode)) {
                        return;
                    }
                    var firstRowValue = firstRowValues[index];
                    _this.valueService.setValue(rowNode, column, firstRowValue);
                    var cellId = new main_17.GridCell(currentRow.rowIndex, currentRow.floating, column).createId();
                    cellsToFlash[cellId] = true;
                });
            }
        });
        // this is very heavy, should possibly just refresh the specific cells?
        this.rowRenderer.refreshView();
        this.eventService.dispatchEvent(main_18.Events.EVENT_FLASH_CELLS, { cells: cellsToFlash });
    };
    ClipboardService.prototype.finishPasteFromClipboard = function (data) {
        var _this = this;
        if (main_16.Utils.missingOrEmpty(data)) {
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
            main_16.Utils.removeFromArray(parsedData, lastLine);
        }
        var currentRow = new main_15.GridRow(focusedCell.rowIndex, focusedCell.floating);
        var cellsToFlash = {};
        parsedData.forEach(function (values) {
            // if we have come to end of rows in grid, then skip
            if (!currentRow) {
                return;
            }
            var rowNode = _this.getRowNode(currentRow);
            var column = focusedCell.column;
            values.forEach(function (value) {
                if (main_16.Utils.missing(column)) {
                    return;
                }
                if (!column.isCellEditable(rowNode)) {
                    return;
                }
                _this.valueService.setValue(rowNode, column, value);
                var cellId = new main_17.GridCell(currentRow.rowIndex, currentRow.floating, column).createId();
                cellsToFlash[cellId] = true;
                column = _this.columnController.getDisplayedColAfter(column);
            });
            // move to next row down for next set of values
            currentRow = _this.cellNavigationService.getRowBelow(currentRow);
        });
        // this is very heavy, should possibly just refresh the specific cells?
        this.rowRenderer.refreshView();
        this.eventService.dispatchEvent(main_18.Events.EVENT_FLASH_CELLS, { cells: cellsToFlash });
    };
    ClipboardService.prototype.copyToClipboard = function () {
        this.logger.log('copyToClipboard');
        // default is copy range if exists, otherwise rows
        if (this.rangeController.isMoreThanOneCell()) {
            this.copySelectedRangeToClipboard();
        }
        else if (!this.selectionController.isEmpty()) {
            this.copySelectedRowsToClipboard();
        }
        else if (!this.rangeController.isEmpty()) {
            this.copySelectedRangeToClipboard();
        }
    };
    ClipboardService.prototype.forEachRangeRow = function (callback) {
        if (this.rangeController.isEmpty()) {
            return;
        }
        var rangeSelections = this.rangeController.getCellRanges();
        // if more than one range selected, we take the first one only, we ignore the others,
        // in Excel, it doesn't allow multiple blocks to be copied to clipboard at same time
        var range = rangeSelections[0];
        // get starting and ending row, remember rowEnd could be before rowStart
        var startRow = range.start.getGridRow();
        var endRow = range.end.getGridRow();
        var startRowIsFirst = startRow.before(endRow);
        var currentRow = startRowIsFirst ? startRow : endRow;
        var lastRow = startRowIsFirst ? endRow : startRow;
        while (true) {
            var rowNode = this.getRowNode(currentRow);
            callback(currentRow, rowNode, range.columns);
            if (currentRow.equals(lastRow)) {
                break;
            }
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    };
    ClipboardService.prototype.copySelectedRangeToClipboard = function () {
        var _this = this;
        if (this.rangeController.isEmpty()) {
            return;
        }
        var data = '';
        var cellsToFlash = {};
        this.forEachRangeRow(function (currentRow, rowNode, columns) {
            columns.forEach(function (column, index) {
                var value = _this.valueService.getValue(column, rowNode);
                value = _this.processRangeCell(rowNode, column, value);
                if (index != 0) {
                    data += '\t';
                }
                if (main_16.Utils.exists(value)) {
                    data += value;
                }
                var cellId = new main_17.GridCell(currentRow.rowIndex, currentRow.floating, column).createId();
                cellsToFlash[cellId] = true;
            });
            data += '\r\n';
        });
        this.copyDataToClipboard(data);
        this.eventService.dispatchEvent(main_18.Events.EVENT_FLASH_CELLS, { cells: cellsToFlash });
    };
    ClipboardService.prototype.processRangeCell = function (rowNode, column, value) {
        var func = this.gridOptionsWrapper.getProcessCellForClipboardFunc();
        if (func) {
            return func({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        }
        else {
            return value;
        }
    };
    ClipboardService.prototype.getRowNode = function (gridRow) {
        switch (gridRow.floating) {
            case main_19.Constants.FLOATING_TOP:
                return this.floatingRowModel.getFloatingTopRowData()[gridRow.rowIndex];
            case main_19.Constants.FLOATING_BOTTOM:
                return this.floatingRowModel.getFloatingBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    ClipboardService.prototype.copySelectedRowsToClipboard = function () {
        var data = this.csvCreator.getDataAsCsv({
            skipHeader: true,
            skipFooters: true,
            columnSeparator: '\t',
            onlySelected: true,
            processCellCallback: this.gridOptionsWrapper.getProcessCellForClipboardFunc()
        });
        this.copyDataToClipboard(data);
    };
    ClipboardService.prototype.copyDataToClipboard = function (data) {
        this.executeOnTempElement(function (element) {
            element.value = data;
            element.select();
            element.focus();
            return document.execCommand('copy');
        });
    };
    ClipboardService.prototype.executeOnTempElement = function (callbackNow, callbackAfter) {
        var eTempInput = document.createElement('textarea');
        eTempInput.style.width = '1px';
        eTempInput.style.height = '1px';
        eTempInput.style.top = '0px';
        eTempInput.style.left = '0px';
        eTempInput.style.position = 'absolute';
        eTempInput.style.opacity = '0.0';
        document.body.appendChild(eTempInput);
        try {
            var result = callbackNow(eTempInput);
            this.logger.log('Clipboard operation result: ' + result);
        }
        catch (err) {
            this.logger.log('Browser doesn\t support document.execComment(\'copy\') for clipboard operations');
        }
        if (callbackAfter) {
            setTimeout(function () {
                callbackAfter(eTempInput);
                document.body.removeChild(eTempInput);
            }, 0);
        }
        else {
            document.body.removeChild(eTempInput);
        }
    };
    // From http://stackoverflow.com/questions/1293147/javascript-code-to-parse-csv-data
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    ClipboardService.prototype.dataToArray = function (strData) {
        var strDelimiter = '\t';
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter) {
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);
            }
            var strMatchedValue;
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
            }
            else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return arrData;
    };
    __decorate([
        main_2.Autowired('csvCreator'), 
        __metadata('design:type', main_3.CsvCreator)
    ], ClipboardService.prototype, "csvCreator", void 0);
    __decorate([
        main_2.Autowired('loggerFactory'), 
        __metadata('design:type', main_4.LoggerFactory)
    ], ClipboardService.prototype, "loggerFactory", void 0);
    __decorate([
        main_2.Autowired('selectionController'), 
        __metadata('design:type', main_5.SelectionController)
    ], ClipboardService.prototype, "selectionController", void 0);
    __decorate([
        main_2.Autowired('rangeController'), 
        __metadata('design:type', rangeController_1.RangeController)
    ], ClipboardService.prototype, "rangeController", void 0);
    __decorate([
        main_2.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], ClipboardService.prototype, "rowModel", void 0);
    __decorate([
        main_2.Autowired('floatingRowModel'), 
        __metadata('design:type', main_6.FloatingRowModel)
    ], ClipboardService.prototype, "floatingRowModel", void 0);
    __decorate([
        main_2.Autowired('valueService'), 
        __metadata('design:type', main_7.ValueService)
    ], ClipboardService.prototype, "valueService", void 0);
    __decorate([
        main_2.Autowired('focusedCellController'), 
        __metadata('design:type', main_8.FocusedCellController)
    ], ClipboardService.prototype, "focusedCellController", void 0);
    __decorate([
        main_2.Autowired('rowRenderer'), 
        __metadata('design:type', main_9.RowRenderer)
    ], ClipboardService.prototype, "rowRenderer", void 0);
    __decorate([
        main_2.Autowired('columnController'), 
        __metadata('design:type', main_10.ColumnController)
    ], ClipboardService.prototype, "columnController", void 0);
    __decorate([
        main_2.Autowired('eventService'), 
        __metadata('design:type', main_11.EventService)
    ], ClipboardService.prototype, "eventService", void 0);
    __decorate([
        main_2.Autowired('cellNavigationService'), 
        __metadata('design:type', main_12.CellNavigationService)
    ], ClipboardService.prototype, "cellNavigationService", void 0);
    __decorate([
        main_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_13.GridOptionsWrapper)
    ], ClipboardService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_14.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ClipboardService.prototype, "init", null);
    ClipboardService = __decorate([
        main_1.Bean('clipboardService'), 
        __metadata('design:paramtypes', [])
    ], ClipboardService);
    return ClipboardService;
})();
exports.ClipboardService = ClipboardService;
