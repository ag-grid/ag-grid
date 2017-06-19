import {
    _,
    Bean,
    IRowNodeStage,
    Autowired,
    GridOptionsWrapper,
    ColumnController,
    ValueService,
    RowNode,
    Column,
    StageExecuteParams,
    IAggFunc,
    GroupValueService
} from "ag-grid/main";
import {PivotStage} from "./pivotStage";
import {AggFuncService} from "../aggregation/aggFuncService";

@Bean('aggregationStage')
export class AggregationStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('groupValueService') private groupValueService: GroupValueService;
    @Autowired('pivotStage') private pivotStage: PivotStage;
    @Autowired('aggFuncService') private aggFuncService: AggFuncService;

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public execute(params: StageExecuteParams): any {
        let rootNode = params.rowNode;

        // we don't do aggregation if user provided the groups
        let rowsAlreadyGrouped = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            return;
        }

        let pivotActive = this.columnController.isPivotActive();

        let measureColumns = this.columnController.getValueColumns();
        let pivotColumns = pivotActive ? this.columnController.getPivotColumns() : [];

        this.recursivelyCreateAggData(rootNode, measureColumns, pivotColumns);
    }

    private recursivelyCreateAggData(rowNode: RowNode, measureColumns: Column[], pivotColumns: Column[]) {

        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach( child => {
            if (child.group) {
                this.recursivelyCreateAggData(child, measureColumns, pivotColumns);
            }
        });

        //Optionally prevent the aggregation at the root Node
        //https://ag-grid.atlassian.net/browse/AG-388
        let notPivoting = !this.columnController.isPivotMode();
        let suppressAggAtRootLevel = this.gridOptionsWrapper.isSuppressAggAtRootLevel();
        let isRootNode = rowNode.level === -1;
        if (isRootNode && suppressAggAtRootLevel && notPivoting) return;
        this.aggregateRowNode(rowNode, measureColumns, pivotColumns);
    }

    private aggregateRowNode(rowNode: RowNode, measureColumns: Column[], pivotColumns: Column[]): void {

        let measureColumnsMissing = measureColumns.length === 0;
        let pivotColumnsMissing = pivotColumns.length === 0;
        let userProvidedGroupRowAggNodes = this.gridOptionsWrapper.getGroupRowAggNodesFunc();

        let aggResult: any;
        if (rowNode.group && userProvidedGroupRowAggNodes) {
            aggResult = userProvidedGroupRowAggNodes(rowNode.childrenAfterFilter);
        } else if (measureColumnsMissing) {
            aggResult = null;
        } else if (rowNode.group && pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, measureColumns);
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
        let result: any = {};
        let pivotColumnDefs = this.pivotStage.getPivotColumnDefs();

        pivotColumnDefs.forEach( pivotColumnDef => {

            let values: any[];
            let valueColumn: Column = pivotColumnDef.pivotValueColumn;

            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                let keys = pivotColumnDef.pivotKeys;
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            } else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, pivotColumnDef.colId);
            }

            result[pivotColumnDef.colId] = this.aggregateValues(values, valueColumn.getAggFunc());

        });

        return result;
    }

    private aggregateRowNodeUsingValuesOnly(rowNode: RowNode, valueColumns: Column[]): any {
        let result: any = {};

        let values2d = this.getValuesNormal(rowNode, valueColumns);

        valueColumns.forEach( (valueColumn: Column, index: number) => {
            result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc());
        });

        return result;
    }

    private getValuesPivotNonLeaf(rowNode: RowNode, colId: string): any[] {
        let values: any[] = [];
        rowNode.childrenAfterFilter.forEach( rowNode => {
            let value = rowNode.aggData[colId];
            values.push(value);
        });
        return values;
    }

    private getValuesFromMappedSet(mappedSet: any, keys: string[], valueColumn: Column): any[] {
        let mapPointer = mappedSet;
        keys.forEach( key => mapPointer = mapPointer ? mapPointer[key] : null );

        if (!mapPointer) {
            return [];
        }

        let values: any = [];
        mapPointer.forEach( (rowNode: RowNode) => {
            let value = this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });

        return values;
    }

    private getValuesNormal(rowNode: RowNode, valueColumns: Column[]): any[][] {
        // create 2d array, of all values for all valueColumns
        let values: any[][] = [];
        valueColumns.forEach( ()=> values.push([]) );

        let valueColumnCount = valueColumns.length;
        let rowCount = rowNode.childrenAfterFilter.length;

        for (let i = 0; i<rowCount; i++) {
            let childNode = rowNode.childrenAfterFilter[i];
            for (let j = 0; j<valueColumnCount; j++) {
                let valueColumn = valueColumns[j];
                let value: any;
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                if (childNode.group) {
                    value = childNode.aggData[valueColumn.getId()];
                } else {
                    value = this.valueService.getValue(valueColumn, childNode);
                }
                values[j].push(value);
            }
        }

        return values;
    }

    private aggregateValues(values: any[], aggFuncOrString: string | IAggFunc): any {

        let aggFunction: IAggFunc;

        if (typeof aggFuncOrString === 'string') {
            aggFunction = this.aggFuncService.getAggFunc(<string>aggFuncOrString);
        } else {
            aggFunction = <IAggFunc> aggFuncOrString;
        }

        if (typeof aggFunction !== 'function') {
            console.error(`ag-Grid: unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }

        let result = aggFunction(values);
        return result;
    }

}
