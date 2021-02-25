import {
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnController,
    ColumnGroup,
    ColumnGroupChild,
    Constants,
    DisplayedGroupCreator,
    ExportParams,
    GroupInstanceIdCreator,
    IClientSideRowModel,
    IRowModel,
    PinnedRowModel,
    ProcessGroupHeaderForExportParams,
    RowNode,
    SelectionController,
    ShouldRowBeSkippedParams,
    _
} from "@ag-grid-community/core";
import { GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "./interfaces";

@Bean("gridSerializer")
export class GridSerializer extends BeanStub {

    @Autowired('displayedGroupCreator') private displayedGroupCreator: DisplayedGroupCreator;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('selectionController') private selectionController: SelectionController;

    public serialize<T>(gridSerializingSession: GridSerializingSession<T>, params: ExportParams<T> = {}): string {

        const rowSkipper: (params: ShouldRowBeSkippedParams) => boolean = params.shouldRowBeSkipped || (() => false);
        const gridOptionsWrapper = this.gridOptionsWrapper;
        const api = gridOptionsWrapper.getApi()!;
        const columnApi = gridOptionsWrapper.getColumnApi()!;
        const skipSingleChildrenGroup = gridOptionsWrapper.isGroupRemoveSingleChildren();
        const skipLowestSingleChildrenGroup = gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        const hideOpenParents = gridOptionsWrapper.isGroupHideOpenParents();
        const context = gridOptionsWrapper.getContext();

        // when in pivot mode, we always render cols on screen, never 'all columns'
        const isPivotMode = this.columnController.isPivotMode();
        const rowModelNormal = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;

        const onlySelectedNonStandardModel = !rowModelNormal && params.onlySelected;

        let columnsToExport: Column[] = [];

        if (_.existsAndNotEmpty(params.columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(params.columnKeys!);
        } else if (params.allColumns && !isPivotMode) {
            // add auto group column for tree data
            columnsToExport = gridOptionsWrapper.isTreeData() ?
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
        const rowModel = this.rowModel;
        const clientSideRowModel = this.rowModel as IClientSideRowModel;

        if (isPivotMode) {
            // @ts-ignore - ignore tautology below as we are using it to check if it's clientSideRowModel
            if (clientSideRowModel.forEachPivotNode) {
                clientSideRowModel.forEachPivotNode(processRow);
            } else {
                // n=must be enterprise, so we can just loop through all the nodes
                rowModel.forEachNode(processRow);
            }
        } else {
            // onlySelectedAllPages: user doing pagination and wants selected items from
            // other pages, so cannot use the standard row model as it won't have rows from
            // other pages.
            // onlySelectedNonStandardModel: if user wants selected in non standard row model
            // (eg viewport) then again RowModel cannot be used, so need to use selected instead.
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
                    clientSideRowModel.forEachNodeAfterFilterAndSort(processRow);
                } else {
                    rowModel.forEachNode(processRow);
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

            if (node.group && (params.skipGroups || shouldSkipCurrentGroup || hideOpenParents)) {
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
                const content = params.getCustomContentBelowRow({node, api, columnApi, context});
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
            columnGroup.getChildren()!.forEach(it => directChildrenHeaderGroups.push(it));
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
                name = this.columnController.getDisplayNameForColumnGroup(columnGroup, 'header')!;
            }

            gridRowIterator.onColumn(name || '', columnIndex++, columnGroup.getLeafColumns().length - 1);
        });
    }
}

type ProcessGroupHeaderCallback = (params: ProcessGroupHeaderForExportParams) => string;

export enum RowType {
    HEADER_GROUPING, HEADER, BODY
}
