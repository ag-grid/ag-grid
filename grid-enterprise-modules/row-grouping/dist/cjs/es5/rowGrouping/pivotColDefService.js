"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PivotColDefService = void 0;
var core_1 = require("@ag-grid-community/core");
var PivotColDefService = /** @class */ (function (_super) {
    __extends(PivotColDefService, _super);
    function PivotColDefService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PivotColDefService_1 = PivotColDefService;
    PivotColDefService.prototype.init = function () {
        var _this = this;
        var getFieldSeparator = function () { var _a; return (_a = _this.gos.get('serverSidePivotResultFieldSeparator')) !== null && _a !== void 0 ? _a : '_'; };
        this.fieldSeparator = getFieldSeparator();
        this.addManagedPropertyListener('serverSidePivotResultFieldSeparator', function () { _this.fieldSeparator = getFieldSeparator(); });
        var getPivotDefaultExpanded = function () { return _this.gos.get('pivotDefaultExpanded'); };
        this.pivotDefaultExpanded = getPivotDefaultExpanded();
        this.addManagedPropertyListener('pivotDefaultExpanded', function () { _this.pivotDefaultExpanded = getPivotDefaultExpanded(); });
    };
    PivotColDefService.prototype.createPivotColumnDefs = function (uniqueValues) {
        // this is passed to the columnModel, to configure the columns and groups we show
        var pivotColumnGroupDefs = this.createPivotColumnsFromUniqueValues(uniqueValues);
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
        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs);
        // additional group columns that contain child totals for each collapsed child column / group
        this.addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs);
        // additional group columns that contain an aggregated total across all child columns
        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs);
        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        var pivotColumnDefsClone = pivotColumnDefs.map(function (colDef) { return core_1._.cloneObject(colDef); });
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    };
    PivotColDefService.prototype.createPivotColumnsFromUniqueValues = function (uniqueValues) {
        var pivotColumns = this.columnModel.getPivotColumns();
        var maxDepth = pivotColumns.length;
        var pivotColumnGroupDefs = this.recursivelyBuildGroup(0, uniqueValues, [], maxDepth, pivotColumns);
        return pivotColumnGroupDefs;
    };
    PivotColDefService.prototype.recursivelyBuildGroup = function (index, uniqueValue, pivotKeys, maxDepth, primaryPivotColumns) {
        var _this = this;
        var measureColumns = this.columnModel.getValueColumns();
        if (index >= maxDepth) { // Base case - build the measure columns
            return this.buildMeasureCols(pivotKeys);
        }
        // sort by either user provided comparator, or our own one
        var primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
        var comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);
        // Base case for the compact layout, instead of recursing build the last layer of groups as measure columns instead
        if (measureColumns.length === 1 && this.gridOptionsService.get('removePivotHeaderRowWhenSingleValueColumn') && index === maxDepth - 1) {
            var leafCols_1 = [];
            core_1._.iterateObject(uniqueValue, function (key) {
                var newPivotKeys = __spreadArray(__spreadArray([], __read(pivotKeys), false), [key], false);
                var colDef = _this.createColDef(measureColumns[0], key, newPivotKeys);
                colDef.columnGroupShow = 'open';
                leafCols_1.push(colDef);
            });
            leafCols_1.sort(comparator);
            return leafCols_1;
        }
        // Recursive case
        var groups = [];
        core_1._.iterateObject(uniqueValue, function (key, value) {
            // expand group by default based on depth of group. (pivotDefaultExpanded provides desired level of depth for expanding group by default)
            var openByDefault = _this.pivotDefaultExpanded === -1 || (index < _this.pivotDefaultExpanded);
            var newPivotKeys = __spreadArray(__spreadArray([], __read(pivotKeys), false), [key], false);
            groups.push({
                children: _this.recursivelyBuildGroup(index + 1, value, newPivotKeys, maxDepth, primaryPivotColumns),
                headerName: key,
                pivotKeys: newPivotKeys,
                columnGroupShow: 'open',
                openByDefault: openByDefault,
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
        if (this.gridOptionsService.get('suppressExpandablePivotGroups') ||
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
    PivotColDefService.prototype.addRowGroupTotals = function (pivotColumnGroupDefs, pivotColumnDefs) {
        var _this = this;
        if (!this.gridOptionsService.get('pivotRowTotals')) {
            return;
        }
        var insertAfter = this.gridOptionsService.get('pivotRowTotals') === 'after';
        var valueColumns = this.columnModel.getValueColumns();
        // order of row group totals depends on position
        var valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
        var _loop_1 = function (i) {
            var valueCol = valueCols[i];
            var colIds = [];
            pivotColumnGroupDefs.forEach(function (groupDef) {
                colIds = colIds.concat(_this.extractColIdsForValueColumn(groupDef, valueCol));
            });
            var withGroup = valueCols.length > 1 || !this_1.gridOptionsService.get('removePivotHeaderRowWhenSingleValueColumn');
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
            groupId: "".concat(PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX, "_pivotGroup_").concat(valueColumn.getColId()),
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
            var updatedList = __spreadArray(__spreadArray([], __read(existingList), false), __read(value), false);
            m1.set(key, updatedList);
        });
    };
    PivotColDefService.prototype.generateColumnGroupId = function (pivotKeys) {
        var pivotCols = this.columnModel.getPivotColumns().map(function (col) { return col.getColId(); });
        return "pivotGroup_".concat(pivotCols.join('-'), "_").concat(pivotKeys.join('-'));
    };
    PivotColDefService.prototype.generateColumnId = function (pivotKeys, measureColumnId) {
        var pivotCols = this.columnModel.getPivotColumns().map(function (col) { return col.getColId(); });
        return "pivot_".concat(pivotCols.join('-'), "_").concat(pivotKeys.join('-'), "_").concat(measureColumnId);
    };
    /**
     * Used by the SSRM to create secondary columns from provided fields
     * @param fields
     */
    PivotColDefService.prototype.createColDefsFromFields = function (fields) {
        var _this = this;
        ;
        // tear the ids down into groups, while this could be done in-step with the next stage, the lookup is faster 
        // than searching col group children array for the right group
        var uniqueValues = {};
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var parts = field.split(this.fieldSeparator);
            var level = uniqueValues;
            for (var p = 0; p < parts.length; p++) {
                var part = parts[p];
                if (level[part] == null) {
                    level[part] = {};
                }
                level = level[part];
            }
        }
        var uniqueValuesToGroups = function (id, key, uniqueValues, depth) {
            var _a;
            var children = [];
            for (var key_1 in uniqueValues) {
                var item = uniqueValues[key_1];
                var child = uniqueValuesToGroups("".concat(id).concat(_this.fieldSeparator).concat(key_1), key_1, item, depth + 1);
                children.push(child);
            }
            if (children.length === 0) {
                var col = {
                    colId: id,
                    headerName: key,
                    // this is to support using pinned rows, normally the data will be extracted from the aggData object using the colId
                    // however pinned rows still access the data object by field, this prevents values with dots from being treated as complex objects
                    valueGetter: function (params) { var _a; return (_a = params.data) === null || _a === void 0 ? void 0 : _a[id]; },
                };
                var potentialAggCol = _this.columnModel.getPrimaryColumn(key);
                if (potentialAggCol) {
                    col.headerName = (_a = _this.columnModel.getDisplayNameForColumn(potentialAggCol, 'header')) !== null && _a !== void 0 ? _a : key;
                    col.aggFunc = potentialAggCol.getAggFunc();
                    col.pivotValueColumn = potentialAggCol;
                }
                return col;
            }
            // this is a bit sketchy. As the fields can be anything we just build groups as deep as the fields go.
            // nothing says user has to give us groups the same depth.
            var collapseSingleChildren = _this.gridOptionsService.get('removePivotHeaderRowWhenSingleValueColumn');
            if (collapseSingleChildren && children.length === 1 && 'colId' in children[0]) {
                children[0].headerName = key;
                return children[0];
            }
            var group = {
                openByDefault: _this.pivotDefaultExpanded === -1 || depth < _this.pivotDefaultExpanded,
                groupId: id,
                headerName: key,
                children: children,
            };
            return group;
        };
        var res = [];
        for (var key in uniqueValues) {
            var item = uniqueValues[key];
            var col = uniqueValuesToGroups(key, key, item, 0);
            res.push(col);
        }
        return res;
    };
    var PivotColDefService_1;
    PivotColDefService.PIVOT_ROW_TOTAL_PREFIX = 'PivotRowTotal_';
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], PivotColDefService.prototype, "columnModel", void 0);
    __decorate([
        (0, core_1.Autowired)('gridOptionsService')
    ], PivotColDefService.prototype, "gos", void 0);
    __decorate([
        core_1.PostConstruct
    ], PivotColDefService.prototype, "init", null);
    PivotColDefService = PivotColDefService_1 = __decorate([
        (0, core_1.Bean)('pivotColDefService')
    ], PivotColDefService);
    return PivotColDefService;
}(core_1.BeanStub));
exports.PivotColDefService = PivotColDefService;
