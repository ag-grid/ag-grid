import {Utils as _} from "ag-grid/main";
import {Bean} from "ag-grid/main";
import {IRowNodeStage} from "ag-grid/main";
import {Autowired} from "ag-grid/main";
import {GridOptionsWrapper} from "ag-grid/main";
import {ColumnController} from "ag-grid/main";
import {ValueService} from "ag-grid/main";
import {RowNode} from "ag-grid/main";
import {Column} from "ag-grid/main";

@Bean('aggregationStage')
export class AggregationStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public execute(rowsToAgg: RowNode[]): RowNode[] {

        var groupAggFunction = this.gridOptionsWrapper.getGroupAggFunction();
        if (typeof groupAggFunction === 'function') {
            this.recursivelyCreateAggData(rowsToAgg, groupAggFunction, 0);
            return;
        }

        var valueColumns = this.columnController.getValueColumns();
        if (valueColumns && valueColumns.length > 0) {
            var aggFunction = this.aggregateUsingValueColumns.bind(this, valueColumns);
            this.recursivelyCreateAggData(rowsToAgg, aggFunction, 0);
        } else {
            // if no agg data, need to clear out any previous items, when can be left behind
            // if user is creating / removing columns using the tool panel.
            // one exception - don't do this if already grouped, as this breaks the File Explorer example!!
            // to fix another day - how do we reset when the user provided the data??
            if (_.missing(this.gridOptionsWrapper.getNodeChildDetailsFunc())) {
                this.recursivelyClearAggData(rowsToAgg);
            }
        }

        return rowsToAgg;
    }

    private recursivelyClearAggData(nodes: RowNode[]): void {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyClearAggData(node.childrenAfterFilter);
                node.data = null;
            }
        }
    }

    private recursivelyCreateAggData(nodes: RowNode[], groupAggFunction: any, level: number) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            var node = nodes[i];
            if (node.group) {
                // agg function needs to start at the bottom, so traverse first
                this.recursivelyCreateAggData(node.childrenAfterFilter, groupAggFunction, level++);
                // after traversal, we can now do the agg at this level

                var pivotColumns = this.columnController.getPivotColumns();

                // if pivot, then result for each pivot
                if (pivotColumns.length > 0) {
                    // if lowest level then reduce from list
                    data = this.recursePivot(node.childrenMapped, pivotColumns, 0);
                    // else extract from each child and add
                } else {
                    var data = groupAggFunction(node.childrenAfterFilter, level);
                }

                node.data = data;
                // if we are grouping, then it's possible there is a sibling footer
                // to the group, so update the data here also if there is one
                if (node.sibling) {
                    node.sibling.data = data;
                }
            }
        }
    }

    private recursePivot(map: any, pivotColumns: Column[], index: number): void {

    }

    private aggregateUsingValueColumns(valueColumns: Column[], rows: RowNode[]): any {
        var result = <any>{};

        for (var j = 0; j < valueColumns.length; j++) {
            var valueColumn = valueColumns[j];
            var colField = valueColumn.getColDef().field;
            if (!colField) {
                console.log('ag-Grid: you need to provide a field for all value columns so that ' +
                    'the grid knows what field to store the result in. so even if using a valueGetter, ' +
                    'the result will not be stored in a value getter.');
            }

            result[colField] = this.aggregateColumn(rows, valueColumn.getAggFunc(), colField, valueColumn);
        }

        return result;
    }

    // executes the agg function on a list and returns the result
    private aggregateColumn(rowNodes: RowNode[], aggFunc: string, colField: string, valueColumn: Column) {
        var resultForColumn: number = null;
        for (var i = 0; i < rowNodes.length; i++) {
            var rowNode = rowNodes[i];
            // if the row is a group, then it will only have an agg result value,
            // which means valueGetter is never used.
            var thisColumnValue: any;
            if (rowNode.group) {
                thisColumnValue = rowNode.data[colField];
            } else {
                thisColumnValue = this.valueService.getValue(valueColumn, rowNode);
            }
            // only include if the value is a number
            if (typeof thisColumnValue === 'number') {

                var firstRow = i === 0;
                var lastRow = i===(rowNodes.length-1);

                switch (aggFunc) {
                    case Column.AGG_SUM :
                        resultForColumn += thisColumnValue;
                        break;
                    case Column.AGG_MIN :
                        if (resultForColumn === null) {
                            resultForColumn = thisColumnValue;
                        } else if (resultForColumn > thisColumnValue) {
                            resultForColumn = thisColumnValue;
                        }
                        break;
                    case Column.AGG_MAX :
                        if (resultForColumn === null) {
                            resultForColumn = thisColumnValue;
                        } else if (resultForColumn < thisColumnValue) {
                            resultForColumn = thisColumnValue;
                        }
                        break;
                    case Column.AGG_FIRST :
                        if (firstRow) {
                            resultForColumn = thisColumnValue;
                        }
                        break;
                    case Column.AGG_LAST :
                        if (lastRow) {
                            resultForColumn = thisColumnValue;
                        }
                        break;
                }

            }
        }
        return resultForColumn;
    }
}