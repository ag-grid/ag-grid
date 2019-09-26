// ag-grid-enterprise v21.2.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var ExcelXmlSerializingSession = /** @class */ (function (_super) {
    __extends(ExcelXmlSerializingSession, _super);
    function ExcelXmlSerializingSession(config) {
        var _this = _super.call(this, {
            columnController: config.columnController,
            valueService: config.valueService,
            gridOptionsWrapper: config.gridOptionsWrapper,
            processCellCallback: config.processCellCallback,
            processHeaderCallback: config.processHeaderCallback,
            cellAndHeaderEscaper: function (raw) { return raw; }
        }) || this;
        _this.mixedStyles = {};
        _this.mixedStyleCounter = 0;
        _this.rows = [];
        var sheetName = config.sheetName, excelFactory = config.excelFactory, baseExcelStyles = config.baseExcelStyles, styleLinker = config.styleLinker, suppressTextAsCDATA = config.suppressTextAsCDATA, rowHeight = config.rowHeight, headerRowHeight = config.headerRowHeight;
        _this.sheetName = sheetName;
        _this.excelFactory = excelFactory;
        _this.baseExcelStyles = baseExcelStyles || [];
        _this.styleLinker = styleLinker;
        _this.suppressTextAsCDATA = suppressTextAsCDATA;
        _this.stylesByIds = {};
        _this.rowHeight = rowHeight;
        _this.headerRowHeight = headerRowHeight;
        _this.baseExcelStyles.forEach(function (it) {
            _this.stylesByIds[it.id] = it;
        });
        _this.excelStyles = _this.baseExcelStyles.slice();
        return _this;
    }
    ExcelXmlSerializingSession.prototype.addCustomHeader = function (customHeader) {
        this.customHeader = customHeader;
    };
    ExcelXmlSerializingSession.prototype.addCustomFooter = function (customFooter) {
        this.customFooter = customFooter;
    };
    ExcelXmlSerializingSession.prototype.prepare = function (columnsToExport) {
        this.cols = ag_grid_community_1._.map(columnsToExport, function (it) {
            // tslint:disable-next-line
            it.getColDef().cellStyle;
            return {
                width: it.getActualWidth()
            };
        });
    };
    ExcelXmlSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        var currentCells = [];
        var that = this;
        this.rows.push({
            cells: currentCells,
            height: this.headerRowHeight
        });
        return {
            onColumn: function (header, index, span) {
                var styleIds = that.styleLinker(ag_grid_community_1.RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(that.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, "String", header, span));
            }
        };
    };
    ExcelXmlSerializingSession.prototype.onNewHeaderRow = function () {
        return this.onNewRow(this.onNewHeaderColumn, this.headerRowHeight);
    };
    ExcelXmlSerializingSession.prototype.onNewBodyRow = function () {
        return this.onNewRow(this.onNewBodyColumn, this.rowHeight);
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
        var that = this;
        return function (column, index, node) {
            var nameForCol = _this.extractHeaderValue(column);
            var styleIds = that.styleLinker(ag_grid_community_1.RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(_this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 'String', nameForCol));
        };
    };
    ExcelXmlSerializingSession.prototype.parse = function () {
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
        return this.excelFactory.createExcel(this.excelStyles, data, []);
    };
    ExcelXmlSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        var that = this;
        return function (column, index, node) {
            var valueForCell = _this.extractRowCellValue(column, index, ag_grid_community_1.Constants.EXPORT_TYPE_EXCEL, node);
            var styleIds = that.styleLinker(ag_grid_community_1.RowType.BODY, rowIndex, index, valueForCell, column, node);
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
            var type = ag_grid_community_1._.isNumeric(valueForCell) ? 'Number' : 'String';
            currentCells.push(that.createCell(excelStyleId, type, valueForCell));
        };
    };
    ExcelXmlSerializingSession.prototype.addNewMixedStyle = function (styleIds) {
        var _this = this;
        this.mixedStyleCounter += 1;
        var excelId = 'mixedStyle' + this.mixedStyleCounter;
        var resultantStyle = {};
        styleIds.forEach(function (styleId) {
            _this.excelStyles.forEach(function (excelStyle) {
                if (excelStyle.id === styleId) {
                    ag_grid_community_1._.mergeDeep(resultantStyle, ag_grid_community_1._.deepCloneObject(excelStyle));
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
        var massageText = function (val) { return _this.suppressTextAsCDATA ? ag_grid_community_1._.escape(val) : "<![CDATA[" + val + "]]>"; };
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
    return ExcelXmlSerializingSession;
}(ag_grid_community_1.BaseGridSerializingSession));
exports.ExcelXmlSerializingSession = ExcelXmlSerializingSession;
