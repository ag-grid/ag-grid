"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PivotColDefService_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
let PivotColDefService = PivotColDefService_1 = class PivotColDefService extends core_1.BeanStub {
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
        const pivotColumnDefsClone = pivotColumnDefs.map(colDef => core_1._.cloneObject(colDef));
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
        if (measureColumns.length === 1 && this.gridOptionsWrapper.isRemovePivotHeaderRowWhenSingleValueColumn() && index === maxDepth - 1) {
            const leafCols = [];
            core_1._.iterateObject(uniqueValue, (key) => {
                const newPivotKeys = [...pivotKeys, key];
                leafCols.push(Object.assign(Object.assign({}, this.createColDef(measureColumns[0], key, newPivotKeys)), { columnGroupShow: 'open' }));
            });
            leafCols.sort(comparator);
            return leafCols;
        }
        // Recursive case
        const groups = [];
        core_1._.iterateObject(uniqueValue, (key, value) => {
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
        if (this.gridOptionsWrapper.isSuppressExpandablePivotGroups() ||
            this.gridOptionsWrapper.getPivotColumnGroupTotals()) {
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
            const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
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
            const withGroup = valueCols.length > 1 || !this.gridOptionsWrapper.isRemovePivotHeaderRowWhenSingleValueColumn();
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
    core_1.Autowired('columnModel')
], PivotColDefService.prototype, "columnModel", void 0);
PivotColDefService = PivotColDefService_1 = __decorate([
    core_1.Bean('pivotColDefService')
], PivotColDefService);
exports.PivotColDefService = PivotColDefService;
