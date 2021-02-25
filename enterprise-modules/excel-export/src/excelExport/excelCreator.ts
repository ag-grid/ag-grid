import {
    Autowired,
    Bean,
    Column,
    ColumnController,
    ExcelExportParams,
    ExcelFactoryMode,
    GridOptions,
    GridOptionsWrapper,
    IExcelCreator,
    PostConstruct,
    RowNode,
    StylingService,
    ValueService,
    _
} from '@ag-grid-community/core';

import { ExcelCell, ExcelStyle } from '@ag-grid-community/core';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseCreator, GridSerializer, ZipContainer, RowType, Downloader } from "@ag-grid-community/csv-export";
import { ExcelGridSerializingParams } from './baseExcelSerializingSession';
import { ExcelXmlFactory } from './excelXmlFactory';

export interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}

type SerializingSession = ExcelXmlSerializingSession | ExcelXlsxSerializingSession;

export const getMultipleSheetsAsExcel = (rawData: string[], defaultFontSize: number = 11) => {
    ZipContainer.addFolders([
        'xl/worksheets/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'docProps/',
        '_rels/'
    ]);

    const sheetLen = rawData.length;
    rawData.forEach((value, idx) => {
        ZipContainer.addFile(`xl/worksheets/sheet${idx + 1}.xml`, value);
    });
    ZipContainer.addFile('xl/workbook.xml', ExcelXlsxFactory.createWorkbook());
    ZipContainer.addFile('xl/styles.xml', ExcelXlsxFactory.createStylesheet(defaultFontSize));
    ZipContainer.addFile('xl/sharedStrings.xml', ExcelXlsxFactory.createSharedStrings());
    ZipContainer.addFile('xl/theme/theme1.xml', ExcelXlsxFactory.createTheme());
    ZipContainer.addFile('xl/_rels/workbook.xml.rels', ExcelXlsxFactory.createWorkbookRels(sheetLen));
    ZipContainer.addFile('docProps/core.xml', ExcelXlsxFactory.createCore());
    ZipContainer.addFile('[Content_Types].xml', ExcelXlsxFactory.createContentTypes(sheetLen));
    ZipContainer.addFile('_rels/.rels', ExcelXlsxFactory.createRels());

    ExcelXlsxFactory.resetFactory();

    return ZipContainer.getContent('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

export const exportMultipleSheetsAsExcel = (rawData: string[], fileName: string = 'export.xlsx', defaultFontSize?: number) => {
    Downloader.download(fileName, getMultipleSheetsAsExcel(rawData, defaultFontSize));
}

@Bean('excelCreator')
export class ExcelCreator extends BaseCreator<ExcelCell[][], SerializingSession, ExcelExportParams> implements IExcelCreator {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('stylingService') private stylingService: StylingService;

    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private exportMode: string = 'xlsx';

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    }

    public exportDataAsExcel(params?: ExcelExportParams): string {
        let exportMode = 'xlsx';

        if (params && params.exportMode) {
            exportMode = params.exportMode;
        }

        this.setExportMode(exportMode);

        return this.export(params);
    }

    public getDataAsExcel(params?: ExcelExportParams): Blob | string {
        const { mergedParams, data } =  this.getMergedParamsAndData(params || {});

        if (params && params.exportMode === 'xml') { return data; }

        return this.packageFile(data, mergedParams.fontSize);
    }

    public setFactoryMode(factoryMode: ExcelFactoryMode, exportMode: 'xml' | 'xlsx' = 'xlsx'): void {
        const factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        factory.factoryMode = factoryMode;
    }

    public getFactoryMode(exportMode: 'xml' | 'xlsx'): ExcelFactoryMode {
        const factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        return factory.factoryMode;
    }

    public getGridRawDataForExcel(params: ExcelExportParams): string {
        return this.getMergedParamsAndData(params || {}).data;
    }

    public getMultipleSheetsAsExcel(gridRawData: string[], defaultFontSize?: number): Blob {
        return getMultipleSheetsAsExcel(gridRawData, defaultFontSize);
    }

    public exportMultipleSheetsAsExcel(gridRawData: string[], fileName?: string, defaultFontSize?: number) {
        return exportMultipleSheetsAsExcel(gridRawData, fileName, defaultFontSize);
    }

    public getMimeType(): string {
        return this.getExportMode() === 'xml' ? 'application/vnd.ms-excel' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    public getDefaultFileName(): string {
        return `export.${this.getExportMode()}`;
    }

    public getDefaultFileExtension(): string {
        return this.getExportMode();
    }

    public createSerializingSession(params: ExcelExportParams): SerializingSession {
        const { columnController, valueService, gridOptionsWrapper } = this;
        const isXlsx = this.getExportMode() === 'xlsx';

        let sheetName = 'ag-grid';

        if (_.exists(params.sheetName)) {
            sheetName = _.utf8_encode(params.sheetName.toString().substr(0, 31));
        }

        const config: ExcelGridSerializingParams = {
            ...params,
            columnController,
            valueService,
            gridOptionsWrapper,
            headerRowHeight: params.headerRowHeight || params.rowHeight,
            sheetName,
            baseExcelStyles: this.gridOptions.excelStyles || [],
            styleLinker: this.styleLinker.bind(this)
        };

        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    }

    private styleLinker(rowType: RowType, rowIndex: number, colIndex: number, value: string, column: Column, node: RowNode): string[] | null {
        if ((rowType === RowType.HEADER) || (rowType === RowType.HEADER_GROUPING)) { return ["header"]; }
        const styles = this.gridOptions.excelStyles;

        if (!styles || !styles.length) { return null; }

        const styleIds: string[] = styles.map((it: ExcelStyle) => {
            return it.id;
        });

        const applicableStyles: string [] = [];
        this.stylingService.processAllCellClasses(
            column.getColDef(),
            {
                value: value,
                data: node.data,
                node: node,
                colDef: column.getColDef(),
                rowIndex: rowIndex,
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!,
                $scope: null,
                context: this.gridOptionsWrapper.getContext()
            },
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
        return this.gridOptionsWrapper.isSuppressExcelExport();
    }

    private setExportMode(exportMode: string): void {
        this.exportMode = exportMode;
    }

    private getExportMode(): string {
        return this.exportMode;
    }

    protected packageFile(data: string, fontSize?: number): Blob {
        if (this.getExportMode() === 'xml') {
            return super.packageFile(data);
        }

        return getMultipleSheetsAsExcel([data], fontSize);
    }
}
