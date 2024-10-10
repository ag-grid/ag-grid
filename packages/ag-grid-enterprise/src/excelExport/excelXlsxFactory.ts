import type {
    AgColumn,
    ExcelHeaderFooterImage,
    ExcelImage,
    ExcelRelationship,
    ExcelStyle,
    ExcelTableConfig,
    ExcelWorksheet,
    RowHeightCallbackParams,
} from 'ag-grid-community';
import { ExcelFactoryMode, _escapeString, _warn } from 'ag-grid-community';

import type {
    ExcelCalculatedImage,
    ExcelDataTable,
    ExcelHeaderFooterCalculatedImage,
    ExcelHeaderFooterPosition,
    ImageIdMap,
} from './assets/excelInterfaces';
import { createXmlPart, setExcelImageTotalHeight, setExcelImageTotalWidth } from './assets/excelUtils';
import type { ExcelGridSerializingParams } from './excelSerializingSession';
import contentTypesFactory, { _normaliseImageExtension } from './files/ooxml/contentTypes';
import coreFactory from './files/ooxml/core';
import drawingFactory from './files/ooxml/drawing';
import relationshipsFactory from './files/ooxml/relationships';
import sharedStringsFactory from './files/ooxml/sharedStrings';
import stylesheetFactory, { registerStyles } from './files/ooxml/styles/stylesheet';
import tableFactory from './files/ooxml/table';
import officeThemeFactory from './files/ooxml/themes/office';
import vmlDrawingFactory from './files/ooxml/vmlDrawing';
import workbookFactory from './files/ooxml/workbook';
import worksheetFactory from './files/ooxml/worksheet';

/**
 * See links for more info on the Office Open XML format being used:
 * https://www.ecma-international.org/wp-content/uploads/Office-Open-XML-White-Paper.pdf
 * https://ecma-international.org/publications-and-standards/standards/ecma-376/
 */
export class ExcelXlsxFactory {
    private static sharedStrings: Map<string, number> = new Map();
    private static sheetNames: string[] = [];

    /** Maps images to sheet */
    public static images: Map<
        string,
        { sheetId: number; image: (ExcelCalculatedImage | ExcelHeaderFooterCalculatedImage)[] }[]
    > = new Map();
    /** Maps sheets to images */
    public static worksheetImages: Map<number, ExcelCalculatedImage[]> = new Map();
    /** Maps sheets to header/footer images */
    public static worksheetHeaderFooterImages: Map<number, ExcelHeaderFooterCalculatedImage[]> = new Map();
    /** Maps all workbook images to a global Id */
    public static workbookImageIds: ImageIdMap = new Map();
    /** Maps all sheet images to unique Ids */
    public static worksheetImageIds: Map<number, ImageIdMap> = new Map();
    /** Maps all sheet tables to unique Ids */
    public static worksheetDataTables: Map<number, ExcelDataTable> = new Map();
    /** Default name to be used for tables when no name is provided */
    public static defaultTableDisplayName = 'AG-GRID-TABLE';

    public static factoryMode: ExcelFactoryMode = ExcelFactoryMode.SINGLE_SHEET;

    public static createExcel(
        styles: ExcelStyle[],
        worksheet: ExcelWorksheet,
        config: ExcelGridSerializingParams
    ): string {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);

        const newConfig = Object.assign({}, config);

        // Table export is not compatible with pivot mode nor master/detail features
        if (config.exportAsExcelTable) {
            if (config.columnModel.isPivotActive()) {
                this.showExcelTableNonCompatibleFeaturesWarning('pivot mode');
                newConfig.exportAsExcelTable = false;
            }

            if (config.gos.get('masterDetail')) {
                this.showExcelTableNonCompatibleFeaturesWarning('master/detail');
                newConfig.exportAsExcelTable = false;
            }
        }

