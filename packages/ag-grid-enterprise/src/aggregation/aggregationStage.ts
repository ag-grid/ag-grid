import type {
    AgColumn,
    BeanCollection,
    ChangedPath,
    ClientSideRowModelStage,
    ColumnModel,
    GetGroupRowAggParams,
    GridOptions,
    IColsService,
    IPivotResultColsService,
    NamedBean,
    RowNode,
    ValueService,
    WithoutGridCommon,
    _IRowNodeAggregationStage,
} from 'ag-grid-community';
import { BeanStub, _getGrandTotalRow, _getGroupAggFiltering, _isClientSideRowModel } from 'ag-grid-community';

import { _aggregateValues } from './aggUtils';

interface AggregationDetails {
    alwaysAggregateAtRootLevel: boolean;
    groupIncludeTotalFooter: boolean;
    changedPath: ChangedPath;
    valueColumns: AgColumn[];
    pivotColumns: AgColumn[];
    filteredOnly: boolean;
    userAggFunc: ((params: WithoutGridCommon<GetGroupRowAggParams<any, any>>) => any) | undefined;
}

export class AggregationStage extends BeanStub implements NamedBean, _IRowNodeAggregationStage {
    beanName = 'aggStage' as const;

    public readonly step: ClientSideRowModelStage = 'aggregate';
    public readonly refreshProps: (keyof GridOptions<any>)[] = [
        'getGroupRowAgg',
        'alwaysAggregateAtRootLevel',
        'suppressAggFilteredOnly',
        'grandTotalRow',
    ];

    private clientSide: boolean = false;
    private colModel: ColumnModel;
    private valueSvc: ValueService;
    private pivotColsSvc?: IColsService;
    private valueColsSvc?: IColsService;
    private pivotResultCols?: IPivotResultColsService;

    public wireBeans(beans: BeanCollection) {
        this.colModel = beans.colModel;
        this.pivotColsSvc = beans.pivotColsSvc;
        this.valueColsSvc = beans.valueColsSvc;
        this.pivotResultCols = beans.pivotResultCols;
        this.valueSvc = beans.valueSvc;
        this.clientSide = _isClientSideRowModel(beans.gos);
    }

    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    public execute(changedPath: ChangedPath): any {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = !this.valueColsSvc?.columns?.length;
        const noUserAgg = !this.gos.getCallback('getGroupRowAgg');
        if (noValueColumns && noUserAgg && changedPath?.active) {
            return;
        }

        const aggDetails = this.createAggDetails(changedPath);

        this.recursivelyCreateAggData(aggDetails);
    }

    private createAggDetails(changedPath: ChangedPath): AggregationDetails {
        const pivotActive = this.colModel.isPivotActive();

        const measureColumns = this.valueColsSvc?.columns;
        const pivotColumns = pivotActive && this.pivotColsSvc ? this.pivotColsSvc.columns : [];

        const aggDetails: AggregationDetails = {
            alwaysAggregateAtRootLevel: this.gos.get('alwaysAggregateAtRootLevel'),
            groupIncludeTotalFooter: !!_getGrandTotalRow(this.gos),
            changedPath,
            valueColumns: measureColumns ?? [],
            pivotColumns: pivotColumns,
            filteredOnly: !this.isSuppressAggFilteredOnly(),
            userAggFunc: this.gos.getCallback('getGroupRowAgg') as any,
        };

        return aggDetails;
    }

