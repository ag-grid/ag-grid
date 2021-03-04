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
import { Constants, _ } from "@ag-grid-community/core";
import { BaseGridSerializingSession, RowType } from "@ag-grid-community/csv-export";
var BaseExcelSerializingSession = /** @class */ (function (_super) {
    __extends(BaseExcelSerializingSession, _super);
    function BaseExcelSerializingSession(config) {
        var _this = _super.call(this, config) || this;
        _this.mixedStyles = {};
        _this.mixedStyleCounter = 0;
        _this.rows = [];
        _this.config = _.assign({}, config);
        _this.stylesByIds = {};
        _this.config.baseExcelStyles.forEach(function (style) {
            _this.stylesByIds[style.id] = style;
        });
        _this.excelStyles = __spreadArrays(_this.config.baseExcelStyles);
        return _this;
    }
    BaseExcelSerializingSession.prototype.addCustomContent = function (customContent) {
        var _this = this;
        customContent.forEach(function (cells) { return _this.rows.push({ cells: cells }); });
    };
    BaseExcelSerializingSession.prototype.prepare = function (columnsToExport) {
        var _this = this;
        _super.prototype.prepare.call(this, columnsToExport);
        this.cols = columnsToExport.map(function (col, i) { return _this.convertColumnToExcel(col, i); });
    };
    BaseExcelSerializingSession.prototype.parse = function () {
        // adding custom content might have made some rows wider than the grid, so add new columns
        var longestRow = this.rows.reduce(function (a, b) { return Math.max(a, b.cells.length); }, 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }
        var data = {
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        };
        return this.createExcel(data);
    };
    BaseExcelSerializingSession.prototype.onNewHeaderRow = function () {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    };
    BaseExcelSerializingSession.prototype.onNewBodyRow = function () {
        return this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
    };
    BaseExcelSerializingSession.prototype.isFormula = function (value) {
        if (value == null) {
            return false;
        }
        return this.config.autoConvertFormulas && value.startsWith('=');
    };
    BaseExcelSerializingSession.prototype.getStyleById = function (styleId) {
        if (styleId == null) {
            return null;
        }
        return this.stylesByIds[styleId] || null;
    };
    BaseExcelSerializingSession.prototype.convertColumnToExcel = function (column, index) {
        var columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            }
            return { width: columnWidth({ column: column, index: index }) };
        }
        if (column) {
            var smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth) };
        }
        return {};
    };
    BaseExcelSerializingSession.prototype.onNewRow = function (onNewColumnAccumulator, height) {
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: height
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    };
    BaseExcelSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        return function (column, index, node) {
            var valueForCell = _this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_EXCEL, node);
            var styleIds = _this.config.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
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
            currentCells.push(_this.createCell(excelStyleId || null, _this.getDataTypeForValue(valueForCell), valueForCell));
        };
    };
    BaseExcelSerializingSession.prototype.addNewMixedStyle = function (styleIds) {
        var _this = this;
        this.mixedStyleCounter += 1;
        var excelId = 'mixedStyle' + this.mixedStyleCounter;
        var resultantStyle = {};
        styleIds.forEach(function (styleId) {
            _this.excelStyles.forEach(function (excelStyle) {
                if (excelStyle.id === styleId) {
                    _.mergeDeep(resultantStyle, _.deepCloneObject(excelStyle));
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
    return BaseExcelSerializingSession;
}(BaseGridSerializingSession));
export { BaseExcelSerializingSession };
