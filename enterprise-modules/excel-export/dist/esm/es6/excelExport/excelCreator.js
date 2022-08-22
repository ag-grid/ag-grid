var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, PostConstruct, } from '@ag-grid-community/core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseCreator, Downloader, RowType, ZipContainer } from "@ag-grid-community/csv-export";
import { ExcelXmlFactory } from './excelXmlFactory';
export const getMultipleSheetsAsExcel = (params) => {
    const { data, fontSize = 11, author = 'AG Grid' } = params;
    const hasImages = ExcelXlsxFactory.images.size > 0;
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
        let imgCounter = 0;
        ExcelXlsxFactory.images.forEach(value => {
            const firstImage = value[0].image[0];
            const ext = firstImage.imageType;
            ZipContainer.addFile(`xl/media/image${++imgCounter}.${ext}`, firstImage.base64, true);
        });
    }
    if (!data || data.length === 0) {
        console.warn("AG Grid: Invalid params supplied to getMultipleSheetsAsExcel() - `ExcelExportParams.data` is empty.");
        ExcelXlsxFactory.resetFactory();
        return;
    }
    const sheetLen = data.length;
    let imageRelationCounter = 0;
    data.forEach((value, idx) => {
        ZipContainer.addFile(`xl/worksheets/sheet${idx + 1}.xml`, value);
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
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return ZipContainer.getContent(mimeType);
};
export const exportMultipleSheetsAsExcel = (params) => {
    const { fileName = 'export.xlsx' } = params;
    const contents = getMultipleSheetsAsExcel(params);
    if (contents) {
        Downloader.download(fileName, contents);
    }
};
const createImageRelationsForSheet = (sheetIndex, currentRelationIndex) => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/drawing${currentRelationIndex + 1}.xml`;
    const relFileName = `${drawingFolder}/_rels/drawing${currentRelationIndex + 1}.xml.rels`;
    const worksheetRelFile = `xl/worksheets/_rels/sheet${sheetIndex + 1}.xml.rels`;
    ZipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
    ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
    ZipContainer.addFile(worksheetRelFile, ExcelXlsxFactory.createWorksheetDrawingRel(currentRelationIndex));
};
let ExcelCreator = class ExcelCreator extends BaseCreator {
    constructor() {
        super(...arguments);
        this.exportMode = 'xlsx';
    }
    postConstruct() {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    }
    getMergedParams(params) {
        const baseParams = this.gridOptionsWrapper.getDefaultExportParams('excel');
        return Object.assign({}, baseParams, params);
    }
    getData(params) {
        this.setExportMode(params.exportMode || 'xlsx');
        return super.getData(params);
    }
    export(userParams) {
        if (this.isExportSuppressed()) {
            console.warn(`AG Grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }
        const mergedParams = this.getMergedParams(userParams);
        const data = this.getData(mergedParams);
        const exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        const packageFile = this.packageFile(exportParams);
        if (packageFile) {
            Downloader.download(this.getFileName(mergedParams.fileName), packageFile);
        }
        return data;
    }
    exportDataAsExcel(params) {
        return this.export(params);
    }
    getDataAsExcel(params) {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);
        if (params && params.exportMode === 'xml') {
            return data;
        }
        const exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        return this.packageFile(exportParams);
    }
    setFactoryMode(factoryMode, exportMode = 'xlsx') {
        const factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        factory.factoryMode = factoryMode;
    }
    getFactoryMode(exportMode) {
        const factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        return factory.factoryMode;
    }
    getSheetDataForExcel(params) {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);
        return data;
    }
    getMultipleSheetsAsExcel(params) {
        return getMultipleSheetsAsExcel(params);
    }
    exportMultipleSheetsAsExcel(params) {
        return exportMultipleSheetsAsExcel(params);
    }
    getDefaultFileName() {
        return `export.${this.getExportMode()}`;
    }
    getDefaultFileExtension() {
        return this.getExportMode();
    }
    createSerializingSession(params) {
        const { columnModel, valueService, gridOptionsWrapper } = this;
        const isXlsx = this.getExportMode() === 'xlsx';
        let sheetName = 'ag-grid';
        if (params.sheetName != null) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        const config = Object.assign(Object.assign({}, params), { sheetName,
            columnModel,
            valueService,
            gridOptionsWrapper, headerRowHeight: params.headerRowHeight || params.rowHeight, baseExcelStyles: this.gridOptions.excelStyles || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    }
    styleLinker(rowType, rowIndex, value, column, node) {
        if (rowType === RowType.HEADER) {
            return ["header"];
        }
        if (rowType === RowType.HEADER_GROUPING) {
            return ["header", "headerGroup"];
        }
        const styles = this.gridOptions.excelStyles;
        const applicableStyles = ["cell"];
        if (!styles || !styles.length) {
            return applicableStyles;
        }
        const styleIds = styles.map((it) => {
            return it.id;
        });
        this.stylingService.processAllCellClasses(column.getColDef(), {
            value: value,
            data: node.data,
            node: node,
            colDef: column.getColDef(),
            column: column,
            rowIndex: rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        }, (className) => {
            if (styleIds.indexOf(className) > -1) {
                applicableStyles.push(className);
            }
        });
        return applicableStyles.sort((left, right) => {
            return (styleIds.indexOf(left) < styleIds.indexOf(right)) ? -1 : 1;
        });
    }
    isExportSuppressed() {
        return this.gridOptionsWrapper.isSuppressExcelExport();
    }
    setExportMode(exportMode) {
        this.exportMode = exportMode;
    }
    getExportMode() {
        return this.exportMode;
    }
    packageFile(params) {
        if (this.getExportMode() === 'xml') {
            const mimeType = params.mimeType || 'application/vnd.ms-excel';
            return new Blob(["\ufeff", params.data[0]], { type: mimeType });
        }
        return getMultipleSheetsAsExcel(params);
    }
};
__decorate([
    Autowired('columnModel')
], ExcelCreator.prototype, "columnModel", void 0);
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
export { ExcelCreator };
