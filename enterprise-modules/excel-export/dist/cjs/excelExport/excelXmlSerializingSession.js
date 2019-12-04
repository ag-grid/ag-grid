"use strict";
var __extends = (this && this.__extends) || (function () {
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var csv_export_1 = require("@ag-grid-community/csv-export");
var ExcelXmlSerializingSession = /** @class */ (function (_super) {
    __extends(ExcelXmlSerializingSession, _super);
    function ExcelXmlSerializingSession(config) {
        var _this = _super.call(this, config) || this;
        _this.mixedStyles = {};
        _this.mixedStyleCounter = 0;
        _this.rows = [];
        _this.config = core_1._.assign({}, config);
        _this.stylesByIds = {};
        _this.config.baseExcelStyles.forEach(function (style) {
            _this.stylesByIds[style.id] = style;
        });
        _this.excelStyles = __spreadArrays(_this.config.baseExcelStyles);
        return _this;
    }
    ExcelXmlSerializingSession.prototype.addCustomContent = function (customContent) {
        var _this = this;
        customContent.forEach(function (cells) { return _this.rows.push({ cells: cells }); });
    };
    ExcelXmlSerializingSession.prototype.prepare = function (columnsToExport) {
        var _this = this;
        _super.prototype.prepare.call(this, columnsToExport);
        this.cols = columnsToExport.map(function (col, i) { return _this.convertColumnToExcel(col, i); });
    };
    ExcelXmlSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        var _this = this;
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: this.config.headerRowHeight
        });
        return {
            onColumn: function (header, index, span) {
                var styleIds = _this.config.styleLinker(csv_export_1.RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(_this.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, "String", header, span));
            }
        };
    };
    ExcelXmlSerializingSession.prototype.onNewHeaderRow = function () {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    };
    ExcelXmlSerializingSession.prototype.onNewBodyRow = function () {
        return this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
    };
    ExcelXmlSerializingSession.prototype.onNewRow = function (onNewColumnAccumulator, height) {
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: height
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    };
    ExcelXmlSerializingSession.prototype.onNewHeaderColumn = function (rowIndex, currentCells) {
        var _this = this;
        return function (column, index) {
            var nameForCol = _this.extractHeaderValue(column);
            var styleIds = _this.config.styleLinker(csv_export_1.RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(_this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 'String', nameForCol));
        };
    };
    ExcelXmlSerializingSession.prototype.parse = function () {
        // adding custom content might have made some rows wider than the grid, so add new columns
        var longestRow = this.rows.reduce(function (a, b) { return Math.max(a, b.cells.length); }, 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }
        var data = [{
                name: this.config.sheetName,
                table: {
                    columns: this.cols,
                    rows: this.rows
                }
            }];
        return this.createExcel(data);
    };
    ExcelXmlSerializingSession.prototype.createExcel = function (data) {
        return this.config.excelFactory.createExcel(this.excelStyles, data, []);
    };
    ExcelXmlSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        return function (column, index, node) {
            var valueForCell = _this.extractRowCellValue(column, index, core_1.Constants.EXPORT_TYPE_EXCEL, node);
            var styleIds = _this.config.styleLinker(csv_export_1.RowType.BODY, rowIndex, index, valueForCell, column, node);
            var excelStyleId;
            if (styleIds && styleIds.length == 1) {
                excelStyleId = styleIds[0];
            }
            else if (styleIds && styleIds.length > 1) {
                var key = styleIds.join("-");
                if (!_this.mixedStyles[key]) {
                    _this.addNewMixedStyle(styleIds);
                }
                excelStyleId = _this.mixedStyles[key].excelID;
            }
            currentCells.push(_this.createCell(excelStyleId, _this.getDataTypeForValue(valueForCell), valueForCell));
        };
    };
    ExcelXmlSerializingSession.prototype.getDataTypeForValue = function (valueForCell) {
        return core_1._.isNumeric(valueForCell) ? 'Number' : 'String';
    };
    ExcelXmlSerializingSession.prototype.addNewMixedStyle = function (styleIds) {
        var _this = this;
        this.mixedStyleCounter += 1;
        var excelId = 'mixedStyle' + this.mixedStyleCounter;
        var resultantStyle = {};
        styleIds.forEach(function (styleId) {
            _this.excelStyles.forEach(function (excelStyle) {
                if (excelStyle.id === styleId) {
                    core_1._.mergeDeep(resultantStyle, core_1._.deepCloneObject(excelStyle));
                }
            });
        });
        resultantStyle.id = excelId;
        resultantStyle.name = excelId;
        var key = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    };
    ExcelXmlSerializingSession.prototype.styleExists = function (styleId) {
        if (styleId == null) {
            return false;
        }
        return this.stylesByIds[styleId];
    };
    ExcelXmlSerializingSession.prototype.createCell = function (styleId, type, value) {
        var _this = this;
        var actualStyle = styleId && this.stylesByIds[styleId];
        var styleExists = actualStyle !== undefined;
        function getType() {
            if (styleExists &&
                actualStyle.dataType) {
                switch (actualStyle.dataType) {
                    case 'string':
                        return 'String';
                    case 'number':
                        return 'Number';
                    case 'dateTime':
                        return 'DateTime';
                    case 'error':
                        return 'Error';
                    case 'boolean':
                        return 'Boolean';
                    default:
                        console.warn("ag-grid: Unrecognized data type for excel export [" + actualStyle.id + ".dataType=" + actualStyle.dataType + "]");
                }
            }
            return type;
        }
        var typeTransformed = getType();
        var massageText = function (val) {
            if (_this.config.suppressTextAsCDATA) {
                return core_1._.escape(val);
            }
            var cdataStart = '<![CDATA[';
            var cdataEnd = ']]>';
            var cdataEndRegex = new RegExp(cdataEnd, "g");
            return cdataStart
                // CDATA sections are closed by the character sequence ']]>' and there is no
                // way of escaping this, so if the text contains the offending sequence, emit
                // multiple CDATA sections and split the characters between them.
                + String(val).replace(cdataEndRegex, ']]' + cdataEnd + cdataStart + '>')
                + cdataEnd;
        };
        var convertBoolean = function (val) {
            if (!val || val === '0' || val === 'false') {
                return '0';
            }
            return '1';
        };
        return {
            styleId: styleExists ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: typeTransformed === 'String' ? massageText(value) :
                    typeTransformed === 'Number' ? Number(value).valueOf() + '' :
                        typeTransformed === 'Boolean' ? convertBoolean(value) :
                            value
            }
        };
    };
    ExcelXmlSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        return {
            styleId: this.styleExists(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    };
    ExcelXmlSerializingSession.prototype.convertColumnToExcel = function (column, index) {
        var columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            }
            else {
                return { width: columnWidth({ column: column, index: index }) };
            }
        }
        if (column) {
            var smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth) };
        }
        return {};
    };
    return ExcelXmlSerializingSession;
}(csv_export_1.BaseGridSerializingSession));
exports.ExcelXmlSerializingSession = ExcelXmlSerializingSession;
//# sourceMappingURL=excelXmlSerializingSession.js.map