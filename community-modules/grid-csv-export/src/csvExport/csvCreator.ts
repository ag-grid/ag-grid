import {
    _,
    Autowired,
    BaseExportParams,
    Bean,
    Column,
    ColumnController,
    Constants,
    CsvExportParams,
    ExportParams,
    GridOptionsWrapper,
    ICsvCreator,
    PostConstruct,
    RowNode,
    ValueService,
    CsvCustomContent
} from "@ag-grid-community/core"

import {
    BaseGridSerializingSession,
    GridSerializer,
    GridSerializingParams,
    GridSerializingSession,
    RowAccumulator,
    RowSpanningAccumulator
} from "./gridSerializer";
import {Downloader} from "./downloader";

const LINE_SEPARATOR = '\r\n';

export interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}

export class CsvSerializingSession extends BaseGridSerializingSession<CsvCustomContent> {
    private result: string = '';
    private suppressQuotes: boolean;
    private columnSeparator: string;

    constructor(config: CsvSerializingParams) {
        super(config);

        const {suppressQuotes, columnSeparator} = config;

        this.suppressQuotes = suppressQuotes;
        this.columnSeparator = columnSeparator;
    }

    public addCustomContent(content: CsvCustomContent) {
        if (!content) { return; }
        if (typeof content === 'string') {
            // we used to require the customFooter to be prefixed with a newline but no longer do,
            // so only add the newline if the user has not supplied one
            if (this.result && !/^\s*\n/.test(content)) {
                content = LINE_SEPARATOR + content;
            }
            // replace whatever newlines are supplied with the style we're using
            content = content.replace(/\r?\n/g, LINE_SEPARATOR);
            this.result += content + LINE_SEPARATOR;
        } else {
            this.beginNewLine();
            content.forEach(row => {
                row.forEach((cell, index) => {
                    if (index !== 0) {
                        this.result += this.columnSeparator;
                    }
                    this.result += this.putInQuotes(cell.data.value || '');
                    if (cell.mergeAcross) {
                        this.appendEmptyCells(cell.mergeAcross);
                    }
                });
            })
        }
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    }

    private onNewHeaderGroupingRowColumn(header: string, index: number, span: number) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }

        this.result += this.putInQuotes(header);

        this.appendEmptyCells(span);
    }

    private appendEmptyCells(count: number) {
        for (let i = 1; i <= count; i++) {
            this.result += this.columnSeparator + this.putInQuotes("");
        }
    }

    public onNewHeaderRow(): RowAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewHeaderRowColumn.bind(this)
        };
    }

    private onNewHeaderRowColumn(column: Column, index: number, node?: RowNode): void {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractHeaderValue(column));
    }

    public onNewBodyRow(): RowAccumulator {
        this.beginNewLine();

        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    }

    private onNewBodyRowColumn(column: Column, index: number, node: RowNode): void {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_CSV, node));
    }

    private putInQuotes(value: any): string {
        if (this.suppressQuotes) {
            return value;
        }

        if (value === null || value === undefined) {
            return '""';
        }

        let stringValue: string;
        if (typeof value === 'string') {
            stringValue = value;
        } else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        } else {
            console.warn('unknown value type during csv conversion');
            stringValue = '';
        }

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        const valueEscaped = stringValue.replace(/"/g, "\"\"");

        return '"' + valueEscaped + '"';
    }

    public parse(): string {
        if (!this.result.endsWith(LINE_SEPARATOR)) {
            this.result += LINE_SEPARATOR;
        }
        return this.result;
    }

    private beginNewLine() {
        if (this.result) {
            this.result += LINE_SEPARATOR;
        }
    }
}

export interface BaseCreatorBeans {
    downloader: Downloader;
    gridSerializer: GridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
}

export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {

    private beans: BaseCreatorBeans;

    protected setBeans(beans: BaseCreatorBeans) {
        this.beans = beans;
    }

    public export(userParams?: P): string {
        if (this.isExportSuppressed()) {
            console.warn(`ag-grid: Export cancelled. Export is not allowed as per your configuration.`);
            return '';
        }

        const {mergedParams, data} = this.getMergedParamsAndData(userParams);

        const fileNamePresent = mergedParams && mergedParams.fileName && mergedParams.fileName.length !== 0;
        let fileName = fileNamePresent ? mergedParams.fileName : this.getDefaultFileName();

        if (fileName!.indexOf(".") === -1) {
            fileName = fileName + "." + this.getDefaultFileExtension();
        }

        this.beans.downloader.download(fileName!, this.packageFile(data));

        return data;
    }

    public getData(params?: P): string {
        return this.getMergedParamsAndData(params).data;
    }

    private getMergedParamsAndData(userParams?: P): { mergedParams: P, data: string } {
        const mergedParams = this.mergeDefaultParams(userParams);
        const data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);

        return {mergedParams, data};
    }

    private mergeDefaultParams(userParams?: P): P {
        const baseParams: BaseExportParams | undefined = this.beans.gridOptionsWrapper.getDefaultExportParams();
        const params: P = {} as any;
        _.assign(params, baseParams);
        _.assign(params, userParams);
        return params;
    }

    protected packageFile(data: string): Blob {
        return new Blob(["\ufeff", data], {
            type: window.navigator.msSaveOrOpenBlob ? this.getMimeType() : 'octet/stream'
        });
    }

    public abstract createSerializingSession(params?: P): S;

    public abstract getMimeType(): string;

    public abstract getDefaultFileName(): string;

    public abstract getDefaultFileExtension(): string;

    public abstract isExportSuppressed(): boolean;
}

@Bean('csvCreator')
export class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements ICsvCreator {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;

    @Autowired('downloader') private downloader: Downloader;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    @PostConstruct
    public postConstruct(): void {
        this.setBeans({
            downloader: this.downloader,
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    }

    public exportDataAsCsv(params?: CsvExportParams): string {
        return this.export(params);
    }

    public getDataAsCsv(params?: CsvExportParams): string {
        return this.getData(params);
    }

    public getMimeType(): string {
        return 'text/csv;charset=utf-8;';
    }

    public getDefaultFileName(): string {
        return 'export.csv';
    }

    public getDefaultFileExtension(): string {
        return 'csv';
    }

    public createSerializingSession(params?: CsvExportParams): CsvSerializingSession {
        const {columnController, valueService, gridOptionsWrapper} = this;
        const {processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback, suppressQuotes, columnSeparator} = params;

        return new CsvSerializingSession({
            columnController,
            valueService,
            gridOptionsWrapper,
            processCellCallback: processCellCallback || undefined,
            processHeaderCallback: processHeaderCallback || undefined,
            processGroupHeaderCallback: processGroupHeaderCallback || undefined,
            processRowGroupCallback: processRowGroupCallback || undefined,
            suppressQuotes: suppressQuotes || false,
            columnSeparator: columnSeparator || ','
        });
    }

    public isExportSuppressed(): boolean {
        return this.gridOptionsWrapper.isSuppressCsvExport();
    }
}
