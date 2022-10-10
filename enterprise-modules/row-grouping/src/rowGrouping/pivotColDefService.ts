import {
    Autowired,
    Bean,
    BeanStub,
    ColDef,
    ColGroupDef,
    Column,
    ColumnModel,
    _
} from "@ag-grid-community/core";

export interface PivotColDefServiceResult {
    pivotColumnGroupDefs: (ColDef | ColGroupDef)[];
    pivotColumnDefs: ColDef[];
}

@Bean('pivotColDefService')
export class PivotColDefService extends BeanStub {

    public static PIVOT_ROW_TOTAL_PREFIX = 'PivotRowTotal_';

    @Autowired('columnModel') private columnModel: ColumnModel;

    public createPivotColumnDefs(uniqueValues: any): PivotColDefServiceResult {
        // this is passed to the columnModel, to configure the columns and groups we show

        const pivotColumns = this.columnModel.getPivotColumns();
        const valueColumns = this.columnModel.getValueColumns();
        const levelsDeep = pivotColumns.length;

        const pivotColumnGroupDefs: (ColDef | ColGroupDef)[] = this.recursiveBuildGroup(0, uniqueValues, [], levelsDeep, pivotColumns);

        function extractColDefs(input: (ColDef | ColGroupDef)[], arr: ColDef[] = []): ColDef[] {
            input.forEach((def: any) => {
                if (def.children !== undefined) {
                    extractColDefs(def.children, arr);
                } else {
                    arr.push(def);
                }
            });
            return arr;
        }
        const pivotColumnDefs = extractColDefs(pivotColumnGroupDefs);

        // additional columns that contain the aggregated total for each value column per row
        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns);

