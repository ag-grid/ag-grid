// ag-grid-enterprise v19.1.3
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var excelXmlSerializingSession_1 = require("./excelXmlSerializingSession");
var ExcelXlsxSerializingSession = /** @class */ (function (_super) {
    __extends(ExcelXlsxSerializingSession, _super);
    function ExcelXlsxSerializingSession() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stringList = [];
        return _this;
    }
    ExcelXlsxSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        var currentCells = [];
        var that = this;
        this.rows.push({
            cells: currentCells
        });
        return {
            onColumn: function (header, index, span) {
                var styleIds = that.styleLinker(ag_grid_community_1.RowType.HEADER_GROUPING, 1, index, "grouping-" + header, null, null);
                currentCells.push(that.createMergedCell(styleIds.length > 0 ? styleIds[0] : null, 's', header, span));
            }
        };
    };
    ExcelXlsxSerializingSession.prototype.onNewHeaderColumn = function (rowIndex, currentCells) {
        var _this = this;
        var that = this;
        return function (column, index, node) {
            var nameForCol = _this.extractHeaderValue(column);
            var styleIds = that.styleLinker(ag_grid_community_1.RowType.HEADER, rowIndex, index, nameForCol, column, null);
            currentCells.push(_this.createCell(styleIds.length > 0 ? styleIds[0] : null, 's', nameForCol));
        };
    };
    ExcelXlsxSerializingSession.prototype.parse = function () {
        function join(header, body, footer) {
            var all = [];
            if (header) {
                header.forEach(function (rowArray) { return all.push({ cells: rowArray }); });
            }
            body.forEach(function (it) { return all.push(it); });
            if (footer) {
                footer.forEach(function (rowArray) { return all.push({ cells: rowArray }); });
            }
            return all;
        }
        var data = [{
                name: this.sheetName,
                table: {
                    columns: this.cols,
                    rows: join(this.customHeader, this.rows, this.customFooter)
                }
            }];
        return this.excelFactory.createExcel(this.excelStyles, data, this.stringList);
    };
    ExcelXlsxSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        var that = this;
        return function (column, index, node) {
            var valueForCell = _this.extractRowCellValue(column, index, ag_grid_community_1.Constants.EXPORT_TYPE_EXCEL, node);
            var styleIds = that.styleLinker(ag_grid_community_1.RowType.BODY, rowIndex, index, valueForCell, column, node);
            var excelStyleId = null;
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
            var type = ag_grid_community_1.Utils.isNumeric(valueForCell) ? 'n' : 's';
            currentCells.push(that.createCell(excelStyleId, type, valueForCell));
        };
    };
    ExcelXlsxSerializingSession.prototype.getStringPosition = function (val) {
        var pos = this.stringList.indexOf(val);
        if (pos < 0) {
            this.stringList.push(val);
            return this.stringList.length - 1;
        }
        return pos;
    };
    ExcelXlsxSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = this.stylesByIds[styleId];
        var styleExists = actualStyle != null;
        function getType() {
            if (styleExists &&
                actualStyle.dataType)
                switch (actualStyle.dataType) {
                    case 'string':
                        return 's';
                    case 'number':
                        return 'n';
                    case 'dateTime':
                        return 'd';
                    case 'error':
                        return 'e';
                    case 'boolean':
                        return 'b';
                    default:
                        console.warn("ag-grid: Unrecognized data type for excel export [" + actualStyle.id + ".dataType=" + actualStyle.dataType + "]");
                }
            return type;
        }
        var typeTransformed = getType();
        return {
            styleId: styleExists ? styleId : null,
            data: {
                type: typeTransformed,
                value: typeTransformed === 's' ? this.getStringPosition(value == null ? '' : value).toString() :
                    typeTransformed === 'n' ? Number(value).toString() :
                        value
            }
        };
    };
    ExcelXlsxSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        return {
            styleId: this.styleExists(styleId) ? styleId : null,
            data: {
                type: type,
                value: type === 's' ? this.getStringPosition(value == null ? '' : value).toString() : value
            },
            mergeAcross: numOfCells
        };
    };
    return ExcelXlsxSerializingSession;
}(excelXmlSerializingSession_1.ExcelXmlSerializingSession));
exports.ExcelXlsxSerializingSession = ExcelXlsxSerializingSession;
