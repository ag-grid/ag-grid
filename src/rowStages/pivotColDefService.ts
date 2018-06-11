import {GridOptionsWrapper, NumberSequence, Bean, Autowired, ColumnController, ColDef, ColGroupDef, Utils, Column} from "ag-grid/main";

export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef|ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}

@Bean('pivotColDefService')
export class PivotColDefService {

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult {

        // this is passed to the columnController, to configure the columns and groups we show
        let pivotColumnGroupDefs: (ColDef|ColGroupDef)[] = [];
        // this is used by the aggregation stage, to do the aggregation based on the pivot columns
        let pivotColumnDefs: ColDef[] = [];

        let pivotColumns = this.columnController.getPivotColumns();
        let valueColumns = this.columnController.getValueColumns();
        let levelsDeep = pivotColumns.length;
        let columnIdSequence = new NumberSequence();

        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep, pivotColumns);

        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns, pivotColumns, columnIdSequence);

        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence);

        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        let pivotColumnDefsClone: ColDef[] = pivotColumnDefs.map(colDef => Utils.cloneObject(colDef) );

        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }

    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    private recursivelyAddGroup(parentChildren: (ColGroupDef|ColDef)[],
                                pivotColumnDefs: ColDef[],
                                index: number,
                                uniqueValues: any,
                                pivotKeys: string[],
                                columnIdSequence: NumberSequence,
                                levelsDeep: number,
                                primaryPivotColumns: Column[]): void {

        Utils.iterateObject(uniqueValues, (key: string, value: any)=> {

            let newPivotKeys = pivotKeys.slice(0);
            newPivotKeys.push(key);

            let createGroup = index !== levelsDeep;
            if (createGroup) {
                let groupDef: ColGroupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys,
                    columnGroupShow: 'open',
                    groupId: 'pivot' + columnIdSequence.next()
                };

                parentChildren.push(groupDef);

                this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index+1, value, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns);
            } else {
                let measureColumns = this.columnController.getValueColumns();
                let valueGroup: ColGroupDef = {
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
                    let colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                    valueGroup.children.push(colDef);
                    pivotColumnDefs.push(colDef);
                } else {
                    measureColumns.forEach(measureColumn => {
                        let columnName:string = this.columnController.getDisplayNameForColumn(measureColumn, 'header')
                        let colDef = this.createColDef(measureColumn, columnName, newPivotKeys, columnIdSequence);
                        colDef.columnGroupShow = 'open';
                        valueGroup.children.push(colDef);
                        pivotColumnDefs.push(colDef);
                    });
                }
                parentChildren.push(valueGroup);
            }
        });
        // sort by either user provided comparator, or our own one
        let colDef = primaryPivotColumns[index-1].getColDef();
        let userComparator = colDef.pivotComparator;
        let comparator = this.headerNameComparator.bind(this, userComparator);

        parentChildren.sort(comparator);
    }

    private addPivotTotalsToGroups(pivotColumnGroupDefs: (ColDef|ColGroupDef)[],
                                   pivotColumnDefs: ColDef[],
                                   columnIdSequence: NumberSequence) {

        if(!this.gridOptionsWrapper.getPivotColumnGroupTotals()) return;

        let insertAfter = this.gridOptionsWrapper.getPivotColumnGroupTotals() === 'after';

        let valueCols = this.columnController.getValueColumns();
        let aggFuncs = valueCols.map(valueCol => valueCol.getAggFunc());

        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if(!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('ag-Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }

        // arbitrarily select a value column to use as a template for pivot columns
        let valueColumn = valueCols[0];

        pivotColumnGroupDefs.forEach((groupDef: (ColGroupDef|ColDef)) => {
            this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
        });
    }

    private recursivelyAddPivotTotal(groupDef: (ColGroupDef|ColDef),
                                     pivotColumnDefs: ColDef[],
                                     columnIdSequence: NumberSequence,
                                     valueColumn: Column,
                                     insertAfter: boolean): string[] {
        let group = <ColGroupDef>groupDef;
        if(!group.children) return [(<ColDef>groupDef).colId];

        let colIds: string[] = [];

        // need to recurse children first to obtain colIds used in the aggregation stage
        group.children
            .forEach((grp: ColGroupDef) => {
                let childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
                colIds = colIds.concat(childColIds);
            });

        // only add total colDef if there is more than 1 child node
        if(group.children.length > 1) {
            //create total colDef using an arbitrary value column as a template
            let totalColDef = this.createColDef(valueColumn, 'Total', groupDef.pivotKeys, columnIdSequence);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();

            // add total colDef to group and pivot colDefs array
            let children = (<ColGroupDef>groupDef).children;
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

        if (!this.gridOptionsWrapper.getPivotRowTotals()) return;

        let insertAfter = this.gridOptionsWrapper.getPivotRowTotals() === 'after';

        // order of row group totals depends on position
        let valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();

        for (let i = 0; i < valueCols.length; i++) {
            let valueCol = valueCols[i];

            let colIds: any[] = [];
            pivotColumnGroupDefs.forEach((groupDef: (ColGroupDef | ColDef)) => {
                colIds = colIds.concat(this.extractColIdsForValueColumn(groupDef, valueCol));
            });

            let levelsDeep = pivotColumns.length;
            this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, 1, [], columnIdSequence, levelsDeep, pivotColumns, valueCol, colIds, insertAfter);
        }
    }

    private extractColIdsForValueColumn(groupDef: (ColGroupDef|ColDef), valueColumn: Column): string[] {
        let group = <ColGroupDef>groupDef;
        if (!group.children)  {
            let colDef = (<ColDef>group);
            return colDef.pivotValueColumn === valueColumn ? [colDef.colId] : [];
        }

        let colIds: string[] = [];
        group.children
            .forEach((grp: ColGroupDef) => {
                this.extractColIdsForValueColumn(grp, valueColumn);
                let childColIds = this.extractColIdsForValueColumn(grp, valueColumn);
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

        let newPivotKeys = pivotKeys.slice(0);
        let createGroup = index !== levelsDeep;
        if (createGroup) {
            let groupDef: ColGroupDef = {
                children: [],
                pivotKeys: newPivotKeys,
                groupId: 'pivot' + columnIdSequence.next()
            };

            insertAfter ? parentChildren.push(groupDef) : parentChildren.unshift(groupDef);

            this.createRowGroupTotal(groupDef.children, pivotColumnDefs, index + 1, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns, valueColumn, colIds, insertAfter);
        } else {
            let measureColumns = this.columnController.getValueColumns();
            let valueGroup: ColGroupDef = {
                children: [],
                pivotKeys: newPivotKeys,
                groupId: 'pivot' + columnIdSequence.next()
            };
            if (measureColumns.length === 0) {
                let colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                valueGroup.children.push(colDef);
                pivotColumnDefs.push(colDef);
            } else {
                let columnName: string = this.columnController.getDisplayNameForColumn(valueColumn, 'header');
                let colDef = this.createColDef(valueColumn, columnName, newPivotKeys, columnIdSequence);
                colDef.pivotTotalColumnIds = colIds;
                valueGroup.children.push(colDef);
                pivotColumnDefs.push(colDef);
            }

            insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
        }
    }

    private createColDef(valueColumn: Column, headerName: any, pivotKeys: string[], columnIdSequence: NumberSequence): ColDef {

        let colDef: ColDef = {};

        if (valueColumn) {
            let colDefToCopy = valueColumn.getColDef();
            Utils.assign(colDef, colDefToCopy);
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
        colDef.suppressFilter = true;

        return colDef;
    }

    private sameAggFuncs(aggFuncs: any[]) {
        if(aggFuncs.length == 1) return true;
        //check if all aggFunc's match
        for (let i = 1; i < aggFuncs.length; i++) {
            if (aggFuncs[i] !== aggFuncs[0]) return false;
        }
        return true;
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