        // additional group columns that contain child totals for each collapsed child column / group
        this.addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs);

        // additional group columns that contain an aggregated total across all child columns
        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs);

        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        const pivotColumnDefsClone: ColDef[] = pivotColumnDefs.map(colDef => _.cloneObject(colDef));

        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }

    private recursiveBuildGroup(
        index: number,
        uniqueValue: any,
        pivotKeys: string[],
        maxDepth: number,
        primaryPivotColumns: Column[]
    ): ColGroupDef[] | ColDef[]  {
        const measureColumns = this.columnModel.getValueColumns();

        if (index >= maxDepth) { // Base case - build the measure columns
            return this.buildMeasureCols(pivotKeys);
        }

        // sort by either user provided comparator, or our own one
        const primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
        const comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);

        // Base case for the compact layout, instead of recursing build the last layer of groups as measure columns instead
        if (measureColumns.length === 1 && this.gridOptionsWrapper.isRemovePivotHeaderRowWhenSingleValueColumn() && index === maxDepth - 1) {
            const leafCols: ColDef[] = [];

            _.iterateObject(uniqueValue, (key) => {
                const newPivotKeys = [...pivotKeys, key];
                leafCols.push({
                    ...this.createColDef(measureColumns[0], key, newPivotKeys),
                    columnGroupShow: 'open'
                });
            });
            leafCols.sort(comparator);
            return leafCols;
        }
        // Recursive case
        const groups: ColGroupDef[] = [];
        _.iterateObject(uniqueValue, (key, value) => {
            const newPivotKeys = [...pivotKeys, key];
            groups.push({
                children: this.recursiveBuildGroup(index + 1, value, newPivotKeys, maxDepth, primaryPivotColumns),
                headerName: key,
                pivotKeys: newPivotKeys,
                columnGroupShow: 'open',
                groupId: this.generateColumnGroupId(newPivotKeys),
            })
        });
        groups.sort(comparator);
        return groups;
    }

    private buildMeasureCols(
        pivotKeys: string[],
    ): ColDef[] {
        const measureColumns = this.columnModel.getValueColumns();
        if (measureColumns.length === 0) {
            // if no value columns selected, then we insert one blank column, so the user at least sees columns
            // rendered. otherwise the grid would render with no columns (just empty groups) which would give the
            // impression that the grid is broken
            return [this.createColDef(null, '-', pivotKeys)];
        }
        return measureColumns.map((measureCol) => {
            const columnName = this.columnModel.getDisplayNameForColumn(measureCol, 'header');
            return {
                ...this.createColDef(measureCol, columnName, pivotKeys),
                columnGroupShow: 'open'
            };
        });
    };

    private addExpandablePivotGroups(
        pivotColumnGroupDefs: (ColDef | ColGroupDef)[],
        pivotColumnDefs: ColDef[],
    ) {
        if (
            this.gridOptionsWrapper.isSuppressExpandablePivotGroups() ||
            this.gridOptionsWrapper.getPivotColumnGroupTotals()
        ) {
            return;
        }

        const recursivelyAddSubTotals = (
            groupDef: (ColGroupDef | ColDef),
            currentPivotColumnDefs: ColDef[],
            acc: Map<string, string[]>
        ) => {
            const group = groupDef as ColGroupDef;

            if (group.children) {
                const childAcc = new Map();

                group.children.forEach((grp: ColDef | ColGroupDef) => {
                    recursivelyAddSubTotals(grp, currentPivotColumnDefs, childAcc);
                });

                const firstGroup = !group.children.some(child => (child as ColGroupDef).children);

                this.columnModel.getValueColumns().forEach(valueColumn => {
                    const columnName: string | null = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
                    const totalColDef = this.createColDef(valueColumn, columnName, groupDef.pivotKeys);
                    totalColDef.pivotTotalColumnIds = childAcc.get(valueColumn.getColId());

                    totalColDef.columnGroupShow = 'closed';

                    totalColDef.aggFunc = valueColumn.getAggFunc();

                    if (!firstGroup) {
                        // add total colDef to group and pivot colDefs array
                        const children = (groupDef as ColGroupDef).children;
                        children.push(totalColDef);
                        currentPivotColumnDefs.push(totalColDef);
                    }
                });

                this.merge(acc, childAcc);

            } else {
                const def: ColDef = groupDef as ColDef;

                // check that value column exists, i.e. aggFunc is supplied
                if (!def.pivotValueColumn) { return; }

                const pivotValueColId = def.pivotValueColumn.getColId();

                const arr = acc.has(pivotValueColId) ? acc.get(pivotValueColId) : [];
                arr!.push(def.colId!);
                acc.set(pivotValueColId, arr!);
            }
        };

        pivotColumnGroupDefs.forEach((groupDef: (ColGroupDef | ColDef)) => {
            recursivelyAddSubTotals(groupDef, pivotColumnDefs, new Map());
        });
    }

    private addPivotTotalsToGroups(pivotColumnGroupDefs: (ColDef | ColGroupDef)[], pivotColumnDefs: ColDef[]) {
        if (!this.gridOptionsWrapper.getPivotColumnGroupTotals()) { return; }

        const insertAfter = this.gridOptionsWrapper.getPivotColumnGroupTotals() === 'after';

        const valueCols = this.columnModel.getValueColumns();
        const aggFuncs = valueCols.map(valueCol => valueCol.getAggFunc());

        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('AG Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }

        // arbitrarily select a value column to use as a template for pivot columns
        const valueColumn = valueCols[0];

        pivotColumnGroupDefs.forEach((groupDef: (ColGroupDef | ColDef)) => {
            this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter);
        });
    }

    private recursivelyAddPivotTotal(groupDef: (ColGroupDef | ColDef),
                                     pivotColumnDefs: ColDef[],
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
                const childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, valueColumn, insertAfter);
                if (childColIds) {
                    colIds = colIds.concat(childColIds);
                }
            });

        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {

            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            const headerName = localeTextFunc('pivotColumnGroupTotals', 'Total');

            //create total colDef using an arbitrary value column as a template
            const totalColDef = this.createColDef(valueColumn, headerName, groupDef.pivotKeys, true);
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
                              valueColumns: Column[]) {
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

            const withGroup = valueCols.length > 1 || !this.gridOptionsWrapper.isRemovePivotHeaderRowWhenSingleValueColumn();
            this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, valueCol, colIds, insertAfter, withGroup);
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
                                valueColumn: Column,
                                colIds: string[],
                                insertAfter: boolean,
                                addGroup: boolean): void {

        const measureColumns = this.columnModel.getValueColumns();

        let colDef: ColDef;

        if (measureColumns.length === 0) {
            colDef = this.createColDef(null, '-', []);
        } else {
            const columnName: string | null = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
            colDef = this.createColDef(valueColumn, columnName, []);
            colDef.pivotTotalColumnIds = colIds;
        }

        colDef.colId = PivotColDefService.PIVOT_ROW_TOTAL_PREFIX + colDef.colId;
        pivotColumnDefs.push(colDef);

        const valueGroup: ColGroupDef | ColDef = addGroup ? {
            children: [colDef],
            pivotKeys: [],
            groupId: `${PivotColDefService.PIVOT_ROW_TOTAL_PREFIX}_pivotGroup_${valueColumn.getColId()}`,
        } : colDef;

        insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
    }

    private createColDef(valueColumn: Column | null, headerName: any, pivotKeys: string[] | undefined, totalColumn: boolean = false): ColDef {

        const colDef: ColDef = {};

        // This is null when there are no measure columns and we're creating placeholder columns
        if (valueColumn) {
            const colDefToCopy = valueColumn.getColDef();
            Object.assign(colDef, colDefToCopy);
            // even if original column was hidden, we always show the pivot value column, otherwise it would be
            // very confusing for people thinking the pivot is broken
            colDef.hide = false;
        }

        colDef.headerName = headerName;
        colDef.colId = this.generateColumnId(pivotKeys || [], valueColumn && !totalColumn ? valueColumn.getColId() : '');

        // pivot columns repeat over field, so it makes sense to use the unique id instead. For example if you want to
        // assign values to pinned bottom rows using setPinnedBottomRowData the value service will use this colId.
        colDef.field = colDef.colId;
        // this is to support using pinned rows, normally the data will be extracted from the aggData object using the colId
        // however pinned rows still access the data object by field, this prevents values with dots from being treated as complex objects
        colDef.valueGetter = (params) => params.data[params.colDef.field!];

        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;
        if(colDef.filter === true) {
            colDef.filter = 'agNumberColumnFilter';
        }

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
            }

            if (a.headerName > b.headerName) {
                return 1;
            }

            return 0;
        }
    }

    private merge(m1: Map<string, string[]>, m2: Map<any, any>) {
        m2.forEach((value, key, map) => {
            const existingList = m1.has(key) ? m1.get(key) : [];
            const updatedList = [...existingList!, ...value];
            m1.set(key, updatedList);
        });
    }

    private generateColumnGroupId(pivotKeys: string[]): string {
        const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
        return `pivotGroup_${pivotCols.join('-')}_${pivotKeys.join('-')}`;
    }

    private generateColumnId(pivotKeys: string[], measureColumnId: string) {
        const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
        return `pivot_${pivotCols.join('-')}_${pivotKeys.join('-')}_${measureColumnId}`;
    }
}
