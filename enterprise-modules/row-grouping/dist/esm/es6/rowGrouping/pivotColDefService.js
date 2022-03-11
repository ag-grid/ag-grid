var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PivotColDefService_1;
import { Autowired, Bean, BeanStub, NumberSequence, _ } from "@ag-grid-community/core";
let PivotColDefService = PivotColDefService_1 = class PivotColDefService extends BeanStub {
    createPivotColumnDefs(uniqueValues) {
        // this is passed to the columnModel, to configure the columns and groups we show
        const pivotColumnGroupDefs = [];
        // this is used by the aggregation stage, to do the aggregation based on the pivot columns
        const pivotColumnDefs = [];
        const pivotColumns = this.columnModel.getPivotColumns();
        const valueColumns = this.columnModel.getValueColumns();
        const levelsDeep = pivotColumns.length;
        const columnIdSequence = new NumberSequence();
        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep, pivotColumns);
        // additional columns that contain the aggregated total for each value column per row
        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns, columnIdSequence);
        // additional group columns that contain child totals for each collapsed child column / group
        this.addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence);
        // additional group columns that contain an aggregated total across all child columns
        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence);
        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        const pivotColumnDefsClone = pivotColumnDefs.map(colDef => _.cloneObject(colDef));
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }
    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    recursivelyAddGroup(parentChildren, pivotColumnDefs, index, uniqueValues, pivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns) {
        _.iterateObject(uniqueValues, (key, value) => {
            const newPivotKeys = [...pivotKeys, key];
            const createGroup = index !== levelsDeep;
            if (createGroup) {
                const groupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys,
                    columnGroupShow: 'open',
                    groupId: 'pivot' + columnIdSequence.next()
                };
                parentChildren.push(groupDef);
                this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index + 1, value, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns);
            }
            else {
                const measureColumns = this.columnModel.getValueColumns();
                const valueGroup = {
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
                }
                else {
                    measureColumns.forEach(measureColumn => {
                        const columnName = this.columnModel.getDisplayNameForColumn(measureColumn, 'header');
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
        const primaryPivotColumnDefs = primaryPivotColumns[index - 1].getColDef();
        const userComparator = primaryPivotColumnDefs.pivotComparator;
        const comparator = this.headerNameComparator.bind(this, userComparator);
        parentChildren.sort(comparator);
    }
    addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence) {
        if (this.gridOptionsWrapper.isSuppressExpandablePivotGroups() ||
            this.gridOptionsWrapper.getPivotColumnGroupTotals()) {
            return;
        }
        const recursivelyAddSubTotals = (groupDef, currentPivotColumnDefs, currentColumnIdSequence, acc) => {
            const group = groupDef;
            if (group.children) {
                const childAcc = new Map();
                group.children.forEach((grp) => {
                    recursivelyAddSubTotals(grp, currentPivotColumnDefs, currentColumnIdSequence, childAcc);
                });
                const firstGroup = !group.children.some(child => child.children);
                this.columnModel.getValueColumns().forEach(valueColumn => {
                    const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
                    const totalColDef = this.createColDef(valueColumn, columnName, groupDef.pivotKeys, currentColumnIdSequence);
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
            recursivelyAddSubTotals(groupDef, pivotColumnDefs, columnIdSequence, new Map());
        });
    }
    addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence) {
        if (!this.gridOptionsWrapper.getPivotColumnGroupTotals()) {
            return;
        }
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
        pivotColumnGroupDefs.forEach((groupDef) => {
            this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
        });
    }
    recursivelyAddPivotTotal(groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter) {
        const group = groupDef;
        if (!group.children) {
            const def = groupDef;
            return def.colId ? [def.colId] : null;
        }
        let colIds = [];
        // need to recurse children first to obtain colIds used in the aggregation stage
        group.children
            .forEach((grp) => {
            const childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
            if (childColIds) {
                colIds = colIds.concat(childColIds);
            }
        });
        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            const headerName = localeTextFunc('pivotColumnGroupTotals', 'Total');
            //create total colDef using an arbitrary value column as a template
            const totalColDef = this.createColDef(valueColumn, headerName, groupDef.pivotKeys, columnIdSequence);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();
            // add total colDef to group and pivot colDefs array
            const children = groupDef.children;
            insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
            pivotColumnDefs.push(totalColDef);
        }
        return colIds;
    }
    addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns, columnIdSequence) {
        if (!this.gridOptionsWrapper.getPivotRowTotals()) {
            return;
        }
        const insertAfter = this.gridOptionsWrapper.getPivotRowTotals() === 'after';
        // order of row group totals depends on position
        const valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
        for (let i = 0; i < valueCols.length; i++) {
            const valueCol = valueCols[i];
            let colIds = [];
            pivotColumnGroupDefs.forEach((groupDef) => {
                colIds = colIds.concat(this.extractColIdsForValueColumn(groupDef, valueCol));
            });
            this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, [], columnIdSequence, valueCol, colIds, insertAfter);
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
    createRowGroupTotal(parentChildren, pivotColumnDefs, pivotKeys, columnIdSequence, valueColumn, colIds, insertAfter) {
        const newPivotKeys = pivotKeys.slice(0);
        const measureColumns = this.columnModel.getValueColumns();
        const valueGroup = {
            children: [],
            pivotKeys: newPivotKeys,
            groupId: PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX + columnIdSequence.next(),
        };
        if (measureColumns.length === 0) {
            const colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
            valueGroup.children.push(colDef);
            pivotColumnDefs.push(colDef);
        }
        else {
            const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
            const colDef = this.createColDef(valueColumn, columnName, newPivotKeys, columnIdSequence);
            colDef.pivotTotalColumnIds = colIds;
            valueGroup.children.push(colDef);
            pivotColumnDefs.push(colDef);
        }
        insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
    }
    createColDef(valueColumn, headerName, pivotKeys, columnIdSequence) {
        const colDef = {};
        if (valueColumn) {
            const colDefToCopy = valueColumn.getColDef();
            Object.assign(colDef, colDefToCopy);
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
};
PivotColDefService.PIVOT_ROW_TOTAL_PREFIX = 'PivotRowTotal_';
__decorate([
    Autowired('columnModel')
], PivotColDefService.prototype, "columnModel", void 0);
PivotColDefService = PivotColDefService_1 = __decorate([
    Bean('pivotColDefService')
], PivotColDefService);
export { PivotColDefService };
//# sourceMappingURL=pivotColDefService.js.map