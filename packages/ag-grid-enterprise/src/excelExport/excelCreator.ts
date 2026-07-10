import { _downloadFile } from 'ag-stack';

import type {
    AgColumn,
    AgColumnGroup,
    ExcelCustomMetadata,
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    ExcelFactoryMode,
    ExcelRow,
    ExcelStyle,
    IExcelCreator,
    NamedBean,
} from 'ag-grid-community';
import {
    BaseCreator,
    _addGridCommonParams,
    _clamp,
    _getHeaderClassesFromColDef,
    _getHeaderRowCount,
    _warnForGrid,
    _warnWithoutAttribution,
} from 'ag-grid-community';

import type { ExcelGridSerializingParams, StyleLinkerInterface } from './excelSerializingSession';
import { ExcelSerializingSession } from './excelSerializingSession';
import {
    Workbook,
    XLSX_IMAGES,
    XLSX_WORKSHEET_COMMENTS,
    XLSX_WORKSHEET_DATA_TABLES,
    XLSX_WORKSHEET_HEADER_FOOTER_IMAGES,
    XLSX_WORKSHEET_IMAGES,
    createXlsxComments,
    createXlsxContentTypes,
    createXlsxCore,
    createXlsxCustomProperties,
    createXlsxDrawing,
    createXlsxDrawingRel,
    createXlsxNoteVmlDrawing,
    createXlsxRelationships,
    createXlsxRels,
    createXlsxSharedStrings,
    createXlsxStylesheet,
    createXlsxTable,
    createXlsxTheme,
    createXlsxVmlDrawing,
    createXlsxVmlDrawingRel,
    createXlsxWorkbook,
    createXlsxWorkbookRels,
} from './excelXlsxFactory';
import { _normaliseImageExtension } from './files/ooxml/contentTypes';
import { ZipContainer } from './zipContainer/zipContainer';

const createExcelXMLCoreFolderStructure = (zipContainer: ZipContainer): void => {
    zipContainer.addFolders(['_rels/', 'docProps/', 'xl/', 'xl/theme/', 'xl/_rels/', 'xl/worksheets/']);

    if (
        XLSX_IMAGES.size ||
        XLSX_WORKSHEET_DATA_TABLES.size ||
        XLSX_WORKSHEET_HEADER_FOOTER_IMAGES.size ||
        XLSX_WORKSHEET_COMMENTS.size
    ) {
        zipContainer.addFolders(['xl/worksheets/_rels']);
    }

    if (XLSX_IMAGES.size || XLSX_WORKSHEET_HEADER_FOOTER_IMAGES.size || XLSX_WORKSHEET_COMMENTS.size) {
        zipContainer.addFolders(['xl/drawings/']);
    }

    if (XLSX_IMAGES.size || XLSX_WORKSHEET_HEADER_FOOTER_IMAGES.size) {
        zipContainer.addFolders(['xl/drawings/_rels']);
    }

    if (XLSX_WORKSHEET_DATA_TABLES.size) {
        zipContainer.addFolders(['xl/tables/']);
    }

    if (!XLSX_IMAGES.size) {
        return;
    }

    zipContainer.addFolders(['xl/media/']);

    let imgCounter = 0;

    XLSX_IMAGES.forEach((value) => {
        const firstImage = value[0].image[0];
        const { base64, imageType } = firstImage;

        zipContainer.addFile(`xl/media/image${++imgCounter}.${_normaliseImageExtension(imageType)}`, base64, true);
    });
};

