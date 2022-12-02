import {
    Bean,
    BeanStub,
    IRowNodeStage,
    Autowired,
    ColumnModel,
    ValueService,
    RowNode,
    Column,
    StageExecuteParams,
    IAggFunc,
    GridApi,
    ColumnApi,
    ChangedPath,
    IAggFuncParams,
    _,
    GetGroupRowAggParams,
    WithoutGridCommon
} from "@ag-grid-community/core";
import { PivotStage } from "./pivotStage";
import { AggFuncService } from "./aggFuncService";

interface AggregationDetails {
    changedPath: ChangedPath;
    valueColumns: Column[];
    pivotColumns: Column[];
}

@Bean('aggregationStage')
export class AggregationStage extends BeanStub implements IRowNodeStage {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('pivotStage') private pivotStage: PivotStage;
    @Autowired('aggFuncService') private aggFuncService: AggFuncService;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;

    private filteredOnly: boolean;

    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    public execute(params: StageExecuteParams): any {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = _.missingOrEmpty(this.columnModel.getValueColumns());
        const noUserAgg = !this.getGroupRowAggFunc();
        const changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) { return; }

        const aggDetails = this.createAggDetails(params);

        this.recursivelyCreateAggData(aggDetails);
    }

    public getGroupRowAggFunc() {
        const getGroupRowAgg = this.gridOptionsService.getCallback('getGroupRowAgg');
        if (getGroupRowAgg) {
            return getGroupRowAgg;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const groupRowAggNodes = this.gridOptionsService.get('groupRowAggNodes');
        if (groupRowAggNodes) {
            return (params: WithoutGridCommon<GetGroupRowAggParams>) => groupRowAggNodes(params.nodes);
        }
    }

    private createAggDetails(params: StageExecuteParams): AggregationDetails {

        const pivotActive = this.columnModel.isPivotActive();

        const measureColumns = this.columnModel.getValueColumns();
        const pivotColumns = pivotActive ? this.columnModel.getPivotColumns() : [];

        const aggDetails = {
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns
        } as AggregationDetails;

        return aggDetails;
    }

    private isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = this.gridOptionsService.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || this.gridOptionsService.is('suppressAggFilteredOnly');
    }

    private recursivelyCreateAggData(aggDetails: AggregationDetails) {

        // update prop, in case changed since last time
        this.filteredOnly = !this.isSuppressAggFilteredOnly();

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

            //Optionally prevent the aggregation at the root Node
            //https://ag-grid.atlassian.net/browse/AG-388
            const isRootNode = rowNode.level === -1;
            if (isRootNode) {
                const notPivoting = !this.columnModel.isPivotMode();
                const suppressAggAtRootLevel = this.gridOptionsService.is('suppressAggAtRootLevel');
                if (suppressAggAtRootLevel && notPivoting) { return; }
            }

            this.aggregateRowNode(rowNode, aggDetails);
        };

        aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
    }

    private aggregateRowNode(rowNode: RowNode, aggDetails: AggregationDetails): void {

        const measureColumnsMissing = aggDetails.valueColumns.length === 0;
        const pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
        const userFunc = this.getGroupRowAggFunc();

        let aggResult: any;
        if (userFunc) {
            const params: WithoutGridCommon<GetGroupRowAggParams> = { nodes: rowNode.childrenAfterFilter! }
            aggResult = userFunc(params);
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
        const pivotColumnDefs = this.pivotStage.getPivotColumnDefs();

        // Step 1: process value columns
        pivotColumnDefs
            .filter(v => !_.exists(v.pivotTotalColumnIds)) // only process pivot value columns
            .forEach(valueColDef => {
                const keys: string[] = valueColDef.pivotKeys || [];
                let values: any[];
                const valueColumn: Column = valueColDef.pivotValueColumn!;
                const colId = valueColDef.colId!;

                if (rowNode.leafGroup) {
                    // lowest level group, get the values from the mapped set
                    values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
                } else {
                    // value columns and pivot columns, non-leaf group
                    values = this.getValuesPivotNonLeaf(rowNode, colId);
                }

                result[colId] = this.aggregateValues(values, valueColumn.getAggFunc()!, valueColumn, rowNode);
            });

        // Step 2: process total columns
        pivotColumnDefs
            .filter(v => _.exists(v.pivotTotalColumnIds)) // only process pivot total columns
            .forEach(totalColDef => {
                const aggResults: any[] = [];
                const { pivotValueColumn, pivotTotalColumnIds, colId } = totalColDef;

                //retrieve results for colIds associated with this pivot total column
                if (!pivotTotalColumnIds || !pivotTotalColumnIds.length) {
                    return;
                }

                pivotTotalColumnIds.forEach((currentColId: string) => {
                    aggResults.push(result[currentColId]);
                });

                result[colId!] = this.aggregateValues(aggResults, pivotValueColumn!.getAggFunc()!, pivotValueColumn!, rowNode);
            });

        return result;
    }

    private aggregateRowNodeUsingValuesOnly(rowNode: RowNode, aggDetails: AggregationDetails): any {
        const result: any = {};

        const changedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;

        const notChangedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;

        const values2d = this.getValuesNormal(rowNode, changedValueColumns);
        const oldValues = rowNode.aggData;

        changedValueColumns.forEach((valueColumn: Column, index: number) => {
            result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc()!, valueColumn, rowNode);
        });

        if (notChangedValueColumns && oldValues) {
            notChangedValueColumns.forEach((valueColumn: Column) => {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            });
        }

        return result;
    }

    private getValuesPivotNonLeaf(rowNode: RowNode, colId: string): any[] {
        const values: any[] = [];
        rowNode.childrenAfterFilter!.forEach((node: RowNode) => {
            const value = node.aggData[colId];
            values.push(value);
        });
        return values;
    }

    private getValuesFromMappedSet(mappedSet: any, keys: string[], valueColumn: Column): any[] {
        let mapPointer = mappedSet;
        keys.forEach(key => (mapPointer = mapPointer ? mapPointer[key] : null));

        if (!mapPointer) {
            return [];
        }

        const values: any = [];
        mapPointer.forEach((rowNode: RowNode) => {
            const value = this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });

        return values;
    }

    private getValuesNormal(rowNode: RowNode, valueColumns: Column[]): any[][] {
        // create 2d array, of all values for all valueColumns
        const values: any[][] = [];
        valueColumns.forEach(() => values.push([]));

        const valueColumnCount = valueColumns.length;

        const nodeList = this.filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
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

    public aggregateValues(values: any[], aggFuncOrString: string | IAggFunc, column?: Column, rowNode?: RowNode): any {
        const aggFunc = typeof aggFuncOrString === 'string' ?
            this.aggFuncService.getAggFunc(aggFuncOrString) :
            aggFuncOrString;

        if (typeof aggFunc !== 'function') {
            console.error(`AG Grid: unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }

        const aggFuncAny = aggFunc;
        const params: IAggFuncParams = {
            values: values,
            column: column,
            colDef: column ? column.getColDef() : undefined,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context'),
        } as any; // the "as any" is needed to allow the deprecation warning messages

        return aggFuncAny(params);
    }
}
