import type {
    AgColumn,
    BeanCollection,
    ChangedPath,
    ColumnModel,
    FuncColsService,
    GetGroupRowAggParams,
    IAggFunc,
    IAggFuncParams,
    IRowNodeStage,
    NamedBean,
    PivotResultColsService,
    RowNode,
    StageExecuteParams,
    ValueService,
    WithoutGridCommon,
} from 'ag-grid-community';
import { BeanStub, _errorOnce, _getGrandTotalRow, _getGroupAggFiltering, _missingOrEmpty } from 'ag-grid-community';

import type { AggFuncService } from './aggFuncService';

interface AggregationDetails {
    alwaysAggregateAtRootLevel: boolean;
    groupIncludeTotalFooter: boolean;
    changedPath: ChangedPath;
    valueColumns: AgColumn[];
    pivotColumns: AgColumn[];
    filteredOnly: boolean;
    userAggFunc: ((params: WithoutGridCommon<GetGroupRowAggParams<any, any>>) => any) | undefined;
}

export class AggregationStage extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'aggregationStage' as const;

    private columnModel: ColumnModel;
    private valueService: ValueService;
    private aggFuncService: AggFuncService;
    private funcColsService: FuncColsService;
    private pivotResultColsService: PivotResultColsService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.aggFuncService = beans.aggFuncService as AggFuncService;
        this.funcColsService = beans.funcColsService;
        this.pivotResultColsService = beans.pivotResultColsService;
        this.valueService = beans.valueService;
    }

    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    public execute(params: StageExecuteParams): any {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = _missingOrEmpty(this.funcColsService.valueCols);
        const noUserAgg = !this.gos.getCallback('getGroupRowAgg');
        const changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) {
            return;
        }

        const aggDetails = this.createAggDetails(params);

        this.recursivelyCreateAggData(aggDetails);
    }

    private createAggDetails(params: StageExecuteParams): AggregationDetails {
        const pivotActive = this.columnModel.isPivotActive();

        const measureColumns = this.funcColsService.valueCols;
        const pivotColumns = pivotActive ? this.funcColsService.pivotCols : [];

        const aggDetails: AggregationDetails = {
            alwaysAggregateAtRootLevel: this.gos.get('alwaysAggregateAtRootLevel'),
            groupIncludeTotalFooter: !!_getGrandTotalRow(this.gos),
            changedPath: params.changedPath!,
            valueColumns: measureColumns,
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
                    rowNode.setAggData(null);
                }
                // never agg data for leaf nodes
                return;
            }

            //Optionally enable the aggregation at the root Node
            const isRootNode = rowNode.level === -1;
            // if total footer is displayed, the value is in use
            if (isRootNode && !aggDetails.groupIncludeTotalFooter) {
                const notPivoting = !this.columnModel.isPivotMode();
                if (!aggDetails.alwaysAggregateAtRootLevel && notPivoting) {
                    rowNode.setAggData(null);
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

        rowNode.setAggData(aggResult);

        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            rowNode.sibling.setAggData(aggResult);
        }
    }

    private aggregateRowNodeUsingValuesAndPivot(rowNode: RowNode): any {
        const result: any = {};

        const secondaryColumns = this.pivotResultColsService.getPivotResultCols()?.list ?? [];
        let canSkipTotalColumns = true;
        for (let i = 0; i < secondaryColumns.length; i++) {
            const secondaryCol = secondaryColumns[i];
            const colDef = secondaryCol.getColDef();

            if (colDef.pivotTotalColumnIds != null) {
                canSkipTotalColumns = false;
                continue;
            }

            const keys: string[] = colDef.pivotKeys ?? [];
            let values: any[];

            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, colDef.pivotValueColumn as AgColumn);
            } else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, colDef.colId!);
            }

            // bit of a memory drain storing null/undefined, but seems to speed up performance.
            result[colDef.colId!] = this.aggregateValues(
                values,
                colDef.pivotValueColumn!.getAggFunc()!,
                colDef.pivotValueColumn as AgColumn,
                rowNode,
                secondaryCol
            );
        }

        if (!canSkipTotalColumns) {
            for (let i = 0; i < secondaryColumns.length; i++) {
                const secondaryCol = secondaryColumns[i];
                const colDef = secondaryCol.getColDef();

                if (colDef.pivotTotalColumnIds == null || !colDef.pivotTotalColumnIds.length) {
                    continue;
                }

                const aggResults: any[] = colDef.pivotTotalColumnIds.map(
                    (currentColId: string) => result[currentColId]
                );
                // bit of a memory drain storing null/undefined, but seems to speed up performance.
                result[colDef.colId!] = this.aggregateValues(
                    aggResults,
                    colDef.pivotValueColumn!.getAggFunc()!,
                    colDef.pivotValueColumn as AgColumn,
                    rowNode,
                    secondaryCol
                );
            }
        }

        return result;
    }

    private aggregateRowNodeUsingValuesOnly(rowNode: RowNode, aggDetails: AggregationDetails): any {
        const result: any = {};

        const changedValueColumns = aggDetails.changedPath.isActive()
            ? aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;

        const notChangedValueColumns = aggDetails.changedPath.isActive()
            ? aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;

        const values2d = this.getValuesNormal(rowNode, changedValueColumns, aggDetails.filteredOnly);
        const oldValues = rowNode.aggData;

        changedValueColumns.forEach((valueColumn, index) => {
            result[valueColumn.getId()] = this.aggregateValues(
                values2d[index],
                valueColumn.getAggFunc()!,
                valueColumn,
                rowNode
            );
        });

        if (notChangedValueColumns && oldValues) {
            notChangedValueColumns.forEach((valueColumn) => {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            });
        }

        return result;
    }

    private getValuesPivotNonLeaf(rowNode: RowNode, colId: string): any[] {
        return rowNode.childrenAfterFilter!.map((childNode: RowNode) => childNode.aggData[colId]);
    }

    private getValuesFromMappedSet(mappedSet: any, keys: string[], valueColumn: AgColumn): any[] {
        let mapPointer = mappedSet;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            mapPointer = mapPointer ? mapPointer[key] : null;
        }

        if (!mapPointer) {
            return [];
        }

        return mapPointer.map((rowNode: RowNode) => this.valueService.getValue(valueColumn, rowNode));
    }

    private getValuesNormal(rowNode: RowNode, valueColumns: AgColumn[], filteredOnly: boolean): any[][] {
        // create 2d array, of all values for all valueColumns
        const values: any[][] = [];
        valueColumns.forEach(() => values.push([]));

        const valueColumnCount = valueColumns.length;

        const nodeList = filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
        const rowCount = nodeList!.length;

        for (let i = 0; i < rowCount; i++) {
            const childNode = nodeList![i];
            for (let j = 0; j < valueColumnCount; j++) {
                const valueColumn = valueColumns[j];
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                const value = this.valueService.getValue(valueColumn, childNode);
                values[j].push(value);
            }
        }

        return values;
    }

    public aggregateValues(
        values: any[],
        aggFuncOrString: string | IAggFunc,
        column?: AgColumn,
        rowNode?: RowNode,
        pivotResultColumn?: AgColumn
    ): any {
        const aggFunc =
            typeof aggFuncOrString === 'string' ? this.aggFuncService.getAggFunc(aggFuncOrString) : aggFuncOrString;

        if (typeof aggFunc !== 'function') {
            _errorOnce(`unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }

        const aggFuncAny = aggFunc;
        const params: IAggFuncParams = this.gos.addGridCommonParams({
            values: values,
            column: column,
            colDef: column ? column.getColDef() : undefined,
            pivotResultColumn: pivotResultColumn,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
        } as any); // the "as any" is needed to allow the deprecation warning messages

        return aggFuncAny(params);
    }
}
