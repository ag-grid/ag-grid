import {NumberSequence, Bean, Autowired, ColumnController, ColDef, ColGroupDef, Utils, Column} from "ag-grid/main";

export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef|ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}

@Bean('pivotColDefService')
export class PivotColDefService {

    @Autowired('columnController') private columnController: ColumnController;

    public createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult {

        var pivotColumnGroupDefs: (ColDef|ColGroupDef)[] = [];
        var pivotColumnDefs: ColDef[] = [];

        var pivotColumns = this.columnController.getPivotColumns();
        var levelsDeep = pivotColumns.length;
        var columnIdSequence = new NumberSequence();

        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep);

        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefs
        };
    }

    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    private recursivelyAddGroup(parentChildren: (ColGroupDef|ColDef)[], pivotColumnDefs: ColDef[], index: number, uniqueValues: any,
                                pivotKeys: string[], columnIdSequence: NumberSequence, levelsDeep: number): void {

        Utils.iterateObject(uniqueValues, (key: string, value: any)=> {

            var newPivotKeys = pivotKeys.slice(0);
            newPivotKeys.push(key);

            var createGroup = index !== levelsDeep;
            if (createGroup) {
                var groupDef: ColGroupDef = {
                    children: [],
                    headerName: key
                };
                parentChildren.push(groupDef);
                this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index+1, value, newPivotKeys, columnIdSequence, levelsDeep);
            } else {

                var measureColumns = this.columnController.getMeasureColumns();
                var valueGroup: ColGroupDef = {
                    children: [],
                    headerName: key
                };
                parentChildren.push(valueGroup);
                measureColumns.forEach( measureColumn => {
                    var colDef = this.createColDef(measureColumn, measureColumn.getColDef().headerName, newPivotKeys, columnIdSequence);
                    valueGroup.children.push(colDef);
                    pivotColumnDefs.push(colDef);
                });
                valueGroup.children.sort(this.headerNameComparator.bind(this));

            }
            parentChildren.sort(this.headerNameComparator.bind(this));
        });
    }

    private createColDef(valueColumn: Column, headerName: any, pivotKeys: string[], columnIdSequence: NumberSequence): ColDef {

        var colDef: ColDef = {};

        if (valueColumn) {
            var colDefToCopy = valueColumn.getColDef();
            Utils.assign(colDef, colDefToCopy);
        }

        colDef.valueGetter = null;
        colDef.headerName = headerName;
        colDef.colId = 'pivot_' + columnIdSequence.next();

        colDef.pivotKeys = pivotKeys;
        colDef.pivotMeasureColumn = valueColumn;

        return colDef;
    }

    private headerNameComparator(a: ColGroupDef|ColDef, b: ColGroupDef|ColDef): number {
        if (a.headerName<b.headerName) {
            return -1;
        } else if (a.headerName>b.headerName) {
            return 1;
        } else {
            return 0;
        }
    }
}