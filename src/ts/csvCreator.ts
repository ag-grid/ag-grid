import {Bean, Autowired} from "./context/context";
import {
    GridSerializer, RowAccumulator, BaseGridSerializingSession, RowSpanningAccumulator,
    GridSerializingSession
} from "./gridSerializer";
import {Downloader} from "./downloader";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {ColumnController} from "./columnController/columnController";
import {ValueService} from "./valueService/valueService";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {
    BaseExportParams, CsvExportParams, ExportParams, ProcessCellForExportParams,
    ProcessHeaderForExportParams
} from "./exportParams";
import {Constants} from "./constants";
import {_} from "./utils";

let LINE_SEPARATOR = '\r\n';

export class CsvSerializingSession extends BaseGridSerializingSession<string> {
    private result:string = '';
    private lineOpened:boolean = false;

    constructor(
        columnController: ColumnController,
        valueService: ValueService,
        gridOptionsWrapper: GridOptionsWrapper,
        processCellCallback:(params: ProcessCellForExportParams)=>string,
        processHeaderCallback:(params: ProcessHeaderForExportParams)=>string,
        private suppressQuotes: boolean,
        private columnSeparator: string
    ){
        super(columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback);
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
        if(this.lineOpened) this.result += LINE_SEPARATOR;

        return {
            onColumn: this.onNewHeaderGroupingRowColumn.bind(this)
        };
    }

    private onNewHeaderGroupingRowColumn (header: string, index: number, span:number) {
        if (index != 0) {
            this.result += this.columnSeparator;
        }

        this.result += header;
        for (let i = 1; i<= span; i++){
            this.result += this.columnSeparator + this.putInQuotes("", this.suppressQuotes);
        }
        this.lineOpened = true;
    }

    public onNewHeaderRow(): RowAccumulator {
        if(this.lineOpened) this.result += LINE_SEPARATOR;

        return {
            onColumn:this.onNewHeaderRowColumn.bind(this)
        };
    }

    private onNewHeaderRowColumn(column: Column, index: number, node?:RowNode):void{
            if (index != 0) {
                this.result += this.columnSeparator;
            }
            this.result += this.putInQuotes(this.extractHeaderValue(column), this.suppressQuotes);
            this.lineOpened = true;
    }

    public onNewBodyRow(): RowAccumulator {
        if(this.lineOpened) this.result += LINE_SEPARATOR;

        return {
            onColumn: this.onNewBodyRowColumn.bind(this)
        };
    }
    
    private onNewBodyRowColumn (column: Column, index: number, node?:RowNode):void{
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

export abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {
    @Autowired('downloader') private downloader: Downloader;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    public export(userParams?: P): string {
        let {mergedParams, data} = this.getMergedParamsAndData(userParams);

        let fileNamePresent = mergedParams && mergedParams.fileName && mergedParams.fileName.length !== 0;
        let fileName = fileNamePresent ? mergedParams.fileName : this.getDefaultFileName();

        if (fileName.indexOf(".") === -1){
            fileName = fileName + "." + this.getDefaultFileExtension();
        }

        this.downloader.download(
            fileName,
            data,
            this.getMimeType()
        );
        return data;
    }

    public getData (params:P):string{
        return this.getMergedParamsAndData(params).data
    }

    private getMergedParamsAndData(userParams: P):{mergedParams:P, data:string} {
        let mergedParams = this.mergeDefaultParams(userParams);
        let data = this.gridSerializer.serialize(this.createSerializingSession(mergedParams), mergedParams);
        return {mergedParams, data};
    }

    private mergeDefaultParams(userParams: P):P {
        let baseParams: BaseExportParams = this.gridOptionsWrapper.getDefaultExportParams();
        let params: P = <any>{};
        _.assign(params, baseParams);
        _.assign(params, userParams);
        return params;
    }
    public abstract createSerializingSession(params?: P):S;
    public abstract getMimeType():string;
    public abstract getDefaultFileName ():string;
    public abstract getDefaultFileExtension ():string;
}

@Bean('csvCreator')
export class CsvCreator extends BaseCreator<string, CsvSerializingSession, CsvExportParams>{
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;

    public exportDataAsCsv(params?: CsvExportParams): string {
        return this.export(params);
    }

    public getDataAsCsv (params?: CsvExportParams): string {
        return this.getData(params);
    }


    public getMimeType(): string {
        return "text/csv;charset=utf-8;"
    }

    public getDefaultFileName(): string {
        return 'export.csv';
    }

    public getDefaultFileExtension(): string {
        return 'csv';
    }

    public createSerializingSession(params?:CsvExportParams): CsvSerializingSession{
        return new CsvSerializingSession(
                this.columnController,
                this.valueService,
                this.gridOptionsWrapper,
                params ? params.processCellCallback : null,
                params ? params.processHeaderCallback : null,
                params && params.suppressQuotes,
                (params && params.columnSeparator) || ','
            )
    }
}
