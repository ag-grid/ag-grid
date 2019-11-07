import {
    _,
    Autowired,
    Bean,
    Column,
    ColumnController,
    ColumnFactory,
    ColumnGroup,
    ColumnGroupChild,
    Constants,
    DisplayedGroupCreator,
    ExportParams,
    GridApi,
    GridOptionsWrapper,
    GroupInstanceIdCreator,
    IClientSideRowModel,
    IRowModel,
    PinnedRowModel,
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessRowGroupForExportParams,
    ProcessHeaderForExportParams,
    RowNode,
    SelectionController,
    ShouldRowBeSkippedParams,
    ValueService
} from "@ag-community/grid-core";

/**
 * This interface works in conjunction with the GridSerializer. When serializing a grid, an instance that implements this interface
 * must be passed in, the serializer will call back to the provided methods and finally call to parse to obtain the final result
 * of the serialization.
 */

export interface GridSerializingSession<T> {
    prepare(columnsToExport: Column[]): void;

    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    
    onNewHeaderRow(): RowAccumulator;
    
    onNewBodyRow(): RowAccumulator;

    addCustomContent(customContent: T): void;

    /**
     * FINAL RESULT
     */
    parse(): string;
}

export interface RowAccumulator {
    onColumn(column: Column, index: number, node?: RowNode): void;
}

export interface RowSpanningAccumulator {
    onColumn(header: string, index: number, span: number): void;
}

export interface GridSerializingParams {
    columnController: ColumnController;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
}

export abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    public columnController: ColumnController;
    public valueService: ValueService;
    public gridOptionsWrapper: GridOptionsWrapper;
    public processCellCallback?: (params: ProcessCellForExportParams) => string;
    public processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    public processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    public processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;

    private firstGroupColumn?: Column;

    constructor(config: GridSerializingParams) {
        const {
            columnController, valueService, gridOptionsWrapper, processCellCallback,
            processHeaderCallback, processGroupHeaderCallback,
            processRowGroupCallback
        } = config;

        this.columnController = columnController;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
    }

    public prepare(columnsToExport: Column[]): void {
        this.firstGroupColumn = columnsToExport.find(col => col.getColDef().showRowGroup);
    }

    abstract addCustomContent(customContent: T): void;

    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;

    abstract onNewHeaderRow(): RowAccumulator;

    abstract onNewBodyRow(): RowAccumulator;

    abstract parse(): string;

    public extractHeaderValue(column: Column): string {
        return this.getHeaderName(this.processHeaderCallback, column) || '';
    }

    public extractRowCellValue(column: Column, index: number, type: string, node: RowNode) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        const renderGroupSummaryCell =
            // on group rows
            node && node.group
            && (
                // in the first group column if groups appear in regular grid cells
                column === this.firstGroupColumn
                // or the first cell in the row, if we're doing full width rows
                || (index === 0 && this.gridOptionsWrapper.isGroupUseEntireRow(this.columnController.isPivotMode()))
            );

        let valueForCell: any;
        if (renderGroupSummaryCell) {
            valueForCell = this.createValueForGroupNode(node);
        } else {
            valueForCell = this.valueService.getValue(column, node);
        }
        return this.processCell(node, column, valueForCell, this.processCellCallback, type) || '';
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
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
            });
        }
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

    public serialize<T>(gridSerializingSession: GridSerializingSession<T>, params: ExportParams<T> = {}): string {

        const rowSkipper: (params: ShouldRowBeSkippedParams) => boolean = params.shouldRowBeSkipped || (() => false);
        const api = this.gridOptionsWrapper.getApi();
        const columnApi = this.gridOptionsWrapper.getColumnApi();
        const skipSingleChildrenGroup = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        const skipLowestSingleChildrenGroup = this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        const context = this.gridOptionsWrapper.getContext();

        // when in pivot mode, we always render cols on screen, never 'all columns'
        const isPivotMode = this.columnController.isPivotMode();
        const rowModelNormal = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;

        const onlySelectedNonStandardModel = !rowModelNormal && params.onlySelected;

        let columnsToExport: Column[] = [];

        if (_.existsAndNotEmpty(params.columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(params.columnKeys!);
        } else if (params.allColumns && !isPivotMode) {
            // add auto group column for tree data
            columnsToExport = this.gridOptionsWrapper.isTreeData() ?
                this.columnController.getGridColumns([Constants.GROUP_AUTO_COLUMN_ID]) : [];

            columnsToExport = columnsToExport.concat(this.columnController.getAllPrimaryColumns() || []);

        } else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }

        if (params.customHeader) {
            gridSerializingSession.addCustomContent(params.customHeader);
        }

        gridSerializingSession.prepare(columnsToExport);

        // first pass, put in the header names of the cols
        if (params.columnGroups) {
            const groupInstanceIdCreator: GroupInstanceIdCreator = new GroupInstanceIdCreator();
            const displayedGroups: ColumnGroupChild[] = this.displayedGroupCreator.createDisplayedGroups(
                columnsToExport,
                this.columnController.getGridBalancedTree(),
                groupInstanceIdCreator,
                null
            );
            this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, params.processGroupHeaderCallback);
        }

        if (!params.skipHeader) {
            const gridRowIterator = gridSerializingSession.onNewHeaderRow();
            columnsToExport.forEach((column, index) => {
                gridRowIterator.onColumn(column, index, undefined);
            });
        }

        this.pinnedRowModel.forEachPinnedTopRow(processRow);

        if (isPivotMode) {
            if ((this.rowModel as IClientSideRowModel).forEachPivotNode) {
                (this.rowModel as IClientSideRowModel).forEachPivotNode(processRow);
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
            if (params.onlySelectedAllPages || onlySelectedNonStandardModel) {
                const selectedNodes = this.selectionController.getSelectedNodes();
                selectedNodes.forEach((node: RowNode) => {
                    processRow(node);
                });
            } else {
                // here is everything else - including standard row model and selected. we don't use
                // the selection model even when just using selected, so that the result is the order
                // of the rows appearing on the screen.
                if (rowModelNormal) {
                    (this.rowModel as IClientSideRowModel).forEachNodeAfterFilterAndSort(processRow);
                } else {
                    this.rowModel.forEachNode(processRow);
                }
            }
        }

        this.pinnedRowModel.forEachPinnedBottomRow(processRow);

        if (params.customFooter) {
            gridSerializingSession.addCustomContent(params.customFooter);
        }

        function processRow(node: RowNode): void {
            const shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
            const shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);

            if (node.group && (params.skipGroups || shouldSkipCurrentGroup)) {
                return;
            }
            if (params.skipFooters && node.footer) {
                return;
            }

            if (params.onlySelected && !node.isSelected()) {
                return;
            }

            if (params.skipPinnedTop && node.rowPinned === 'top') {
                return;
            }

            if (params.skipPinnedBottom && node.rowPinned === 'bottom') {
                return;
            }

            // if we are in pivotMode, then the grid will show the root node only
            // if it's not a leaf group
            const nodeIsRootNode = node.level === -1;
            if (nodeIsRootNode && !node.leafGroup) {
                return;
            }

            const shouldRowBeSkipped: boolean = rowSkipper({node, api, context});

            if (shouldRowBeSkipped) {
                return;
            }

            const rowAccumulator: RowAccumulator = gridSerializingSession.onNewBodyRow();
            columnsToExport.forEach((column: Column, index: number) => {
                rowAccumulator.onColumn(column, index, node);
            });

            if (params.getCustomContentBelowRow) {
                const content = params.getCustomContentBelowRow({node, api, columnApi, context})
                if (content) {
                    gridSerializingSession.addCustomContent(content);
                }
            }
        }

        return gridSerializingSession.parse();
    }

    recursivelyAddHeaderGroups<T>(displayedGroups: ColumnGroupChild[], gridSerializingSession: GridSerializingSession<T>, processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined): void {
        const directChildrenHeaderGroups: ColumnGroupChild[] = [];
        displayedGroups.forEach((columnGroupChild: ColumnGroupChild) => {
            const columnGroup: ColumnGroup = columnGroupChild as ColumnGroup;
            if (!columnGroup.getChildren) {
                return;
            }
            columnGroup.getChildren().forEach(it => directChildrenHeaderGroups.push(it));
        });

        if (displayedGroups.length > 0 && displayedGroups[0] instanceof ColumnGroup) {
            this.doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback);
        }

        if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
            this.recursivelyAddHeaderGroups(directChildrenHeaderGroups, gridSerializingSession, processGroupHeaderCallback);
        }
    }

    private doAddHeaderHeader<T>(gridSerializingSession: GridSerializingSession<T>, displayedGroups: ColumnGroupChild[], processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined) {

        const gridRowIterator: RowSpanningAccumulator = gridSerializingSession.onNewHeaderGroupingRow();
        let columnIndex: number = 0;
        displayedGroups.forEach((columnGroupChild: ColumnGroupChild) => {
            const columnGroup: ColumnGroup = columnGroupChild as ColumnGroup;

            let name: string;
            if (processGroupHeaderCallback) {
                name = processGroupHeaderCallback({
                    columnGroup: columnGroup,
                    api: this.gridOptionsWrapper.getApi(),
                    columnApi: this.gridOptionsWrapper.getColumnApi(),
                    context: this.gridOptionsWrapper.getContext()
                });
            } else {
                name = this.columnController.getDisplayNameForColumnGroup(columnGroup, 'header');
            }

            gridRowIterator.onColumn(name || '', columnIndex++, columnGroup.getLeafColumns().length - 1);
        });
    }
}

type ProcessGroupHeaderCallback = (params: ProcessGroupHeaderForExportParams) => string;

export enum RowType {
    HEADER_GROUPING, HEADER, BODY
}
