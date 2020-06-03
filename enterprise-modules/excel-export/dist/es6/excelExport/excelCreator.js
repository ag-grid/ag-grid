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
import { BaseCreator, RowType } from "@ag-grid-community/csv-export";
var ExcelCreator = /** @class */ (function (_super) {
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
        this.setExportMode(params ? params.exportMode : undefined);
        return this.export(params);
    };
    ExcelCreator.prototype.getDataAsExcelXml = function (params) {
        if (params && params.exportMode) {
            delete params.exportMode;
        }
        this.setExportMode('xml');
        return this.getData(params || {});
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
        var excelFactory = isXlsx ? this.xlsxFactory : this.excelXmlFactory;
        var sheetName = 'ag-grid';
        if (_.exists(params.sheetName)) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        var config = __assign(__assign({}, params), { columnController: columnController,
            valueService: valueService,
            gridOptionsWrapper: gridOptionsWrapper, headerRowHeight: params.headerRowHeight || params.rowHeight, sheetName: sheetName,
            excelFactory: excelFactory, baseExcelStyles: this.gridOptions.excelStyles || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)((config));
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
        return this.exportMode || 'xlsx';
    };
    ExcelCreator.prototype.packageFile = function (data) {
        if (this.getExportMode() === 'xml') {
            return _super.prototype.packageFile.call(this, data);
        }
        var _a = this, zipContainer = _a.zipContainer, xlsxFactory = _a.xlsxFactory;
        zipContainer.addFolders([
            'xl/worksheets/',
            'xl/',
            'xl/theme/',
            'xl/_rels/',
            'docProps/',
            '_rels/'
        ]);
        zipContainer.addFile('xl/worksheets/sheet1.xml', data);
        zipContainer.addFile('xl/workbook.xml', xlsxFactory.createWorkbook());
        zipContainer.addFile('xl/styles.xml', xlsxFactory.createStylesheet());
        zipContainer.addFile('xl/sharedStrings.xml', xlsxFactory.createSharedStrings());
        zipContainer.addFile('xl/theme/theme1.xml', xlsxFactory.createTheme());
        zipContainer.addFile('xl/_rels/workbook.xml.rels', xlsxFactory.createWorkbookRels());
        zipContainer.addFile('docProps/core.xml', xlsxFactory.createCore());
        zipContainer.addFile('[Content_Types].xml', xlsxFactory.createContentTypes());
        zipContainer.addFile('_rels/.rels', xlsxFactory.createRels());
        return zipContainer.getContent('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    };
    __decorate([
        Autowired('excelXmlFactory')
    ], ExcelCreator.prototype, "excelXmlFactory", void 0);
    __decorate([
        Autowired('excelXlsxFactory')
    ], ExcelCreator.prototype, "xlsxFactory", void 0);
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
        Autowired('downloader')
    ], ExcelCreator.prototype, "downloader", void 0);
    __decorate([
        Autowired('gridSerializer')
    ], ExcelCreator.prototype, "gridSerializer", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], ExcelCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('zipContainer')
    ], ExcelCreator.prototype, "zipContainer", void 0);
    __decorate([
        PostConstruct
    ], ExcelCreator.prototype, "postConstruct", null);
    ExcelCreator = __decorate([
        Bean('excelCreator')
    ], ExcelCreator);
    return ExcelCreator;
}(BaseCreator));
export { ExcelCreator };
