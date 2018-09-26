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
    _
} from 'ag-grid-community';

import {ExcelCell, ExcelStyle} from 'ag-grid-community';
import {ExcelXmlSerializingSession} from './excelXmlSerializingSession';
import {ExcelXlsxSerializingSession} from './excelXlsxSerializingSession';
import {ExcelXmlFactory} from './excelXmlFactory';
import {ExcelXlsxFactory} from './excelXlsxFactory';
import * as JSZip from 'jszip-sync';

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
        if (params.exportMode) {
            this.setExportMode(params.exportMode);
        }
        return this.export(params);
    }

    public getDataAsExcelXml(params?: ExcelExportParams): string {
        return this.getData(params);
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

    public createSerializingSession(params?: ExcelExportParams): SerializingSession {
        const {columnController, valueService, gridOptionsWrapper} = this;
        const {processCellCallback, processHeaderCallback, sheetName, suppressTextAsCDATA} = params;
        const isXlsx = this.getExportMode() === 'xlsx';
        const excelFactory = isXlsx ? this.xlsxFactory : this.excelXmlFactory;

        const config = {
            columnController,
            valueService,
            gridOptionsWrapper,
            processCellCallback: processCellCallback || null,
            processHeaderCallback: processHeaderCallback || null,
            sheetName: sheetName != null && sheetName !== '' ? sheetName : 'ag-grid',
            excelFactory,
            baseExcelStyles: this.gridOptions.excelStyles,
            styleLinker: this.styleLinker.bind(this),
            suppressTextAsCDATA: suppressTextAsCDATA || false
        };

        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    }

    private styleLinker(rowType: RowType, rowIndex: number, colIndex: number, value: string, column: Column, node: RowNode): string[] {
        if ((rowType === RowType.HEADER) || (rowType === RowType.HEADER_GROUPING)) return ["header"];
        if (!this.gridOptions.excelStyles || this.gridOptions.excelStyles.length === 0) return null;

        let styleIds: string[] = this.gridOptions.excelStyles.map((it: ExcelStyle) => {
            return it.id;
        });

        let applicableStyles: string [] = [];
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

        const zip: JSZip = new JSZip();
        const xlsxFactory = this.xlsxFactory;

        return zip.sync(() => {
            zip.file('_rels/.rels', xlsxFactory.createRels());
            zip.file('docProps/core.xml', xlsxFactory.createCore());
            zip.file('[Content_Types].xml', xlsxFactory.createContentTypes());

            const xl = zip.folder('xl');

            xl.file('_rels/workbook.xml.rels', xlsxFactory.createWorkbookRels());
            xl.file('theme/theme1.xml', xlsxFactory.createTheme());
            xl.file('worksheets/sheet1.xml', data);
            xl.file('sharedStrings.xml', xlsxFactory.createSharedStrings());
            xl.file('styles.xml', xlsxFactory.createStylesheet());
            xl.file('workbook.xml', xlsxFactory.createWorkbook());

            let zipped;

            zip.generateAsync({
                type: 'blob',
                mimeType:
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              }).then(function(content: any) {
                zipped = content;
            });

            return zipped;
        });
    }
}