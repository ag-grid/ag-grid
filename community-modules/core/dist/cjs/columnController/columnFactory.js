/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var columnKeyCreator_1 = require("./columnKeyCreator");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var defaultColumnTypes_1 = require("../entities/defaultColumnTypes");
var beanStub_1 = require("../context/beanStub");
var constants_1 = require("../constants/constants");
var object_1 = require("../utils/object");
var generic_1 = require("../utils/generic");
var array_1 = require("../utils/array");
// takes ColDefs and ColGroupDefs and turns them into Columns and OriginalGroups
var ColumnFactory = /** @class */ (function (_super) {
    __extends(ColumnFactory, _super);
    function ColumnFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnFactory.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ColumnFactory');
    };
    ColumnFactory.prototype.createColumnTree = function (defs, primaryColumns, existingTree) {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that could be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        var columnKeyCreator = new columnKeyCreator_1.ColumnKeyCreator();
        var _a = this.extractExistingTreeData(existingTree), existingCols = _a.existingCols, existingGroups = _a.existingGroups, existingColKeys = _a.existingColKeys;
        columnKeyCreator.addExistingKeys(existingColKeys);
        // create am unbalanced tree that maps the provided definitions
        var unbalancedTree = this.recursivelyCreateColumns(defs, 0, primaryColumns, existingCols, columnKeyCreator, existingGroups);
        var treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        var columnTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
        var deptFirstCallback = function (child, parent) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                child.setupExpandable();
            }
            // we set the original parents at the end, rather than when we go along, as balancing the tree
            // adds extra levels into the tree. so we can only set parents when balancing is done.
            child.setOriginalParent(parent);
        };
        this.columnUtils.depthFirstOriginalTreeSearch(null, columnTree, deptFirstCallback);
        return {
            columnTree: columnTree,
            treeDept: treeDept
        };
    };
    ColumnFactory.prototype.extractExistingTreeData = function (existingTree) {
        var existingCols = [];
        var existingGroups = [];
        var existingColKeys = [];
        if (existingTree) {
            this.columnUtils.depthFirstOriginalTreeSearch(null, existingTree, function (item) {
                if (item instanceof originalColumnGroup_1.OriginalColumnGroup) {
                    var group = item;
                    existingGroups.push(group);
                }
                else {
                    var col = item;
                    existingColKeys.push(col.getId());
                    existingCols.push(col);
                }
            });
        }
        return { existingCols: existingCols, existingGroups: existingGroups, existingColKeys: existingColKeys };
    };
    ColumnFactory.prototype.createForAutoGroups = function (autoGroupCols, gridBalancedTree) {
        var _this = this;
        var autoColBalancedTree = [];
        autoGroupCols.forEach(function (col) {
            var fakeTreeItem = _this.createAutoGroupTreeItem(gridBalancedTree, col);
            autoColBalancedTree.push(fakeTreeItem);
        });
        return autoColBalancedTree;
    };
    ColumnFactory.prototype.createAutoGroupTreeItem = function (balancedColumnTree, column) {
        var dept = this.findDepth(balancedColumnTree);
        // at the end, this will be the top of the tree item.
        var nextChild = column;
        for (var i = dept - 1; i >= 0; i--) {
            var autoGroup = new originalColumnGroup_1.OriginalColumnGroup(null, "FAKE_PATH_" + column.getId() + "}_" + i, true, i);
            this.context.createBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild.setOriginalParent(autoGroup);
            nextChild = autoGroup;
        }
        // at this point, the nextChild is the top most item in the tree
        return nextChild;
    };
    ColumnFactory.prototype.findDepth = function (balancedColumnTree) {
        var dept = 0;
        var pointer = balancedColumnTree;
        while (pointer && pointer[0] && pointer[0] instanceof originalColumnGroup_1.OriginalColumnGroup) {
            dept++;
            pointer = pointer[0].getChildren();
        }
        return dept;
    };
    ColumnFactory.prototype.balanceColumnTree = function (unbalancedTree, currentDept, columnDept, columnKeyCreator) {
        var result = [];
        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        for (var i = 0; i < unbalancedTree.length; i++) {
            var child = unbalancedTree[i];
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                // child is a group, all we do is go to the next level of recursion
                var originalGroup = child;
                var newChildren = this.balanceColumnTree(originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            }
            else {
                // child is a column - so here we add in the padded column groups if needed
                var firstPaddedGroup = void 0;
                var currentPaddedGroup = void 0;
                // this for loop will NOT run any loops if no padded column groups are needed
                for (var j = columnDept - 1; j >= currentDept; j--) {
                    var newColId = columnKeyCreator.getUniqueKey(null, null);
                    var colGroupDefMerged = this.createMergedColGroupDef(null);
                    var paddedGroup = new originalColumnGroup_1.OriginalColumnGroup(colGroupDefMerged, newColId, true, currentDept);
                    this.context.createBean(paddedGroup);
                    if (currentPaddedGroup) {
                        currentPaddedGroup.setChildren([paddedGroup]);
                    }
                    currentPaddedGroup = paddedGroup;
                    if (!firstPaddedGroup) {
                        firstPaddedGroup = currentPaddedGroup;
                    }
                }
                // likewise this if statement will not run if no padded groups
                if (firstPaddedGroup && currentPaddedGroup) {
                    result.push(firstPaddedGroup);
                    var hasGroups = unbalancedTree.some(function (leaf) { return leaf instanceof originalColumnGroup_1.OriginalColumnGroup; });
                    if (hasGroups) {
                        currentPaddedGroup.setChildren([child]);
                        continue;
                    }
                    else {
                        currentPaddedGroup.setChildren(unbalancedTree);
                        break;
                    }
                }
                result.push(child);
            }
        }
        return result;
    };
    ColumnFactory.prototype.findMaxDept = function (treeChildren, dept) {
        var maxDeptThisLevel = dept;
        for (var i = 0; i < treeChildren.length; i++) {
            var abstractColumn = treeChildren[i];
            if (abstractColumn instanceof originalColumnGroup_1.OriginalColumnGroup) {
                var originalGroup = abstractColumn;
                var newDept = this.findMaxDept(originalGroup.getChildren(), dept + 1);
                if (maxDeptThisLevel < newDept) {
                    maxDeptThisLevel = newDept;
                }
            }
        }
        return maxDeptThisLevel;
    };
    ColumnFactory.prototype.recursivelyCreateColumns = function (defs, level, primaryColumns, existingColsCopy, columnKeyCreator, existingGroups) {
        var _this = this;
        var result = [];
        if (!defs) {
            return result;
        }
        defs.forEach(function (def) {
            var newGroupOrColumn;
            if (_this.isColumnGroup(def)) {
                newGroupOrColumn = _this.createColumnGroup(primaryColumns, def, level, existingColsCopy, columnKeyCreator, existingGroups);
            }
            else {
                newGroupOrColumn = _this.createColumn(primaryColumns, def, existingColsCopy, columnKeyCreator);
            }
            result.push(newGroupOrColumn);
        });
        return result;
    };
    ColumnFactory.prototype.createColumnGroup = function (primaryColumns, colGroupDef, level, existingColumns, columnKeyCreator, existingGroups) {
        var colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);
        var groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId || null, null);
        var originalGroup = new originalColumnGroup_1.OriginalColumnGroup(colGroupDefMerged, groupId, false, level);
        this.context.createBean(originalGroup);
        var existingGroup = this.findExistingGroup(colGroupDef, existingGroups);
        if (existingGroup && existingGroup.isExpanded()) {
            originalGroup.setExpanded(true);
        }
        var children = this.recursivelyCreateColumns(colGroupDefMerged.children, level + 1, primaryColumns, existingColumns, columnKeyCreator, existingGroups);
        originalGroup.setChildren(children);
        return originalGroup;
    };
    ColumnFactory.prototype.createMergedColGroupDef = function (colGroupDef) {
        var colGroupDefMerged = {};
        object_1.assign(colGroupDefMerged, this.gridOptionsWrapper.getDefaultColGroupDef());
        object_1.assign(colGroupDefMerged, colGroupDef);
        this.checkForDeprecatedItems(colGroupDefMerged);
        return colGroupDefMerged;
    };
    ColumnFactory.prototype.createColumn = function (primaryColumns, colDef, existingColsCopy, columnKeyCreator) {
        var colDefMerged = this.mergeColDefs(colDef);
        this.checkForDeprecatedItems(colDefMerged);
        // see if column already exists
        var column = this.findExistingColumn(colDef, existingColsCopy);
        if (!column) {
            // no existing column, need to create one
            var colId = columnKeyCreator.getUniqueKey(colDefMerged.colId, colDefMerged.field);
            column = new column_1.Column(colDefMerged, colDef, colId, primaryColumns);
            this.context.createBean(column);
        }
        else {
            column.setColDef(colDefMerged, colDef);
            this.applyColumnState(column, colDefMerged);
        }
        return column;
    };
    ColumnFactory.prototype.applyColumnState = function (column, colDef) {
        // flex
        var flex = generic_1.attrToNumber(colDef.flex);
        if (flex !== undefined) {
            column.setFlex(flex);
        }
        // width - we only set width if column is not flexing
        var noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            var width = generic_1.attrToNumber(colDef.width);
            if (width != null) {
                column.setActualWidth(width);
            }
            else {
                // otherwise set the width again, in case min or max width has changed,
                // and width needs to be adjusted.
                var widthBeforeUpdate = column.getActualWidth();
                column.setActualWidth(widthBeforeUpdate);
            }
        }
        // sort - anything but undefined will set sort, thus null or empty string will clear the sort
        if (colDef.sort !== undefined) {
            if (colDef.sort == constants_1.Constants.SORT_ASC || colDef.sort == constants_1.Constants.SORT_DESC) {
                column.setSort(colDef.sort);
            }
            else {
                column.setSort(undefined);
            }
        }
        // sorted at - anything but undefined, thus null will clear the sortIndex
        var sortIndex = generic_1.attrToNumber(colDef.sortIndex);
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }
        // hide - anything but undefined, thus null will clear the hide
        var hide = generic_1.attrToBoolean(colDef.hide);
        if (hide !== undefined) {
            column.setVisible(!hide);
        }
        // pinned - anything but undefined, thus null or empty string will remove pinned
        if (colDef.pinned !== undefined) {
            column.setPinned(colDef.pinned);
        }
    };
    ColumnFactory.prototype.findExistingColumn = function (newColDef, existingColsCopy) {
        var res = generic_1.find(existingColsCopy, function (existingCol) {
            var existingColDef = existingCol.getUserProvidedColDef();
            if (!existingColDef) {
                return false;
            }
            var newHasId = newColDef.colId != null;
            var newHasField = newColDef.field != null;
            if (newHasId) {
                return existingCol.getId() === newColDef.colId;
            }
            if (newHasField) {
                return existingColDef.field === newColDef.field;
            }
            // if no id or field present, then try object equivalence.
            if (existingColDef === newColDef) {
                return true;
            }
            return false;
        });
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (existingColsCopy && res) {
            array_1.removeFromArray(existingColsCopy, res);
        }
        return res;
    };
    ColumnFactory.prototype.findExistingGroup = function (newGroupDef, existingGroups) {
        var res = generic_1.find(existingGroups, function (existingGroup) {
            var existingDef = existingGroup.getColGroupDef();
            if (!existingDef) {
                return false;
            }
            var newHasId = newGroupDef.groupId != null;
            if (newHasId) {
                return existingGroup.getId() === newGroupDef.groupId;
            }
            return false;
        });
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (res) {
            array_1.removeFromArray(existingGroups, res);
        }
        return res;
    };
    ColumnFactory.prototype.mergeColDefs = function (colDef) {
        // start with empty merged definition
        var colDefMerged = {};
        // merge properties from default column definitions
        var defaultColDef = this.gridOptionsWrapper.getDefaultColDef();
        object_1.mergeDeep(colDefMerged, defaultColDef, true, true);
        // merge properties from column type properties
        var columnType = colDef.type;
        if (!columnType) {
            columnType = defaultColDef && defaultColDef.type;
        }
        // if type of both colDef and defaultColDef, then colDef gets preference
        if (columnType) {
            this.assignColumnTypes(columnType, colDefMerged);
        }
        // merge properties from column definitions
        object_1.mergeDeep(colDefMerged, colDef, true, true);
        return colDefMerged;
    };
    ColumnFactory.prototype.assignColumnTypes = function (type, colDefMerged) {
        var typeKeys = [];
        if (type instanceof Array) {
            var invalidArray = type.some(function (a) { return typeof a !== 'string'; });
            if (invalidArray) {
                console.warn("ag-grid: if colDef.type is supplied an array it should be of type 'string[]'");
            }
            else {
                typeKeys = type;
            }
        }
        else if (typeof type === 'string') {
            typeKeys = type.split(',');
        }
        else {
            console.warn("ag-grid: colDef.type should be of type 'string' | 'string[]'");
            return;
        }
        // merge user defined with default column types
        var allColumnTypes = object_1.assign({}, defaultColumnTypes_1.DefaultColumnTypes);
        var userTypes = this.gridOptionsWrapper.getColumnTypes() || {};
        object_1.iterateObject(userTypes, function (key, value) {
            if (key in allColumnTypes) {
                console.warn("AG Grid: the column type '" + key + "' is a default column type and cannot be overridden.");
            }
            else {
                allColumnTypes[key] = value;
            }
        });
        typeKeys.forEach(function (t) {
            var typeColDef = allColumnTypes[t.trim()];
            if (typeColDef) {
                object_1.mergeDeep(colDefMerged, typeColDef, true, true);
            }
            else {
                console.warn("ag-grid: colDef.type '" + t + "' does not correspond to defined gridOptions.columnTypes");
            }
        });
    };
    ColumnFactory.prototype.checkForDeprecatedItems = function (colDef) {
        if (colDef) {
            var colDefNoType = colDef; // take out the type, so we can access attributes not defined in the type
            if (colDefNoType.group !== undefined) {
                console.warn('ag-grid: colDef.group is invalid, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.headerGroup !== undefined) {
                console.warn('ag-grid: colDef.headerGroup is invalid, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.headerGroupShow !== undefined) {
                console.warn('ag-grid: colDef.headerGroupShow is invalid, should be columnGroupShow, please check documentation on how to do grouping as it changed in version 3');
            }
            if (colDefNoType.suppressRowGroup !== undefined) {
                console.warn('ag-grid: colDef.suppressRowGroup is deprecated, please use colDef.type instead');
            }
            if (colDefNoType.suppressAggregation !== undefined) {
                console.warn('ag-grid: colDef.suppressAggregation is deprecated, please use colDef.type instead');
            }
            if (colDefNoType.suppressRowGroup || colDefNoType.suppressAggregation) {
                console.warn('ag-grid: colDef.suppressAggregation and colDef.suppressRowGroup are deprecated, use allowRowGroup, allowPivot and allowValue instead');
            }
            if (colDefNoType.displayName) {
                console.warn("ag-grid: Found displayName " + colDefNoType.displayName + ", please use headerName instead, displayName is deprecated.");
                colDefNoType.headerName = colDefNoType.displayName;
            }
        }
    };
    // if object has children, we assume it's a group
    ColumnFactory.prototype.isColumnGroup = function (abstractColDef) {
        return abstractColDef.children !== undefined;
    };
    __decorate([
        context_1.Autowired('columnUtils')
    ], ColumnFactory.prototype, "columnUtils", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory'))
    ], ColumnFactory.prototype, "setBeans", null);
    ColumnFactory = __decorate([
        context_1.Bean('columnFactory')
    ], ColumnFactory);
    return ColumnFactory;
}(beanStub_1.BeanStub));
exports.ColumnFactory = ColumnFactory;

//# sourceMappingURL=columnFactory.js.map
