import {
    Utils,
    Bean,
    IRowNodeStage,
    Autowired,
    GridOptionsWrapper,
    ColumnController,
    ValueService,
    RowNode,
    PivotService,
    Column
} from "ag-grid/main";

@Bean('aggregationStage')
export class AggregationStage implements IRowNodeStage {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('pivotService') private pivotService: PivotService;

    // it's possible to recompute the aggregate without doing the other parts
    // + gridApi.recomputeAggregates()
    public execute(rootNode: RowNode): any {

        // we don't do aggregation if user provided the groups
        var userProvidedTheGroups = Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        if (userProvidedTheGroups) {
            return;
        }

        var valueColumns = this.columnController.getValueColumns();
        var pivotColumns = this.columnController.getPivotColumns();

        this.recursivelyCreateAggData(rootNode, valueColumns, pivotColumns);
    }

    private recursivelyCreateAggData(rowNode: RowNode, valueColumns: Column[], pivotColumns: Column[]) {

        // aggregate all children first, as we use the result in this nodes calculations
        rowNode.childrenAfterFilter.forEach( child => {
            if (child.group) {
                this.recursivelyCreateAggData(child, valueColumns, pivotColumns);
            }
        });

        this.aggregateRowNode(rowNode, valueColumns, pivotColumns);
    }

    private aggregateRowNode(rowNode: RowNode, valueColumns: Column[], pivotColumns: Column[]): void {
        var valueColumnsMissing = valueColumns.length === 0;
        var pivotColumnsMissing = pivotColumns.length === 0;

        if (valueColumnsMissing) {
            rowNode.data = null;
            return;
        }
        
        rowNode.data = {};

        if (pivotColumnsMissing) {
            valueColumns.forEach( valueColumn => {
                var values = this.getValuesNormal(rowNode, valueColumn);
                rowNode.data[valueColumn.getId()] = this.aggregateValues(values, valueColumn.getAggFunc());
                return;
            });
            return;
        }

        var pivotColumnDefs = this.pivotService.getPivotColumnDefs();
        pivotColumnDefs.forEach( pivotColumnDef => {

            var values: any[];
            var valueColumn = (<any>pivotColumnDef).valueColumn;

            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                var keys = (<any>pivotColumnDef).keys;
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, valueColumn);
            } else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, pivotColumnDef.colId);
            }

            rowNode.data[pivotColumnDef.colId] = this.aggregateValues(values, valueColumn.getAggFunc());

        });

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

    private getValuesNormal(rowNode: RowNode, valueColumn: Column): any[] {
        var values: any[] = [];
        rowNode.childrenAfterFilter.forEach( rowNode => {
            var value:any;
            // if the row is a group, then it will only have an agg result value,
            // which means valueGetter is never used.
            if (rowNode.group) {
                value = rowNode.data[valueColumn.getId()];
            } else {
                value = this.valueService.getValue(valueColumn, rowNode);
            }
            values.push(value);
        });
        return values;
    }
    
    private aggregateValues(values: any[], aggFunc: string): any {
        switch (aggFunc) {
            case Column.AGG_SUM: return this.aggFuncSum(values);
            case Column.AGG_FIRST: return this.aggFuncFirst(values);
            case Column.AGG_LAST: return this.aggFuncLast(values);
            case Column.AGG_MIN: return this.aggFuncMin(values);
            case Column.AGG_MAX: return this.aggFuncMax(values);
        }
    }
    
    private aggFuncSum(input: any[]): any {
        var result: number = null;
        input.forEach( value => {
            if (typeof value === 'number') {
                if (result === null) {
                    result = value;
                } else {
                    result += value;
                }
            }
        });
        return result;
    }

    private aggFuncFirst(input: any[]): any {
        if (input.length>=0) {
            return input[0];
        } else {
            return null;
        }
    }

    private aggFuncLast(input: any[]): any {
        if (input.length>=0) {
            return input[input.length-1];
        } else {
            return null;
        }
    }

    private aggFuncMin(input: any[]): any {
        var result: number = null;
        input.forEach( value => {
            if (typeof value === 'number') {
                if (result === null) {
                    result = value;
                } else if (result > value) {
                    result = value;
                }
            }
        });
        return result;
    }

    private aggFuncMax(input: any[]): any {
        var result: number = null;
        input.forEach( value => {
            if (typeof value === 'number') {
                if (result === null) {
                    result = value;
                } else if (result < value) {
                    result = value;
                }
            }
        });
        return result;
    }
}