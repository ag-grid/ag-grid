import {NumberSequence, Bean, Autowired, ColumnController, ColDef, ColGroupDef, Utils, Column} from "ag-grid/main";

export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef|ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}

@Bean('pivotColDefService')
export class PivotColDefService {

    @Autowired('columnController') private columnController: ColumnController;

    public createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult {

        // this is passed to the columnController, to configure the columns and groups we show
        var pivotColumnGroupDefs: (ColDef|ColGroupDef)[] = [];
        // this is used by the aggregation stage, to do the aggregation based on the pivot columns
        var pivotColumnDefs: ColDef[] = [];

        var pivotColumns = this.columnController.getPivotColumns();
        var levelsDeep = pivotColumns.length;
        var columnIdSequence = new NumberSequence();

        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep, pivotColumns);

        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        var pivotColumnDefsClone: ColDef[] = pivotColumnDefs.map(colDef => Utils.cloneObject(colDef) );

        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }

    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    private recursivelyAddGroup(parentChildren: (ColGroupDef|ColDef)[], pivotColumnDefs: ColDef[], index: number, uniqueValues: any,
                                pivotKeys: string[], columnIdSequence: NumberSequence, levelsDeep: number, primaryPivotColumns: Column[]): void {

        Utils.iterateObject(uniqueValues, (key: string, value: any)=> {

            var newPivotKeys = pivotKeys.slice(0);
            newPivotKeys.push(key);

            var createGroup = index !== levelsDeep;
            if (createGroup) {
                var groupDef: ColGroupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys
                };
                parentChildren.push(groupDef);
                this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index+1, value, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns);
            } else {

                var measureColumns = this.columnController.getValueColumns();
                var valueGroup: ColGroupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys
                };
                parentChildren.push(valueGroup);
                // if no value columns selected, then we insert one blank column, so the user at least sees columns
                // rendered. otherwise the grid would render with no columns (just empty groups) which would give the
                // impression that the grid is broken
                if (measureColumns.length===0) {
                    // this is the blank column, for when no value columns enabled.
                    var colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                    valueGroup.children.push(colDef);
                    pivotColumnDefs.push(colDef);
                } else {
                    measureColumns.forEach( measureColumn => {
                        var colDef = this.createColDef(measureColumn, measureColumn.getColDef().headerName, newPivotKeys, columnIdSequence);
                        valueGroup.children.push(colDef);
                        pivotColumnDefs.push(colDef);
                    });
                }
            }
        });
        // sort by either user provided comparator, or our own one
        var colDef = primaryPivotColumns[index-1].getColDef();
        var userComparator = colDef.pivotComparator;
        var comparator = this.headerNameComparator.bind(this, userComparator);
        parentChildren.sort(comparator);
    }

    private createColDef(valueColumn: Column, headerName: any, pivotKeys: string[], columnIdSequence: NumberSequence): ColDef {

        var colDef: ColDef = {};

        if (valueColumn) {
            var colDefToCopy = valueColumn.getColDef();
            Utils.assign(colDef, colDefToCopy);
            // even if original column was hidden, we always show the pivot value column, otherwise it would be
            // very confusing for people thinking the pivot is broken
            colDef.hide = false;
        }

        colDef.headerName = headerName;
        colDef.colId = 'pivot_' + columnIdSequence.next();

        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;

        return colDef;
    }

    private headerNameComparator(userComparator: (a: string, b: string)=>number, a: ColGroupDef|ColDef, b: ColGroupDef|ColDef): number {
        if (userComparator) {
            return userComparator(a.headerName, b.headerName);
        } else {
            if (a.headerName<b.headerName) {
                return -1;
            } else if (a.headerName>b.headerName) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}