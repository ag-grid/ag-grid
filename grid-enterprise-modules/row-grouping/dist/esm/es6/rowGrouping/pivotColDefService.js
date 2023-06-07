var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PivotColDefService_1;
import { Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
let PivotColDefService = PivotColDefService_1 = class PivotColDefService extends BeanStub {
    createPivotColumnDefs(uniqueValues) {
        // this is passed to the columnModel, to configure the columns and groups we show
        const pivotColumns = this.columnModel.getPivotColumns();
        const valueColumns = this.columnModel.getValueColumns();
        const levelsDeep = pivotColumns.length;
        const pivotColumnGroupDefs = this.recursiveBuildGroup(0, uniqueValues, [], levelsDeep, pivotColumns);
        function extractColDefs(input, arr = []) {
            input.forEach((def) => {
                if (def.children !== undefined) {
                    extractColDefs(def.children, arr);
                }
                else {
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
        const pivotColumnDefsClone = pivotColumnDefs.map(colDef => _.cloneObject(colDef));
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }
    recursiveBuildGroup(index, uniqueValue, pivotKeys, maxDepth, primaryPivotColumns) {
        const measureColumns = this.columnModel.getValueColumns();
        if (index >= maxDepth) { // Base case - build the measure columns
            return this.buildMeasureCols(pivotKeys);
        }
        // sort by either user provided comparator, or our own one
        const primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
        const comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);
        // Base case for the compact layout, instead of recursing build the last layer of groups as measure columns instead
        if (measureColumns.length === 1 && this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn') && index === maxDepth - 1) {
            const leafCols = [];
            _.iterateObject(uniqueValue, (key) => {
                const newPivotKeys = [...pivotKeys, key];
                leafCols.push(Object.assign(Object.assign({}, this.createColDef(measureColumns[0], key, newPivotKeys)), { columnGroupShow: 'open' }));
            });
            leafCols.sort(comparator);
            return leafCols;
        }
        // Recursive case
        const groups = [];
        _.iterateObject(uniqueValue, (key, value) => {
            const newPivotKeys = [...pivotKeys, key];
            groups.push({
                children: this.recursiveBuildGroup(index + 1, value, newPivotKeys, maxDepth, primaryPivotColumns),
                headerName: key,
                pivotKeys: newPivotKeys,
                columnGroupShow: 'open',
                groupId: this.generateColumnGroupId(newPivotKeys),
            });
        });
        groups.sort(comparator);
        return groups;
    }
    buildMeasureCols(pivotKeys) {
        const measureColumns = this.columnModel.getValueColumns();
        if (measureColumns.length === 0) {
            // if no value columns selected, then we insert one blank column, so the user at least sees columns
            // rendered. otherwise the grid would render with no columns (just empty groups) which would give the
            // impression that the grid is broken
            return [this.createColDef(null, '-', pivotKeys)];
        }
        return measureColumns.map((measureCol) => {
            const columnName = this.columnModel.getDisplayNameForColumn(measureCol, 'header');
            return Object.assign(Object.assign({}, this.createColDef(measureCol, columnName, pivotKeys)), { columnGroupShow: 'open' });
        });
    }
    ;
    addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs) {
        if (this.gridOptionsService.is('suppressExpandablePivotGroups') ||
            this.gridOptionsService.get('pivotColumnGroupTotals')) {
            return;
        }
        const recursivelyAddSubTotals = (groupDef, currentPivotColumnDefs, acc) => {
            const group = groupDef;
            if (group.children) {
                const childAcc = new Map();
                group.children.forEach((grp) => {
                    recursivelyAddSubTotals(grp, currentPivotColumnDefs, childAcc);
                });
                const firstGroup = !group.children.some(child => child.children);
                this.columnModel.getValueColumns().forEach(valueColumn => {
                    const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
                    const totalColDef = this.createColDef(valueColumn, columnName, groupDef.pivotKeys);
                    totalColDef.pivotTotalColumnIds = childAcc.get(valueColumn.getColId());
                    totalColDef.columnGroupShow = 'closed';
                    totalColDef.aggFunc = valueColumn.getAggFunc();
                    if (!firstGroup) {
                        // add total colDef to group and pivot colDefs array
                        const children = groupDef.children;
                        children.push(totalColDef);
                        currentPivotColumnDefs.push(totalColDef);
                    }
                });
                this.merge(acc, childAcc);
            }
            else {
                const def = groupDef;
                // check that value column exists, i.e. aggFunc is supplied
                if (!def.pivotValueColumn) {
                    return;
                }
                const pivotValueColId = def.pivotValueColumn.getColId();
                const arr = acc.has(pivotValueColId) ? acc.get(pivotValueColId) : [];
                arr.push(def.colId);
                acc.set(pivotValueColId, arr);
            }
        };
        pivotColumnGroupDefs.forEach((groupDef) => {
            recursivelyAddSubTotals(groupDef, pivotColumnDefs, new Map());
        });
    }
    addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs) {
        if (!this.gridOptionsService.get('pivotColumnGroupTotals')) {
            return;
        }
        const insertAfter = this.gridOptionsService.get('pivotColumnGroupTotals') === 'after';
        const valueCols = this.columnModel.getValueColumns();
        const aggFuncs = valueCols.map(valueCol => valueCol.getAggFunc());
        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('AG Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }
        // arbitrarily select a value column to use as a template for pivot columns
        const valueColumn = valueCols[0];
        pivotColumnGroupDefs.forEach((groupDef) => {
            this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter);
        });
    }
    recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter) {
        const group = groupDef;
        if (!group.children) {
            const def = groupDef;
            return def.colId ? [def.colId] : null;
        }
        let colIds = [];
        // need to recurse children first to obtain colIds used in the aggregation stage
        group.children
            .forEach((grp) => {
            const childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, valueColumn, insertAfter);
            if (childColIds) {
                colIds = colIds.concat(childColIds);
            }
        });
        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            const headerName = localeTextFunc('pivotColumnGroupTotals', 'Total');
            //create total colDef using an arbitrary value column as a template
            const totalColDef = this.createColDef(valueColumn, headerName, groupDef.pivotKeys, true);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();
            // add total colDef to group and pivot colDefs array
            const children = groupDef.children;
            insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
            pivotColumnDefs.push(totalColDef);
        }
        return colIds;
    }
    addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns) {
        if (!this.gridOptionsService.get('pivotRowTotals')) {
            return;
        }
        const insertAfter = this.gridOptionsService.get('pivotRowTotals') === 'after';
        // order of row group totals depends on position
        const valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
        for (let i = 0; i < valueCols.length; i++) {
            const valueCol = valueCols[i];
            let colIds = [];
            pivotColumnGroupDefs.forEach((groupDef) => {
                colIds = colIds.concat(this.extractColIdsForValueColumn(groupDef, valueCol));
            });
            const withGroup = valueCols.length > 1 || !this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn');
            this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, valueCol, colIds, insertAfter, withGroup);
        }
    }
    extractColIdsForValueColumn(groupDef, valueColumn) {
        const group = groupDef;
        if (!group.children) {
            const colDef = group;
            return colDef.pivotValueColumn === valueColumn && colDef.colId ? [colDef.colId] : [];
        }
        let colIds = [];
        group.children
            .forEach((grp) => {
            this.extractColIdsForValueColumn(grp, valueColumn);
            const childColIds = this.extractColIdsForValueColumn(grp, valueColumn);
            colIds = colIds.concat(childColIds);
        });
        return colIds;
    }
    createRowGroupTotal(parentChildren, pivotColumnDefs, valueColumn, colIds, insertAfter, addGroup) {
        const measureColumns = this.columnModel.getValueColumns();
        let colDef;
        if (measureColumns.length === 0) {
            colDef = this.createColDef(null, '-', []);
        }
        else {
            const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
            colDef = this.createColDef(valueColumn, columnName, []);
            colDef.pivotTotalColumnIds = colIds;
        }
        colDef.colId = PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX + colDef.colId;
        pivotColumnDefs.push(colDef);
        const valueGroup = addGroup ? {
            children: [colDef],
            pivotKeys: [],
            groupId: `${PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX}_pivotGroup_${valueColumn.getColId()}`,
        } : colDef;
        insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
    }
    createColDef(valueColumn, headerName, pivotKeys, totalColumn = false) {
        const colDef = {};
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
        colDef.valueGetter = (params) => { var _a; return (_a = params.data) === null || _a === void 0 ? void 0 : _a[params.colDef.field]; };
        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;
        if (colDef.filter === true) {
            colDef.filter = 'agNumberColumnFilter';
        }
        return colDef;
    }
    sameAggFuncs(aggFuncs) {
        if (aggFuncs.length == 1) {
            return true;
        }
        //check if all aggFunc's match
        for (let i = 1; i < aggFuncs.length; i++) {
            if (aggFuncs[i] !== aggFuncs[0]) {
                return false;
            }
        }
        return true;
    }
    headerNameComparator(userComparator, a, b) {
        if (userComparator) {
            return userComparator(a.headerName, b.headerName);
        }
        else {
            if (a.headerName && !b.headerName) {
                return 1;
            }
            else if (!a.headerName && b.headerName) {
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
    merge(m1, m2) {
        m2.forEach((value, key, map) => {
            const existingList = m1.has(key) ? m1.get(key) : [];
            const updatedList = [...existingList, ...value];
            m1.set(key, updatedList);
        });
    }
    generateColumnGroupId(pivotKeys) {
        const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
        return `pivotGroup_${pivotCols.join('-')}_${pivotKeys.join('-')}`;
    }
    generateColumnId(pivotKeys, measureColumnId) {
        const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
        return `pivot_${pivotCols.join('-')}_${pivotKeys.join('-')}_${measureColumnId}`;
    }
};
PivotColDefService.PIVOT_ROW_TOTAL_PREFIX = 'PivotRowTotal_';
__decorate([
    Autowired('columnModel')
], PivotColDefService.prototype, "columnModel", void 0);
PivotColDefService = PivotColDefService_1 = __decorate([
    Bean('pivotColDefService')
], PivotColDefService);
export { PivotColDefService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGl2b3RDb2xEZWZTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL3Bpdm90Q29sRGVmU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQUtSLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBUWpDLElBQWEsa0JBQWtCLDBCQUEvQixNQUFhLGtCQUFtQixTQUFRLFFBQVE7SUFNckMscUJBQXFCLENBQUMsWUFBaUI7UUFDMUMsaUZBQWlGO1FBRWpGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4RCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBRXZDLE1BQU0sb0JBQW9CLEdBQTZCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFL0gsU0FBUyxjQUFjLENBQUMsS0FBK0IsRUFBRSxNQUFnQixFQUFFO1lBQ3ZFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ3JDO3FCQUFNO29CQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2pCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7UUFDRCxNQUFNLGVBQWUsR0FBRyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUU3RCxxRkFBcUY7UUFDckYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUU1RSw2RkFBNkY7UUFDN0YsSUFBSSxDQUFDLHdCQUF3QixDQUFDLG9CQUFvQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXJFLHFGQUFxRjtRQUNyRixJQUFJLENBQUMsc0JBQXNCLENBQUMsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFbkUsd0dBQXdHO1FBQ3hHLDZHQUE2RztRQUM3RyxpQ0FBaUM7UUFDakMsTUFBTSxvQkFBb0IsR0FBYSxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTVGLE9BQU87WUFDSCxvQkFBb0IsRUFBRSxvQkFBb0I7WUFDMUMsZUFBZSxFQUFFLG9CQUFvQjtTQUN4QyxDQUFDO0lBQ04sQ0FBQztJQUVPLG1CQUFtQixDQUN2QixLQUFhLEVBQ2IsV0FBZ0IsRUFDaEIsU0FBbUIsRUFDbkIsUUFBZ0IsRUFDaEIsbUJBQTZCO1FBRTdCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFMUQsSUFBSSxLQUFLLElBQUksUUFBUSxFQUFFLEVBQUUsd0NBQXdDO1lBQzdELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsMERBQTBEO1FBQzFELE1BQU0sc0JBQXNCLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDdEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFaEcsbUhBQW1IO1FBQ25ILElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQywyQ0FBMkMsQ0FBQyxJQUFJLEtBQUssS0FBSyxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ2xJLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztZQUU5QixDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNqQyxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxRQUFRLENBQUMsSUFBSSxpQ0FDTixJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLEtBQzFELGVBQWUsRUFBRSxNQUFNLElBQ3pCLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUIsT0FBTyxRQUFRLENBQUM7U0FDbkI7UUFDRCxpQkFBaUI7UUFDakIsTUFBTSxNQUFNLEdBQWtCLEVBQUUsQ0FBQztRQUNqQyxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN4QyxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ1IsUUFBUSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixDQUFDO2dCQUNqRyxVQUFVLEVBQUUsR0FBRztnQkFDZixTQUFTLEVBQUUsWUFBWTtnQkFDdkIsZUFBZSxFQUFFLE1BQU07Z0JBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDO2FBQ3BELENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN4QixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU8sZ0JBQWdCLENBQ3BCLFNBQW1CO1FBRW5CLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDMUQsSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3QixtR0FBbUc7WUFDbkcscUdBQXFHO1lBQ3JHLHFDQUFxQztZQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDcEQ7UUFDRCxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRix1Q0FDTyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLEtBQ3ZELGVBQWUsRUFBRSxNQUFNLElBQ3pCO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztJQUVNLHdCQUF3QixDQUM1QixvQkFBOEMsRUFDOUMsZUFBeUI7UUFFekIsSUFDSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLCtCQUErQixDQUFDO1lBQzNELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsRUFDdkQ7WUFDRSxPQUFPO1NBQ1Y7UUFFRCxNQUFNLHVCQUF1QixHQUFHLENBQzVCLFFBQWdDLEVBQ2hDLHNCQUFnQyxFQUNoQyxHQUEwQixFQUM1QixFQUFFO1lBQ0EsTUFBTSxLQUFLLEdBQUcsUUFBdUIsQ0FBQztZQUV0QyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRTNCLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBeUIsRUFBRSxFQUFFO29CQUNqRCx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQyxDQUFDO2dCQUVILE1BQU0sVUFBVSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBRSxLQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVsRixJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtvQkFDckQsTUFBTSxVQUFVLEdBQWtCLElBQUksQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNsRyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNuRixXQUFXLENBQUMsbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFFdkUsV0FBVyxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7b0JBRXZDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUUvQyxJQUFJLENBQUMsVUFBVSxFQUFFO3dCQUNiLG9EQUFvRDt3QkFDcEQsTUFBTSxRQUFRLEdBQUksUUFBd0IsQ0FBQyxRQUFRLENBQUM7d0JBQ3BELFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQzNCLHNCQUFzQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDNUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFFN0I7aUJBQU07Z0JBQ0gsTUFBTSxHQUFHLEdBQVcsUUFBa0IsQ0FBQztnQkFFdkMsMkRBQTJEO2dCQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO29CQUFFLE9BQU87aUJBQUU7Z0JBRXRDLE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFFeEQsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNyRSxHQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFNLENBQUMsQ0FBQztnQkFDdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsR0FBSSxDQUFDLENBQUM7YUFDbEM7UUFDTCxDQUFDLENBQUM7UUFFRixvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFnQyxFQUFFLEVBQUU7WUFDOUQsdUJBQXVCLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsb0JBQThDLEVBQUUsZUFBeUI7UUFDcEcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV2RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEtBQUssT0FBTyxDQUFDO1FBRXRGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDckQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLHNGQUFzRjtRQUN0RixJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNsRSxxR0FBcUc7WUFDckcsT0FBTztTQUNWO1FBRUQsMkVBQTJFO1FBQzNFLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFnQyxFQUFFLEVBQUU7WUFDOUQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZGLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHdCQUF3QixDQUFDLFFBQWdDLEVBQ2hDLGVBQXlCLEVBQ3pCLFdBQW1CLEVBQ25CLFdBQW9CO1FBQ2pELE1BQU0sS0FBSyxHQUFHLFFBQXVCLENBQUM7UUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDakIsTUFBTSxHQUFHLEdBQVcsUUFBa0IsQ0FBQztZQUN2QyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDekM7UUFFRCxJQUFJLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFFMUIsZ0ZBQWdGO1FBQ2hGLEtBQUssQ0FBQyxRQUFRO2FBQ1QsT0FBTyxDQUFDLENBQUMsR0FBeUIsRUFBRSxFQUFFO1lBQ25DLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsRyxJQUFJLFdBQVcsRUFBRTtnQkFDYixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN2QztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRVAsMkRBQTJEO1FBQzNELElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBRTNCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM5RCxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFckUsbUVBQW1FO1lBQ25FLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pGLFdBQVcsQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUM7WUFDekMsV0FBVyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFL0Msb0RBQW9EO1lBQ3BELE1BQU0sUUFBUSxHQUFJLFFBQXdCLENBQUMsUUFBUSxDQUFDO1lBQ3BELFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6RSxlQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3JDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGlCQUFpQixDQUFDLG9CQUE4QyxFQUM5QyxlQUF5QixFQUN6QixZQUFzQjtRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRS9ELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxPQUFPLENBQUM7UUFFOUUsZ0RBQWdEO1FBQ2hELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdEYsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdkMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTlCLElBQUksTUFBTSxHQUFVLEVBQUUsQ0FBQztZQUN2QixvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFnQyxFQUFFLEVBQUU7Z0JBQzlELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1lBQ25ILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDN0c7SUFDTCxDQUFDO0lBRU8sMkJBQTJCLENBQUMsUUFBZ0MsRUFBRSxXQUFtQjtRQUNyRixNQUFNLEtBQUssR0FBRyxRQUF1QixDQUFDO1FBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE1BQU0sTUFBTSxHQUFJLEtBQWdCLENBQUM7WUFDakMsT0FBTyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssV0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDeEY7UUFFRCxJQUFJLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDMUIsS0FBSyxDQUFDLFFBQVE7YUFDVCxPQUFPLENBQUMsQ0FBQyxHQUF5QixFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBRVAsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLG1CQUFtQixDQUFDLGNBQXdDLEVBQ3hDLGVBQXlCLEVBQ3pCLFdBQW1CLEVBQ25CLE1BQWdCLEVBQ2hCLFdBQW9CLEVBQ3BCLFFBQWlCO1FBRXpDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFMUQsSUFBSSxNQUFjLENBQUM7UUFFbkIsSUFBSSxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3QixNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO2FBQU07WUFDSCxNQUFNLFVBQVUsR0FBa0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbEcsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCxNQUFNLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDO1NBQ3ZDO1FBRUQsTUFBTSxDQUFDLEtBQUssR0FBRyxvQkFBa0IsQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3hFLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFN0IsTUFBTSxVQUFVLEdBQXlCLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDaEQsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2xCLFNBQVMsRUFBRSxFQUFFO1lBQ2IsT0FBTyxFQUFFLEdBQUcsb0JBQWtCLENBQUMsc0JBQXNCLGVBQWUsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFO1NBQy9GLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUVYLFdBQVcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU8sWUFBWSxDQUFDLFdBQTBCLEVBQUUsVUFBZSxFQUFFLFNBQStCLEVBQUUsY0FBdUIsS0FBSztRQUUzSCxNQUFNLE1BQU0sR0FBVyxFQUFFLENBQUM7UUFFMUIsd0ZBQXdGO1FBQ3hGLElBQUksV0FBVyxFQUFFO1lBQ2IsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3BDLG1HQUFtRztZQUNuRyx5REFBeUQ7WUFDekQsTUFBTSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7U0FDdkI7UUFFRCxNQUFNLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUMvQixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLElBQUksRUFBRSxFQUFFLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqSCw4R0FBOEc7UUFDOUcsMEdBQTBHO1FBQzFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUM1QixvSEFBb0g7UUFDcEgsa0lBQWtJO1FBQ2xJLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxXQUFDLE9BQUEsTUFBQSxNQUFNLENBQUMsSUFBSSwwQ0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQU0sQ0FBQyxDQUFBLEVBQUEsQ0FBQztRQUVyRSxNQUFNLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUM3QixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO1FBQ3RDLElBQUcsTUFBTSxDQUFDLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFDdkIsTUFBTSxDQUFDLE1BQU0sR0FBRyxzQkFBc0IsQ0FBQztTQUMxQztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxZQUFZLENBQUMsUUFBZTtRQUNoQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7U0FBRTtRQUMxQyw4QkFBOEI7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUFFLE9BQU8sS0FBSyxDQUFDO2FBQUU7U0FDckQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sb0JBQW9CLENBQUMsY0FBd0UsRUFBRSxDQUF1QixFQUFFLENBQXVCO1FBQ25KLElBQUksY0FBYyxFQUFFO1lBQ2hCLE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3JEO2FBQU07WUFDSCxJQUFJLENBQUMsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFO2dCQUMvQixPQUFPLENBQUMsQ0FBQzthQUNaO2lCQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDYjtZQUVELGlEQUFpRDtZQUNqRCw4Q0FBOEM7WUFDOUMsOEdBQThHO1lBQzlHLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7WUFFRCxJQUFJLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUU7Z0JBQzdCLE9BQU8sQ0FBQyxDQUFDO2FBQ1o7WUFFRCxPQUFPLENBQUMsQ0FBQztTQUNaO0lBQ0wsQ0FBQztJQUVPLEtBQUssQ0FBQyxFQUF5QixFQUFFLEVBQWlCO1FBQ3RELEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQzNCLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNwRCxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsWUFBYSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDakQsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8scUJBQXFCLENBQUMsU0FBbUI7UUFDN0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLE9BQU8sY0FBYyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUN0RSxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsU0FBbUIsRUFBRSxlQUF1QjtRQUNqRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbEYsT0FBTyxTQUFTLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQztJQUNwRixDQUFDO0NBQ0osQ0FBQTtBQS9ZaUIseUNBQXNCLEdBQUcsZ0JBQWdCLENBQUM7QUFFOUI7SUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzt1REFBa0M7QUFKbEQsa0JBQWtCO0lBRDlCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztHQUNkLGtCQUFrQixDQWlaOUI7U0FqWlksa0JBQWtCIn0=