import {
    Utils,
    Bean,
    IRowNodeStage,
    Autowired,
    GridOptionsWrapper,
    ColumnController,
    ValueService,
    RowNode,
    Column,
    StageExecuteParams,
    IAggFunc
} from "ag-grid/main";
import {PivotStage} from "./pivotStage";
import {AggFuncService} from "../aggregation/aggFuncService";

@Bean('aggregationStage')
export class AggregationStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('pivotStage') private pivotStage: PivotStage;
    @Autowired('aggFuncService') private aggFuncService: AggFuncService;

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public execute(params: StageExecuteParams): any {
        let rootNode = params.rowNode;

        // we don't do aggregation if user provided the groups
        var rowsAlreadyGrouped = Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (rowsAlreadyGrouped) {
            return;
        }

        var pivotActive = this.columnController.isPivotActive();

        var measureColumns = this.columnController.getValueColumns();
        var pivotColumns = pivotActive ? this.columnController.getPivotColumns() : [];

        this.recursivelyCreateAggData(rootNode, measureColumns, pivotColumns);
    }

    private recursivelyCreateAggData(rowNode: RowNode, measureColumns: Column[], pivotColumns: Column[]) {

        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach( child => {
            if (child.group) {
                this.recursivelyCreateAggData(child, measureColumns, pivotColumns);
            }
        });

        this.aggregateRowNode(rowNode, measureColumns, pivotColumns);
    }

    private aggregateRowNode(rowNode: RowNode, measureColumns: Column[], pivotColumns: Column[]): void {

        var measureColumnsMissing = measureColumns.length === 0;
        var pivotColumnsMissing = pivotColumns.length === 0;
        var userProvidedGroupRowAggNodes = this.gridOptionsWrapper.getGroupRowAggNodesFunc();

        var aggResult: any;
        if (userProvidedGroupRowAggNodes) {
            aggResult = userProvidedGroupRowAggNodes(rowNode.childrenAfterFilter);
        } else if (measureColumnsMissing) {
            aggResult = null;
        } else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, measureColumns);
        } else {
            aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
        }

        rowNode.data = aggResult;

        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            rowNode.sibling.data = aggResult;
        }
    }

    private aggregateRowNodeUsingValuesAndPivot(rowNode: RowNode): any {
        var result: any = {};
        var pivotColumnDefs = this.pivotStage.getPivotColumnDefs();

        pivotColumnDefs.forEach( pivotColumnDef => {

            var values: any[];
            var valueColumn: Column = pivotColumnDef.pivotValueColumn;

            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                var keys = pivotColumnDef.pivotKeys;
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            } else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, pivotColumnDef.colId);
            }

            result[pivotColumnDef.colId] = this.aggregateValues(values, valueColumn.getAggFunc());

        });

        this.putInValueForGroupNode(result, rowNode);

        return result;
    }

    private aggregateRowNodeUsingValuesOnly(rowNode: RowNode, valueColumns: Column[]): any {
        var result: any = {};

        var values2d = this.getValuesNormal(rowNode, valueColumns);

        valueColumns.forEach( (valueColumn: Column, index: number) => {
            result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc());
        });

        this.putInValueForGroupNode(result, rowNode);

        return result;
    }

    // when doing copy to clipboard, the valueService is used to get the value for the cell.
    // the problem is that the valueService is wired to get the values directly from the data
    // using column ID's (rather than, eg, valueGetters), so we need to have the value of the
    // group key in the data, so when copy to clipboard is executed, the value is picked up correctly.
    private putInValueForGroupNode(result: any, rowNode: RowNode): void {
        result[ColumnController.GROUP_AUTO_COLUMN_ID] = rowNode.key;
    }

    private getValuesPivotNonLeaf(rowNode: RowNode, colId: string): any[] {
        var values: any[] = [];
        rowNode.childrenAfterFilter.forEach( rowNode => {
            var value = rowNode.data[colId];
            values.push(value);
        });
        return values;
    }

    private getValuesFromMappedSet(mappedSet: any, keys: string[], valueColumn: Column): any[] {
        var mapPointer = mappedSet;
        keys.forEach( key => mapPointer = mapPointer ? mapPointer[key] : null );

        if (!mapPointer) {
            return [];
        }

        var values: any = [];
        mapPointer.forEach( (rowNode: RowNode) => {
            var value = this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });

        return values;
    }

    private getValuesNormal(rowNode: RowNode, valueColumns: Column[]): any[][] {
        // create 2d array, of all values for all valueColumns
        var values: any[][] = [];
        valueColumns.forEach( ()=> values.push([]) );

        var valueColumnCount = valueColumns.length;
        var rowCount = rowNode.childrenAfterFilter.length;

        for (var i = 0; i<rowCount; i++) {
            var childNode = rowNode.childrenAfterFilter[i];
            for (var j = 0; j<valueColumnCount; j++) {
                var valueColumn = valueColumns[j];
                var value: any;
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                if (childNode.group) {
                    value = childNode.data[valueColumn.getId()];
                } else {
                    value = this.valueService.getValueUsingSpecificData(valueColumn, childNode.data, childNode);
                }
                values[j].push(value);
            }
        }

        return values;
    }

    private aggregateValues(values: any[], aggFuncOrString: string | IAggFunc): any {

        var aggFunction: IAggFunc;

        if (typeof aggFuncOrString === 'string') {
            aggFunction = this.aggFuncService.getAggFunc(<string>aggFuncOrString);
        } else {
            aggFunction = <IAggFunc> aggFuncOrString;
        }

        if (typeof aggFunction !== 'function') {
            console.error(`ag-Grid: unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }

        var result = aggFunction(values);
        return result;
    }

}
