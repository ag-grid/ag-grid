import {Column} from "./entities/column";
import {Bean, Autowired} from "./context/context";
import {ColumnController} from "./columnController/columnController";
import {Constants} from "./constants";
import {IRowModel} from "./interfaces/iRowModel";
import {IInMemoryRowModel} from "./interfaces/iInMemoryRowModel";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {ProcessCellForExportParams, ProcessHeaderForExportParams} from "./entities/gridOptions";
import {Utils as _} from "./utils";
import {RowNode} from "./entities/rowNode";
import {SelectionController} from "./selectionController";
import {ValueService} from "./valueService";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {CsvExportParams} from "./exportParams";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {GroupInstanceIdCreator} from "./columnController/groupInstanceIdCreator";
import {ColumnGroupChild} from "./entities/columnGroupChild";
import {ColumnGroup} from "./entities/columnGroup";

/**
 * This interface works in conjuction with the GridSerializer. When serializing a grid, an instance that implements this interface
 * must be passed in, the serializer will call back to the provided methods and finally call to parse to obtain the final result
 * of the serialization.
 *
 * The lifecycle of a serializer with a GridSerializingSession is as follows.
 *
 * --1 Call to prepare method. An opportunity to do any required work before the call to accumulate data for the rows are about to happen.
 * --2 Call to the row methods as the serializer loops through the different rows of the grid will call these methods so that the data
 * can be accumulated. The methods. if there is relevant data will be called in the following order:
 *      a) addCustomHeader
 *      b) onNewHeaderGroupingRow
 *      c) onNewHeader
 *      d) onNewBodyRow
 *      e) addCustomFooter
 *      IF ANY OF THIS METHODS RETURN A ROW ACCUMULATOR, YOU CAN EXPECT THE SERIALIZER TO CALL ON THAT ACCUMULATOR WITH THE DATA FOR THAT ROW
 *      IMMEDIATELY AFTER IT HAS RECEIVED THE OBJECT AND BEFORE IT CALLS YOU TO OBTAIN A NEW ROW ACCUMULATOR
 * --3 Call to parse method. This method is the last one to be called and is expected to return whatever accumulated
 * parsed string is to be returned as a result of the serialization
 *
 * This interface is closely related to the RowAccumulator and RowSpanningAccumulator interfaces as every time a new row is about
 * to be created a new instances of RowAccumulator or RowSpanningAccumulator need to be provided.

 */

export interface GridSerializingSession {
    /**
     * INITIAL METHOD
     */
    prepare(columnsToExport: Column[]) : void;


    /**
     * ROW METHODS
     */
    addCustomHeader(customHeader: string): void;

    onNewHeaderGroupingRow ():RowSpanningAccumulator;

    onNewHeaderRow (): RowAccumulator;

    onNewBodyRow (): RowAccumulator;

    addCustomFooter(customFooter: string): void;

    /**
     * FINAL RESULT
     */
    parse (): string;
}

export interface RowAccumulator {
    onColumn(column: Column, index: number, node?:RowNode):void;
}

export interface RowSpanningAccumulator {
    onColumn(header: string, index: number, span:number):void;
}

export abstract class BaseGridSerializingSession implements GridSerializingSession{
    constructor(
        public columnController:ColumnController,
        public valueService:ValueService,
        public gridOptionsWrapper:GridOptionsWrapper,
        public processCellCallback?:(params: ProcessCellForExportParams)=>string,
        public processHeaderCallback?:(params: ProcessHeaderForExportParams)=>string,
        public cellAndHeaderEscaper?:(rawValue:string)=>string
    ){}

    abstract prepare(columnsToExport: Column[]) : void;

    abstract addCustomHeader(customHeader: string): void;

    abstract addCustomFooter(customFooter: string): void;

    abstract onNewHeaderGroupingRow (): RowSpanningAccumulator;

    abstract onNewHeaderRow (): RowAccumulator;

    abstract onNewBodyRow (): RowAccumulator;

    abstract parse (): string;

    public extractHeaderValue(column: Column): string {
        var nameForCol = this.getHeaderName(this.processHeaderCallback, column);
            if (nameForCol === null || nameForCol === undefined) {
                nameForCol = '';
            }
        return this.cellAndHeaderEscaper? this.cellAndHeaderEscaper(nameForCol) : nameForCol;
    }

    public extractRowCellValue (column: Column, index: number, node?:RowNode){
        var isRowGrouping = this.columnController.getRowGroupColumns().length > 0;

        var valueForCell: any;
        if (node.group && isRowGrouping && index === 0) {
            valueForCell =  this.createValueForGroupNode(node);
        } else {
            valueForCell =  this.valueService.getValue(column, node);
        }
        valueForCell = this.processCell(node, column, valueForCell, this.processCellCallback);
        if (valueForCell === null || valueForCell === undefined) {
            valueForCell = '';
        }

        return this.cellAndHeaderEscaper? this.cellAndHeaderEscaper(valueForCell) : valueForCell;
    }

