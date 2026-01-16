import type {
    AgColumn,
    BeanCollection,
    ChangedPath,
    ClientSideRowModelStage,
    ColumnModel,
    GetGroupRowAggParams,
    GridOptions,
    IColsService,
    NamedBean,
    RowNode,
    ValueService,
    WithoutGridCommon,
    _IRowNodeAggregationStage,
} from 'ag-grid-community';
import { BeanStub, _getGrandTotalRow, _getGroupAggFiltering } from 'ag-grid-community';

import { _aggregateValues, aggregateRowNodeUsingValuesAndPivot, getValuesNormal, setAggData } from './aggUtils';

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

    private colModel: ColumnModel;
    private valueSvc: ValueService;
    private pivotColsSvc?: IColsService;
    private valueColsSvc?: IColsService;

    public wireBeans(beans: BeanCollection) {
        this.colModel = beans.colModel;
        this.pivotColsSvc = beans.pivotColsSvc;
        this.valueColsSvc = beans.valueColsSvc;
        this.valueSvc = beans.valueSvc;
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
                    setAggData(this.colModel, rowNode, null);
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
                    setAggData(this.colModel, rowNode, null);
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
            aggResult = aggregateRowNodeUsingValuesAndPivot(this.beans, rowNode);
        }

        setAggData(this.colModel, rowNode, aggResult);

        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            setAggData(this.colModel, rowNode.sibling, aggResult);

            // Similarly for pinned siblings. A pinned grand total row is a `pinnedSibling` of
            // the `sibling` of the root node.
            if (rowNode.sibling.pinnedSibling) {
                setAggData(this.colModel, rowNode.sibling.pinnedSibling, aggResult);
            }
        }
    }

    private aggregateRowNodeUsingValuesOnly(rowNode: RowNode, aggDetails: AggregationDetails): any {
        const result: Record<string, any> = {};

        const { changedPath, valueColumns, filteredOnly } = aggDetails;

        const changedValueColumns = changedPath.active
            ? changedPath.getValueColumnsForNode(rowNode, valueColumns)
            : valueColumns;

        const notChangedValueColumns = changedPath.active
            ? changedPath.getNotValueColumnsForNode(rowNode, valueColumns)
            : null;

        const values2d = getValuesNormal(
            this.valueSvc,
            filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup,
            changedValueColumns
        );
        const oldValues = rowNode.aggData;

        const beans = this.beans;

        changedValueColumns.forEach((valueColumn, index) => {
            result[valueColumn.getId()] = _aggregateValues(
                beans,
                values2d[index],
                valueColumn.getAggFunc()!,
                valueColumn,
                rowNode
            );
        });

        if (notChangedValueColumns && oldValues) {
            for (const valueColumn of notChangedValueColumns) {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            }
        }

        return result;
    }
}
