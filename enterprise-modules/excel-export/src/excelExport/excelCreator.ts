import {
    Autowired,
    Bean,
    Column,
    ColumnModel,
    ExcelExportParams,
    ExcelFactoryMode,
    ExcelStyle,
    GridOptionsService,
    IExcelCreator,
    PostConstruct,
    StylingService,
    ValueService,
    ExcelExportMultipleSheetParams,
    ExcelRow,
    CssClassApplier,
    ColumnGroup
} from '@ag-grid-community/core';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseCreator, Downloader, GridSerializer, RowType, ZipContainer } from "@ag-grid-community/csv-export";
import { ExcelGridSerializingParams, ExcelSerializingSession, StyleLinkerInterface } from './excelSerializingSession';

const createExcelXMLCoreFolderStructure = (): void => {
    ZipContainer.addFolders([
        '_rels/',
        'docProps/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'xl/worksheets/'
    ]);

    if (!ExcelXlsxFactory.images.size) { return; }

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

const createExcelXmlWorksheets = (data: string[]): void => {
    let imageRelationCounter = 0;
    let tableRelationCounter = 0;

    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        ZipContainer.addFile(`xl/worksheets/sheet${i + 1}.xml`, value, false);

        const hasImages = ExcelXlsxFactory.images.size > 0 && ExcelXlsxFactory.worksheetImages.has(i);
        const hasTables = ExcelXlsxFactory.worksheetDataTables.size > 0 && ExcelXlsxFactory.worksheetDataTables.has(i);

        if (!hasImages && !hasTables) { continue; }

        let tableIndex: number | undefined;
        let drawingIndex: number | undefined;

        if (hasImages) {
            createExcelXmlDrawings(i, imageRelationCounter);
            drawingIndex = imageRelationCounter;
            imageRelationCounter++;
        }

        if (hasTables) {
            tableIndex = tableRelationCounter;
            tableRelationCounter++;
        }

        const worksheetRelFile = `xl/worksheets/_rels/sheet${i + 1}.xml.rels`;
        ZipContainer.addFile(
            worksheetRelFile,
            ExcelXlsxFactory.createRelationships({ tableIndex, drawingIndex }),
        );
    }

}

