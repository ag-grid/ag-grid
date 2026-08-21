import type { ColumnModel } from '../columns/columnModel';
import { isColumnGroupAutoCol, isColumnSelectionCol, isRowNumberCol } from '../columns/columnUtils';
import { GroupInstanceIdCreator } from '../columns/groupInstanceIdCreator';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import {
    _addGridCommonParams,
    _isClientSideRowModel,
    _isHiddenSingleChildGroup,
    _isServerSideRowModel,
} from '../gridOptionsUtils';
import type { ExportParams, ShouldRowBeSkippedParams } from '../interfaces/exportParams';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { IRowModel } from '../interfaces/iRowModel';
import { createExportHeaderLayout } from './exportHeaderLayout';
import type { GridHeaderCell, GridSerializingSession, RowAccumulator } from './iGridSerializer';

export class GridSerializer extends BeanStub implements NamedBean {
    beanName = 'gridSerializer' as const;

    private visibleCols: VisibleColsService;
    private colModel: ColumnModel;
    private rowModel: IRowModel;
    private pinnedRowModel?: IPinnedRowModel;

    public wireBeans(beans: BeanCollection): void {
        this.visibleCols = beans.visibleCols;
        this.colModel = beans.colModel;
        this.rowModel = beans.rowModel;
        this.pinnedRowModel = beans.pinnedRowModel;
    }

    public serialize<T>(gridSerializingSession: GridSerializingSession<T>, params: ExportParams<T> = {}): string {
        const { allColumns, columnKeys, skipRowGroups, exportRowNumbers } = params;
        const columnsToExport = this.getColumnsToExport({
            allColumns,
            skipRowGroups,
            columnKeys: columnKeys as (string | AgColumn)[] | undefined,
            exportRowNumbers,
        });

        return [
            // first pass, put in the header names of the cols
            this.prepareSession(columnsToExport),
            this.prependContent(params),
            this.exportHeaders(params, columnsToExport),
            this.processPinnedTopRows(params, columnsToExport),
            this.processRows(params, columnsToExport),
            this.processPinnedBottomRows(params, columnsToExport),
            this.appendContent(params),
        ]
            .reduce((composed, f) => f(composed), gridSerializingSession)
            .parse();
    }

    private processRow<T>(
        gridSerializingSession: GridSerializingSession<T>,
        params: ExportParams<T>,
        columnsToExport: AgColumn[],
        node: RowNode
    ): void {
        const rowSkipper: (params: ShouldRowBeSkippedParams) => boolean = params.shouldRowBeSkipped || (() => false);
        // if onlySelected, we ignore groupHideOpenParents as the user has explicitly selected the rows they wish to export.
        // similarly, if specific rowNodes are provided we do the same. (the clipboard service uses rowNodes to define which rows to export)
        const isClipboardExport = params.rowPositions != null;
        const isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
        const hideOpenParents = this.gos.get('groupHideOpenParents') && !isExplicitExportSelection;
        const isLeafNode = this.colModel.pivotMode ? node.leafGroup : !node.group;
        const isFooter = !!node.footer;
        const shouldSkipCurrentGroup = _isHiddenSingleChildGroup(this.gos, node);

        if (
            (!isLeafNode && !isFooter && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents)) ||
            (params.onlySelected && !node.isSelected()) ||
            (params.skipPinnedTop && node.rowPinned === 'top') ||
            (params.skipPinnedBottom && node.rowPinned === 'bottom') ||
            node.stub // skip SSRM stub/loading rows
        ) {
            return;
        }

        // if we are in pivotMode, then the grid will show the root node only
        // if it's not a leaf group
        const nodeIsRootNode = node.level === -1;

        if (nodeIsRootNode && !isLeafNode && !isFooter) {
            return;
        }

        const shouldRowBeSkipped = rowSkipper(_addGridCommonParams(this.gos, { node }));

        if (shouldRowBeSkipped) {
            return;
        }

        const rowAccumulator: RowAccumulator = gridSerializingSession.onNewBodyRow(node);
        columnsToExport.forEach((column: AgColumn, index: number) => {
            rowAccumulator.onColumn(column, index, node);
        });

