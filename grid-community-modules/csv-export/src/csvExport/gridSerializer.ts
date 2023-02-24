import {
    _,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnModel,
    ColumnGroup,
    IHeaderColumn,
    GROUP_AUTO_COLUMN_ID,
    DisplayedGroupCreator,
    ExportParams,
    GroupInstanceIdCreator,
    IClientSideRowModel,
    IRowModel,
    IServerSideRowModel,
    PinnedRowModel,
    ProcessGroupHeaderForExportParams,
    RowNode,
    SelectionService,
    ShouldRowBeSkippedParams,
    RowPositionUtils,
    SortedRowNode,
    RowNodeSorter,
    SortController
} from "@ag-grid-community/core";
import { GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "./interfaces";

type ProcessGroupHeaderCallback = (params: ProcessGroupHeaderForExportParams) => string;

export enum RowType { HEADER_GROUPING, HEADER, BODY }

@Bean("gridSerializer")
export class GridSerializer extends BeanStub {

    @Autowired('displayedGroupCreator') private displayedGroupCreator: DisplayedGroupCreator;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('selectionService') private selectionService: SelectionService;
    @Autowired('rowPositionUtils') private rowPositionUtils: RowPositionUtils;
    @Autowired('rowNodeSorter') private rowNodeSorter: RowNodeSorter;
    @Autowired('sortController') private sortController: SortController;

    public serialize<T>(gridSerializingSession: GridSerializingSession<T>, params: ExportParams<T> = {}): string {
        const columnsToExport = this.getColumnsToExport(params.allColumns, params.columnKeys);

        const serializeChain = _.compose(
            // first pass, put in the header names of the cols
            this.prepareSession(columnsToExport),
            this.prependContent(params),
            this.exportColumnGroups(params, columnsToExport),
            this.exportHeaders(params, columnsToExport),
            this.processPinnedTopRows(params, columnsToExport),
            this.processRows(params, columnsToExport),
            this.processPinnedBottomRows(params, columnsToExport),
            this.appendContent(params)
        );

        return serializeChain(gridSerializingSession).parse();
    }

    private processRow<T>(gridSerializingSession: GridSerializingSession<T>, params: ExportParams<T>, columnsToExport: Column[], node: RowNode): void {
        const rowSkipper: (params: ShouldRowBeSkippedParams) => boolean = params.shouldRowBeSkipped || (() => false);
        const context = this.gridOptionsService.context;
        const api = this.gridOptionsService.api;
        const columnApi = this.gridOptionsService.columnApi;
        const skipSingleChildrenGroup = this.gridOptionsService.is('groupRemoveSingleChildren');
        const skipLowestSingleChildrenGroup = this.gridOptionsService.is('groupRemoveLowestSingleChildren');
        // if onlySelected, we ignore groupHideOpenParents as the user has explicitly selected the rows they wish to export.
        // similarly, if specific rowNodes are provided we do the same. (the clipboard service uses rowNodes to define which rows to export)
        const isClipboardExport = params.rowPositions != null;
        const isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
        const hideOpenParents = this.gridOptionsService.is('groupHideOpenParents') && !isExplicitExportSelection;
        const isLeafNode = this.columnModel.isPivotMode() ? node.leafGroup : !node.group;
        const skipRowGroups = params.skipGroups || params.skipRowGroups;
        const shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
        const shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);

        if (skipRowGroups && params.skipGroups) {
            _.doOnce(() => console.warn('AG Grid: Since v25.2 `skipGroups` has been renamed to `skipRowGroups`.'), 'gridSerializer-skipGroups');
        }

        if (
            (!isLeafNode && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents)) ||
            (params.onlySelected && !node.isSelected()) ||
            (params.skipPinnedTop && node.rowPinned === 'top') ||
            (params.skipPinnedBottom && node.rowPinned === 'bottom')
        ) {
            return;
        }

        // if we are in pivotMode, then the grid will show the root node only
        // if it's not a leaf group
        const nodeIsRootNode = node.level === -1;

        if (nodeIsRootNode && !node.leafGroup && !node.footer) { 
            return;
        }

        const shouldRowBeSkipped: boolean = rowSkipper({ node, api, columnApi, context });

        if (shouldRowBeSkipped) { return; }

        const rowAccumulator: RowAccumulator = gridSerializingSession.onNewBodyRow();
        columnsToExport.forEach((column: Column, index: number) => {
            rowAccumulator.onColumn(column, index, node);
        });

        if (params.getCustomContentBelowRow) {
            const content = params.getCustomContentBelowRow({ node, api, columnApi, context });
            if (content) {
                gridSerializingSession.addCustomContent(content);
            }
        }
    }

    private appendContent<T>(params: ExportParams<T>): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession: GridSerializingSession<T>) => {
            const appendContent = params.customFooter || params.appendContent;
            if (appendContent) {
                if (params.customFooter) {
                    _.doOnce(() => console.warn('AG Grid: Since version 25.2.0 the `customFooter` param has been deprecated. Use `appendContent` instead.'), 'gridSerializer-customFooter');
                }
                gridSerializingSession.addCustomContent(appendContent);
            }
            return gridSerializingSession;
        };
    }

    private prependContent<T>(params: ExportParams<T>): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession: GridSerializingSession<T>) => {
            const prependContent = params.customHeader || params.prependContent;
            if (prependContent) {
                if (params.customHeader) {
                    _.doOnce(() => console.warn('AG Grid: Since version 25.2.0 the `customHeader` param has been deprecated. Use `prependContent` instead.'), 'gridSerializer-customHeader');
                }
                gridSerializingSession.addCustomContent(prependContent);
            }
            return gridSerializingSession;
        };
    }

    private prepareSession<T>(columnsToExport: Column[]): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            gridSerializingSession.prepare(columnsToExport);
            return gridSerializingSession;
        };
    }

    private exportColumnGroups<T>(params: ExportParams<T>, columnsToExport: Column[]): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            if (!params.skipColumnGroupHeaders) {
                const groupInstanceIdCreator: GroupInstanceIdCreator = new GroupInstanceIdCreator();
                const displayedGroups: IHeaderColumn[] = this.displayedGroupCreator.createDisplayedGroups(
                    columnsToExport,
                    this.columnModel.getGridBalancedTree(),
                    groupInstanceIdCreator,
                    null
                );
                this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, params.processGroupHeaderCallback);
            } else if (params.columnGroups) {
                _.doOnce(() => console.warn('AG Grid: Since v25.2 the `columnGroups` param has deprecated, and groups are exported by default.'), 'gridSerializer-columnGroups');
            }
            return gridSerializingSession;
        };
    }

    private exportHeaders<T>(params: ExportParams<T>, columnsToExport: Column[]): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            if (!params.skipHeader && !params.skipColumnHeaders) {
                const gridRowIterator = gridSerializingSession.onNewHeaderRow();
                columnsToExport.forEach((column, index) => {
                    gridRowIterator.onColumn(column, index, undefined);
                });
            } else if (params.skipHeader) {
                _.doOnce(() => console.warn('AG Grid: Since v25.2 the `skipHeader` param has been renamed to `skipColumnHeaders`.'), 'gridSerializer-skipHeader');
            }
            return gridSerializingSession;
        };
    }

    private processPinnedTopRows<T>(params: ExportParams<T>, columnsToExport: Column[]): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);

            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedTop rows, other models are processed by `processRows` and `processPinnedBottomsRows`
                    .filter(position => position.rowPinned === 'top')
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map(position => this.pinnedRowModel.getPinnedTopRow(position.rowIndex))
                    .forEach(processRow);
            } else {
                this.pinnedRowModel.forEachPinnedTopRow(processRow);
            }
            return gridSerializingSession;
        };
    }

    private processRows<T>(params: ExportParams<T>, columnsToExport: Column[]): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            // when in pivot mode, we always render cols on screen, never 'all columns'
            const rowModel = this.rowModel;
            const rowModelType = rowModel.getType();
            const usingCsrm = rowModelType === 'clientSide';
            const usingSsrm = rowModelType === 'serverSide';
            const onlySelectedNonStandardModel = !usingCsrm && params.onlySelected;
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            const {
                exportedRows = 'filteredAndSorted',
            } = params;

            if (params.rowPositions) {
                params.rowPositions
                    // pinnedRows are processed by `processPinnedTopRows` and `processPinnedBottomsRows`
                    .filter(position => position.rowPinned == null)
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map(position => rowModel.getRow(position.rowIndex))
                    .forEach(processRow);
            } else if (this.columnModel.isPivotMode()) {
                if (usingCsrm) {
                    (rowModel as IClientSideRowModel).forEachPivotNode(processRow, true);
                } else {
                    // must be enterprise, so we can just loop through all the nodes
                    rowModel.forEachNode(processRow);
                }
            } else {
                // onlySelectedAllPages: user doing pagination and wants selected items from
                // other pages, so cannot use the standard row model as it won't have rows from
                // other pages.
                // onlySelectedNonStandardModel: if user wants selected in non standard row model
                // (eg viewport) then again RowModel cannot be used, so need to use selected instead.
                if (params.onlySelectedAllPages || onlySelectedNonStandardModel) {
                    const selectedNodes = this.selectionService.getSelectedNodes();
                    this.replicateSortedOrder(selectedNodes);
                    // serialize each node
                    selectedNodes.forEach(processRow);
                } else {
                    // here is everything else - including standard row model and selected. we don't use
                    // the selection model even when just using selected, so that the result is the order
                    // of the rows appearing on the screen.
                    if (exportedRows === 'all') {
                        rowModel.forEachNode(processRow);
                    } else if (usingCsrm) {
                        (rowModel as IClientSideRowModel).forEachNodeAfterFilterAndSort(processRow, true);
                    } else if (usingSsrm) {
                        (rowModel as IServerSideRowModel).forEachNodeAfterFilterAndSort(processRow);
                    } else {
                        rowModel.forEachNode(processRow);
                    }
                }
            }
            return gridSerializingSession;
        };
    }

    private replicateSortedOrder(rows: RowNode[]) {
        const sortOptions = this.sortController.getSortOptions();
        const compareNodes = (rowA: RowNode, rowB: RowNode): number => {
            if (rowA.rowIndex != null && rowB.rowIndex != null) {
                // if the rows have rowIndexes, this is the easiest way to compare,
                // as they're already ordered
                return rowA.rowIndex - rowB.rowIndex;
            }


            // if the level is the same, compare these nodes, or their parents
            if (rowA.level === rowB.level) {
                if (rowA.parent?.id === rowB.parent?.id) {
                    return this.rowNodeSorter.compareRowNodes(sortOptions, {
                        rowNode: rowA,
                        currentPos: rowA.rowIndex ?? -1,
                    }, {
                        rowNode: rowB,
                        currentPos: rowB.rowIndex ?? -1,
                    });
                }

                // level is same, but parent isn't, compare parents
                return compareNodes(rowA.parent!, rowB.parent!);
            }

            // if level is different, match levels
            if (rowA.level > rowB.level) {
                return compareNodes(rowA.parent!, rowB);
            }
            return compareNodes(rowA, rowB.parent!);
        }

        // sort the nodes either by existing row index or compare them
        rows.sort(compareNodes);
    }

    private processPinnedBottomRows<T>(params: ExportParams<T>, columnsToExport: Column[]): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedBottom rows, other models are processed by `processRows` and `processPinnedTopRows`
                    .filter(position => position.rowPinned === 'bottom')
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map(position => this.pinnedRowModel.getPinnedBottomRow(position.rowIndex))
                    .forEach(processRow);
            } else {
                this.pinnedRowModel.forEachPinnedBottomRow(processRow);
            }
            return gridSerializingSession;
        };
    }

    private getColumnsToExport(allColumns: boolean = false, columnKeys?: (string | Column)[]): Column[] {
        const isPivotMode = this.columnModel.isPivotMode();

        if (columnKeys && columnKeys.length) {
            return this.columnModel.getGridColumns(columnKeys);
        }

        if (allColumns && !isPivotMode) {
            // add auto group column for tree data
            const columns = this.gridOptionsService.isTreeData()
                ? this.columnModel.getGridColumns([GROUP_AUTO_COLUMN_ID])
                : [];

            return columns.concat(this.columnModel.getAllPrimaryColumns() || []);
        }

        return this.columnModel.getAllDisplayedColumns();
    }

    private recursivelyAddHeaderGroups<T>(displayedGroups: IHeaderColumn[], gridSerializingSession: GridSerializingSession<T>, processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined): void {
        const directChildrenHeaderGroups: IHeaderColumn[] = [];
        displayedGroups.forEach((columnGroupChild: IHeaderColumn) => {
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

    private doAddHeaderHeader<T>(gridSerializingSession: GridSerializingSession<T>, displayedGroups: IHeaderColumn[], processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined) {
        const gridRowIterator: RowSpanningAccumulator = gridSerializingSession.onNewHeaderGroupingRow();
        let columnIndex: number = 0;
        displayedGroups.forEach((columnGroupChild: IHeaderColumn) => {
            const columnGroup: ColumnGroup = columnGroupChild as ColumnGroup;

            let name: string;
            if (processGroupHeaderCallback) {
                name = processGroupHeaderCallback({
                    columnGroup: columnGroup,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context
                });
            } else {
                name = this.columnModel.getDisplayNameForColumnGroup(columnGroup, 'header')!;
            }

            const collapsibleGroupRanges = columnGroup.getLeafColumns().reduce((collapsibleGroups: number[][], currentColumn, currentIdx, arr) => {
                let lastGroup = _.last(collapsibleGroups);
                const groupShow = currentColumn.getColumnGroupShow() === 'open';

                if (!groupShow) {
                    if (lastGroup && lastGroup[1] == null) {
                        lastGroup[1] = currentIdx - 1;
                    }
                } else if (!lastGroup || lastGroup[1] != null) {
                    lastGroup = [currentIdx];
                    collapsibleGroups.push(lastGroup);
                }


                if (currentIdx === arr.length - 1 && lastGroup && lastGroup[1] == null) {
                    lastGroup[1] = currentIdx;
                }

                return collapsibleGroups;
            }, []);

            gridRowIterator.onColumn(columnGroup, name || '', columnIndex++, columnGroup.getLeafColumns().length - 1, collapsibleGroupRanges);
        });
    }
}
