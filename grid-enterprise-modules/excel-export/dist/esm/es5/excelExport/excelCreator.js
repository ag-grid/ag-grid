var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, Autowired, Bean, PostConstruct, CssClassApplier } from '@ag-grid-community/core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseCreator, Downloader, RowType, ZipContainer } from "@ag-grid-community/csv-export";
import { ExcelXmlFactory } from './excelXmlFactory';
export var getMultipleSheetsAsExcel = function (params) {
    var data = params.data, _a = params.fontSize, fontSize = _a === void 0 ? 11 : _a, _b = params.author, author = _b === void 0 ? 'AG Grid' : _b;
    var hasImages = ExcelXlsxFactory.images.size > 0;
    ZipContainer.addFolders([
        '_rels/',
        'docProps/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'xl/worksheets/'
    ]);
    if (hasImages) {
        ZipContainer.addFolders([
            'xl/worksheets/_rels',
            'xl/drawings/',
            'xl/drawings/_rels',
            'xl/media/',
        ]);
        var imgCounter_1 = 0;
        ExcelXlsxFactory.images.forEach(function (value) {
            var firstImage = value[0].image[0];
            var ext = firstImage.imageType;
            ZipContainer.addFile("xl/media/image" + ++imgCounter_1 + "." + ext, firstImage.base64, true);
        });
    }
    if (!data || data.length === 0) {
        console.warn("AG Grid: Invalid params supplied to getMultipleSheetsAsExcel() - `ExcelExportParams.data` is empty.");
        ExcelXlsxFactory.resetFactory();
        return;
    }
    var sheetLen = data.length;
    var imageRelationCounter = 0;
    data.forEach(function (value, idx) {
        ZipContainer.addFile("xl/worksheets/sheet" + (idx + 1) + ".xml", value);
        if (hasImages && ExcelXlsxFactory.worksheetImages.get(idx)) {
            createImageRelationsForSheet(idx, imageRelationCounter++);
        }
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
    var mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return ZipContainer.getContent(mimeType);
};
export var exportMultipleSheetsAsExcel = function (params) {
    var _a = params.fileName, fileName = _a === void 0 ? 'export.xlsx' : _a;
    var contents = getMultipleSheetsAsExcel(params);
    if (contents) {
        Downloader.download(fileName, contents);
    }
};
var createImageRelationsForSheet = function (sheetIndex, currentRelationIndex) {
    var drawingFolder = 'xl/drawings';
    var drawingFileName = drawingFolder + "/drawing" + (currentRelationIndex + 1) + ".xml";
    var relFileName = drawingFolder + "/_rels/drawing" + (currentRelationIndex + 1) + ".xml.rels";
    var worksheetRelFile = "xl/worksheets/_rels/sheet" + (sheetIndex + 1) + ".xml.rels";
    ZipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
    ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
    ZipContainer.addFile(worksheetRelFile, ExcelXlsxFactory.createWorksheetDrawingRel(currentRelationIndex));
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
            gridOptionsService: this.gridOptionsService
        });
    };
    ExcelCreator.prototype.getMergedParams = function (params) {
        var baseParams = this.gridOptionsService.get('defaultExcelExportParams');
        return Object.assign({}, baseParams, params);
    };
    ExcelCreator.prototype.getData = function (params) {
        this.setExportMode(params.exportMode || 'xlsx');
        return _super.prototype.getData.call(this, params);
    };
    ExcelCreator.prototype.export = function (userParams) {
        if (this.isExportSuppressed()) {
            console.warn("AG Grid: Export cancelled. Export is not allowed as per your configuration.");
            return '';
        }
        var mergedParams = this.getMergedParams(userParams);
        var data = this.getData(mergedParams);
        var exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        var packageFile = this.packageFile(exportParams);
        if (packageFile) {
            Downloader.download(this.getFileName(mergedParams.fileName), packageFile);
        }
        return data;
    };
    ExcelCreator.prototype.exportDataAsExcel = function (params) {
        return this.export(params);
    };
    ExcelCreator.prototype.getDataAsExcel = function (params) {
        var mergedParams = this.getMergedParams(params);
        var data = this.getData(mergedParams);
        if (params && params.exportMode === 'xml') {
            return data;
        }
        var exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        return this.packageFile(exportParams);
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
    ExcelCreator.prototype.getSheetDataForExcel = function (params) {
        var mergedParams = this.getMergedParams(params);
        var data = this.getData(mergedParams);
        return data;
    };
    ExcelCreator.prototype.getMultipleSheetsAsExcel = function (params) {
        return getMultipleSheetsAsExcel(params);
    };
    ExcelCreator.prototype.exportMultipleSheetsAsExcel = function (params) {
        return exportMultipleSheetsAsExcel(params);
    };
    ExcelCreator.prototype.getDefaultFileName = function () {
        return "export." + this.getExportMode();
    };
    ExcelCreator.prototype.getDefaultFileExtension = function () {
        return this.getExportMode();
    };
    ExcelCreator.prototype.createSerializingSession = function (params) {
        var _a = this, columnModel = _a.columnModel, valueService = _a.valueService, gridOptionsService = _a.gridOptionsService, valueFormatterService = _a.valueFormatterService, valueParserService = _a.valueParserService;
        var isXlsx = this.getExportMode() === 'xlsx';
        var sheetName = 'ag-grid';
        if (params.sheetName != null) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        var config = __assign(__assign({}, params), { sheetName: sheetName, columnModel: columnModel, valueService: valueService, gridOptionsService: gridOptionsService, valueFormatterService: valueFormatterService, valueParserService: valueParserService, headerRowHeight: params.headerRowHeight || params.rowHeight, baseExcelStyles: this.gridOptionsService.get('excelStyles') || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    };
    ExcelCreator.prototype.styleLinker = function (params) {
        var rowType = params.rowType, rowIndex = params.rowIndex, value = params.value, column = params.column, columnGroup = params.columnGroup, node = params.node;
        var isHeader = rowType === RowType.HEADER;
        var isGroupHeader = rowType === RowType.HEADER_GROUPING;
        var col = (isHeader ? column : columnGroup);
        var headerClasses = [];
        if (isHeader || isGroupHeader) {
            headerClasses.push('header');
            if (isGroupHeader) {
                headerClasses.push('headerGroup');
            }
            if (col) {
                headerClasses = headerClasses.concat(CssClassApplier.getHeaderClassesFromColDef(col.getDefinition(), this.gridOptionsService, column || null, columnGroup || null));
            }
            return headerClasses;
        }
        var styles = this.gridOptionsService.get('excelStyles');
        var applicableStyles = ["cell"];
        if (!styles || !styles.length) {
            return applicableStyles;
        }
        var styleIds = styles.map(function (it) {
            return it.id;
        });
        this.stylingService.processAllCellClasses(column.getDefinition(), {
            value: value,
            data: node.data,
            node: node,
            colDef: column.getDefinition(),
            column: column,
            rowIndex: rowIndex,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
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
        return this.gridOptionsService.is('suppressExcelExport');
    };
    ExcelCreator.prototype.setExportMode = function (exportMode) {
        this.exportMode = exportMode;
    };
    ExcelCreator.prototype.getExportMode = function () {
        return this.exportMode;
    };
    ExcelCreator.prototype.packageFile = function (params) {
        if (this.getExportMode() === 'xml') {
            var mimeType = params.mimeType || 'application/vnd.ms-excel';
            return new Blob(["\ufeff", params.data[0]], { type: mimeType });
        }
        return getMultipleSheetsAsExcel(params);
    };
    __decorate([
        Autowired('columnModel')
    ], ExcelCreator.prototype, "columnModel", void 0);
    __decorate([
        Autowired('valueService')
    ], ExcelCreator.prototype, "valueService", void 0);
    __decorate([
        Autowired('stylingService')
    ], ExcelCreator.prototype, "stylingService", void 0);
    __decorate([
        Autowired('gridSerializer')
    ], ExcelCreator.prototype, "gridSerializer", void 0);
    __decorate([
        Autowired('gridOptionsService')
    ], ExcelCreator.prototype, "gridOptionsService", void 0);
    __decorate([
        Autowired('valueFormatterService')
    ], ExcelCreator.prototype, "valueFormatterService", void 0);
    __decorate([
        Autowired('valueParserService')
    ], ExcelCreator.prototype, "valueParserService", void 0);
    __decorate([
        PostConstruct
    ], ExcelCreator.prototype, "postConstruct", null);
    ExcelCreator = __decorate([
        Bean('excelCreator')
    ], ExcelCreator);
    return ExcelCreator;
}(BaseCreator));
export { ExcelCreator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxDcmVhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsQ3JlYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFRSixhQUFhLEVBS2IsZUFBZSxFQUlsQixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzFFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzVFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFrQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFL0csT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSXBELE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFHLFVBQUMsTUFBc0M7SUFDbkUsSUFBQSxJQUFJLEdBQXdDLE1BQU0sS0FBOUMsRUFBRSxLQUFzQyxNQUFNLFNBQS9CLEVBQWIsUUFBUSxtQkFBRyxFQUFFLEtBQUEsRUFBRSxLQUF1QixNQUFNLE9BQVgsRUFBbEIsTUFBTSxtQkFBRyxTQUFTLEtBQUEsQ0FBWTtJQUUzRCxJQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUVuRCxZQUFZLENBQUMsVUFBVSxDQUFDO1FBQ3BCLFFBQVE7UUFDUixXQUFXO1FBQ1gsS0FBSztRQUNMLFdBQVc7UUFDWCxXQUFXO1FBQ1gsZ0JBQWdCO0tBQ25CLENBQUMsQ0FBQztJQUVILElBQUksU0FBUyxFQUFFO1FBQ1gsWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUNwQixx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