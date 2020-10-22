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
import { _ } from '@ag-grid-community/core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { RowType } from "@ag-grid-community/csv-export";
var ExcelXlsxSerializingSession = /** @class */ (function (_super) {
    __extends(ExcelXlsxSerializingSession, _super);
    function ExcelXlsxSerializingSession() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stringList = [];
        _this.stringMap = {};
        return _this;
    }
    ExcelXlsxSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        var _this = this;
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: this.config.headerRowHeight
        });
        return {
            onColumn: function (header, index, span) {
                var styleIds = _this.config.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(_this.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 's', header, span));
            }
        };
    };
    ExcelXlsxSerializingSession.prototype.onNewHeaderColumn = function (rowIndex, currentCells) {
        var _this = this;
        return function (column, index, node) {
            var nameForCol = _this.extractHeaderValue(column);
            var styleIds = _this.config.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(_this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 's', nameForCol));
        };
    };
    ExcelXlsxSerializingSession.prototype.createExcel = function (data) {
        return this.config.excelFactory.createExcel(this.excelStyles, data, this.stringList);
    };
    ExcelXlsxSerializingSession.prototype.getDataTypeForValue = function (valueForCell) {
        return _.isNumeric(valueForCell) ? 'n' : 's';
    };
    ExcelXlsxSerializingSession.prototype.getStringPosition = function (val) {
        var pos = this.stringMap[val];
        if (pos === undefined) {
            pos = this.stringMap[val] = this.stringList.length;
            this.stringList.push(val);
        }
        return pos;
    };
    ExcelXlsxSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = styleId && this.stylesByIds[styleId];
        var styleExists = actualStyle !== undefined;
        function getType() {
            if (styleExists &&
                actualStyle.dataType) {
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
            }
            return type;
        }
        var typeTransformed = getType();
        return {
            styleId: styleExists ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: typeTransformed === 's'
                    ? this.getStringPosition(value == null ? '' : value).toString()
                    : typeTransformed === 'n'
                        ? Number(value).toString()
                        : value
            }
        };
    };
    ExcelXlsxSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        return {
            styleId: this.styleExists(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: type === 's' ? this.getStringPosition(value == null ? '' : value).toString() : value
            },
            mergeAcross: numOfCells
        };
    };
    return ExcelXlsxSerializingSession;
}(ExcelXmlSerializingSession));
export { ExcelXlsxSerializingSession };
