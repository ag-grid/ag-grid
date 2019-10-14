import {
    Autowired,
    Bean,
    ColDef,
    ColGroupDef,
    Column,
    ColumnController,
    GridOptionsWrapper,
    NumberSequence,
    _
} from "ag-grid-community";

export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}

@Bean('pivotColDefService')
export class PivotColDefService {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult {

        // this is passed to the columnController, to configure the columns and groups we show
        const pivotColumnGroupDefs: (ColDef | ColGroupDef)[] = [];
        // this is used by the aggregation stage, to do the aggregation based on the pivot columns
        const pivotColumnDefs: ColDef[] = [];

        const pivotColumns = this.columnController.getPivotColumns();
        const valueColumns = this.columnController.getValueColumns();
        const levelsDeep = pivotColumns.length;
        const columnIdSequence = new NumberSequence();

        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep, pivotColumns);

        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns, pivotColumns, columnIdSequence);

        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence);

        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        const pivotColumnDefsClone: ColDef[] = pivotColumnDefs.map(colDef => _.cloneObject(colDef));

        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }

    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    private recursivelyAddGroup(parentChildren: (ColGroupDef | ColDef)[],
                                pivotColumnDefs: ColDef[],
                                index: number,
                                uniqueValues: any,
                                pivotKeys: string[],
                                columnIdSequence: NumberSequence,
                                levelsDeep: number,
                                primaryPivotColumns: Column[]): void {

        _.iterateObject(uniqueValues, (key: string, value: any) => {

            const newPivotKeys = pivotKeys.slice(0);
            newPivotKeys.push(key);

            const createGroup = index !== levelsDeep;
            if (createGroup) {
                const groupDef: ColGroupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys,
                    columnGroupShow: 'open',
                    groupId: 'pivot' + columnIdSequence.next()
                };

                parentChildren.push(groupDef);

                this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index + 1, value, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns);
            } else {
                const measureColumns = this.columnController.getValueColumns();
                const valueGroup: ColGroupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys,
                    columnGroupShow: 'open',
                    groupId: 'pivot' + columnIdSequence.next()
                };
                // if no value columns selected, then we insert one blank column, so the user at least sees columns
                // rendered. otherwise the grid would render with no columns (just empty groups) which would give the
                // impression that the grid is broken
                if (measureColumns.length === 0) {
                    // this is the blank column, for when no value columns enabled.
                    const colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                    valueGroup.children.push(colDef);
                    pivotColumnDefs.push(colDef);
                } else {
                    measureColumns.forEach(measureColumn => {
                        const columnName: string | null = this.columnController.getDisplayNameForColumn(measureColumn, 'header');
                        const colDef = this.createColDef(measureColumn, columnName, newPivotKeys, columnIdSequence);
                        colDef.columnGroupShow = 'open';
                        valueGroup.children.push(colDef);
                        pivotColumnDefs.push(colDef);
                    });
                }
                parentChildren.push(valueGroup);
            }
        });
        // sort by either user provided comparator, or our own one
        const colDef = primaryPivotColumns[index - 1].getColDef();
        const userComparator = colDef.pivotComparator;
        const comparator = this.headerNameComparator.bind(this, userComparator);

        parentChildren.sort(comparator);
    }

    private addPivotTotalsToGroups(pivotColumnGroupDefs: (ColDef | ColGroupDef)[],
                                   pivotColumnDefs: ColDef[],
                                   columnIdSequence: NumberSequence) {

        if (!this.gridOptionsWrapper.getPivotColumnGroupTotals()) { return; }

        const insertAfter = this.gridOptionsWrapper.getPivotColumnGroupTotals() === 'after';

        const valueCols = this.columnController.getValueColumns();
        const aggFuncs = valueCols.map(valueCol => valueCol.getAggFunc());

        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('ag-Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }

        // arbitrarily select a value column to use as a template for pivot columns
        const valueColumn = valueCols[0];

        pivotColumnGroupDefs.forEach((groupDef: (ColGroupDef | ColDef)) => {
            this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
        });
    }

    private recursivelyAddPivotTotal(groupDef: (ColGroupDef | ColDef),
                                     pivotColumnDefs: ColDef[],
                                     columnIdSequence: NumberSequence,
                                     valueColumn: Column,
                                     insertAfter: boolean): string[] | null {
        const group = groupDef as ColGroupDef;
        if (!group.children) {
            const def: ColDef = groupDef as ColDef;
            return def.colId ? [def.colId] : null;
        }

        let colIds: string[] = [];

        // need to recurse children first to obtain colIds used in the aggregation stage
        group.children
            .forEach((grp: ColDef | ColGroupDef) => {
                const childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
                if (childColIds) {
                    colIds = colIds.concat(childColIds);
                }
            });

        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {
            //create total colDef using an arbitrary value column as a template
            const totalColDef = this.createColDef(valueColumn, 'Total', groupDef.pivotKeys, columnIdSequence);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();

            // add total colDef to group and pivot colDefs array
            const children = (groupDef as ColGroupDef).children;
            insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
            pivotColumnDefs.push(totalColDef);
        }

        return colIds;
    }

    private addRowGroupTotals(pivotColumnGroupDefs: (ColDef | ColGroupDef)[],
                              pivotColumnDefs: ColDef[],
                              valueColumns: Column[],
                              pivotColumns: Column[],
                              columnIdSequence: NumberSequence) {

        if (!this.gridOptionsWrapper.getPivotRowTotals()) { return; }

        const insertAfter = this.gridOptionsWrapper.getPivotRowTotals() === 'after';

        // order of row group totals depends on position
        const valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();

        for (let i = 0; i < valueCols.length; i++) {
            const valueCol = valueCols[i];

            let colIds: any[] = [];
            pivotColumnGroupDefs.forEach((groupDef: (ColGroupDef | ColDef)) => {
                colIds = colIds.concat(this.extractColIdsForValueColumn(groupDef, valueCol));
            });

            const levelsDeep = pivotColumns.length;
            this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, 1, [], columnIdSequence, levelsDeep, pivotColumns, valueCol, colIds, insertAfter);
        }
    }

    private extractColIdsForValueColumn(groupDef: (ColGroupDef | ColDef), valueColumn: Column): string[] {
        const group = groupDef as ColGroupDef;
        if (!group.children) {
            const colDef = (group as ColDef);
            return colDef.pivotValueColumn === valueColumn && colDef.colId ? [colDef.colId] : [];
        }

        let colIds: string[] = [];
        group.children
            .forEach((grp: ColDef | ColGroupDef) => {
                this.extractColIdsForValueColumn(grp, valueColumn);
                const childColIds = this.extractColIdsForValueColumn(grp, valueColumn);
                colIds = colIds.concat(childColIds);
            });

        return colIds;
    }

    private createRowGroupTotal(parentChildren: (ColGroupDef | ColDef)[],
                                pivotColumnDefs: ColDef[],
                                index: number,
                                pivotKeys: string[],
                                columnIdSequence: NumberSequence,
                                levelsDeep: number,
                                primaryPivotColumns: Column[],
                                valueColumn: Column,
                                colIds: string[],
                                insertAfter: boolean): void {

        const newPivotKeys = pivotKeys.slice(0);
        const createGroup = index !== levelsDeep;
        if (createGroup) {
            const groupDef: ColGroupDef = {
                children: [],
                pivotKeys: newPivotKeys,
                groupId: 'pivot' + columnIdSequence.next()
            };

            insertAfter ? parentChildren.push(groupDef) : parentChildren.unshift(groupDef);

            this.createRowGroupTotal(groupDef.children, pivotColumnDefs, index + 1, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns, valueColumn, colIds, insertAfter);
        } else {
            const measureColumns = this.columnController.getValueColumns();
            const valueGroup: ColGroupDef = {
                children: [],
                pivotKeys: newPivotKeys,
                groupId: 'pivot' + columnIdSequence.next()
            };
            if (measureColumns.length === 0) {
                const colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                valueGroup.children.push(colDef);
                pivotColumnDefs.push(colDef);
            } else {
                const columnName: string | null = this.columnController.getDisplayNameForColumn(valueColumn, 'header');
                const colDef = this.createColDef(valueColumn, columnName, newPivotKeys, columnIdSequence);
                colDef.pivotTotalColumnIds = colIds;
                valueGroup.children.push(colDef);
                pivotColumnDefs.push(colDef);
            }

            insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
        }
    }

    private createColDef(valueColumn: Column | null, headerName: any, pivotKeys: string[] | undefined, columnIdSequence: NumberSequence): ColDef {

        const colDef: ColDef = {};

        if (valueColumn) {
            const colDefToCopy = valueColumn.getColDef();
            _.assign(colDef, colDefToCopy);
            // even if original column was hidden, we always show the pivot value column, otherwise it would be
            // very confusing for people thinking the pivot is broken
            colDef.hide = false;
        }

        colDef.headerName = headerName;
        colDef.colId = 'pivot_' + columnIdSequence.next();

        // pivot columns repeat over field, so it makes sense to use the unique id instead. For example if you want to
        // assign values to pinned bottom rows using setPinnedBottomRowData the value service will use this colId.
        colDef.field = colDef.colId;

        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;
        colDef.filter = false;

        return colDef;
    }

    private sameAggFuncs(aggFuncs: any[]) {
        if (aggFuncs.length == 1) { return true; }
        //check if all aggFunc's match
        for (let i = 1; i < aggFuncs.length; i++) {
            if (aggFuncs[i] !== aggFuncs[0]) { return false; }
        }
        return true;
    }

    private headerNameComparator(userComparator: (a: string | undefined, b: string | undefined) => number, a: ColGroupDef | ColDef, b: ColGroupDef | ColDef): number {
        if (userComparator) {
            return userComparator(a.headerName, b.headerName);
        } else {
            if (a.headerName && !b.headerName) {
                return 1;
            } else if (!a.headerName && b.headerName) {
                return -1;
            }

            // slightly naff here - just to satify typescript
            // really should be &&, but if so ts complains
            // the above if/else checks would deal with either being falsy, so at this stage if either are falsy, both are
            // ..still naff though
            if (!a.headerName || !b.headerName) {
                return 0;
            }

            if (a.headerName < b.headerName) {
                return -1;
            } else if (a.headerName > b.headerName) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}