        if (params.getCustomContentBelowRow) {
            const content = params.getCustomContentBelowRow(_addGridCommonParams(this.gos, { node }));
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

    private exportHeaders<T>(
        params: ExportParams<T>,
        columnsToExport: AgColumn[]
    ): (gridSerializingSession: GridSerializingSession<T>) => GridSerializingSession<T> {
        return (gridSerializingSession) => {
            if (params.skipColumnGroupHeaders && params.skipColumnHeaders) {
                return gridSerializingSession;
            }

            let displayedGroups: (AgColumn | AgColumnGroup)[] = [];
            if (!params.skipColumnGroupHeaders) {
                displayedGroups = this.beans.colGroupSvc.createGroups(
                    columnsToExport,
                    new GroupInstanceIdCreator(),
                    null,
                    /* buildToken */ undefined,
                    /* isStandaloneStructure */ true
                );
            }
            const rows = createExportHeaderLayout(
                displayedGroups,
                columnsToExport,
                gridSerializingSession.useGridHeaderLayout && !!this.gos.get('hidePaddedHeaderRows'),
                !params.skipColumnHeaders,
                gridSerializingSession.useGridHeaderLayout
            );
            for (const row of rows) {
                const accumulator = row.grouping
                    ? gridSerializingSession.onNewHeaderGroupingRow()
                    : gridSerializingSession.onNewHeaderRow();
                for (const cell of row.cells) {
                    accumulator.onCell(this.withCollapsibleGroupRanges(cell, columnsToExport));
                }
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
                    .map((position) => this.pinnedRowModel?.getPinnedTopRow(position.rowIndex))
                    .forEach(processRow);
            } else {
                this.pinnedRowModel?.forEachPinnedRow('top', processRow);
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
            const usingCsrm = _isClientSideRowModel(this.gos, rowModel);
            const usingSsrm = _isServerSideRowModel(this.gos, rowModel);
            const onlySelectedNonStandardModel = !usingCsrm && params.onlySelected;
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            const pinnedRowModel = this.pinnedRowModel;
            const processBodyRow = (node: RowNode): void => {
                if (!params.skipPinnedRowDuplicates) {
                    processRow(node);
                    return;
                }

                const pinnedNode = node.pinnedSibling;
                const pinnedPosition = pinnedNode?.rowPinned;
                const isDisplayedPinnedSource = !!(
                    pinnedRowModel?.isManual() &&
                    pinnedNode?.id != null &&
                    pinnedPosition &&
                    pinnedRowModel.getPinnedRowById(pinnedNode.id, pinnedPosition) === pinnedNode
                );
                // manually pinned rows are exported from their pinned containers, not duplicated in the body.
                if (isDisplayedPinnedSource) {
                    return;
                }
                processRow(node);
            };
            const { exportedRows = 'filteredAndSorted' } = params;

            if (params.rowPositions) {
                params.rowPositions
                    // pinnedRows are processed by `processPinnedTopRows` and `processPinnedBottomsRows`
                    .filter((position) => position.rowPinned == null)
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map((position) => rowModel.getRow(position.rowIndex))
                    .filter((node): node is RowNode => node != null)
                    .forEach(processBodyRow);
            } else if (this.colModel.pivotMode) {
                if (usingCsrm) {
                    rowModel.forEachPivotNode(processBodyRow, true, exportedRows === 'filteredAndSorted');
                } else if (usingSsrm) {
                    rowModel.forEachNodeAfterFilterAndSort(processBodyRow, true);
                } else {
                    // must be enterprise, so we can just loop through all the nodes
                    rowModel.forEachNode(processBodyRow);
                }
            } else if (params.onlySelectedAllPages || onlySelectedNonStandardModel) {
                // onlySelectedAllPages: user doing pagination and wants selected items from
                // other pages, so cannot use the standard row model as it won't have rows from
                // other pages.
                // onlySelectedNonStandardModel: if user wants selected in non standard row model
                // (eg viewport) then again RowModel cannot be used, so need to use selected instead.
                const selectedNodes = this.beans.selectionSvc?.getSelectedNodes() ?? [];
                this.replicateSortedOrder(selectedNodes);
                // serialize each node
                selectedNodes.forEach(processBodyRow);
            }
            // here is everything else - including standard row model and selected. we don't use
            // the selection model even when just using selected, so that the result is the order
            // of the rows appearing on the screen.
            else if (exportedRows === 'all') {
                rowModel.forEachNode(processBodyRow);
            } else if (usingCsrm || usingSsrm) {
                rowModel.forEachNodeAfterFilterAndSort(processBodyRow, true);
            } else {
                rowModel.forEachNode(processBodyRow);
            }

            return gridSerializingSession;
        };
    }

    private replicateSortedOrder(rows: RowNode[]) {
        const { sortSvc, rowNodeSorter } = this.beans;
        if (!sortSvc || !rowNodeSorter) {
            return;
        }
        const sortOptions = sortSvc.getSortOptions();
        const compareNodes = (rowA: RowNode, rowB: RowNode): number => {
            if (rowA.rowIndex != null && rowB.rowIndex != null) {
                // if the rows have rowIndexes, this is the easiest way to compare,
                // as they're already ordered
                return rowA.rowIndex - rowB.rowIndex;
            }

            // if the level is the same, compare these nodes, or their parents
            if (rowA.level === rowB.level) {
                if (rowA.parent?.id === rowB.parent?.id) {
                    return (
                        rowNodeSorter.compareRowNodes(sortOptions, rowA, rowB) ||
                        (rowA.rowIndex ?? -1) - (rowB.rowIndex ?? -1)
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
                    .map((position) => this.pinnedRowModel?.getPinnedBottomRow(position.rowIndex))
                    .forEach(processRow);
            } else {
                this.pinnedRowModel?.forEachPinnedRow('bottom', processRow);
            }
            return gridSerializingSession;
        };
    }

    private getColumnsToExport(params: {
        allColumns?: boolean;
        skipRowGroups?: boolean;
        exportRowNumbers?: boolean;
        columnKeys?: (string | AgColumn)[];
    }): AgColumn[] {
        const { allColumns = false, skipRowGroups = false, exportRowNumbers = false, columnKeys } = params;
        const { colModel, gos, visibleCols } = this;
        const isPivotMode = colModel.pivotMode;

        const filterSpecialColumns = (col: AgColumn) => {
            if (isColumnSelectionCol(col)) {
                return false;
            }

            return !isRowNumberCol(col) || exportRowNumbers;
        };

        if (columnKeys?.length) {
            const result: AgColumn[] = [];
            for (let i = 0, len = columnKeys.length; i < len; ++i) {
                const col = colModel.getCol(columnKeys[i]);
                if (col && filterSpecialColumns(col)) {
                    result.push(col);
                }
            }
            return result;
        }

        const isTreeData = gos.get('treeData');

        let columnsToExport: AgColumn[];

        if (allColumns && !isPivotMode) {
            columnsToExport = colModel.colsList;
        } else {
            columnsToExport = visibleCols.allCols;
        }

        columnsToExport = columnsToExport.filter(
            (column) =>
                filterSpecialColumns(column) && (skipRowGroups && !isTreeData ? !isColumnGroupAutoCol(column) : true)
        );

        return columnsToExport;
    }

    private withCollapsibleGroupRanges(cell: GridHeaderCell, columnsToExport: AgColumn[]): GridHeaderCell {
        if (cell.type !== 'group' && cell.type !== 'padding') {
            return cell;
        }
        if (!cell.column?.isExpandable()) {
            return cell;
        }

        // ranges are offsets within this cell's own span, matching how merge
        // references are resolved from the cell's first output column.
        const collapsibleGroupRanges: number[][] = [];
        let openStart = -1;
        for (let offset = 0; offset <= cell.columnSpan; offset++) {
            const column = offset < cell.columnSpan ? columnsToExport[cell.columnIndex + offset] : undefined;
            const isOpen = column?.getColumnGroupShow() === 'open';
            if (isOpen && openStart < 0) {
                openStart = offset;
            } else if (!isOpen && openStart >= 0) {
                collapsibleGroupRanges.push([openStart, offset - 1]);
                openStart = -1;
            }
        }
        return { ...cell, collapsibleGroupRanges };
    }
}
