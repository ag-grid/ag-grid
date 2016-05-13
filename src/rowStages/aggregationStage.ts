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
    public execute(rowNode: RowNode): any {

        // we don't do aggregation if user provided the groups
        var userProvidedTheGroups = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (userProvidedTheGroups) {
            return;
        }

        var valueColumns = this.columnController.getValueColumns();
        this.recursivelyCreateAggData(rowNode, valueColumns);
    }

    private recursivelyCreateAggData(rowNode: RowNode, valueColumns: Column[]) {
        var doingAggregation = valueColumns.length > 0;

        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach( child => {
            if (child.group) {
                this.recursivelyCreateAggData(child, valueColumns);
            }
        });

        if (doingAggregation) {
            rowNode.data = this.aggregateUsingValueColumns(valueColumns, rowNode.childrenAfterFilter);
        } else {
            rowNode.data = null;
        }
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