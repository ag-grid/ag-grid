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
import {ExportParams} from 'ag-grid/main';
import {StylingService} from 'ag-grid/main';


export interface ExcelMixedStyle {
    key: string,
    excelID: string,
    result: ExcelStyle
}

export class ExcelGridSerializingSession extends BaseGridSerializingSession {
    private styleIds:string[];
    private mixedStyles:{[key:string]: ExcelMixedStyle} = {};
    private mixedStyleCounter:number = 0;
    private excelStyles: ExcelStyle[];

    constructor (
        columnController: ColumnController,
        valueService: ValueService,
        gridOptionsWrapper: GridOptionsWrapper,
        processCellCallback:(params: ProcessCellForExportParams)=>string,
        processHeaderCallback:(params: ProcessHeaderForExportParams)=>string,
        private excelXmlFactory:ExcelXmlFactory,
        baseExcelStyles:ExcelStyle[],
        private styleLinker:(rowType: RowType, rowIndex:number, colIndex:number, value:string, column:Column, node:RowNode)=> string[]
    ){
        super(columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback);
        if (!baseExcelStyles) {
            this.styleIds = [];
            this.excelStyles = [];
        }else{
            this.styleIds = baseExcelStyles.map((it:ExcelStyle)=>{
                return it.id
            });
            this.excelStyles = baseExcelStyles.slice();
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
            it.getColDef().cellStyle;
            return {
                width: it.getActualWidth()
            }
        });
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        let currentCells:ExcelCell[] = [];
        let that = this;
        this.rows.push({
            cells:currentCells
        });
        return {
             onColumn: (header: string, index: number, span:number)=>{
                 let styleIds:string[] = that.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, null, null);
                 currentCells.push(that.createMergedCell(styleIds.length > 0 ? styleIds[0] : null, ExcelDataType.String, header, span));
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
        let currentCells:ExcelCell[] = [];
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
            let styleIds:string[] = that.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, null);
            currentCells.push(this.createCell(styleIds.length > 0 ? styleIds[0] : null, ExcelDataType.String, nameForCol))
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
        let that = this;
        return (column: Column, index: number, node?:RowNode) => {
            let valueForCell = this.extractRowCellValue(column, index, node);
            let styleIds:string[] = that.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
            let excelStyleId: string = null;
            if (styleIds && styleIds.length == 1){
                excelStyleId = styleIds [0];
            } else if (styleIds && styleIds.length > 1){
                let key: string = styleIds.join("-");
                if (! this.mixedStyles[key]){
                    this.addNewMixedStyle (styleIds);
                }
                excelStyleId = this.mixedStyles[key].excelID;
            }
            let type: ExcelDataType = Utils.isNumeric(valueForCell) ? ExcelDataType.Number : ExcelDataType.String;
            currentCells.push(that.createCell(excelStyleId, type, valueForCell))}
    }

    addNewMixedStyle (styleIds:string[]):void{
        this.mixedStyleCounter += 1;
        let excelId = 'mixedStyle' + this.mixedStyleCounter;
        let resultantStyle: ExcelStyle = {};

        styleIds.forEach((styleId:string)=>{
            this.excelStyles.forEach((excelStyle:ExcelStyle)=>{
                if (excelStyle.id === styleId){
                    Utils.mergeDeep (resultantStyle, excelStyle);
                }
            });
        });

        resultantStyle['id'] = excelId;
        resultantStyle['name'] = excelId;
        let key: string = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle)
        this.styleIds.push(excelId);
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

    public exportDataAsExcel(params?: ExportParams): void {
        let fileNamePresent = params && params.fileName && params.fileName.length !== 0;
        let fileName = fileNamePresent ? params.fileName : 'export.xls';

        if (fileName.indexOf(".") === -1){
            fileName = fileName + '.xls';
        }

        let content = this.getDataAsExcelXml(params);
        this.downloader.download(
            fileName,
            content,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
    }

    public getDataAsExcelXml(params?: ExportParams): string{
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

    private styleLinker (rowType: RowType, rowIndex:number, colIndex:number, value:string, column:Column, node:RowNode): string[]{
        if ((rowType === RowType.HEADER) || (rowType === RowType.HEADER_GROUPING)) return ["header"];
        if (!this.gridOptions.excelStyles || this.gridOptions.excelStyles.length === 0) return null;

        let styleIds : string[] = this.gridOptions.excelStyles.map((it:ExcelStyle)=>{
            return it.id
        });

        let applicableStyles:string [] = [];
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
            (className:string)=>{
                if (styleIds.indexOf(className) > -1){
                    applicableStyles.push(className);
                }
            }
        );

        return applicableStyles.sort((left:string, right:string):number=>{
            return (styleIds.indexOf(left) < styleIds.indexOf(right)) ? -1: 1;
        });
    }


}