    private isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = _getGroupAggFiltering(this.gos) !== undefined;
        return isGroupAggFiltering || this.gos.get('suppressAggFilteredOnly');
    }

    private recursivelyCreateAggData(aggDetails: AggregationDetails) {
        const callback = (rowNode: RowNode) => {
            const hasNoChildren = !rowNode.hasChildren();
            if (hasNoChildren) {
                // this check is needed for TreeData, in case the node is no longer a child,
                // but it was a child previously.
                if (rowNode.aggData) {
                    this.setAggDataWithSiblings(rowNode, null);
                }
                // never agg data for leaf nodes
                return;
            }

            //Optionally enable the aggregation at the root Node
            const isRootNode = rowNode.level === -1;
            // if total footer is displayed, the value is in use
            if (isRootNode && !aggDetails.groupIncludeTotalFooter) {
                const notPivoting = !this.colModel.isPivotMode();
                if (!aggDetails.alwaysAggregateAtRootLevel && notPivoting) {
                    // Root node has no siblings here: no footer (groupIncludeTotalFooter is false)
                    // and root cannot be manually pinned, so just clear the root node's aggData.
                    this.setAggData(rowNode, null);
                    return;
                }
            }

            this.aggregateRowNode(rowNode, aggDetails);
        };

        aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
    }

    private aggregateRowNode(rowNode: RowNode, aggDetails: AggregationDetails): void {
        const measureColumnsMissing = aggDetails.valueColumns.length === 0;
        const pivotColumnsMissing = aggDetails.pivotColumns.length === 0;

        let aggResult: any;
        if (aggDetails.userAggFunc) {
            aggResult = aggDetails.userAggFunc({ nodes: rowNode.childrenAfterFilter! });
        } else if (measureColumnsMissing) {
            aggResult = null;
        } else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, aggDetails);
        } else {
            aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
        }

        this.setAggDataWithSiblings(rowNode, aggResult);
    }

    private aggregateRowNodeUsingValuesAndPivot(rowNode: RowNode): any {
        const result: any = {};

        const secondaryColumns = this.pivotResultCols?.getPivotResultCols()?.list ?? [];
        let canSkipTotalColumns = true;
        const beans = this.beans;
        const valueSvc = this.valueSvc;

        for (let i = 0; i < secondaryColumns.length; i++) {
            const secondaryCol = secondaryColumns[i];
            const colDef = secondaryCol.getColDef();

            if (colDef.pivotTotalColumnIds != null) {
                canSkipTotalColumns = false;
                continue;
            }

            let values: any[];
            let aggregatedChildren: RowNode[] | null | undefined;

            const pivotValueColumn = colDef.pivotValueColumn as AgColumn;

            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                aggregatedChildren = getNodesFromMappedSet(rowNode.childrenMapped, colDef.pivotKeys);
                values = getValuesFromNodes(valueSvc, aggregatedChildren, pivotValueColumn);
            } else {
                // value columns and pivot columns, non-leaf group
                aggregatedChildren = rowNode.childrenAfterFilter;
                values = getAggDataFromNodes(aggregatedChildren, secondaryCol.getId());
            }

            // bit of a memory drain storing null/undefined, but seems to speed up performance.
            result[colDef.colId!] = _aggregateValues({
                beans,
                values,
                aggFuncOrString: pivotValueColumn.getAggFunc()!,
                column: pivotValueColumn,
                rowNode,
                pivotResultColumn: secondaryCol,
                aggregatedChildren: aggregatedChildren ?? [],
            });
        }

        if (!canSkipTotalColumns) {
            for (let i = 0; i < secondaryColumns.length; i++) {
                const secondaryCol = secondaryColumns[i];
                const colDef = secondaryCol.getColDef();

                if (!colDef.pivotTotalColumnIds?.length) {
                    continue;
                }

                const aggResults: any[] = colDef.pivotTotalColumnIds.map(
                    (currentColId: string) => result[currentColId]
                );
                // bit of a memory drain storing null/undefined, but seems to speed up performance.
                // For total columns, aggregatedChildren is the same as the parent node's children
                result[colDef.colId!] = _aggregateValues({
                    beans,
                    values: aggResults,
                    aggFuncOrString: colDef.pivotValueColumn!.getAggFunc()!,
                    column: colDef.pivotValueColumn as AgColumn,
                    rowNode,
                    pivotResultColumn: secondaryCol,
                    aggregatedChildren: rowNode.childrenAfterFilter ?? [],
                });
            }
        }

        return result;
    }

    private aggregateRowNodeUsingValuesOnly(rowNode: RowNode, aggDetails: AggregationDetails): any {
        const result: any = {};

        const { changedPath, valueColumns, filteredOnly } = aggDetails;

        const changedValueColumns = changedPath.active
            ? changedPath.getValueColumnsForNode(rowNode, valueColumns)
            : valueColumns;

        const notChangedValueColumns = changedPath.active
            ? changedPath.getNotValueColumnsForNode(rowNode, valueColumns)
            : null;

        // Get aggregated children once and reuse for all columns
        const aggregatedChildren = (filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup) ?? [];
        const values2d = getValuesFromNodesMultiColumn(this.valueSvc, aggregatedChildren, changedValueColumns);
        const oldValues = rowNode.aggData;

        const beans = this.beans;

        changedValueColumns.forEach((valueColumn, index) => {
            result[valueColumn.getId()] = _aggregateValues({
                beans,
                values: values2d[index],
                aggFuncOrString: valueColumn.getAggFunc()!,
                column: valueColumn,
                rowNode,
                pivotResultColumn: undefined,
                aggregatedChildren,
            });
        });

        if (notChangedValueColumns && oldValues) {
            for (const valueColumn of notChangedValueColumns) {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            }
        }

        return result;
    }

    public getAggregatedChildren(rowNode: RowNode | null | undefined, col: AgColumn | null | undefined): RowNode[] {
        if (!rowNode?.group || !this.clientSide) {
            return []; // only group nodes have aggregated children, and only supported in CSRM
        }

        // For pinned siblings, delegate to the source row which has the actual children.
        // Pinned siblings copy children references at creation time, but those references become stale
        // when filtering/sorting updates the source row's children arrays.
        if (rowNode.rowPinned) {
            const sourceRow = rowNode.pinnedSibling;
            if (!sourceRow) {
                return [];
            }
            rowNode = sourceRow;
        }

        const colDef = col?.getColDef();
        const pivotKeys = colDef?.pivotKeys; // undefined for non-pivot columns
        if (pivotKeys) {
            // For regular pivot columns on leaf groups with specific pivot keys, use childrenMapped to filter by pivot keys.
            // For pivot total columns (pivotColumnGroupTotals), aggregation uses childrenAfterFilter instead.
            if (rowNode.leafGroup && pivotKeys.length && !colDef.pivotTotalColumnIds) {
                return getNodesFromMappedSet(rowNode.childrenMapped, pivotKeys) ?? [];
            }

            // For pivot columns on non-leaf groups, total columns, or pivot total columns with empty pivotKeys,
            // aggregation always uses childrenAfterFilter (see aggregateRowNodeUsingValuesAndPivot),
            // regardless of suppressAggFilteredOnly.
            return rowNode.childrenAfterFilter ?? rowNode.childrenAfterGroup ?? [];
        }

        // For non-pivot columns, return the children that aggregation uses: filtered children by default,
        // or all children when suppressAggFilteredOnly is true or groupAggFiltering is defined.
        if (this.isSuppressAggFilteredOnly()) {
            return rowNode.childrenAfterGroup ?? [];
        }

        return rowNode.childrenAfterFilter ?? rowNode.childrenAfterGroup ?? [];
    }

    /**
     * Sets aggData on a row node and all its siblings (footer sibling and pinned siblings).
     * This ensures all related nodes stay in sync when aggregation data changes.
     */
    private setAggDataWithSiblings(rowNode: RowNode, newAggData: any): void {
        this.setAggData(rowNode, newAggData);

        // Update pinnedSibling of the group row (for manually pinned group rows)
        const pinnedSibling = rowNode.pinnedSibling;
        if (pinnedSibling) {
            this.setAggData(pinnedSibling, newAggData);
        }

        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        const sibling = rowNode.sibling;
        if (sibling) {
            this.setAggData(sibling, newAggData);

            // Similarly for pinned siblings. A pinned grand total row is a `pinnedSibling` of
            // the `sibling` of the root node.
            const siblingPinnedSibling = sibling.pinnedSibling;
            if (siblingPinnedSibling) {
                this.setAggData(siblingPinnedSibling, newAggData);
            }
        }
    }

    private setAggData(rowNode: RowNode, newAggData: any): void {
        const oldAggData = rowNode.aggData;
        rowNode.aggData = newAggData;

        // if no event service, nobody has registered for events, so no need fire event
        if (rowNode.__localEventService) {
            const eventFunc = (colId: string) => {
                const value = rowNode.aggData ? rowNode.aggData[colId] : undefined;
                const oldValue = oldAggData ? oldAggData[colId] : undefined;

                if (value === oldValue) {
                    return;
                }

                // do a quick lookup - despite the event it's possible the column no longer exists
                const column = this.colModel.getColById(colId);
                if (!column) {
                    return;
                }

                rowNode.dispatchCellChangedEvent(column, value, oldValue);
            };

            if (oldAggData) {
                for (const key of Object.keys(oldAggData)) {
                    eventFunc(key); // raise for old keys
                }
            }
            if (newAggData) {
                for (const key of Object.keys(newAggData)) {
                    if (!oldAggData || !(key in oldAggData)) {
                        eventFunc(key); // new key, event not yet raised
                    }
                }
            }
        }
    }
}

