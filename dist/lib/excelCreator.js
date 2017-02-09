// ag-grid-enterprise v8.0.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require('ag-grid/main');
var main_2 = require('ag-grid/main');
var main_3 = require('ag-grid/main');
var main_4 = require('ag-grid/main');
var excelXmlFactory_1 = require("./excelXmlFactory");
var main_5 = require('ag-grid/main');
var main_6 = require('ag-grid/main');
var main_7 = require('ag-grid/main');
var main_8 = require('ag-grid/main');
var ExcelGridSerializingSession = (function (_super) {
    __extends(ExcelGridSerializingSession, _super);
    function ExcelGridSerializingSession(columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback, excelXmlFactory, baseExcelStyles, styleLinker) {
        _super.call(this, columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback);
        this.excelXmlFactory = excelXmlFactory;
        this.styleLinker = styleLinker;
        this.mixedStyles = {};
        this.mixedStyleCounter = 0;
        this.rows = [];
        if (!baseExcelStyles) {
            this.styleIds = [];
            this.excelStyles = [];
        }
        else {
            this.styleIds = baseExcelStyles.map(function (it) {
                return it.id;
            });
            this.excelStyles = baseExcelStyles.slice();
        }
    }
    ExcelGridSerializingSession.prototype.addCustomHeader = function (customHeader) {
        throw new Error("Custom header not supported for Excel serialization");
    };
    ExcelGridSerializingSession.prototype.addCustomFooter = function (customFooter) {
        throw new Error("Custom footer not supported for Excel serialization");
    };
    ExcelGridSerializingSession.prototype.prepare = function (columnsToExport) {
        this.cols = main_6.Utils.map(columnsToExport, function (it) {
            it.getColDef().cellStyle;
            return {
                width: it.getActualWidth()
            };
        });
    };
    ExcelGridSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        var currentCells = [];
        var that = this;
        this.rows.push({
            cells: currentCells
        });
        return {
            onColumn: function (header, index, span) {
                var styleIds = that.styleLinker(main_5.RowType.HEADER_GROUPING, 1, index, "grouping-" + header, null, null);
                currentCells.push(that.createMergedCell(styleIds.length > 0 ? styleIds[0] : null, excelXmlFactory_1.ExcelDataType.String, header, span));
            }
        };
    };
    ExcelGridSerializingSession.prototype.onNewHeaderRow = function () {
        return this.onNewRow(this.onNewHeaderColumn);
    };
    ExcelGridSerializingSession.prototype.onNewBodyRow = function () {
        return this.onNewRow(this.onNewBodyColumn);
    };
    ExcelGridSerializingSession.prototype.onNewRow = function (onNewColumnAccumulator) {
        var currentCells = [];
        this.rows.push({
            cells: currentCells
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    };
    ExcelGridSerializingSession.prototype.onNewHeaderColumn = function (rowIndex, currentCells) {
        var _this = this;
        var that = this;
        return function (column, index, node) {
            var nameForCol = _this.extractHeaderValue(column);
            var styleIds = that.styleLinker(main_5.RowType.HEADER, rowIndex, index, nameForCol, column, null);
            currentCells.push(_this.createCell(styleIds.length > 0 ? styleIds[0] : null, excelXmlFactory_1.ExcelDataType.String, nameForCol));
        };
    };
    ExcelGridSerializingSession.prototype.parse = function () {
        var data = [{
                name: "ag-grid",
                table: {
                    columns: this.cols,
                    rows: this.rows
                }
            }];
        return this.excelXmlFactory.createExcelXml(this.excelStyles, data);
    };
    ExcelGridSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        var that = this;
        return function (column, index, node) {
            var valueForCell = _this.extractRowCellValue(column, index, node);
            var styleIds = that.styleLinker(main_5.RowType.BODY, rowIndex, index, valueForCell, column, node);
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
            var type = main_6.Utils.isNumeric(valueForCell) ? excelXmlFactory_1.ExcelDataType.Number : excelXmlFactory_1.ExcelDataType.String;
            currentCells.push(that.createCell(excelStyleId, type, valueForCell));
        };
    };
    ExcelGridSerializingSession.prototype.addNewMixedStyle = function (styleIds) {
        var _this = this;
        this.mixedStyleCounter += 1;
        var excelId = 'mixedStyle' + this.mixedStyleCounter;
        var resultantStyle = {};
        styleIds.forEach(function (styleId) {
            _this.excelStyles.forEach(function (excelStyle) {
                if (excelStyle.id === styleId) {
                    main_6.Utils.mergeDeep(resultantStyle, excelStyle);
                }
            });
        });
        resultantStyle['id'] = excelId;
        resultantStyle['name'] = excelId;
        var key = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.styleIds.push(excelId);
    };
    ExcelGridSerializingSession.prototype.styleExists = function (styleId) {
        if (styleId == null)
            return false;
        return this.styleIds.indexOf(styleId) > -1;
    };
    ExcelGridSerializingSession.prototype.createCell = function (styleId, type, value) {
        return {
            styleId: this.styleExists(styleId) ? styleId : null,
            data: {
                type: type,
                value: value
            }
        };
    };
    ExcelGridSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        return {
            styleId: this.styleExists(styleId) ? styleId : null,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    };
    return ExcelGridSerializingSession;
}(main_5.BaseGridSerializingSession));
exports.ExcelGridSerializingSession = ExcelGridSerializingSession;
var ExcelCreator = (function () {
    function ExcelCreator() {
    }
    ExcelCreator.prototype.exportDataAsExcel = function (params) {
        var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        var fileName = fileNamePresent ? params.fileName : 'export.xls';
        if (fileName.indexOf(".") === -1) {
            fileName = fileName + '.xls';
        }
        var content = this.getDataAsExcelXml(params);
        this.downloader.download(fileName, content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    };
    ExcelCreator.prototype.getDataAsExcelXml = function (params) {
        return this.gridSerializer.serialize(new ExcelGridSerializingSession(this.columnController, this.valueService, this.gridOptionsWrapper, params.processCellCallback, params.processHeaderCallback, this.excelXmlFactory, this.gridOptions.excelStyles, this.styleLinker.bind(this)), params);
    };
    ExcelCreator.prototype.styleLinker = function (rowType, rowIndex, colIndex, value, column, node) {
        if ((rowType === main_5.RowType.HEADER) || (rowType === main_5.RowType.HEADER_GROUPING))
            return ["header"];
        if (!this.gridOptions.excelStyles || this.gridOptions.excelStyles.length === 0)
            return null;
        var styleIds = this.gridOptions.excelStyles.map(function (it) {
            return it.id;
        });
        var applicableStyles = [];
        this.stylingService.processAllCellClasses(column.getColDef(), {
            value: value,
            data: node.data,
            node: node,
            colDef: column.getColDef(),
            rowIndex: rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        }, function (className) {
            if (styleIds.indexOf(className) > -1) {
                applicableStyles.push(className);
            }
        });
        return applicableStyles.sort(function (left, right) {
            return (styleIds.indexOf(left) < styleIds.indexOf(right)) ? -1 : 1;
        });
    };
    __decorate([
        main_3.Autowired('excelXmlFactory'), 
        __metadata('design:type', excelXmlFactory_1.ExcelXmlFactory)
    ], ExcelCreator.prototype, "excelXmlFactory", void 0);
    __decorate([
        main_3.Autowired('downloader'), 
        __metadata('design:type', main_4.Downloader)
    ], ExcelCreator.prototype, "downloader", void 0);
    __decorate([
        main_3.Autowired('columnController'), 
        __metadata('design:type', main_1.ColumnController)
    ], ExcelCreator.prototype, "columnController", void 0);
    __decorate([
        main_3.Autowired('valueService'), 
        __metadata('design:type', main_2.ValueService)
    ], ExcelCreator.prototype, "valueService", void 0);
    __decorate([
        main_3.Autowired('gridSerializer'), 
        __metadata('design:type', main_5.GridSerializer)
    ], ExcelCreator.prototype, "gridSerializer", void 0);
    __decorate([
        main_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_7.GridOptionsWrapper)
    ], ExcelCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_3.Autowired('gridOptions'), 
        __metadata('design:type', Object)
    ], ExcelCreator.prototype, "gridOptions", void 0);
    __decorate([
        main_3.Autowired('stylingService'), 
        __metadata('design:type', main_8.StylingService)
    ], ExcelCreator.prototype, "stylingService", void 0);
    ExcelCreator = __decorate([
        main_3.Bean('excelCreator'), 
        __metadata('design:paramtypes', [])
    ], ExcelCreator);
    return ExcelCreator;
}());
exports.ExcelCreator = ExcelCreator;
