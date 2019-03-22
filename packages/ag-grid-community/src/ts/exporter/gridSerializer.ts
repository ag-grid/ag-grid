import { Column } from "../entities/column";
import { Autowired, Bean } from "../context/context";
import { ColumnController } from "../columnController/columnController";
import { Constants } from "../constants";
import { IRowModel } from "../interfaces/iRowModel";
import { RowNode } from "../entities/rowNode";
import { SelectionController } from "../selectionController";
import { ValueService } from "../valueService/valueService";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import {
    ExportParams,
    ProcessCellForExportParams,
    ProcessHeaderForExportParams,
    ShouldRowBeSkippedParams
} from "./exportParams";
import { DisplayedGroupCreator } from "../columnController/displayedGroupCreator";
import { ColumnFactory } from "../columnController/columnFactory";
import { GroupInstanceIdCreator } from "../columnController/groupInstanceIdCreator";
import { ColumnGroupChild } from "../entities/columnGroupChild";
import { ColumnGroup } from "../entities/columnGroup";
import { GridApi } from "../gridApi";
import { ClientSideRowModel } from "../rowModels/clientSide/clientSideRowModel";
import { PinnedRowModel } from "../rowModels/pinnedRowModel";
import { _ } from "../utils";

/**
 * This interface works in conjunction with the GridSerializer. When serializing a grid, an instance that implements this interface
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

export interface GridSerializingSession<T> {
    /**
     * INITIAL METHOD
     */
    prepare(columnsToExport: Column[]) : void;

    /**
     * ROW METHODS
     */
    addCustomHeader(customHeader: T): void;

    onNewHeaderGroupingRow():RowSpanningAccumulator;

    onNewHeaderRow(): RowAccumulator;

    onNewBodyRow(): RowAccumulator;

    addCustomFooter(customFooter: T): void;

    /**
     * FINAL RESULT
     */
    parse(): string;
}

export interface RowAccumulator {
    onColumn(column: Column, index: number, node?:RowNode):void;
}

export interface RowSpanningAccumulator {
    onColumn(header: string, index: number, span:number):void;
}

export interface GridSerializingParams {
    columnController: ColumnController;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    cellAndHeaderEscaper?: (rawValue:string) => string;
}

export abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    public columnController: ColumnController;
    public valueService:ValueService;
    public gridOptionsWrapper:GridOptionsWrapper;
    public processCellCallback?:(params: ProcessCellForExportParams) => string;
    public processHeaderCallback?:(params: ProcessHeaderForExportParams) => string;
    public cellAndHeaderEscaper?:(rawValue:string) => string;

    constructor(config: GridSerializingParams) {
        const {columnController, valueService, gridOptionsWrapper, processCellCallback,
            processHeaderCallback, cellAndHeaderEscaper} = config;

        this.columnController = columnController;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.cellAndHeaderEscaper = cellAndHeaderEscaper;
    }

    abstract prepare(columnsToExport: Column[]) : void;

    abstract addCustomHeader(customHeader: T): void;

    abstract addCustomFooter(customFooter: T): void;

    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;

    abstract onNewHeaderRow(): RowAccumulator;

    abstract onNewBodyRow(): RowAccumulator;

    abstract parse(): string;

    public extractHeaderValue(column: Column): string {
        let nameForCol = this.getHeaderName(this.processHeaderCallback, column);
            if (nameForCol === null || nameForCol === undefined) {
                nameForCol = '';
            }
        return this.cellAndHeaderEscaper ? this.cellAndHeaderEscaper(nameForCol) : nameForCol;
    }

    public extractRowCellValue(column: Column, index: number, type: string, node: RowNode) {
        const isRowGrouping = this.columnController.getRowGroupColumns().length > 0;

        let valueForCell: any;
        if (node && node.group && isRowGrouping && index === 0) {
            valueForCell =  this.createValueForGroupNode(node);
        } else {
            valueForCell =  this.valueService.getValue(column, node);
        }
        valueForCell = this.processCell(node, column, valueForCell, this.processCellCallback, type);
        if (valueForCell === null || valueForCell === undefined) {
            valueForCell = '';
        }

        return this.cellAndHeaderEscaper ? this.cellAndHeaderEscaper(valueForCell) : valueForCell;
    }

    private getHeaderName(callback: ((params: ProcessHeaderForExportParams) => string) | undefined, column: Column): string | null {
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
        const keys = [node.key];
        while (node.parent) {
            node = node.parent;
            keys.push(node.key);
        }
        return keys.reverse().join(' -> ');
    }

    private processCell(rowNode: RowNode, column: Column, value: any, processCellCallback: ((params: ProcessCellForExportParams) => string) | undefined, type: string): any {
        if (processCellCallback) {
            return processCellCallback({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                type: type
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
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('columnFactory') private columnFactory: ColumnFactory;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public serialize<T>(gridSerializingSession: GridSerializingSession<T>, params?: ExportParams<T>): string {

        const dontSkipRows = (): boolean => false;

        const skipGroups = params && params.skipGroups;
        const skipHeader = params && params.skipHeader;
        const columnGroups = params && params.columnGroups;
        const skipFooters = params && params.skipFooters;
        const skipPinnedTop = params && params.skipPinnedTop;
        const skipPinnedBottom = params && params.skipPinnedBottom;
        const includeCustomHeader = params && params.customHeader;
        const includeCustomFooter = params && params.customFooter;
        const allColumns = params && params.allColumns;
        const onlySelected = params && params.onlySelected;
        const columnKeys = params && params.columnKeys;
        const onlySelectedAllPages = params && params.onlySelectedAllPages;
        const rowSkipper:(params: ShouldRowBeSkippedParams) => boolean = (params && params.shouldRowBeSkipped) || dontSkipRows;
        const api:GridApi = this.gridOptionsWrapper.getApi() as GridApi;
        const skipSingleChildrenGroup = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        const skipLowestSingleChildrenGroup = this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        const context:any = this.gridOptionsWrapper.getContext();

        // when in pivot mode, we always render cols on screen, never 'all columns'
        const isPivotMode = this.columnController.isPivotMode();
        const rowModelNormal = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;

        const onlySelectedNonStandardModel = !rowModelNormal && onlySelected;

        let columnsToExport: Column[] = [];

        if (_.existsAndNotEmpty(columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(columnKeys!);
        } else if (allColumns && !isPivotMode) {
            // add auto group column for tree data
            columnsToExport = this.gridOptionsWrapper.isTreeData() ?
                this.columnController.getGridColumns([Constants.GROUP_AUTO_COLUMN_ID]) : [];

            columnsToExport = columnsToExport.concat(this.columnController.getAllPrimaryColumns() || []);

        } else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }

        if (includeCustomHeader) {
            gridSerializingSession.addCustomHeader(includeCustomHeader);
        }

        gridSerializingSession.prepare(columnsToExport);

        // first pass, put in the header names of the cols
        if (columnGroups) {
            const groupInstanceIdCreator: GroupInstanceIdCreator = new GroupInstanceIdCreator();
            const displayedGroups: ColumnGroupChild[] = this.displayedGroupCreator.createDisplayedGroups(
                columnsToExport,
                this.columnController.getGridBalancedTree(),
                groupInstanceIdCreator,
                null
            );
            this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession);
        }

        if (!skipHeader) {
            const gridRowIterator = gridSerializingSession.onNewHeaderRow();
            columnsToExport.forEach((column, index) => {
                gridRowIterator.onColumn(column, index, undefined);
            });
        }

        this.pinnedRowModel.forEachPinnedTopRow(processRow);

        if (isPivotMode) {
            if ((this.rowModel as any).forEachPivotNode) {
                (this.rowModel as ClientSideRowModel).forEachPivotNode(processRow);
            } else {
                //Must be enterprise, so we can just loop through all the nodes
                this.rowModel.forEachNode(processRow);
            }
        } else {
            // onlySelectedAllPages: user doing pagination and wants selected items from
            // other pages, so cannot use the standard row model as it won't have rows from
            // other pages.
            // onlySelectedNonStandardModel: if user wants selected in non standard row model
            // (eg viewport) then again rowmodel cannot be used, so need to use selected instead.
            if (onlySelectedAllPages || onlySelectedNonStandardModel) {
                const selectedNodes = this.selectionController.getSelectedNodes();
                selectedNodes.forEach((node:RowNode) => {
                    processRow(node);
                });
            } else {
                // here is everything else - including standard row model and selected. we don't use
                // the selection model even when just using selected, so that the result is the order
                // of the rows appearing on the screen.
                if (rowModelNormal) {
                    (this.rowModel as ClientSideRowModel).forEachNodeAfterFilterAndSort(processRow);
                } else {
                    this.rowModel.forEachNode(processRow);
                }
            }
        }

        this.pinnedRowModel.forEachPinnedBottomRow(processRow);

        if (includeCustomFooter) {
            gridSerializingSession.addCustomFooter(includeCustomFooter);
        }

        function processRow(node: RowNode): void {
            const shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
            const shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);

            if (node.group && (skipGroups || shouldSkipCurrentGroup)) {
                return;
            }
            if (skipFooters && node.footer) {
                return;
            }

            if (onlySelected && !node.isSelected()) {
                return;
            }

            if (skipPinnedTop && node.rowPinned === 'top') {
                return;
            }

            if (skipPinnedBottom && node.rowPinned === 'bottom') {
                return;
            }

            // if we are in pivotMode, then the grid will show the root node only
            // if it's not a leaf group
            const nodeIsRootNode = node.level === -1;
            if (nodeIsRootNode && !node.leafGroup) {
                return;
            }

            const shouldRowBeSkipped:boolean = rowSkipper({
                node: node,
                api: api,
                context: context
            });

            if (shouldRowBeSkipped) { return; }

            const rowAccumulator: RowAccumulator = gridSerializingSession.onNewBodyRow();
            columnsToExport.forEach((column: Column, index: number) => {
                rowAccumulator.onColumn(column, index, node);
            });
        }

        return gridSerializingSession.parse();
    }

    recursivelyAddHeaderGroups<T>(displayedGroups:ColumnGroupChild[], gridSerializingSession:GridSerializingSession<T>):void {
        const directChildrenHeaderGroups:ColumnGroupChild[] = [];
        displayedGroups.forEach((columnGroupChild: ColumnGroupChild) => {
            const columnGroup: ColumnGroup = columnGroupChild as ColumnGroup;
            if (!columnGroup.getChildren) { return; }
            columnGroup.getChildren().forEach(it => directChildrenHeaderGroups.push(it));
        });

        if (displayedGroups.length > 0 && displayedGroups[0] instanceof ColumnGroup) {
            this.doAddHeaderHeader(gridSerializingSession, displayedGroups);
        }

        if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
            this.recursivelyAddHeaderGroups(directChildrenHeaderGroups, gridSerializingSession);
        }
    }

    private doAddHeaderHeader<T>(gridSerializingSession: GridSerializingSession<T>, displayedGroups: ColumnGroupChild[]) {
        const gridRowIterator: RowSpanningAccumulator = gridSerializingSession.onNewHeaderGroupingRow();
        let columnIndex: number = 0;
        displayedGroups.forEach((columnGroupChild: ColumnGroupChild) => {
            const columnGroup: ColumnGroup = columnGroupChild as ColumnGroup;

            const columnName = this.columnController.getDisplayNameForColumnGroup(columnGroup, 'header');
            gridRowIterator.onColumn(columnName || '', columnIndex++, columnGroup.getLeafColumns().length - 1);
        });
    }
}

export enum RowType {
    HEADER_GROUPING, HEADER, BODY
}