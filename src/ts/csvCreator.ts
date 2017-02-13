import {Bean, Autowired} from "./context/context";
import {GridSerializer, RowAccumulator, BaseGridSerializingSession, RowSpanningAccumulator} from "./gridSerializer";
import {Downloader} from "./downloader";
import {Column} from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {ColumnController} from "./columnController/columnController";
import {ValueService} from "./valueService";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ProcessCellForExportParams, ProcessHeaderForExportParams} from "./entities/gridOptions";
import {CsvExportParams} from "./exportParams";

var LINE_SEPARATOR = '\r\n';

export class CsvSerializingSession extends BaseGridSerializingSession {
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
        this.result += this.putInQuotes(this.extractRowCellValue(column, index, node), this.suppressQuotes);
        this.lineOpened = true;
    }


    private putInQuotes(value: any, suppressQuotes: boolean): string {
        if (suppressQuotes) { return value; }

        if (value === null || value === undefined) {
            return '""';
        }

        var stringValue: string;
        if (typeof value === 'string') {
            stringValue = value;
        } else if (typeof value.toString === 'function') {
            stringValue = value.toString();
        } else {
            console.warn('unknown value type during csv conversion');
            stringValue = '';
        }

        // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
        var valueEscaped = stringValue.replace(/"/g, "\"\"");

        return '"' + valueEscaped + '"';
    }

    public parse(): string {
        return this.result;
    }
}

@Bean('csvCreator')
export class CsvCreator {
    @Autowired('downloader') private downloader: Downloader;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public exportDataAsCsv(params?: CsvExportParams): string {
        var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        var fileName = fileNamePresent ? params.fileName : 'export.csv';


        let dataAsCsv = this.getDataAsCsv(params);
        this.downloader.download(
            fileName,
            dataAsCsv,
            "text/csv;charset=utf-8;"
        );
        return dataAsCsv;
    }

    public getDataAsCsv(params?: CsvExportParams): string{
        return this.gridSerializer.serialize(
            new CsvSerializingSession(
                this.columnController,
                this.valueService,
                this.gridOptionsWrapper,
                params ? params.processCellCallback : null,
                params ? params.processHeaderCallback : null,
                params && params.suppressQuotes,
                (params && params.columnSeparator) || ','
            ),
            params
        );
    }
}
