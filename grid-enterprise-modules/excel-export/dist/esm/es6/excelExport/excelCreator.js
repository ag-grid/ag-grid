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
            gridOptionsService: this.gridOptionsService
        });
    }
    getMergedParams(params) {
        const baseParams = this.gridOptionsService.get('defaultExcelExportParams');
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
        const { columnModel, valueService, gridOptionsService, valueFormatterService, valueParserService } = this;
        const isXlsx = this.getExportMode() === 'xlsx';
        let sheetName = 'ag-grid';
        if (params.sheetName != null) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        const config = Object.assign(Object.assign({}, params), { sheetName,
            columnModel,
            valueService,
            gridOptionsService,
            valueFormatterService,
            valueParserService, headerRowHeight: params.headerRowHeight || params.rowHeight, baseExcelStyles: this.gridOptionsService.get('excelStyles') || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    }
    styleLinker(params) {
        const { rowType, rowIndex, value, column, columnGroup, node } = params;
        const isHeader = rowType === RowType.HEADER;
        const isGroupHeader = rowType === RowType.HEADER_GROUPING;
        const col = (isHeader ? column : columnGroup);
        let headerClasses = [];
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
        const styles = this.gridOptionsService.get('excelStyles');
        const applicableStyles = ["cell"];
        if (!styles || !styles.length) {
            return applicableStyles;
        }
        const styleIds = styles.map((it) => {
            return it.id;
        });
        this.stylingService.processAllCellClasses(column.getDefinition(), {
            value,
            data: node.data,
            node: node,
            colDef: column.getDefinition(),
            column: column,
            rowIndex: rowIndex,
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
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
        return this.gridOptionsService.is('suppressExcelExport');
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
export { ExcelCreator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxDcmVhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsQ3JlYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUNELFNBQVMsRUFDVCxJQUFJLEVBUUosYUFBYSxFQUtiLGVBQWUsRUFJbEIsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBa0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRS9HLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUlwRCxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLE1BQXNDLEVBQW9CLEVBQUU7SUFDakcsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxTQUFTLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFFM0QsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFFbkQsWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUNwQixRQUFRO1FBQ1IsV0FBVztRQUNYLEtBQUs7UUFDTCxXQUFXO1FBQ1gsV0FBVztRQUNYLGdCQUFnQjtLQUNuQixDQUFDLENBQUM7SUFFSCxJQUFJLFNBQVMsRUFBRTtRQUNYLFlBQVksQ0FBQyxVQUFVLENBQUM7WUFDcEIscUJBQXFCO1lBQ3JCLGNBQWM7WUFDZCxtQkFBbUI7WUFDbkIsV0FBVztTQUVkLENBQUMsQ0FBQztRQUVILElBQUksVUFB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