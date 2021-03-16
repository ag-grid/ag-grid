import {
    Autowired,
    Bean,
    Column,
    ColumnController,
    ExcelExportParams,
    ExcelFactoryMode,
    ExcelExportMultipleSheetParams,
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

type SerializingSession = ExcelXlsxSerializingSession | ExcelXmlSerializingSession;

export const getMultipleSheetsAsExcel = (params: ExcelExportMultipleSheetParams) => {
    const { data, fontSize = 11, author = 'AG Grid' } = params;
    ZipContainer.addFolders([
        'xl/worksheets/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'docProps/',
        '_rels/'
    ]);

    const sheetLen = data.length;
    data.forEach((value, idx) => {
        ZipContainer.addFile(`xl/worksheets/sheet${idx + 1}.xml`, value);
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
}

export const exportMultipleSheetsAsExcel = (properties: ExcelExportMultipleSheetParams) => {
    const { fileName = 'export.xlsx' } = properties;

    Downloader.download(fileName, getMultipleSheetsAsExcel(properties));
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

    public export(userParams?: ExcelExportParams): string {
        if (this.isExportSuppressed()) {
            console.warn(`ag-grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }

        const { mergedParams, data } = this.getMergedParamsAndData(userParams);

        Downloader.download(this.getFileName(mergedParams.fileName), this.packageFile({
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author
        }));

        return data;
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
        const { mergedParams, data } =  this.getMergedParamsAndData(params);

        if (params && params.exportMode === 'xml') { return data; }

        return this.packageFile({
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author
        });
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
        return this.getMergedParamsAndData(params).data;
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob {
        return getMultipleSheetsAsExcel(params);
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams) {
        return exportMultipleSheetsAsExcel(params);
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
        if (rowType === RowType.HEADER) { return ["header"]; }
        if (rowType === RowType.HEADER_GROUPING) { return ["header", "headerGroup"]; }

        const styles = this.gridOptions.excelStyles;

        const applicableStyles: string [] = ["cell"];

        if (!styles || !styles.length) { return applicableStyles; }

        const styleIds: string[] = styles.map((it: ExcelStyle) => {
            return it.id;
        });

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

    protected packageFile(params: ExcelExportMultipleSheetParams): Blob {
        if (this.getExportMode() === 'xml') {
            return super.packageFile(params);
        }

        return getMultipleSheetsAsExcel(params);
    }
}