        this.processTableConfig(worksheet, newConfig);
        return this.createWorksheet(worksheet, newConfig);
    }

    private static showExcelTableNonCompatibleFeaturesWarning(featureName: string) {
        _warn(163, { featureName });
    }

    public static getTableNameFromIndex(idx: number) {
        return `table${idx + 1}`;
    }

    public static getSanitizedTableName(name: string) {
        return name
            .replace(/^[^a-zA-Z_]+/, '_')
            .replace(/\s/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '_');
    }

    public static addTableToSheet(sheetIndex: number, table: ExcelDataTable): void {
        if (this.worksheetDataTables.has(sheetIndex)) {
            _warn(164);
            return;
        }

        this.worksheetDataTables.set(sheetIndex, table);
    }

    private static processTableConfig(worksheet: ExcelWorksheet, config: ExcelGridSerializingParams) {
        if (!config.exportAsExcelTable) {
            return;
        }

        const tableConfig: Partial<ExcelTableConfig> =
            typeof config.exportAsExcelTable === 'boolean' ? {} : config.exportAsExcelTable;

        const {
            name: nameFromConfig,
            showColumnStripes,
            showRowStripes,
            showFilterButton,
            highlightFirstColumn,
            highlightLastColumn,
        } = tableConfig;

        const tableName = this.getSanitizedTableName(nameFromConfig || ExcelXlsxFactory.defaultTableDisplayName);

        const sheetIndex = this.sheetNames.length - 1;
        const { table } = worksheet;
        const { rows, columns } = table;
        const headerRowCount = config.columnModel.getHeaderRowCount();
        const tableHeaderRowIndex: number = headerRowCount - 1; // Assuming that header starts at row 0
        const tableRowCount = rows.length;
        const tableColCount = columns.length;

        const tableColumns: string[] = [];
        const showFilterButtons: boolean[] = [];

        for (let i = 0; i < tableColCount; i++) {
            const col = columns[i];
            tableColumns.push(col.displayName || '');
            showFilterButtons.push(
                showFilterButton === 'match' || showFilterButton === undefined
                    ? col.filterAllowed ?? false // We fall back to the column's filterAllowed property on match
                    : showFilterButton
            );
        }

        if (!tableColumns || !tableColumns.length || !tableRowCount || !tableName) {
            _warn(165);
            return;
        }

        this.addTableToSheet(sheetIndex, {
            name: this.getTableNameFromIndex(sheetIndex),
            displayName: tableName,
            columns: tableColumns,
            showFilterButtons: showFilterButtons,
            headerRowIndex: tableHeaderRowIndex,
            rowCount: tableRowCount - headerRowCount,
            showRowStripes: showRowStripes ?? true,
            showColumnStripes: showColumnStripes ?? false,
            highlightFirstColumn: highlightFirstColumn ?? false,
            highlightLastColumn: highlightLastColumn ?? false,
        });
    }

    public static addHeaderFooterImageToMap(image: ExcelHeaderFooterImage, position: ExcelHeaderFooterPosition): void {
        const sheetIndex = this.sheetNames.length - 1;
        const headerFooterImage = image as ExcelHeaderFooterCalculatedImage;

        headerFooterImage.headerFooterPosition = position;

        this.buildImageMap({ imageToAdd: headerFooterImage, idx: sheetIndex });

        let headerFooterImagesForSheet = this.worksheetHeaderFooterImages.get(sheetIndex);

        if (!headerFooterImagesForSheet) {
            headerFooterImagesForSheet = [];
            this.worksheetHeaderFooterImages.set(sheetIndex, headerFooterImagesForSheet);
        }

        if (!headerFooterImagesForSheet.find((img) => img.id === image.id)) {
            headerFooterImagesForSheet.push(image as ExcelHeaderFooterCalculatedImage);
        }
    }

    public static addBodyImageToMap(
        image: ExcelImage,
        rowIndex: number,
        col: AgColumn,
        columnsToExport?: AgColumn[],
        rowHeight?: number | ((params: RowHeightCallbackParams) => number)
    ): void {
        const sheetIndex = this.sheetNames.length;
        const { row, column } = image.position || {};
        const calculatedImage = image as ExcelCalculatedImage;

        if (columnsToExport) {
            if (rowIndex != null && col != null && (!row || !column)) {
                if (!image.position) {
                    image.position = {};
                }

                image.position = Object.assign({}, image.position, {
                    row: rowIndex,
                    column: columnsToExport.indexOf(col) + 1,
                });
            }
            setExcelImageTotalWidth(calculatedImage, columnsToExport);
            setExcelImageTotalHeight(calculatedImage, rowHeight);
        }

        this.buildImageMap({ imageToAdd: calculatedImage, idx: sheetIndex });

        let worksheetImageIdMap = this.worksheetImageIds.get(sheetIndex);

        if (!worksheetImageIdMap) {
            worksheetImageIdMap = new Map();
            this.worksheetImageIds.set(sheetIndex, worksheetImageIdMap);
        }

        const sheetImages = this.worksheetImages.get(sheetIndex);

        if (!sheetImages) {
            this.worksheetImages.set(sheetIndex, [calculatedImage]);
        } else {
            sheetImages.push(calculatedImage);
        }

        if (!worksheetImageIdMap.get(image.id)) {
            worksheetImageIdMap.set(image.id, { index: worksheetImageIdMap.size, type: image.imageType });
        }
    }

    private static buildImageMap(params: {
        imageToAdd: ExcelCalculatedImage | ExcelHeaderFooterCalculatedImage;
        idx: number;
    }): void {
        const { imageToAdd, idx } = params;
        const mappedImagesToSheet = this.images.get(imageToAdd.id);

        if (mappedImagesToSheet) {
            const currentSheetImages = mappedImagesToSheet.find((currentImage) => currentImage.sheetId === idx);
            if (currentSheetImages) {
                currentSheetImages.image.push(imageToAdd);
            } else {
                mappedImagesToSheet.push({
                    sheetId: idx,
                    image: [imageToAdd],
                });
            }
        } else {
            this.images.set(imageToAdd.id, [{ sheetId: idx, image: [imageToAdd] }]);
            this.workbookImageIds.set(imageToAdd.id, { type: imageToAdd.imageType, index: this.workbookImageIds.size });
        }
    }

    private static addSheetName(worksheet: ExcelWorksheet): void {
        const name = _escapeString(worksheet.name) || '';
        let append = '';

        while (this.sheetNames.indexOf(`${name}${append}`) !== -1) {
            if (append === '') {
                append = '_1';
            } else {
                const curr = parseInt(append.slice(1), 10);
                append = `_${curr + 1}`;
            }
        }

        worksheet.name = `${name}${append}`;
        this.sheetNames.push(worksheet.name);
    }

    public static getStringPosition(str: string): number {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str)!;
        }

        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    }

    public static resetFactory(): void {
        this.sharedStrings = new Map();

        this.images = new Map();
        this.worksheetImages = new Map();
        this.worksheetHeaderFooterImages = new Map();

        this.workbookImageIds = new Map();
        this.worksheetImageIds = new Map();
        this.worksheetDataTables = new Map();

        this.sheetNames = [];
        this.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
    }

    public static createWorkbook(currentSheet: number): string {
        return createXmlPart(workbookFactory.getTemplate(this.sheetNames, currentSheet));
    }

    public static createStylesheet(defaultFontSize: number): string {
        return createXmlPart(stylesheetFactory.getTemplate(defaultFontSize));
    }

    public static createSharedStrings(): string {
        return createXmlPart(sharedStringsFactory.getTemplate(this.sharedStrings));
    }

    public static createCore(author: string): string {
        return createXmlPart(coreFactory.getTemplate(author));
    }

    public static createContentTypes(sheetLen: number): string {
        return createXmlPart(contentTypesFactory.getTemplate(sheetLen));
    }

    public static createRels(): string {
        const rs = relationshipsFactory.getTemplate([
            {
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                Target: 'xl/workbook.xml',
            },
            {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
                Target: 'docProps/core.xml',
            },
        ]);

        return createXmlPart(rs);
    }

    public static createTheme(): string {
        return createXmlPart(officeThemeFactory.getTemplate());
    }

    public static createTable(dataTable: ExcelDataTable, index?: number): string {
        return createXmlPart(tableFactory.getTemplate(dataTable, index));
    }

    public static createWorkbookRels(sheetLen: number): string {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            Id: `rId${i + 1}`,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: `worksheets/sheet${i + 1}.xml`,
        }));

        const rs = relationshipsFactory.getTemplate([
            ...worksheets,
            {
                Id: `rId${sheetLen + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml',
            },
            {
                Id: `rId${sheetLen + 2}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml',
            },
            {
                Id: `rId${sheetLen + 3}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml',
            },
        ]);

        return createXmlPart(rs);
    }

    public static createDrawing(sheetIndex: number) {
        return createXmlPart(drawingFactory.getTemplate({ sheetIndex }));
    }

    public static createDrawingRel(sheetIndex: number) {
        const worksheetImageIds = this.worksheetImageIds.get(sheetIndex) || [];
        const XMLArr: ExcelRelationship[] = [];

        for (const [key, value] of worksheetImageIds) {
            const { index, type } = value;

            XMLArr.push({
                Id: `rId${index + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                Target: `../media/image${this.workbookImageIds.get(key)!.index + 1}.${_normaliseImageExtension(type)}`,
            });
        }

        return createXmlPart(relationshipsFactory.getTemplate(XMLArr));
    }

    public static createVmlDrawing(sheetIndex: number) {
        return createXmlPart(vmlDrawingFactory.getTemplate({ sheetIndex }), true);
    }

    public static createVmlDrawingRel(sheetIndex: number) {
        const worksheetHeaderFooterImages = this.worksheetHeaderFooterImages.get(sheetIndex) || [];
        const XMLArr: ExcelRelationship[] = [];

        for (let i = 0; i < worksheetHeaderFooterImages.length; i++) {
            const headerFooterImage = worksheetHeaderFooterImages[i];
            const workbookImage = this.workbookImageIds.get(headerFooterImage.id);

            if (!workbookImage) {
                continue;
            }

            const { index, type } = workbookImage;

            XMLArr.push({
                Id: `rId${i + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                Target: `../media/image${index + 1}.${_normaliseImageExtension(type)}`,
            });
        }

        return createXmlPart(relationshipsFactory.getTemplate(XMLArr));
    }

    public static createRelationships({
        drawingIndex,
        vmlDrawingIndex,
        tableIndex,
    }: {
        drawingIndex?: number;
        vmlDrawingIndex?: number;
        tableIndex?: number;
    } = {}) {
        if (drawingIndex === undefined && vmlDrawingIndex === undefined && tableIndex === undefined) {
            return '';
        }

        const config = [];
        if (drawingIndex != null) {
            config.push({
                Id: `rId${config.length + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
                Target: `../drawings/drawing${drawingIndex + 1}.xml`,
            });
        }

        if (vmlDrawingIndex != null) {
            config.push({
                Id: `rId${config.length + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing',
                Target: `../drawings/vmlDrawing${vmlDrawingIndex + 1}.vml`,
            });
        }

        if (tableIndex != null) {
            config.push({
                Id: `rId${config.length + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table',
                Target: `../tables/${this.getTableNameFromIndex(tableIndex)}.xml`,
            });
        }

        const rs = relationshipsFactory.getTemplate(config);
        return createXmlPart(rs);
    }

    private static createWorksheet(worksheet: ExcelWorksheet, config: ExcelGridSerializingParams): string {
        return createXmlPart(
            worksheetFactory.getTemplate({
                worksheet,
                currentSheet: this.sheetNames.length - 1,
                config,
            })
        );
    }
}
