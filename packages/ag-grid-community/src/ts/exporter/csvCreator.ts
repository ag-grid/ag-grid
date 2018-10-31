import {Bean, Autowired, PostConstruct} from "../context/context";
import {
    GridSerializer, RowAccumulator, BaseGridSerializingSession, RowSpanningAccumulator,
    GridSerializingSession, GridSerializingParams
} from "./gridSerializer";
import {Downloader} from "./downloader";
import {Column} from "../entities/column";
import {RowNode} from "../entities/rowNode";
import {ColumnController} from "../columnController/columnController";
import {ValueService} from "../valueService/valueService";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {
    BaseExportParams, CsvExportParams, ExportParams, ProcessCellForExportParams,
    ProcessHeaderForExportParams
} from "./exportParams";
import {Constants} from "../constants";
import {_} from "../utils";

let LINE_SEPARATOR = '\r\n';

export interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}

export class CsvSerializingSession extends BaseGridSerializingSession<string> {
    private result:string = '';
    private lineOpened:boolean = false;
    private suppressQuotes: boolean;
    private columnSeparator: string;

    constructor(config: CsvSerializingParams) {
        super({
            columnController: config.columnController,
            valueService: config.valueService,
            gridOptionsWrapper: config.gridOptionsWrapper,
            processCellCallback: config.processCellCallback,
            processHeaderCallback: config.processHeaderCallback
        });

        const {suppressQuotes, columnSeparator} = config;

        this.suppressQuotes = suppressQuotes;
        this.columnSeparator = columnSeparator;
    }

    public prepare(columnsToExport: Column[]): void {
    }

    public addCustomHeader(customHeader: string): void {
        if (!customHeader) return;
        this.result += customHeader + LINE_SEPARATOR;
    }

    public addCustomFooter(customFooter: string): void {
        if (!customFooter) return;
        this.result += customFooter + LINE_SEPARATOR;
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        if (this.lineOpened) this.result += LINE_SEPARATOR;

        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    }

    private onNewHeaderGroupingRowColumn(header: string, index: number, span:number) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }

        this.result += this.putInQuotes(header, this.suppressQuotes);

        for (let i = 1; i<= span; i++) {
            this.result += this.columnSeparator + this.putInQuotes("", this.suppressQuotes);
        }
        this.lineOpened = true;
    }

    public onNewHeaderRow(): RowAccumulator {
        if (this.lineOpened) this.result += LINE_SEPARATOR;

        return {
            onColumn:this.onNewHeaderRowColumn.bind(this)
        };
    }

    private onNewHeaderRowColumn(column: Column, index: number, node?:RowNode):void {
            if (index != 0) {
                this.result += this.columnSeparator;
            }
            this.result += this.putInQuotes(this.extractHeaderValue(column), this.suppressQuotes);
            this.lineOpened = true;
    }

    public onNewBodyRow(): RowAccumulator {
        if (this.lineOpened) this.result += LINE_SEPARATOR;

        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    }

    private onNewBodyRowColumn(column: Column, index: number, node?:RowNode):void {
        if (index != 0) {
            this.result += this.columnSeparator;
        }
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_CSV, node), this.suppressQuotes);
        this.lineOpened = true;
    }

    private putInQuotes(value: any, suppressQuotes: boolean): string {
        if (suppressQuotes) { return value; }

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
        let valueEscaped = stringValue.replace(/"/g, "\"\"");

        return '"' + valueEscaped + '"';
    }

    public parse(): string {
        return this.result;
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
            console.warn(`ag-grid: Export canceled. Export is not allowed as per your configuration.`);
            return '';
        }

        let {mergedParams, data} = this.getMergedParamsAndData(userParams);

        let fileNamePresent = mergedParams && mergedParams.fileName && mergedParams.fileName.length !== 0;
        let fileName = fileNamePresent ? mergedParams.fileName : this.getDefaultFileName();

        if (fileName.indexOf(".") === -1) {
            fileName = fileName + "." + this.getDefaultFileExtension();
        }

        this.beans.downloader.download(fileName, this.packageFile(data));

        return data;
    }

    public getData(params:P): string {
        return this.getMergedParamsAndData(params).data;
    }

    private getMergedParamsAndData(userParams: P):{mergedParams: P, data: string} {
        let mergedParams = this.mergeDefaultParams(userParams);
        let data = this.beans.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);

        return {mergedParams, data};
    }

    private mergeDefaultParams(userParams: P):P {
        let baseParams: BaseExportParams = this.beans.gridOptionsWrapper.getDefaultExportParams();
        let params: P = <any>{};
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
export class CsvCreator extends BaseCreator<string, CsvSerializingSession, CsvExportParams> {

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
        const {processCellCallback, processHeaderCallback, suppressQuotes, columnSeparator} = params;

        return new CsvSerializingSession({
                columnController,
                valueService,
                gridOptionsWrapper,
                processCellCallback: processCellCallback || null,
                processHeaderCallback: processHeaderCallback || null,
                suppressQuotes: suppressQuotes,
                columnSeparator: columnSeparator|| ','
        });
    }

    public isExportSuppressed(): boolean {
        return this.gridOptionsWrapper.isSuppressCsvExport();
    }
}
