// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var main_1 = require("ag-grid/main");
var excelXmlFactory_1 = require("./excelXmlFactory");
var ExcelGridSerializingSession = (function (_super) {
    __extends(ExcelGridSerializingSession, _super);
    function ExcelGridSerializingSession(columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback, sheetName, excelXmlFactory, baseExcelStyles, styleLinker) {
        var _this = _super.call(this, columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback, function (raw) { return main_1.Utils.escape(raw); }) || this;
        _this.excelXmlFactory = excelXmlFactory;
        _this.styleLinker = styleLinker;
        _this.mixedStyles = {};
        _this.mixedStyleCounter = 0;
        _this.rows = [];
        _this.stylesByIds = {};
        if (!baseExcelStyles) {
            _this.excelStyles = [];
        }
        else {
            baseExcelStyles.forEach(function (it) {
                _this.stylesByIds[it.id] = it;
            });
            _this.excelStyles = baseExcelStyles.slice();
        }
        _this.sheetName = sheetName;
        return _this;
    }
    ExcelGridSerializingSession.prototype.addCustomHeader = function (customHeader) {
        this.customHeader = customHeader;
    };
    ExcelGridSerializingSession.prototype.addCustomFooter = function (customFooter) {
        this.customFooter = customFooter;
    };
    ExcelGridSerializingSession.prototype.prepare = function (columnsToExport) {
        this.cols = main_1.Utils.map(columnsToExport, function (it) {
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
                var styleIds = that.styleLinker(main_1.RowType.HEADER_GROUPING, 1, index, "grouping-" + header, null, null);
                currentCells.push(that.createMergedCell(styleIds.length > 0 ? styleIds[0] : null, "String", header, span));
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
            var styleIds = that.styleLinker(main_1.RowType.HEADER, rowIndex, index, nameForCol, column, null);
            currentCells.push(_this.createCell(styleIds.length > 0 ? styleIds[0] : null, 'String', nameForCol));
        };
    };
    ExcelGridSerializingSession.prototype.parse = function () {
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
        return this.excelXmlFactory.createExcelXml(this.excelStyles, data);
    };
    ExcelGridSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        var that = this;
        return function (column, index, node) {
            var valueForCell = _this.extractRowCellValue(column, index, main_1.Constants.EXPORT_TYPE_EXCEL, node);
            var styleIds = that.styleLinker(main_1.RowType.BODY, rowIndex, index, valueForCell, column, node);
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
            var type = main_1.Utils.isNumeric(valueForCell) ? 'Number' : 'String';
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
                    main_1.Utils.mergeDeep(resultantStyle, excelStyle);
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
        this.stylesByIds[excelId] = resultantStyle;
    };
    ExcelGridSerializingSession.prototype.styleExists = function (styleId) {
        if (styleId == null)
            return false;
        return this.stylesByIds[styleId];
    };
    ExcelGridSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = this.stylesByIds[styleId];
        var styleExists = actualStyle != null;
        function getType() {
            if (styleExists &&
                actualStyle.dataType)
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
            return type;
        }
        return {
            styleId: styleExists ? styleId : null,
            data: {
                type: getType(),
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
}(main_1.BaseGridSerializingSession));
exports.ExcelGridSerializingSession = ExcelGridSerializingSession;
var ExcelCreator = (function (_super) {
    __extends(ExcelCreator, _super);
    function ExcelCreator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExcelCreator.prototype.postConstruct = function () {
        this.setBeans({
            downloader: this.downloader,
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    };
    ExcelCreator.prototype.exportDataAsExcel = function (params) {
        return this.export(params);
    };
    ExcelCreator.prototype.getDataAsExcelXml = function (params) {
        return this.getData(params);
    };
    ExcelCreator.prototype.getMimeType = function () {
        return "application/vnd.ms-excel";
    };
    ExcelCreator.prototype.getDefaultFileName = function () {
        return 'export.xls';
    };
    ExcelCreator.prototype.getDefaultFileExtension = function () {
        return 'xls';
    };
    ExcelCreator.prototype.createSerializingSession = function (params) {
        return new ExcelGridSerializingSession(this.columnController, this.valueService, this.gridOptionsWrapper, params ? params.processCellCallback : null, params ? params.processHeaderCallback : null, params && params.sheetName != null && params.sheetName != "" ? params.sheetName : 'ag-grid', this.excelXmlFactory, this.gridOptions.excelStyles, this.styleLinker.bind(this));
    };
    ExcelCreator.prototype.styleLinker = function (rowType, rowIndex, colIndex, value, column, node) {
        if ((rowType === main_1.RowType.HEADER) || (rowType === main_1.RowType.HEADER_GROUPING))
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
    ExcelCreator.prototype.isExportSuppressed = function () {
        return this.gridOptionsWrapper.isSuppressExcelExport();
    };
    __decorate([
        main_1.Autowired('excelXmlFactory'),
        __metadata("design:type", excelXmlFactory_1.ExcelXmlFactory)
    ], ExcelCreator.prototype, "excelXmlFactory", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], ExcelCreator.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('valueService'),
        __metadata("design:type", main_1.ValueService)
    ], ExcelCreator.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('gridOptions'),
        __metadata("design:type", Object)
    ], ExcelCreator.prototype, "gridOptions", void 0);
    __decorate([
        main_1.Autowired('stylingService'),
        __metadata("design:type", main_1.StylingService)
    ], ExcelCreator.prototype, "stylingService", void 0);
    __decorate([
        main_1.Autowired('downloader'),
        __metadata("design:type", main_1.Downloader)
    ], ExcelCreator.prototype, "downloader", void 0);
    __decorate([
        main_1.Autowired('gridSerializer'),
        __metadata("design:type", main_1.GridSerializer)
    ], ExcelCreator.prototype, "gridSerializer", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], ExcelCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ExcelCreator.prototype, "postConstruct", null);
    ExcelCreator = __decorate([
        main_1.Bean('excelCreator')
    ], ExcelCreator);
    return ExcelCreator;
}(main_1.BaseCreator));
exports.ExcelCreator = ExcelCreator;