const createExcelXmlDrawings = (sheetIndex: number, drawingIndex: number): void => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/drawing${drawingIndex + 1}.xml`;
    const relFileName = `${drawingFolder}/_rels/drawing${drawingIndex + 1}.xml.rels`;

    ZipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
    ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
};

const createExcelXmlTables = (): void => {
    const tablesDataByWorksheet = ExcelXlsxFactory.worksheetDataTables;
    const worksheetKeys = Array.from(tablesDataByWorksheet.keys());

    for (let i = 0; i < worksheetKeys.length; i++) {
        const sheetIndex = worksheetKeys[i];
        const dataTable = tablesDataByWorksheet.get(sheetIndex);

        if (!dataTable) {
            continue;
        }

        ZipContainer.addFile(
            `xl/tables/${dataTable.name}.xml`,
            ExcelXlsxFactory.createTable(dataTable, i),
        );
    }
}

const createExcelXmlCoreSheets = (fontSize: number, author: string, sheetLen: number): void => {
    ZipContainer.addFile('xl/workbook.xml', ExcelXlsxFactory.createWorkbook());
    ZipContainer.addFile('xl/styles.xml', ExcelXlsxFactory.createStylesheet(fontSize));
    ZipContainer.addFile('xl/sharedStrings.xml', ExcelXlsxFactory.createSharedStrings());
    ZipContainer.addFile('xl/theme/theme1.xml', ExcelXlsxFactory.createTheme());
    ZipContainer.addFile('xl/_rels/workbook.xml.rels', ExcelXlsxFactory.createWorkbookRels(sheetLen));
    ZipContainer.addFile('docProps/core.xml', ExcelXlsxFactory.createCore(author));
    ZipContainer.addFile('[Content_Types].xml', ExcelXlsxFactory.createContentTypes(sheetLen));
    ZipContainer.addFile('_rels/.rels', ExcelXlsxFactory.createRels());
}

const createExcelFileForExcel = (data: string[], options: {
    columns?: string[],
    rowCount?: number,
    fontSize?: number
    author?: string,
} = {}): boolean  => {
    if (!data || data.length === 0) {
        console.warn("AG Grid: Invalid params supplied to createExcelFileForExcel() - `ExcelExportParams.data` is empty.");
        ExcelXlsxFactory.resetFactory();
        return false;
    }

    const {
        fontSize = 11,
        author = 'AG Grid',
    } = options;

    createExcelXMLCoreFolderStructure();
    createExcelXmlTables();
    createExcelXmlWorksheets(data);
    createExcelXmlCoreSheets(fontSize, author, data.length);

    ExcelXlsxFactory.resetFactory();
    return true;
}

const getMultipleSheetsAsExcelCompressed = (params: ExcelExportMultipleSheetParams): Promise<Blob | undefined> => {
    const { data, fontSize, author } = params;
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!createExcelFileForExcel(data, {
        author,
        fontSize,
    })) { return Promise.resolve(undefined); }

    return ZipContainer.getZipFile(mimeType);
};

export const getMultipleSheetsAsExcel = (params: ExcelExportMultipleSheetParams): Blob | undefined => {
    const { data, fontSize, author } = params;
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!createExcelFileForExcel(data, {
        author,
        fontSize,
    })) { return; }

    return ZipContainer.getUncompressedZipFile(mimeType);
};

export const exportMultipleSheetsAsExcel = (params: ExcelExportMultipleSheetParams) => {
    const { fileName = 'export.xlsx' } = params;

    getMultipleSheetsAsExcelCompressed(params).then(contents => {
        if (contents) {
            const downloadFileName = typeof fileName === 'function'
                ? fileName()
                : fileName;

            Downloader.download(downloadFileName, contents);
        }
    });
};

@Bean('excelCreator')
export class ExcelCreator extends BaseCreator<ExcelRow[], ExcelSerializingSession, ExcelExportParams> implements IExcelCreator {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('stylingService') private stylingService: StylingService;

    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsService') gos: GridOptionsService;

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gos: this.gos
        });
    }

    protected getMergedParams(params?: ExcelExportParams): ExcelExportParams {
        const baseParams = this.gos.get('defaultExcelExportParams');
        return Object.assign({}, baseParams, params);
    }

    protected export(userParams?: ExcelExportParams): void {
        if (this.isExportSuppressed()) {
            console.warn(`AG Grid: Export cancelled. Export is not allowed as per your configuration.`);
            return;
        }

        const mergedParams = this.getMergedParams(userParams);
        const data = this.getData(mergedParams);

        const exportParams: ExcelExportMultipleSheetParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };

        this.packageCompressedFile(exportParams).then(packageFile => {
            if (packageFile) {
                const { fileName } = mergedParams;
                const providedFileName = typeof fileName === 'function'
                    ? fileName(this.gos.getGridCommonParams())
                    : fileName;

                Downloader.download(this.getFileName(providedFileName), packageFile);
            }
        });
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        this.export(params);
    }

    public getDataAsExcel(params?: ExcelExportParams): Blob | string | undefined {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);

        const exportParams: ExcelExportMultipleSheetParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };

        return this.packageFile(exportParams);
    }

    public setFactoryMode(factoryMode: ExcelFactoryMode): void {
        ExcelXlsxFactory.factoryMode = factoryMode;
    }

    public getFactoryMode(): ExcelFactoryMode {
        return ExcelXlsxFactory.factoryMode;
    }

    public getSheetDataForExcel(params: ExcelExportParams): string {
        const mergedParams = this.getMergedParams(params);
        return this.getData(mergedParams);
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        return getMultipleSheetsAsExcel(params);
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        exportMultipleSheetsAsExcel(params);
    }

    public getDefaultFileExtension(): 'xlsx' {
        return 'xlsx';
    }

    public createSerializingSession(params: ExcelExportParams): ExcelSerializingSession {
        const { columnModel, valueService, gos } = this;

        let sheetName: string;
        if (params.sheetName != null) {
            const {sheetName: sheetNameParam } = params;
            const sheetNameValue = typeof sheetNameParam === 'function'
                ? sheetNameParam(this.gos.getGridCommonParams())
                : sheetNameParam;

            sheetName = String(sheetNameValue).substring(0, 31);
        } else {
            sheetName = 'ag-grid';
        }

        const config: ExcelGridSerializingParams = {
            ...params,
            sheetName,
            columnModel,
            valueService,
            gos,
            suppressRowOutline: params.suppressRowOutline || params.skipRowGroups,
            headerRowHeight: params.headerRowHeight || params.rowHeight,
            baseExcelStyles: this.gos.get('excelStyles') || [],
            styleLinker: this.styleLinker.bind(this)
        };

        return new ExcelSerializingSession(config);
    }

    private styleLinker(params: StyleLinkerInterface): string[] {
        const  { rowType, rowIndex, value, column, columnGroup, node } = params;
        const isHeader = rowType === RowType.HEADER;
        const isGroupHeader = rowType === RowType.HEADER_GROUPING;
        const col = (isHeader ? column : columnGroup) as Column | ColumnGroup;
        let headerClasses: string[] = [];

        if (isHeader || isGroupHeader) {
            headerClasses.push('header');
            if (isGroupHeader) {
                headerClasses.push('headerGroup');
            }
            
            if (col) {
                headerClasses = headerClasses.concat(CssClassApplier.getHeaderClassesFromColDef(
                    col.getDefinition(),
                    this.gos,
                    column || null,
                    columnGroup || null
                ));
            }

            return headerClasses;
        }

        const styles = this.gos.get('excelStyles');

        const applicableStyles: string [] = ["cell"];

        if (!styles || !styles.length) { return applicableStyles; }

        const styleIds: string[] = styles.map((it: ExcelStyle) => {
            return it.id;
        });

        this.stylingService.processAllCellClasses(
            column!.getDefinition(),
            this.gos.addGridCommonParams({
                value,
                data: node!.data,
                node: node!,
                colDef: column!.getDefinition(),
                column: column!,
                rowIndex: rowIndex
            }),
            (className: string) => {
                if (styleIds.indexOf(className) > -1) {
                    applicableStyles.push(className);
                }
            }
        );

        return applicableStyles.sort((left: string, right: string): number => {
            return (styleIds.indexOf(left) < styleIds.indexOf(right)) ? -1 : 1;
        });
    }

    public isExportSuppressed():boolean {
        return this.gos.get('suppressExcelExport');
    }

    private packageCompressedFile(params: ExcelExportMultipleSheetParams): Promise<Blob | undefined> {
        return getMultipleSheetsAsExcelCompressed(params);
    }

    private packageFile(params: ExcelExportMultipleSheetParams): Blob | undefined {
        return getMultipleSheetsAsExcel(params);
    }
}