    private getHeaderName(callback: (params: ProcessHeaderForExportParams)=>string, column: Column): string {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        } else {
            return this.columnController.getDisplayNameForColumn(column, 'csv', true);
        }
    }


    private createValueForGroupNode(node: RowNode): string {
        var keys = [node.key];
        while (node.parent) {
            node = node.parent;
            keys.push(node.key);
        }
        return keys.reverse().join(' -> ');
    }

    private processCell(rowNode: RowNode, column: Column, value: any, processCellCallback:(params: ProcessCellForExportParams)=>string): any {
        if (processCellCallback) {
            return processCellCallback({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        } else {
            return value;
        }
    }


}

@Bean("gridSerializer")
export class GridSerializer {
    @Autowired('displayedGroupCreator') private displayedGroupCreator: DisplayedGroupCreator;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('floatingRowModel') private floatingRowModel: FloatingRowModel;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('balancedColumnTreeBuilder') private balancedColumnTreeBuilder: BalancedColumnTreeBuilder;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public serialize(gridSerializingSession: GridSerializingSession, params?: CsvExportParams): string {
        var skipGroups = params && params.skipGroups;
        var skipHeader = params && params.skipHeader;
        var columnGroups = params && params.columnGroups;
        var skipFooters = params && params.skipFooters;
        var skipFloatingTop = params && params.skipFloatingTop;
        var skipFloatingBottom = params && params.skipFloatingBottom;
        var includeCustomHeader = params && params.customHeader;
        var includeCustomFooter = params && params.customFooter;
        var allColumns = params && params.allColumns;
        var onlySelected = params && params.onlySelected;
        var columnKeys = params && params.columnKeys;
        var onlySelectedAllPages = params && params.onlySelectedAllPages;

        // when in pivot mode, we always render cols on screen, never 'all columns'
        var isPivotMode = this.columnController.isPivotMode();
        var rowModelNormal = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_NORMAL;

        var onlySelectedNonStandardModel = !rowModelNormal && onlySelected;

        // we can only export if it's a normal row model - unless we are exporting
        // selected only, as this way we don't use the selected nodes rather than
        // the row model to get the rows
        if (!rowModelNormal && !onlySelected) {
            console.log('ag-Grid: getDataAsCsv is only available for standard row model');
            return '';
        }

        var inMemoryRowModel = <IInMemoryRowModel> this.rowModel;

        var columnsToExport: Column[];
        if (_.existsAndNotEmpty(columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(columnKeys);
        } else if (allColumns && !isPivotMode) {
            columnsToExport = this.columnController.getAllPrimaryColumns();
        } else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }

        if (!columnsToExport || columnsToExport.length === 0) {
            return '';
        }

        gridSerializingSession.prepare(columnsToExport);

        if (includeCustomHeader) {
            gridSerializingSession.addCustomHeader (params.customHeader);
        }

        // first pass, put in the header names of the cols
        if (!skipHeader || columnGroups) {
            let groupInstanceIdCreator: GroupInstanceIdCreator = new GroupInstanceIdCreator();
            let displayedGroups: ColumnGroupChild[] = this.displayedGroupCreator.createDisplayedGroups (
                columnsToExport,
                this.columnController.getGridBalancedTree(),
                groupInstanceIdCreator
            );
            if (columnGroups && displayedGroups.length > 0 && displayedGroups[0] instanceof ColumnGroup) {
                let gridRowIterator : RowSpanningAccumulator = gridSerializingSession.onNewHeaderGroupingRow();
                let columnIndex :number = 0;
                displayedGroups.forEach((it:ColumnGroupChild)=>{
                    let casted:ColumnGroup = it as ColumnGroup;
                    gridRowIterator.onColumn(casted.getDefinition().headerName, columnIndex ++, casted.getChildren().length - 1);
                });
            }

            if (!skipHeader){
                let gridRowIterator = gridSerializingSession.onNewHeaderRow();
                columnsToExport.forEach((column, index)=>{
                    gridRowIterator.onColumn (column, index, null)
                });
            }
        }

        this.floatingRowModel.forEachFloatingTopRow(processRow);

        if (isPivotMode) {
            inMemoryRowModel.forEachPivotNode(processRow);
        } else {
            // onlySelectedAllPages: user doing pagination and wants selected items from
            // other pages, so cannot use the standard row model as it won't have rows from
            // other pages.
            // onlySelectedNonStandardModel: if user wants selected in non standard row model
            // (eg viewport) then again rowmodel cannot be used, so need to use selected instead.
            if (onlySelectedAllPages || onlySelectedNonStandardModel) {
                var selectedNodes = this.selectionController.getSelectedNodes();
                selectedNodes.forEach((node:RowNode)=>{
                    processRow(node)
                });
            } else {
                // here is everything else - including standard row model and selected. we don't use
                // the selection model even when just using selected, so that the result is the order
                // of the rows appearing on the screen.
                inMemoryRowModel.forEachNodeAfterFilterAndSort(processRow);
            }
        }

        this.floatingRowModel.forEachFloatingBottomRow(processRow);

        if (includeCustomFooter) {
            gridSerializingSession.addCustomFooter (params.customFooter);
        }

        function processRow(node: RowNode): void {
            if (skipGroups && node.group) {
                return;
            }

            if (skipFooters && node.footer) {
                return;
            }

            if (onlySelected && !node.isSelected()) {
                return;
            }

            if (skipFloatingTop && node.floating === 'top') {
                return;
            }

            if (skipFloatingBottom && node.floating === 'bottom') {
                return;
            }

            // if we are in pivotMode, then the grid will show the root node only
            // if it's not a leaf group
            var nodeIsRootNode = node.level === -1;
            if (nodeIsRootNode && !node.leafGroup) {
                return;
            }

            var rowAccumulator: RowAccumulator = gridSerializingSession.onNewBodyRow();
            columnsToExport.forEach((column: Column, index: number) => {
                rowAccumulator.onColumn(column, index, node);
            });
        }

        return gridSerializingSession.parse();
    }

}

export enum RowType {
    HEADER_GROUPING, HEADER, BODY
}