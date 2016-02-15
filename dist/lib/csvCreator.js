/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var LINE_SEPARATOR = '\r\n';
var CsvCreator = (function () {
    function CsvCreator(rowController, columnController, grid, valueService) {
        this.rowController = rowController;
        this.columnController = columnController;
        this.grid = grid;
        this.valueService = valueService;
    }
    CsvCreator.prototype.exportDataAsCsv = function (params) {
        var csvString = this.getDataAsCsv(params);
        var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        var fileName = fileNamePresent ? params.fileName : 'export.csv';
        // for Excel, we need \ufeff at the start
        // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
        var blobObject = new Blob(["\ufeff", csvString], {
            type: "text/csv;charset=utf-8;"
        });
        // Internet Explorer
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
        }
        else {
            // Chrome
            var downloadLink = document.createElement("a");
            downloadLink.href = window.URL.createObjectURL(blobObject);
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };
    CsvCreator.prototype.getDataAsCsv = function (params) {
        var _this = this;
        if (!this.grid.isUsingInMemoryModel()) {
            console.log('ag-Grid: getDataAsCsv not available when doing virtual pagination');
            return '';
        }
        var result = '';
        var skipGroups = params && params.skipGroups;
        var skipHeader = params && params.skipHeader;
        var skipFooters = params && params.skipFooters;
        var includeCustomHeader = params && params.customHeader;
        var includeCustomFooter = params && params.customFooter;
        var allColumns = params && params.allColumns;
        var columnSeparator = (params && params.columnSeparator) || ',';
        var columnsToExport;
        if (allColumns) {
            columnsToExport = this.columnController.getAllColumns();
        }
        else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }
        if (!columnsToExport || columnsToExport.length === 0) {
            return '';
        }
        if (includeCustomHeader) {
            result += params.customHeader;
        }
        // first pass, put in the header names of the cols
        if (!skipHeader) {
            columnsToExport.forEach(function (column, index) {
                var nameForCol = _this.columnController.getDisplayNameForCol(column);
                if (nameForCol === null || nameForCol === undefined) {
                    nameForCol = '';
                }
                if (index != 0) {
                    result += columnSeparator;
                }
                result += '"' + _this.escape(nameForCol) + '"';
            });
            result += LINE_SEPARATOR;
        }
        this.rowController.forEachNodeAfterFilterAndSort(function (node) {
            if (skipGroups && node.group) {
                return;
            }
            if (skipFooters && node.footer) {
                return;
            }
            columnsToExport.forEach(function (column, index) {
                var valueForCell;
                if (node.group && index === 0) {
                    valueForCell = _this.createValueForGroupNode(node);
                }
                else {
                    valueForCell = _this.valueService.getValue(column.getColDef(), node.data, node);
                }
                if (valueForCell === null || valueForCell === undefined) {
                    valueForCell = '';
                }
                if (index != 0) {
                    result += columnSeparator;
                }
                result += '"' + _this.escape(valueForCell) + '"';
            });
            result += LINE_SEPARATOR;
        });
        if (includeCustomFooter) {
            result += params.customFooter;
        }
        return result;
    };
    CsvCreator.prototype.createValueForGroupNode = function (node) {
        var keys = [node.key];
        while (node.parent) {
            node = node.parent;
            keys.push(node.key);
        }
        return keys.reverse().join(' -> ');
    };
    // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
    CsvCreator.prototype.escape = function (value) {
        if (value === null || value === undefined) {
            return '';
        }
        var stringValue;
        if (typeof value === 'string') {
            stringValue = value;
        }
        else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        }
        else {
            console.warn('known value type during csv conversio');
            stringValue = '';
        }
        return stringValue.replace(/"/g, "\"\"");
    };
    return CsvCreator;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CsvCreator;
