import type {
    AgColumn,
    AgColumnGroup,
    BeanCollection,
    ColumnModel,
    ColumnNameService,
    ExportParams,
    IClientSideRowModel,
    IRowModel,
    ISelectionService,
    IServerSideRowModel,
    NamedBean,
    PinnedRowModel,
    ProcessGroupHeaderForExportParams,
    RowNode,
    RowNodeSorter,
    ShouldRowBeSkippedParams,
    SortController,
    VisibleColsService,
} from '@ag-grid-community/core';
import {
    BeanStub,
    GroupInstanceIdCreator,
    _compose,
    _isClientSideRowModel,
    _isServerSideRowModel,
    _last,
    isColumnControlsCol,
    isColumnGroup,
    isColumnGroupAutoCol,
} from '@ag-grid-community/core';

import type { GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from './interfaces';

type ProcessGroupHeaderCallback = (params: ProcessGroupHeaderForExportParams) => string;

export enum RowType {
    HEADER_GROUPING,
    HEADER,
    BODY,
}

export class GridSerializer extends BeanStub implements NamedBean {
    beanName = 'gridSerializer' as const;

    private visibleColsService: VisibleColsService;
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private rowModel: IRowModel;
    private pinnedRowModel: PinnedRowModel;
    private selectionService: ISelectionService;
    private rowNodeSorter: RowNodeSorter;
    private sortController: SortController;

    public wireBeans(beans: BeanCollection): void {
        this.visibleColsService = beans.visibleColsService;
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.rowModel = beans.rowModel;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.selectionService = beans.selectionService;
        this.rowNodeSorter = beans.rowNodeSorter;
        this.sortController = beans.sortController;
    }

    public serialize<T>(gridSerializingSession: GridSerializingSession<T>, params: ExportParams<T> = {}): string {
        const { allColumns, columnKeys, skipRowGroups } = params;
        const columnsToExport = this.getColumnsToExport(
            allColumns,
            skipRowGroups,
            columnKeys as (string | AgColumn)[] | undefined
        );

        const serializeChain = _compose<GridSerializingSession<T>>(
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

    private processRow<T>(
        gridSerializingSession: GridSerializingSession<T>,
        params: ExportParams<T>,
        columnsToExport: AgColumn[],
        node: RowNode
    ): void {
        const rowSkipper: (params: ShouldRowBeSkippedParams) => boolean = params.shouldRowBeSkipped || (() => false);
        const skipSingleChildrenGroup = this.gos.get('groupRemoveSingleChildren');
        const skipLowestSingleChildrenGroup = this.gos.get('groupRemoveLowestSingleChildren');
        // if onlySelected, we ignore groupHideOpenParents as the user has explicitly selected the rows they wish to export.
        // similarly, if specific rowNodes are provided we do the same. (the clipboard service uses rowNodes to define which rows to export)
        const isClipboardExport = params.rowPositions != null;
        const isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
        const hideOpenParents = this.gos.get('groupHideOpenParents') && !isExplicitExportSelection;
        const isLeafNode = this.columnModel.isPivotMode() ? node.leafGroup : !node.group;
        const isFooter = !!node.footer;
        const shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
        const shouldSkipCurrentGroup =
            node.allChildrenCount === 1 &&
            node.childrenAfterGroup?.length === 1 &&
            (skipSingleChildrenGroup || shouldSkipLowestGroup);

        if (
            (!isLeafNode && !isFooter && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents)) ||
            (params.onlySelected && !node.isSelected()) ||
            (params.skipPinnedTop && node.rowPinned === 'top') ||
            (params.skipPinnedBottom && node.rowPinned === 'bottom')
        ) {
            return;
        }

        // if we are in pivotMode, then the grid will show the root node only
        // if it's not a leaf group
        const nodeIsRootNode = node.level === -1;

        if (nodeIsRootNode && !isLeafNode && !isFooter) {
            return;
        }

        const shouldRowBeSkipped: boolean = rowSkipper(this.gos.addGridCommonParams({ node }));

        if (shouldRowBeSkipped) {
            return;
        }

        const rowAccumulator: RowAccumulator = gridSerializingSession.onNewBodyRow(node);
        columnsToExport.forEach((column: AgColumn, index: number) => {
            rowAccumulator.onColumn(column, index, node);
        });

        if (params.getCustomContentBelowRow) {
            const content = params.getCustomContentBelowRow(this.gos.addGridCommonParams({ node }));
            if (content) {
                gridSerializingSession.addCustomContent(content);
            }
        }
    }

    private appendContent<T>(
        params: ExportParams<T>
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession: GridSerializingSession<T>) => {
            const appendContent = params.appendContent;
            if (appendContent) {
                gridSerializingSession.addCustomContent(appendContent);
            }
            return gridSerializingSession;
        };
    }

    private prependContent<T>(
        params: ExportParams<T>
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession: GridSerializingSession<T>) => {
            const prependContent = params.prependContent;
            if (prependContent) {
                gridSerializingSession.addCustomContent(prependContent);
            }
            return gridSerializingSession;
        };
    }

    private prepareSession<T>(
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            gridSerializingSession.prepare(columnsToExport);
            return gridSerializingSession;
        };
    }

    private exportColumnGroups<T>(
        params: ExportParams<T>,
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            if (!params.skipColumnGroupHeaders) {
                const idCreator: GroupInstanceIdCreator = new GroupInstanceIdCreator();
                const displayedGroups: (AgColumn | AgColumnGroup)[] = this.visibleColsService.createGroups({
                    columns: columnsToExport,
                    idCreator,
                    pinned: null,
                    isStandaloneStructure: true,
                });

                this.recursivelyAddHeaderGroups(
                    displayedGroups,
                    gridSerializingSession,
                    params.processGroupHeaderCallback
                );
            }
            return gridSerializingSession;
        };
    }

    private exportHeaders<T>(
        params: ExportParams<T>,
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            if (!params.skipColumnHeaders) {
                const gridRowIterator = gridSerializingSession.onNewHeaderRow();
                columnsToExport.forEach((column, index) => {
                    gridRowIterator.onColumn(column, index, undefined);
                });
            }
            return gridSerializingSession;
        };
    }

    private processPinnedTopRows<T>(
        params: ExportParams<T>,
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);

            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedTop rows, other models are processed by `processRows` and `processPinnedBottomsRows`
                    .filter((position) => position.rowPinned === 'top')
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map((position) => this.pinnedRowModel.getPinnedTopRow(position.rowIndex))
                    .forEach(processRow);
            } else {
                this.pinnedRowModel.forEachPinnedRow('top', processRow);
            }
            return gridSerializingSession;
        };
    }

    private processRows<T>(
        params: ExportParams<T>,
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            // when in pivot mode, we always render cols on screen, never 'all columns'
            const rowModel = this.rowModel;
            const usingCsrm = _isClientSideRowModel(this.gos);
            const usingSsrm = _isServerSideRowModel(this.gos);
            const onlySelectedNonStandardModel = !usingCsrm && params.onlySelected;
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            const { exportedRows = 'filteredAndSorted' } = params;

            if (params.rowPositions) {
                params.rowPositions
                    // pinnedRows are processed by `processPinnedTopRows` and `processPinnedBottomsRows`
                    .filter((position) => position.rowPinned == null)
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map((position) => rowModel.getRow(position.rowIndex))
                    .forEach(processRow);
            } else if (this.columnModel.isPivotMode()) {
                if (usingCsrm) {
                    (rowModel as IClientSideRowModel).forEachPivotNode(processRow, true);
                } else if (usingSsrm) {
                    (rowModel as IServerSideRowModel).forEachNodeAfterFilterAndSort(processRow, true);
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
                        (rowModel as IServerSideRowModel).forEachNodeAfterFilterAndSort(processRow, true);
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
                    return this.rowNodeSorter.compareRowNodes(
                        sortOptions,
                        {
                            rowNode: rowA,
                            currentPos: rowA.rowIndex ?? -1,
                        },
                        {
                            rowNode: rowB,
                            currentPos: rowB.rowIndex ?? -1,
                        }
                    );
                }

                // level is same, but parent isn't, compare parents
                return compareNodes(rowA.parent!, rowB.parent!);
            }

            // if level is different, match levels
            if (rowA.level > rowB.level) {
                return compareNodes(rowA.parent!, rowB);
            }
            return compareNodes(rowA, rowB.parent!);
        };

        // sort the nodes either by existing row index or compare them
        rows.sort(compareNodes);
    }

    private processPinnedBottomRows<T>(
        params: ExportParams<T>,
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedBottom rows, other models are processed by `processRows` and `processPinnedTopRows`
                    .filter((position) => position.rowPinned === 'bottom')
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map((position) => this.pinnedRowModel.getPinnedBottomRow(position.rowIndex))
                    .forEach(processRow);
            } else {
                this.pinnedRowModel.forEachPinnedRow('bottom', processRow);
            }
            return gridSerializingSession;
        };
    }

    private getColumnsToExport(
        allColumns: boolean = false,
        skipRowGroups: boolean = false,
        columnKeys?: (string | AgColumn)[]
    ): AgColumn[] {
        const isPivotMode = this.columnModel.isPivotMode();

        if (columnKeys && columnKeys.length) {
            return this.columnModel.getColsForKeys(columnKeys);
        }

        const isTreeData = this.gos.get('treeData');

        let columnsToExport: AgColumn[] = [];

        if (allColumns && !isPivotMode) {
            columnsToExport = this.columnModel.getCols();
        } else {
            columnsToExport = this.visibleColsService.getAllCols();
        }

        if (skipRowGroups && !isTreeData) {
            columnsToExport = columnsToExport.filter(
                (column) => isColumnGroupAutoCol(column) || isColumnControlsCol(column)
            );
        }

        return columnsToExport;
    }

    private recursivelyAddHeaderGroups<T>(
        displayedGroups: (AgColumn | AgColumnGroup)[],
        gridSerializingSession: GridSerializingSession<T>,
        processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined
    ): void {
        const directChildrenHeaderGroups: (AgColumn | AgColumnGroup)[] = [];
        displayedGroups.forEach((columnGroupChild) => {
            const columnGroup = columnGroupChild as AgColumnGroup;
            if (!columnGroup.getChildren) {
                return;
            }
            columnGroup.getChildren()!.forEach((it) => directChildrenHeaderGroups.push(it));
        });

        if (displayedGroups.length > 0 && isColumnGroup(displayedGroups[0])) {
            this.doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback);
        }

        if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
            this.recursivelyAddHeaderGroups(
                directChildrenHeaderGroups,
                gridSerializingSession,
                processGroupHeaderCallback
            );
        }
    }

    private doAddHeaderHeader<T>(
        gridSerializingSession: GridSerializingSession<T>,
        displayedGroups: (AgColumn | AgColumnGroup)[],
        processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined
    ) {
        const gridRowIterator: RowSpanningAccumulator = gridSerializingSession.onNewHeaderGroupingRow();
        let columnIndex: number = 0;
        displayedGroups.forEach((columnGroupChild) => {
            const columnGroup: AgColumnGroup = columnGroupChild as AgColumnGroup;

            let name: string;
            if (processGroupHeaderCallback) {
                name = processGroupHeaderCallback(
                    this.gos.addGridCommonParams({
                        columnGroup: columnGroup,
                    })
                );
            } else {
                name = this.columnNameService.getDisplayNameForColumnGroup(columnGroup, 'header')!;
            }

            const collapsibleGroupRanges = columnGroup
                .getLeafColumns()
                .reduce((collapsibleGroups: number[][], currentColumn, currentIdx, arr) => {
                    let lastGroup = _last(collapsibleGroups);
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

            gridRowIterator.onColumn(
                columnGroup,
                name || '',
                columnIndex++,
                columnGroup.getLeafColumns().length - 1,
                collapsibleGroupRanges
            );
        });
    }
}