const createExcelXmlWorksheets = (
    zipContainer: ZipContainer,
    data: string[],
    author: string,
    suppressPrependAuthorToNotes?: boolean
): void => {
    let imageRelationCounter = 0;
    let commentCounter = 0;
    let vmlDrawingCounter = 0;

    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        zipContainer.addFile(`xl/worksheets/sheet${i + 1}.xml`, value, false);

        const hasImages = XLSX_IMAGES.size > 0 && XLSX_WORKSHEET_IMAGES.has(i);
        const tableData = XLSX_WORKSHEET_DATA_TABLES.size > 0 && XLSX_WORKSHEET_DATA_TABLES.get(i);
        const hasHeaderFooterImages = XLSX_IMAGES.size && XLSX_WORKSHEET_HEADER_FOOTER_IMAGES.has(i);
        const hasComments = !!XLSX_WORKSHEET_COMMENTS.get(i)?.length;

        if (!hasImages && !tableData && !hasHeaderFooterImages && !hasComments) {
            continue;
        }

        let tableName: string | undefined;
        let drawingIndex: number | undefined;
        let noteVmlDrawingIndex: number | undefined;
        let headerFooterVmlDrawingIndex: number | undefined;
        let commentsIndex: number | undefined;

        if (hasImages) {
            createExcelXmlDrawings(zipContainer, i, imageRelationCounter);
            drawingIndex = imageRelationCounter;
            imageRelationCounter++;
        }

        if (hasComments) {
            createExcelXmlComments(
                zipContainer,
                i,
                commentCounter,
                vmlDrawingCounter,
                author,
                suppressPrependAuthorToNotes
            );
            commentsIndex = commentCounter;
            noteVmlDrawingIndex = vmlDrawingCounter;
            commentCounter++;
            vmlDrawingCounter++;
        }

        if (hasHeaderFooterImages) {
            createExcelHeaderFooterVmlDrawings(zipContainer, i, vmlDrawingCounter);
            headerFooterVmlDrawingIndex = vmlDrawingCounter;
            vmlDrawingCounter++;
        }

        if (tableData) {
            tableName = tableData.name;
        }

        const worksheetRelFile = `xl/worksheets/_rels/sheet${i + 1}.xml.rels`;

        zipContainer.addFile(
            worksheetRelFile,
            createXlsxRelationships({
                tableName,
                drawingIndex,
                noteVmlDrawingIndex,
                headerFooterVmlDrawingIndex,
                commentsIndex,
            })
        );
    }
};

