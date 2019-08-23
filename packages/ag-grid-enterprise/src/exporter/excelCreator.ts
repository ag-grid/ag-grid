import {
    Autowired,
    BaseCreator,
    Bean,
    Column,
    ColumnController,
    Downloader,
    ExcelExportParams,
    GridOptions,
    GridOptionsWrapper,
    GridSerializer,
    IExcelCreator,
    PostConstruct,
    RowNode,
    RowType,
    StylingService,
    ValueService,
    ZipContainer,
    _
} from 'ag-grid-community';

import { ExcelCell, ExcelStyle } from 'ag-grid-community';
import { ExcelGridSerializingParams, ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
import { ExcelXmlFactory } from './excelXmlFactory';
import { ExcelXlsxFactory } from './excelXlsxFactory';

export interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}

type SerializingSession = ExcelXmlSerializingSession | ExcelXlsxSerializingSession;

@Bean('excelCreator')
export class ExcelCreator extends BaseCreator<ExcelCell[][], SerializingSession, ExcelExportParams> implements IExcelCreator {

    @Autowired('excelXmlFactory') private excelXmlFactory: ExcelXmlFactory;
    @Autowired('excelXlsxFactory') private xlsxFactory: ExcelXlsxFactory;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('stylingService') private stylingService: StylingService;

    @Autowired('downloader') private downloader: Downloader;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('zipContainer') zipContainer: ZipContainer;

    private exportMode: string;

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            downloader: this.downloader,
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    }

    public exportDataAsExcel(params?: ExcelExportParams): string {
        if (params && params.exportMode) {
            this.setExportMode(params.exportMode);
        }
        return this.export(params);
    }

    public getDataAsExcelXml(params?: ExcelExportParams): string {
        if (params && params.exportMode) {
            delete params.exportMode;
        }
        this.setExportMode('xml');
        return this.getData(params || {});
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
        const {columnController, valueService, gridOptionsWrapper} = this;
        const {processCellCallback, processHeaderCallback, suppressTextAsCDATA, rowHeight, headerRowHeight} = params;
        const isXlsx = this.getExportMode() === 'xlsx';
        const excelFactory = isXlsx ? this.xlsxFactory : this.excelXmlFactory;

        let sheetName = 'ag-grid';

        if (_.exists(params.sheetName)) {
            sheetName = _.utf8_encode(params.sheetName!.toString().substr(0, 31));
        }

        const config = {
            columnController,
            valueService,
            gridOptionsWrapper,
            processCellCallback,
            processHeaderCallback,
            rowHeight,
            headerRowHeight: headerRowHeight || rowHeight,
            sheetName,
            excelFactory,
            baseExcelStyles: this.gridOptions.excelStyles || undefined,
            styleLinker: this.styleLinker.bind(this),
            suppressTextAsCDATA: suppressTextAsCDATA || false
        };

        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)((config as ExcelGridSerializingParams));
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
                api: this.gridOptionsWrapper.getApi(),
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
        return this.exportMode || 'xlsx';
    }

    protected packageFile(data: string): Blob {
        if (this.getExportMode() === 'xml') {
            return super.packageFile(data);
        }

        const {zipContainer, xlsxFactory} = this;

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
    }
}
