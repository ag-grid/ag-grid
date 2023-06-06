var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Autowired, Bean, BeanStub, _ } from "@ag-grid-community/core";
var PivotColDefService = /** @class */ (function (_super) {
    __extends(PivotColDefService, _super);
    function PivotColDefService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PivotColDefService_1 = PivotColDefService;
    PivotColDefService.prototype.createPivotColumnDefs = function (uniqueValues) {
        // this is passed to the columnModel, to configure the columns and groups we show
        var pivotColumns = this.columnModel.getPivotColumns();
        var valueColumns = this.columnModel.getValueColumns();
        var levelsDeep = pivotColumns.length;
        var pivotColumnGroupDefs = this.recursiveBuildGroup(0, uniqueValues, [], levelsDeep, pivotColumns);
        function extractColDefs(input, arr) {
            if (arr === void 0) { arr = []; }
            input.forEach(function (def) {
                if (def.children !== undefined) {
                    extractColDefs(def.children, arr);
                }
                else {
                    arr.push(def);
                }
            });
            return arr;
        }
        var pivotColumnDefs = extractColDefs(pivotColumnGroupDefs);
        // additional columns that contain the aggregated total for each value column per row
        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns);
        // additional group columns that contain child totals for each collapsed child column / group
        this.addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs);
        // additional group columns that contain an aggregated total across all child columns
        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs);
        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        var pivotColumnDefsClone = pivotColumnDefs.map(function (colDef) { return _.cloneObject(colDef); });
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    };
    PivotColDefService.prototype.recursiveBuildGroup = function (index, uniqueValue, pivotKeys, maxDepth, primaryPivotColumns) {
        var _this = this;
        var measureColumns = this.columnModel.getValueColumns();
        if (index >= maxDepth) { // Base case - build the measure columns
            return this.buildMeasureCols(pivotKeys);
        }
        // sort by either user provided comparator, or our own one
        var primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
        var comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);
        // Base case for the compact layout, instead of recursing build the last layer of groups as measure columns instead
        if (measureColumns.length === 1 && this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn') && index === maxDepth - 1) {
            var leafCols_1 = [];
            _.iterateObject(uniqueValue, function (key) {
                var newPivotKeys = __spreadArray(__spreadArray([], __read(pivotKeys)), [key]);
                leafCols_1.push(__assign(__assign({}, _this.createColDef(measureColumns[0], key, newPivotKeys)), { columnGroupShow: 'open' }));
            });
            leafCols_1.sort(comparator);
            return leafCols_1;
        }
        // Recursive case
        var groups = [];
        _.iterateObject(uniqueValue, function (key, value) {
            var newPivotKeys = __spreadArray(__spreadArray([], __read(pivotKeys)), [key]);
            groups.push({
                children: _this.recursiveBuildGroup(index + 1, value, newPivotKeys, maxDepth, primaryPivotColumns),
                headerName: key,
                pivotKeys: newPivotKeys,
                columnGroupShow: 'open',
                groupId: _this.generateColumnGroupId(newPivotKeys),
            });
        });
        groups.sort(comparator);
        return groups;
    };
    PivotColDefService.prototype.buildMeasureCols = function (pivotKeys) {
        var _this = this;
        var measureColumns = this.columnModel.getValueColumns();
        if (measureColumns.length === 0) {
            // if no value columns selected, then we insert one blank column, so the user at least sees columns
            // rendered. otherwise the grid would render with no columns (just empty groups) which would give the
            // impression that the grid is broken
            return [this.createColDef(null, '-', pivotKeys)];
        }
        return measureColumns.map(function (measureCol) {
            var columnName = _this.columnModel.getDisplayNameForColumn(measureCol, 'header');
            return __assign(__assign({}, _this.createColDef(measureCol, columnName, pivotKeys)), { columnGroupShow: 'open' });
        });
    };
    ;
    PivotColDefService.prototype.addExpandablePivotGroups = function (pivotColumnGroupDefs, pivotColumnDefs) {
        var _this = this;
        if (this.gridOptionsService.is('suppressExpandablePivotGroups') ||
            this.gridOptionsService.get('pivotColumnGroupTotals')) {
            return;
        }
        var recursivelyAddSubTotals = function (groupDef, currentPivotColumnDefs, acc) {
            var group = groupDef;
            if (group.children) {
                var childAcc_1 = new Map();
                group.children.forEach(function (grp) {
                    recursivelyAddSubTotals(grp, currentPivotColumnDefs, childAcc_1);
                });
                var firstGroup_1 = !group.children.some(function (child) { return child.children; });
                _this.columnModel.getValueColumns().forEach(function (valueColumn) {
                    var columnName = _this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
                    var totalColDef = _this.createColDef(valueColumn, columnName, groupDef.pivotKeys);
                    totalColDef.pivotTotalColumnIds = childAcc_1.get(valueColumn.getColId());
                    totalColDef.columnGroupShow = 'closed';
                    totalColDef.aggFunc = valueColumn.getAggFunc();
                    if (!firstGroup_1) {
                        // add total colDef to group and pivot colDefs array
                        var children = groupDef.children;
                        children.push(totalColDef);
                        currentPivotColumnDefs.push(totalColDef);
                    }
                });
                _this.merge(acc, childAcc_1);
            }
            else {
                var def = groupDef;
                // check that value column exists, i.e. aggFunc is supplied
                if (!def.pivotValueColumn) {
                    return;
                }
                var pivotValueColId = def.pivotValueColumn.getColId();
                var arr = acc.has(pivotValueColId) ? acc.get(pivotValueColId) : [];
                arr.push(def.colId);
                acc.set(pivotValueColId, arr);
            }
        };
        pivotColumnGroupDefs.forEach(function (groupDef) {
            recursivelyAddSubTotals(groupDef, pivotColumnDefs, new Map());
        });
    };
    PivotColDefService.prototype.addPivotTotalsToGroups = function (pivotColumnGroupDefs, pivotColumnDefs) {
        var _this = this;
        if (!this.gridOptionsService.get('pivotColumnGroupTotals')) {
            return;
        }
        var insertAfter = this.gridOptionsService.get('pivotColumnGroupTotals') === 'after';
        var valueCols = this.columnModel.getValueColumns();
        var aggFuncs = valueCols.map(function (valueCol) { return valueCol.getAggFunc(); });
        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('AG Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }
        // arbitrarily select a value column to use as a template for pivot columns
        var valueColumn = valueCols[0];
        pivotColumnGroupDefs.forEach(function (groupDef) {
            _this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter);
        });
    };
    PivotColDefService.prototype.recursivelyAddPivotTotal = function (groupDef, pivotColumnDefs, valueColumn, insertAfter) {
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
            var childColIds = _this.recursivelyAddPivotTotal(grp, pivotColumnDefs, valueColumn, insertAfter);
            if (childColIds) {
                colIds = colIds.concat(childColIds);
            }
        });
        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {
            var localeTextFunc = this.localeService.getLocaleTextFunc();
            var headerName = localeTextFunc('pivotColumnGroupTotals', 'Total');
            //create total colDef using an arbitrary value column as a template
            var totalColDef = this.createColDef(valueColumn, headerName, groupDef.pivotKeys, true);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();
            // add total colDef to group and pivot colDefs array
            var children = groupDef.children;
            insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
            pivotColumnDefs.push(totalColDef);
        }
        return colIds;
    };
    PivotColDefService.prototype.addRowGroupTotals = function (pivotColumnGroupDefs, pivotColumnDefs, valueColumns) {
        var _this = this;
        if (!this.gridOptionsService.get('pivotRowTotals')) {
            return;
        }
        var insertAfter = this.gridOptionsService.get('pivotRowTotals') === 'after';
        // order of row group totals depends on position
        var valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
        var _loop_1 = function (i) {
            var valueCol = valueCols[i];
            var colIds = [];
            pivotColumnGroupDefs.forEach(function (groupDef) {
                colIds = colIds.concat(_this.extractColIdsForValueColumn(groupDef, valueCol));
            });
            var withGroup = valueCols.length > 1 || !this_1.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn');
            this_1.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, valueCol, colIds, insertAfter, withGroup);
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
    PivotColDefService.prototype.createRowGroupTotal = function (parentChildren, pivotColumnDefs, valueColumn, colIds, insertAfter, addGroup) {
        var measureColumns = this.columnModel.getValueColumns();
        var colDef;
        if (measureColumns.length === 0) {
            colDef = this.createColDef(null, '-', []);
        }
        else {
            var columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
            colDef = this.createColDef(valueColumn, columnName, []);
            colDef.pivotTotalColumnIds = colIds;
        }
        colDef.colId = PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX + colDef.colId;
        pivotColumnDefs.push(colDef);
        var valueGroup = addGroup ? {
            children: [colDef],
            pivotKeys: [],
            groupId: PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX + "_pivotGroup_" + valueColumn.getColId(),
        } : colDef;
        insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
    };
    PivotColDefService.prototype.createColDef = function (valueColumn, headerName, pivotKeys, totalColumn) {
        if (totalColumn === void 0) { totalColumn = false; }
        var colDef = {};
        // This is null when there are no measure columns and we're creating placeholder columns
        if (valueColumn) {
            var colDefToCopy = valueColumn.getColDef();
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
        colDef.valueGetter = function (params) { var _a; return (_a = params.data) === null || _a === void 0 ? void 0 : _a[params.colDef.field]; };
        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;
        if (colDef.filter === true) {
            colDef.filter = 'agNumberColumnFilter';
        }
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
            if (a.headerName > b.headerName) {
                return 1;
            }
            return 0;
        }
    };
    PivotColDefService.prototype.merge = function (m1, m2) {
        m2.forEach(function (value, key, map) {
            var existingList = m1.has(key) ? m1.get(key) : [];
            var updatedList = __spreadArray(__spreadArray([], __read(existingList)), __read(value));
            m1.set(key, updatedList);
        });
    };
    PivotColDefService.prototype.generateColumnGroupId = function (pivotKeys) {
        var pivotCols = this.columnModel.getPivotColumns().map(function (col) { return col.getColId(); });
        return "pivotGroup_" + pivotCols.join('-') + "_" + pivotKeys.join('-');
    };
    PivotColDefService.prototype.generateColumnId = function (pivotKeys, measureColumnId) {
        var pivotCols = this.columnModel.getPivotColumns().map(function (col) { return col.getColId(); });
        return "pivot_" + pivotCols.join('-') + "_" + pivotKeys.join('-') + "_" + measureColumnId;
    };
    var PivotColDefService_1;
    PivotColDefService.PIVOT_ROW_TOTAL_PREFIX = 'PivotRowTotal_';
    __decorate([
        Autowired('columnModel')
    ], PivotColDefService.prototype, "columnModel", void 0);
    PivotColDefService = PivotColDefService_1 = __decorate([
        Bean('pivotColDefService')
    ], PivotColDefService);
    return PivotColDefService;
}(BeanStub));
export { PivotColDefService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGl2b3RDb2xEZWZTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Jvd0dyb3VwaW5nL3Bpdm90Q29sRGVmU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFLUixDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQVFqQztJQUF3QyxzQ0FBUTtJQUFoRDs7SUFpWkEsQ0FBQzsyQkFqWlksa0JBQWtCO0lBTXBCLGtEQUFxQixHQUE1QixVQUE2QixZQUFpQjtRQUMxQyxpRkFBaUY7UUFFakYsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4RCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hELElBQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFFdkMsSUFBTSxvQkFBb0IsR0FBNkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUUvSCxTQUFTLGNBQWMsQ0FBQyxLQUErQixFQUFFLEdBQWtCO1lBQWxCLG9CQUFBLEVBQUEsUUFBa0I7WUFDdkUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQVE7Z0JBQ25CLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQzVCLGNBQWMsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUNyQztxQkFBTTtvQkFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNqQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FB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