const createExcelXmlDrawings = (zipContainer: ZipContainer, sheetIndex: number, drawingIndex: number): void => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/drawing${drawingIndex + 1}.xml`;
    const relFileName = `${drawingFolder}/_rels/drawing${drawingIndex + 1}.xml.rels`;

    zipContainer.addFile(relFileName, createXlsxDrawingRel(sheetIndex));
    zipContainer.addFile(drawingFileName, createXlsxDrawing(sheetIndex));
};

const createExcelXmlComments = (
    zipContainer: ZipContainer,
    sheetIndex: number,
    commentsIndex: number,
    drawingIndex: number,
    author: string,
    suppressPrependAuthorToNotes?: boolean
): void => {
    const drawingFolder = 'xl/drawings';

    zipContainer.addFile(
        `xl/comments${commentsIndex + 1}.xml`,
        createXlsxComments(sheetIndex, author, suppressPrependAuthorToNotes)
    );
    zipContainer.addFile(`${drawingFolder}/vmlDrawing${drawingIndex + 1}.vml`, createXlsxNoteVmlDrawing(sheetIndex));
};

const createExcelHeaderFooterVmlDrawings = (
    zipContainer: ZipContainer,
    sheetIndex: number,
    drawingIndex: number
): void => {
    const drawingFolder = 'xl/drawings';
    const drawingFileName = `${drawingFolder}/vmlDrawing${drawingIndex + 1}.vml`;
    const relFileName = `${drawingFolder}/_rels/vmlDrawing${drawingIndex + 1}.vml.rels`;

    zipContainer.addFile(drawingFileName, createXlsxVmlDrawing(sheetIndex));
    zipContainer.addFile(relFileName, createXlsxVmlDrawingRel(sheetIndex));
};

const createExcelXmlTables = (zipContainer: ZipContainer): void => {
    const tablesDataByWorksheet = XLSX_WORKSHEET_DATA_TABLES;
    const worksheetKeys = Array.from(tablesDataByWorksheet.keys());

    for (let i = 0; i < worksheetKeys.length; i++) {
        const sheetIndex = worksheetKeys[i];
        const table = tablesDataByWorksheet.get(sheetIndex);

        if (!table) {
            continue;
        }

        zipContainer.addFile(`xl/tables/${table.name}.xml`, createXlsxTable(table, i));
    }
};

const createExcelXmlCoreSheets = (
    zipContainer: ZipContainer,
    fontSize: number,
    author: string,
    sheetLen: number,
    activeTab: number,
    customMetadata?: ExcelCustomMetadata
): void => {
    const hasCustomMetadata =
        !!customMetadata && Object.keys(customMetadata).some((key) => customMetadata[key] != null);

    zipContainer.addFile('xl/workbook.xml', createXlsxWorkbook(activeTab));
    zipContainer.addFile('xl/styles.xml', createXlsxStylesheet(fontSize));
    zipContainer.addFile('xl/sharedStrings.xml', createXlsxSharedStrings());
    zipContainer.addFile('xl/theme/theme1.xml', createXlsxTheme());
    zipContainer.addFile('xl/_rels/workbook.xml.rels', createXlsxWorkbookRels(sheetLen));
    zipContainer.addFile('docProps/core.xml', createXlsxCore(author));

    if (hasCustomMetadata) {
        zipContainer.addFile('docProps/custom.xml', createXlsxCustomProperties(customMetadata));
    }

    zipContainer.addFile('[Content_Types].xml', createXlsxContentTypes(sheetLen, hasCustomMetadata));
    zipContainer.addFile('_rels/.rels', createXlsxRels(hasCustomMetadata));
};

const createExcelFileForExcel = (
    zipContainer: ZipContainer,
    data: string[],
    options: {
        columns?: string[];
        rowCount?: number;
        fontSize?: number;
        author?: string;
        activeTab?: number;
        customMetadata?: ExcelCustomMetadata;
        suppressPrependAuthorToNotes?: boolean;
    } = {},
    workbook: Workbook,
    gridId?: string
): boolean => {
    if (!data || data.length === 0) {
        if (gridId) {
            _warnForGrid(gridId, 159);
        } else {
            _warnWithoutAttribution(159);
        }
        workbook.reset();
        return false;
    }

    workbook.syncOrderWithSheetData(data);

    const { fontSize = 11, author = 'AG Grid', activeTab = 0, customMetadata, suppressPrependAuthorToNotes } = options;

    const len = data.length;
    const activeTabWithinBounds = _clamp(activeTab, 0, len - 1);

    createExcelXMLCoreFolderStructure(zipContainer);
    createExcelXmlTables(zipContainer);
    createExcelXmlWorksheets(zipContainer, data, author, suppressPrependAuthorToNotes);
    createExcelXmlCoreSheets(zipContainer, fontSize, author, len, activeTabWithinBounds, customMetadata);

    workbook.reset();

    return true;
};

const getMultipleSheetsAsExcelCompressed = (
    params: ExcelExportMultipleSheetParams,
    workbook: Workbook = new Workbook(),
    gridId?: string
): Promise<Blob | undefined> => {
    const { data, fontSize, author, activeSheetIndex, customMetadata, suppressPrependAuthorToNotes } = params;
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const zipContainer = new ZipContainer();

    if (
        !createExcelFileForExcel(
            zipContainer,
            data,
            {
                author,
                fontSize,
                activeTab: activeSheetIndex,
                customMetadata,
                suppressPrependAuthorToNotes,
            },
            workbook,
            gridId
        )
    ) {
        return Promise.resolve(undefined);
    }

    return zipContainer.getZipFile(mimeType);
};

export const getMultipleSheetsAsExcel = (
    params: ExcelExportMultipleSheetParams,
    workbook: Workbook = new Workbook(),
    gridId?: string
): Blob | undefined => {
    const {
        data,
        fontSize,
        author,
        activeSheetIndex: activeTab,
        customMetadata,
        suppressPrependAuthorToNotes,
    } = params;
    const mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const zipContainer = new ZipContainer();

    if (
        !createExcelFileForExcel(
            zipContainer,
            data,
            {
                author,
                fontSize,
                activeTab,
                customMetadata,
                suppressPrependAuthorToNotes,
            },
            workbook,
            gridId
        )
    ) {
        return;
    }

    return zipContainer.getUncompressedZipFile(mimeType);
};

export const exportMultipleSheetsAsExcel = (params: ExcelExportMultipleSheetParams) => {
    const { fileName = 'export.xlsx' } = params;

    const workbook = new Workbook();
    getMultipleSheetsAsExcelCompressed(params, workbook).then((contents) => {
        if (contents) {
            const downloadFileName = typeof fileName === 'function' ? fileName() : fileName;

            _downloadFile(downloadFileName, contents);
        }
    });
};

export class ExcelCreator
    extends BaseCreator<ExcelRow[], ExcelSerializingSession, ExcelExportParams>
    implements NamedBean, IExcelCreator
{
    beanName = 'excelCreator' as const;
    private readonly workbook = new Workbook();

    protected getMergedParams(params?: ExcelExportParams): ExcelExportParams {
        const baseParams = this.gos.get('defaultExcelExportParams');
        return Object.assign({}, baseParams, params);
    }

    protected export(userParams?: ExcelExportParams): void {
        if (this.isExportSuppressed()) {
            this.warn(160);
            return;
        }

        const exportFunc = () => {
            const mergedParams = this.getMergedParams(userParams);
            const data = this.getData(mergedParams);

            const { fontSize, author, mimeType, customMetadata, suppressPrependAuthorToNotes } = mergedParams;

            const exportParams: ExcelExportMultipleSheetParams = {
                data: [data],
                fontSize,
                author,
                mimeType,
                customMetadata,
                suppressPrependAuthorToNotes,
            };

            this.packageCompressedFile(exportParams).then((packageFile) => {
                if (packageFile) {
                    const { fileName } = mergedParams;
                    const providedFileName =
                        typeof fileName === 'function' ? fileName(_addGridCommonParams(this.gos, {})) : fileName;

                    _downloadFile(this.getFileName(providedFileName), packageFile);
                }
            });
        };
        const { overlays } = this.beans;
        if (overlays) {
            overlays.showExportOverlay(exportFunc);
        } else {
            exportFunc();
        }
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        this.export(params);
    }

    public getDataAsExcel(params?: ExcelExportParams): Blob | string | undefined {
        const mergedParams = this.getMergedParams(params);
        const data = this.getData(mergedParams);

        const { fontSize, author, mimeType, customMetadata, suppressPrependAuthorToNotes } = mergedParams;

        const exportParams: ExcelExportMultipleSheetParams = {
            data: [data],
            fontSize,
            author,
            mimeType,
            customMetadata,
            suppressPrependAuthorToNotes,
        };

        return this.packageFile(exportParams);
    }

    public setFactoryMode(factoryMode: ExcelFactoryMode): void {
        this.workbook.setFactoryMode(factoryMode);
    }

    public getFactoryMode(): ExcelFactoryMode {
        return this.workbook.getFactoryMode();
    }

    public getSheetDataForExcel(params: ExcelExportParams): string {
        const mergedParams = this.getMergedParams(params);
        return this.getData(mergedParams);
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        return getMultipleSheetsAsExcel(params, this.workbook, this.beans.context.getId());
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        getMultipleSheetsAsExcelCompressed(params, this.workbook, this.beans.context.getId()).then((contents) => {
            const { fileName = 'export.xlsx' } = params;
            if (contents) {
                const downloadFileName = typeof fileName === 'function' ? fileName() : fileName;

                _downloadFile(downloadFileName, contents);
            }
        });
    }

    public getDefaultFileExtension(): 'xlsx' {
        return 'xlsx';
    }

    public createSerializingSession(params: ExcelExportParams): ExcelSerializingSession {
        const { colModel, colNames, rowGroupColsSvc, valueSvc, formula, gos, notesSvc, log } = this.beans;
        const baseExcelStyles = gos.get('excelStyles') || [];
        const styleLinker = this.createStyleLinker(baseExcelStyles);

        const config: ExcelGridSerializingParams = {
            ...params,
            colModel,
            colNames,
            rowGroupColsSvc,
            valueSvc,
            formulaSvc: formula,
            gos,
            log,
            suppressRowOutline: params.suppressRowOutline || params.skipRowGroups,
            headerRowHeight: params.headerRowHeight || params.rowHeight,
            baseExcelStyles,
            rightToLeft: params.rightToLeft ?? gos.get('enableRtl'),
            styleLinker,
            headerRowCount: _getHeaderRowCount(colModel),
            notesSvc,
            pivotModeActive: colModel.isPivotActive(),
            workbook: this.workbook,
        };

        return new ExcelSerializingSession(config);
    }

    private createStyleLinker(baseExcelStyles: ExcelStyle[]): (params: StyleLinkerInterface) => string[] {
        const styleIds: string[] = [];
        const styleIdsSet = new Set<string>();
        const styleIdOrder = new Map<string, number>();

        baseExcelStyles.forEach((it, idx) => {
            styleIds.push(it.id);
            styleIdsSet.add(it.id);
            styleIdOrder.set(it.id, idx);
        });

        const { gos, cellStyles } = this.beans;

        return (params) => {
            const { rowType, rowIndex, value, column, columnGroup, node } = params;
            const isHeader = rowType === 'HEADER';
            const isGroupHeader = rowType === 'HEADER_GROUPING';
            const col = (isHeader ? column : columnGroup) as AgColumn | AgColumnGroup | null;
            let headerClasses: string[] = [];

            if (isHeader || isGroupHeader) {
                headerClasses.push('header');
                if (isGroupHeader) {
                    headerClasses.push('headerGroup');
                }

                if (col) {
                    headerClasses = headerClasses.concat(
                        _getHeaderClassesFromColDef(
                            col.getDefinition(),
                            this.beans,
                            (column as AgColumn) || null,
                            (columnGroup as AgColumnGroup) || null
                        )
                    );
                }

                return headerClasses;
            }

            const applicableStyles: string[] = ['cell'];

            if (!styleIds.length) {
                return applicableStyles;
            }

            const colDef = (column as AgColumn).getDefinition();
            cellStyles?.processAllCellClasses(
                colDef,
                _addGridCommonParams(gos, {
                    value,
                    data: node!.data,
                    node: node!,
                    colDef,
                    column: column!,
                    rowIndex: rowIndex,
                }),
                (className: string) => {
                    if (styleIdsSet.has(className)) {
                        applicableStyles.push(className);
                    }
                }
            );

            return applicableStyles.sort((left: string, right: string): number => {
                const leftIdx = styleIdOrder.get(left) ?? -1;
                const rightIdx = styleIdOrder.get(right) ?? -1;
                return leftIdx === rightIdx ? 0 : leftIdx < rightIdx ? -1 : 1;
            });
        };
    }

    public isExportSuppressed(): boolean {
        return this.gos.get('suppressExcelExport');
    }

    private packageCompressedFile(params: ExcelExportMultipleSheetParams): Promise<Blob | undefined> {
        return getMultipleSheetsAsExcelCompressed(params, this.workbook, this.beans.context.getId());
    }

    private packageFile(params: ExcelExportMultipleSheetParams): Blob | undefined {
        return getMultipleSheetsAsExcel(params, this.workbook, this.beans.context.getId());
    }
}
