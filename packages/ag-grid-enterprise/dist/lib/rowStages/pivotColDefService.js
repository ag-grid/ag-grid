// ag-grid-enterprise v21.2.2
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var PivotColDefService = /** @class */ (function () {
    function PivotColDefService() {
    }
    PivotColDefService.prototype.createPivotColumnDefs = function (uniqueValues) {
        // this is passed to the columnController, to configure the columns and groups we show
        var pivotColumnGroupDefs = [];
        // this is used by the aggregation stage, to do the aggregation based on the pivot columns
        var pivotColumnDefs = [];
        var pivotColumns = this.columnController.getPivotColumns();
        var valueColumns = this.columnController.getValueColumns();
        var levelsDeep = pivotColumns.length;
        var columnIdSequence = new ag_grid_community_1.NumberSequence();
        this.recursivelyAddGroup(pivotColumnGroupDefs, pivotColumnDefs, 1, uniqueValues, [], columnIdSequence, levelsDeep, pivotColumns);
        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns, pivotColumns, columnIdSequence);
        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence);
        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        var pivotColumnDefsClone = pivotColumnDefs.map(function (colDef) { return ag_grid_community_1._.cloneObject(colDef); });
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    };
    // parentChildren - the list of colDefs we are adding to
    // @index - how far the column is from the top (also same as pivotKeys.length)
    // @uniqueValues - the values for which we should create a col for
    // @pivotKeys - the keys for the pivot, eg if pivoting on {Language,Country} then could be {English,Ireland}
    PivotColDefService.prototype.recursivelyAddGroup = function (parentChildren, pivotColumnDefs, index, uniqueValues, pivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns) {
        var _this = this;
        ag_grid_community_1._.iterateObject(uniqueValues, function (key, value) {
            var newPivotKeys = pivotKeys.slice(0);
            newPivotKeys.push(key);
            var createGroup = index !== levelsDeep;
            if (createGroup) {
                var groupDef = {
                    children: [],
                    headerName: key,
                    pivotKeys: newPivotKeys,
                    columnGroupShow: 'open',
                    groupId: 'pivot' + columnIdSequence.next()
                };
                parentChildren.push(groupDef);
                _this.recursivelyAddGroup(groupDef.children, pivotColumnDefs, index + 1, value, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns);
            }
            else {
                var measureColumns = _this.columnController.getValueColumns();
                var valueGroup_1 = {
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
                    var colDef_1 = _this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                    valueGroup_1.children.push(colDef_1);
                    pivotColumnDefs.push(colDef_1);
                }
                else {
                    measureColumns.forEach(function (measureColumn) {
                        var columnName = _this.columnController.getDisplayNameForColumn(measureColumn, 'header');
                        var colDef = _this.createColDef(measureColumn, columnName, newPivotKeys, columnIdSequence);
                        colDef.columnGroupShow = 'open';
                        valueGroup_1.children.push(colDef);
                        pivotColumnDefs.push(colDef);
                    });
                }
                parentChildren.push(valueGroup_1);
            }
        });
        // sort by either user provided comparator, or our own one
        var colDef = primaryPivotColumns[index - 1].getColDef();
        var userComparator = colDef.pivotComparator;
        var comparator = this.headerNameComparator.bind(this, userComparator);
        parentChildren.sort(comparator);
    };
    PivotColDefService.prototype.addPivotTotalsToGroups = function (pivotColumnGroupDefs, pivotColumnDefs, columnIdSequence) {
        var _this = this;
        if (!this.gridOptionsWrapper.getPivotColumnGroupTotals()) {
            return;
        }
        var insertAfter = this.gridOptionsWrapper.getPivotColumnGroupTotals() === 'after';
        var valueCols = this.columnController.getValueColumns();
        var aggFuncs = valueCols.map(function (valueCol) { return valueCol.getAggFunc(); });
        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('ag-Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }
        // arbitrarily select a value column to use as a template for pivot columns
        var valueColumn = valueCols[0];
        pivotColumnGroupDefs.forEach(function (groupDef) {
            _this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
        });
    };
    PivotColDefService.prototype.recursivelyAddPivotTotal = function (groupDef, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter) {
        var _this = this;
        var group = groupDef;
        if (!group.children) {
            var def = groupDef;
            return def.colId ? [def.colId] : null;
        }
        var colIds = [];
        // need to recurse children first to obtain colIds used in the aggregation stage
        group.children
            .forEach(function (grp) {
            var childColIds = _this.recursivelyAddPivotTotal(grp, pivotColumnDefs, columnIdSequence, valueColumn, insertAfter);
            if (childColIds) {
                colIds = colIds.concat(childColIds);
            }
        });
        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {
            //create total colDef using an arbitrary value column as a template
            var totalColDef = this.createColDef(valueColumn, 'Total', groupDef.pivotKeys, columnIdSequence);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();
            // add total colDef to group and pivot colDefs array
            var children = groupDef.children;
            insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
            pivotColumnDefs.push(totalColDef);
        }
        return colIds;
    };
    PivotColDefService.prototype.addRowGroupTotals = function (pivotColumnGroupDefs, pivotColumnDefs, valueColumns, pivotColumns, columnIdSequence) {
        var _this = this;
        if (!this.gridOptionsWrapper.getPivotRowTotals()) {
            return;
        }
        var insertAfter = this.gridOptionsWrapper.getPivotRowTotals() === 'after';
        // order of row group totals depends on position
        var valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
        var _loop_1 = function (i) {
            var valueCol = valueCols[i];
            var colIds = [];
            pivotColumnGroupDefs.forEach(function (groupDef) {
                colIds = colIds.concat(_this.extractColIdsForValueColumn(groupDef, valueCol));
            });
            var levelsDeep = pivotColumns.length;
            this_1.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, 1, [], columnIdSequence, levelsDeep, pivotColumns, valueCol, colIds, insertAfter);
        };
        var this_1 = this;
        for (var i = 0; i < valueCols.length; i++) {
            _loop_1(i);
        }
    };
    PivotColDefService.prototype.extractColIdsForValueColumn = function (groupDef, valueColumn) {
        var _this = this;
        var group = groupDef;
        if (!group.children) {
            var colDef = group;
            return colDef.pivotValueColumn === valueColumn && colDef.colId ? [colDef.colId] : [];
        }
        var colIds = [];
        group.children
            .forEach(function (grp) {
            _this.extractColIdsForValueColumn(grp, valueColumn);
            var childColIds = _this.extractColIdsForValueColumn(grp, valueColumn);
            colIds = colIds.concat(childColIds);
        });
        return colIds;
    };
    PivotColDefService.prototype.createRowGroupTotal = function (parentChildren, pivotColumnDefs, index, pivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns, valueColumn, colIds, insertAfter) {
        var newPivotKeys = pivotKeys.slice(0);
        var createGroup = index !== levelsDeep;
        if (createGroup) {
            var groupDef = {
                children: [],
                pivotKeys: newPivotKeys,
                groupId: 'pivot' + columnIdSequence.next()
            };
            insertAfter ? parentChildren.push(groupDef) : parentChildren.unshift(groupDef);
            this.createRowGroupTotal(groupDef.children, pivotColumnDefs, index + 1, newPivotKeys, columnIdSequence, levelsDeep, primaryPivotColumns, valueColumn, colIds, insertAfter);
        }
        else {
            var measureColumns = this.columnController.getValueColumns();
            var valueGroup = {
                children: [],
                pivotKeys: newPivotKeys,
                groupId: 'pivot' + columnIdSequence.next()
            };
            if (measureColumns.length === 0) {
                var colDef = this.createColDef(null, '-', newPivotKeys, columnIdSequence);
                valueGroup.children.push(colDef);
                pivotColumnDefs.push(colDef);
            }
            else {
                var columnName = this.columnController.getDisplayNameForColumn(valueColumn, 'header');
                var colDef = this.createColDef(valueColumn, columnName, newPivotKeys, columnIdSequence);
                colDef.pivotTotalColumnIds = colIds;
                valueGroup.children.push(colDef);
                pivotColumnDefs.push(colDef);
            }
            insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
        }
    };
    PivotColDefService.prototype.createColDef = function (valueColumn, headerName, pivotKeys, columnIdSequence) {
        var colDef = {};
        if (valueColumn) {
            var colDefToCopy = valueColumn.getColDef();
            ag_grid_community_1._.assign(colDef, colDefToCopy);
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
    };
    PivotColDefService.prototype.sameAggFuncs = function (aggFuncs) {
        if (aggFuncs.length == 1) {
            return true;
        }
        //check if all aggFunc's match
        for (var i = 1; i < aggFuncs.length; i++) {
            if (aggFuncs[i] !== aggFuncs[0]) {
                return false;
            }
        }
        return true;
    };
    PivotColDefService.prototype.headerNameComparator = function (userComparator, a, b) {
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
            else if (a.headerName > b.headerName) {
                return 1;
            }
            else {
                return 0;
            }
        }
    };
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], PivotColDefService.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], PivotColDefService.prototype, "gridOptionsWrapper", void 0);
    PivotColDefService = __decorate([
        ag_grid_community_1.Bean('pivotColDefService')
    ], PivotColDefService);
    return PivotColDefService;
}());
exports.PivotColDefService = PivotColDefService;
