import {ColumnController} from 'ag-grid/main';
import {ValueService} from 'ag-grid/main';
import {Column} from 'ag-grid/main';
import {IExcelCreator} from 'ag-grid/main';
import {Bean, Autowired} from 'ag-grid/main';
import {Downloader} from 'ag-grid/main';
import {
    ExcelXmlFactory,
    ExcelDataType,
    ExcelCell,
    ExcelRow,
    ExcelStyle,
    ExcelWorksheet,
    ExcelColumn
} from "./excelXmlFactory";
import {
    GridSerializer,
    RowAccumulator,
    RowType,
    BaseGridSerializingSession,
    RowSpanningAccumulator
} from 'ag-grid/main';
import {RowNode} from 'ag-grid/main';
import {Utils} from 'ag-grid/main';
import {GridOptionsWrapper} from 'ag-grid/main';
import {ProcessCellForExportParams, ProcessHeaderForExportParams, GridOptions} from 'ag-grid/main';
import {CsvExportParams} from 'ag-grid/main';
import {StylingService} from 'ag-grid/main';


export class ExcelGridSerializingSession extends BaseGridSerializingSession {
    private styleIds:string[];

    constructor (
        columnController: ColumnController,
        valueService: ValueService,
        gridOptionsWrapper: GridOptionsWrapper,
        processCellCallback:(params: ProcessCellForExportParams)=>string,
        processHeaderCallback:(params: ProcessHeaderForExportParams)=>string,
        private excelXmlFactory:ExcelXmlFactory,
        private excelStyles:ExcelStyle[],
        private styleLinker:(rowType: RowType, rowIndex:number, colIndex:number, value:string, column:Column, node:RowNode)=> string
    ){
        super(columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback);
        if (!excelStyles) {
            this.styleIds = [];
        }else{
            this.styleIds = excelStyles.map((it:ExcelStyle)=>{
                return it.id
            });
        }
    }
    private rows:ExcelRow[] = [];

    private cols:ExcelColumn[];
    public addCustomHeader(customHeader: string): void {
        throw new Error ("Custom header not supported for Excel serialization");
    }

    public addCustomFooter(customFooter: string): void {
        throw new Error ("Custom footer not supported for Excel serialization");
    }

    public prepare(columnsToExport: Column[]): void {
        this.cols = Utils.map(columnsToExport, (it: Column)=>{
            it.getColDef().cellStyle
            return {
                width: it.getColDef().width
            }
        });
    }

    onNewHeaderGroupingRow(): RowSpanningAccumulator {
        var currentCells:ExcelCell[] = [];
        let that = this;
        this.rows.push({
            cells:currentCells
        });
        return {
             onColumn: (header: string, index: number, span:number)=>{
                 var styleId:string = that.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, null, null);
                 currentCells.push(that.createMergedCell(styleId, ExcelDataType.String, header, span));
             }
        };
    }

    public onNewHeaderRow(): RowAccumulator {
        return this.onNewRow (this.onNewHeaderColumn);
    }

    public onNewBodyRow(): RowAccumulator {
        return this.onNewRow (this.onNewBodyColumn);
    }

    onNewRow(onNewColumnAccumulator:(rowIndex:number, currentCells:ExcelCell[])=> (column: Column, index: number, node?:RowNode)=>void ):RowAccumulator{
        var currentCells:ExcelCell[] = [];
        this.rows.push({
            cells:currentCells
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        }
    }

    onNewHeaderColumn (rowIndex:number, currentCells:ExcelCell[]): (column: Column, index: number, node?:RowNode)=>void {
        let that = this;
        return (column: Column, index: number, node?:RowNode) => {
            let nameForCol = this.extractHeaderValue(column);
            var styleId:string = that.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, null);
            currentCells.push(this.createCell(styleId, ExcelDataType.String, nameForCol))
        }
    }

    public parse(): string {
        let data: ExcelWorksheet [] = [{
            name: "ag-grid",
            table: {
                columns: this.cols,
                rows: this.rows
            }
        }];
        return this.excelXmlFactory.createExcelXml(this.excelStyles, data)
    }

    onNewBodyColumn (rowIndex:number, currentCells:ExcelCell[]): (column: Column, index: number, node?:RowNode)=>void {
        var that = this;
        return (column: Column, index: number, node?:RowNode) => {
            var valueForCell = this.extractRowCellValue(column, index, node);
            var styleId:string = that.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
            let type: ExcelDataType = Utils.isNumeric(valueForCell) ? ExcelDataType.Number : ExcelDataType.String;
            currentCells.push(that.createCell(styleId, type, valueForCell))}
    }

    private styleExists (styleId:string):boolean{
        if (styleId == null) return false;

        return this.styleIds.indexOf(styleId) > -1
    }


    private createCell(styleId: string, type: ExcelDataType, value: string) :ExcelCell{
        return {
            styleId: this.styleExists(styleId) ? styleId : null,
            data: {
                type: type,
                value: value
            }
        };
    }

    private createMergedCell(styleId: string, type: ExcelDataType, value: string, numOfCells: number) :ExcelCell{
        return {
            styleId: this.styleExists(styleId) ? styleId : null,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }
}

@Bean('excelCreator')
export class ExcelCreator implements IExcelCreator{
    @Autowired('excelXmlFactory') private excelXmlFactory: ExcelXmlFactory;
    @Autowired('downloader') private downloader: Downloader;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('gridSerializer') private gridSerializer: GridSerializer;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('stylingService') private stylingService: StylingService;

    public exportDataAsExcel(params?: CsvExportParams): void {
        let fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        let fileName = fileNamePresent ? params.fileName : 'export.xls';

        if (fileName.indexOf(".") === -1){
            fileName = fileName + '.xls';
        }

        let content = this.getDataAsExcelXml(params);
        this.downloader.download(
            fileName,
            content,
            "text/xml"
        );
    }

    public getDataAsExcelXml(params?: CsvExportParams): string{
        return this.gridSerializer.serialize(
            new ExcelGridSerializingSession(
                this.columnController,
                this.valueService,
                this.gridOptionsWrapper,
                params.processCellCallback,
                params.processHeaderCallback,
                this.excelXmlFactory,
                this.gridOptions.excelStyles,
                this.styleLinker.bind(this)
            ),
            params
        );
    }

    private styleLinker (rowType: RowType, rowIndex:number, colIndex:number, value:string, column:Column, node:RowNode): string{
        if ((rowType === RowType.HEADER) || (rowType === RowType.HEADER_GROUPING)) return "header";
        if (!this.gridOptions.excelStyles || this.gridOptions.excelStyles.length === 0) return null;

        var applicableStyles:string [] = [];
        this.stylingService.processCellClassRules(
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
            (className:string)=>{
                applicableStyles.push(className);
            }
        );

        var lastStyle:string = null;
        this.gridOptions.excelStyles.forEach((it:ExcelStyle)=>{
            if (applicableStyles.indexOf(it.name) > -1){
                lastStyle = it.name;
            }
        });

        return lastStyle;
    }


}

