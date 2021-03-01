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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct, _ } from '@ag-grid-community/core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseCreator, ZipContainer, RowType, Downloader } from "@ag-grid-community/csv-export";
import { ExcelXmlFactory } from './excelXmlFactory';
export var getMultipleSheetsAsExcel = function (params) {
    var data = params.data, _a = params.fontSize, fontSize = _a === void 0 ? 11 : _a, _b = params.author, author = _b === void 0 ? 'AG Grid' : _b;
    ZipContainer.addFolders([
        'xl/worksheets/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'docProps/',
        '_rels/'
    ]);
    var sheetLen = data.length;
    data.forEach(function (value, idx) {
        ZipContainer.addFile("xl/worksheets/sheet" + (idx + 1) + ".xml", value);
    });
    ZipContainer.addFile('xl/workbook.xml', ExcelXlsxFactory.createWorkbook());
    ZipContainer.addFile('xl/styles.xml', ExcelXlsxFactory.createStylesheet(fontSize));
    ZipContainer.addFile('xl/sharedStrings.xml', ExcelXlsxFactory.createSharedStrings());
    ZipContainer.addFile('xl/theme/theme1.xml', ExcelXlsxFactory.createTheme());
    ZipContainer.addFile('xl/_rels/workbook.xml.rels', ExcelXlsxFactory.createWorkbookRels(sheetLen));
    ZipContainer.addFile('docProps/core.xml', ExcelXlsxFactory.createCore(author));
    ZipContainer.addFile('[Content_Types].xml', ExcelXlsxFactory.createContentTypes(sheetLen));
    ZipContainer.addFile('_rels/.rels', ExcelXlsxFactory.createRels());
    ExcelXlsxFactory.resetFactory();
    return ZipContainer.getContent('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};
export var exportMultipleSheetsAsExcel = function (properties) {
    var _a = properties.fileName, fileName = _a === void 0 ? 'export.xlsx' : _a;
    Downloader.download(fileName, getMultipleSheetsAsExcel(properties));
};
var ExcelCreator = /** @class */ (function (_super) {
    __extends(ExcelCreator, _super);
    function ExcelCreator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.exportMode = 'xlsx';
        return _this;
    }
    ExcelCreator.prototype.postConstruct = function () {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    };
    ExcelCreator.prototype.export = function (userParams) {
        if (this.isExportSuppressed()) {
            console.warn("ag-grid: Export cancelled. Export is not allowed as per your configuration.");
            return '';
        }
        var _a = this.getMergedParamsAndData(userParams), mergedParams = _a.mergedParams, data = _a.data;
        Downloader.download(this.getFileName(mergedParams.fileName), this.packageFile({
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author
        }));
        return data;
    };
    ExcelCreator.prototype.exportDataAsExcel = function (params) {
        var exportMode = 'xlsx';
        if (params && params.exportMode) {
            exportMode = params.exportMode;
        }
        this.setExportMode(exportMode);
        return this.export(params);
    };
    ExcelCreator.prototype.getDataAsExcel = function (params) {
        var _a = this.getMergedParamsAndData(params), mergedParams = _a.mergedParams, data = _a.data;
        if (params && params.exportMode === 'xml') {
            return data;
        }
        return this.packageFile({
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author
        });
    };
    ExcelCreator.prototype.setFactoryMode = function (factoryMode, exportMode) {
        if (exportMode === void 0) { exportMode = 'xlsx'; }
        var factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        factory.factoryMode = factoryMode;
    };
    ExcelCreator.prototype.getFactoryMode = function (exportMode) {
        var factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        return factory.factoryMode;
    };
    ExcelCreator.prototype.getGridRawDataForExcel = function (params) {
        return this.getMergedParamsAndData(params).data;
    };
    ExcelCreator.prototype.getMultipleSheetsAsExcel = function (params) {
        return getMultipleSheetsAsExcel(params);
    };
    ExcelCreator.prototype.exportMultipleSheetsAsExcel = function (params) {
        return exportMultipleSheetsAsExcel(params);
    };
    ExcelCreator.prototype.getMimeType = function () {
        return this.getExportMode() === 'xml' ? 'application/vnd.ms-excel' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    };
    ExcelCreator.prototype.getDefaultFileName = function () {
        return "export." + this.getExportMode();
    };
    ExcelCreator.prototype.getDefaultFileExtension = function () {
        return this.getExportMode();
    };
    ExcelCreator.prototype.createSerializingSession = function (params) {
        var _a = this, columnController = _a.columnController, valueService = _a.valueService, gridOptionsWrapper = _a.gridOptionsWrapper;
        var isXlsx = this.getExportMode() === 'xlsx';
        var sheetName = 'ag-grid';
        if (_.exists(params.sheetName)) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        var config = __assign(__assign({}, params), { columnController: columnController,
            valueService: valueService,
            gridOptionsWrapper: gridOptionsWrapper, headerRowHeight: params.headerRowHeight || params.rowHeight, sheetName: sheetName, baseExcelStyles: this.gridOptions.excelStyles || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    };
    ExcelCreator.prototype.styleLinker = function (rowType, rowIndex, colIndex, value, column, node) {
        if ((rowType === RowType.HEADER) || (rowType === RowType.HEADER_GROUPING)) {
            return ["header"];
        }
        var styles = this.gridOptions.excelStyles;
        if (!styles || !styles.length) {
            return null;
        }
        var styleIds = styles.map(function (it) {
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
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            $scope: null,
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
    ExcelCreator.prototype.setExportMode = function (exportMode) {
        this.exportMode = exportMode;
    };
    ExcelCreator.prototype.getExportMode = function () {
        return this.exportMode;
    };
    ExcelCreator.prototype.packageFile = function (params) {
        if (this.getExportMode() === 'xml') {
            return _super.prototype.packageFile.call(this, params);
        }
        return getMultipleSheetsAsExcel(params);
    };
    __decorate([
        Autowired('columnController')
    ], ExcelCreator.prototype, "columnController", void 0);
    __decorate([
        Autowired('valueService')
    ], ExcelCreator.prototype, "valueService", void 0);
    __decorate([
        Autowired('gridOptions')
    ], ExcelCreator.prototype, "gridOptions", void 0);
    __decorate([
        Autowired('stylingService')
    ], ExcelCreator.prototype, "stylingService", void 0);
    __decorate([
        Autowired('gridSerializer')
    ], ExcelCreator.prototype, "gridSerializer", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ExcelCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], ExcelCreator.prototype, "postConstruct", null);
    ExcelCreator = __decorate([
        Bean('excelCreator')
    ], ExcelCreator);
    return ExcelCreator;
}(BaseCreator));
export { ExcelCreator };