/** Extracts values from nodes for a single column. */
const getValuesFromNodes = (valueSvc: ValueService, nodes: RowNode[] | null | undefined, column: AgColumn): any[] => {
    if (!nodes) {
        return [];
    }
    const len = nodes.length;
    const result = new Array<any>(len);
    for (let i = 0; i < len; ++i) {
        result[i] = valueSvc.getValue(column, nodes[i], 'data');
    }
    return result;
};

/** Extracts values from nodes for multiple columns (returns 2D array). */
const getValuesFromNodesMultiColumn = (valueSvc: ValueService, nodes: RowNode[], columns: AgColumn[]): any[][] => {
    const columnCount = columns.length;
    const values: any[][] = new Array(columnCount);
    for (let j = 0; j < columnCount; j++) {
        values[j] = [];
    }
    const rowCount = nodes.length;
    for (let i = 0; i < rowCount; i++) {
        const childNode = nodes[i];
        for (let j = 0; j < columnCount; j++) {
            values[j].push(valueSvc.getValue(columns[j], childNode, 'data'));
        }
    }
    return values;
};

/** Extracts aggData values from nodes for a specific column ID. */
const getAggDataFromNodes = (nodes: RowNode[] | null | undefined, columnId: string): any[] => {
    if (!nodes) {
        return [];
    }
    const len = nodes.length;
    const result = new Array<any>(len);
    for (let i = 0; i < len; i++) {
        result[i] = nodes[i].aggData?.[columnId];
    }
    return result;
};

/** Traverses childrenMapped using pivot keys to get the matching RowNode array. */
const getNodesFromMappedSet = (mappedSet: any, keys: string[] | null | undefined): RowNode[] | undefined => {
    if (!keys) {
        return undefined;
    }
    let mapPointer = mappedSet;
    for (let i = 0; i < keys.length && mapPointer; i++) {
        mapPointer = mapPointer[keys[i]];
    }
    // Only return if we reached an array of RowNodes. If keys is empty or traversal
    // ends at a non-array (e.g., intermediate map object), return undefined.
    if (Array.isArray(mapPointer)) {
        return mapPointer;
    }
    return undefined;
};
