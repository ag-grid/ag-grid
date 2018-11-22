/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v19.1.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var logger_1 = require("../logger");
var columnUtils_1 = require("./columnUtils");
var columnKeyCreator_1 = require("./columnKeyCreator");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var defaultColumnTypes_1 = require("../entities/defaultColumnTypes");
// takes ColDefs and ColGroupDefs and turns them into Columns and OriginalGroups
var ColumnFactory = /** @class */ (function () {
    function ColumnFactory() {
    }
    ColumnFactory.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ColumnFactory');
    };
    ColumnFactory.prototype.createColumnTree = function (defs, primaryColumns, existingColumns) {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that could be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        var columnKeyCreator = new columnKeyCreator_1.ColumnKeyCreator();
        if (existingColumns) {
            var existingKeys = existingColumns.map(function (col) { return col.getId(); });
            columnKeyCreator.addExistingKeys(existingKeys);
        }
        // we take a copy of the columns as we are going to be removing from them
        var existingColsCopy = existingColumns ? existingColumns.slice() : null;
        // create am unbalanced tree that maps the provided definitions
        var unbalancedTree = this.recursivelyCreateColumns(defs, 0, primaryColumns, existingColsCopy, columnKeyCreator);
        var treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        var res = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
        this.columnUtils.depthFirstOriginalTreeSearch(res, function (child) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                child.setupExpandable();
            }
        });
        return {
            columnTree: res,
            treeDept: treeDept
        };
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
        var dept = this.findDept(balancedColumnTree);
        // at the end, this will be the top of the tree item.
        var nextChild = column;
        for (var i = dept - 1; i >= 0; i--) {
            var autoGroup = new originalColumnGroup_1.OriginalColumnGroup(null, "FAKE_PATH_" + column.getId() + "}_" + i, true, i);
            this.context.wireBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild = autoGroup;
        }
        // at this point, the nextChild is the top most item in the tree
        return nextChild;
    };
    ColumnFactory.prototype.findDept = function (balancedColumnTree) {
        var dept = 0;
        var pointer = balancedColumnTree;
        while (pointer && pointer[0] && pointer[0] instanceof originalColumnGroup_1.OriginalColumnGroup) {
            dept++;
            pointer = pointer[0].getChildren();
        }
        return dept;
    };
    ColumnFactory.prototype.balanceColumnTree = function (unbalancedTree, currentDept, columnDept, columnKeyCreator) {
        var _this = this;
        var result = [];
        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        unbalancedTree.forEach(function (child) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                var originalGroup = child;
                var newChildren = _this.balanceColumnTree(originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            }
            else {
                var newChild = child;
                for (var i = columnDept - 1; i >= currentDept; i--) {
                    var newColId = columnKeyCreator.getUniqueKey(null, null);
                    var colGroupDefMerged = _this.createMergedColGroupDef(null);
                    var paddedGroup = new originalColumnGroup_1.OriginalColumnGroup(colGroupDefMerged, newColId, true, currentDept);
                    _this.context.wireBean(paddedGroup);
                    paddedGroup.setChildren([newChild]);
                    newChild = paddedGroup;
                }
                result.push(newChild);
            }
        });
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
    ColumnFactory.prototype.recursivelyCreateColumns = function (defs, level, primaryColumns, existingColsCopy, columnKeyCreator) {
        var _this = this;
        var result = [];
        if (!defs) {
            return result;
        }
        defs.forEach(function (def) {
            var newGroupOrColumn;
            if (_this.isColumnGroup(def)) {
                newGroupOrColumn = _this.createColumnGroup(primaryColumns, def, level, existingColsCopy, columnKeyCreator);
            }
            else {
                newGroupOrColumn = _this.createColumn(primaryColumns, def, existingColsCopy, columnKeyCreator);
            }
            result.push(newGroupOrColumn);
        });
        return result;
    };
    ColumnFactory.prototype.createColumnGroup = function (primaryColumns, colGroupDef, level, existingColumns, columnKeyCreator) {
        var colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);
        var groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId, null);
        var originalGroup = new originalColumnGroup_1.OriginalColumnGroup(colGroupDefMerged, groupId, false, level);
        this.context.wireBean(originalGroup);
        var children = this.recursivelyCreateColumns(colGroupDefMerged.children, level + 1, primaryColumns, existingColumns, columnKeyCreator);
        originalGroup.setChildren(children);
        return originalGroup;
    };
    ColumnFactory.prototype.createMergedColGroupDef = function (colGroupDef) {
        var colGroupDefMerged = {};
        utils_1.Utils.assign(colGroupDefMerged, this.gridOptionsWrapper.getDefaultColGroupDef());
        utils_1.Utils.assign(colGroupDefMerged, colGroupDef);
        this.checkForDeprecatedItems(colGroupDefMerged);
        return colGroupDefMerged;
    };
    ColumnFactory.prototype.createColumn = function (primaryColumns, colDef, existingColsCopy, columnKeyCreator) {
        var colDefMerged = this.mergeColDefs(colDef);
        this.checkForDeprecatedItems(colDefMerged);
        // see if column already exists
        var column = this.findExistingColumn(colDef, existingColsCopy);
        // no existing column, need to create one
        if (!column) {
            var colId = columnKeyCreator.getUniqueKey(colDefMerged.colId, colDefMerged.field);
            column = new column_1.Column(colDefMerged, colDef, colId, primaryColumns);
            this.context.wireBean(column);
        }
        return column;
    };
    ColumnFactory.prototype.findExistingColumn = function (colDef, existingColsCopy) {
        var res = utils_1.Utils.find(existingColsCopy, function (col) {
            var oldColDef = col.getUserProvidedColDef();
            if (!oldColDef) {
                return false;
            }
            // first check object references
            if (oldColDef === colDef) {
                return true;
            }
            // second check id's
            var oldColHadId = oldColDef.colId !== null && oldColDef.colId !== undefined;
            if (oldColHadId) {
                return oldColDef.colId === colDef.colId;
            }
            else {
                return false;
            }
        });
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef's with common id
        if (res) {
            utils_1.Utils.removeFromArray(existingColsCopy, res);
        }
        return res;
    };
    ColumnFactory.prototype.mergeColDefs = function (colDef) {
        // start with empty merged definition
        var colDefMerged = {};
        // merge properties from default column definitions
        utils_1.Utils.assign(colDefMerged, this.gridOptionsWrapper.getDefaultColDef());
        // merge properties from column type properties
        if (colDef.type) {
            this.assignColumnTypes(colDef, colDefMerged);
        }
        // merge properties from column definitions
        utils_1.Utils.assign(colDefMerged, colDef);
        return colDefMerged;
    };
    ColumnFactory.prototype.assignColumnTypes = function (colDef, colDefMerged) {
        var typeKeys;
        if (colDef.type instanceof Array) {
            var invalidArray = colDef.type.some(function (a) { return typeof a !== 'string'; });
            if (invalidArray) {
                console.warn("ag-grid: if colDef.type is supplied an array it should be of type 'string[]'");
            }
            else {
                typeKeys = colDef.type;
            }
        }
        else if (typeof colDef.type === 'string') {
            typeKeys = colDef.type.split(',');
        }
        else {
            console.warn("ag-grid: colDef.type should be of type 'string' | 'string[]'");
            return;
        }
        // merge user defined with default column types
        var allColumnTypes = utils_1.Utils.assign({}, this.gridOptionsWrapper.getColumnTypes(), defaultColumnTypes_1.DefaultColumnTypes);
        typeKeys.forEach(function (t) {
            var typeColDef = allColumnTypes[t.trim()];
            if (typeColDef) {
                utils_1.Utils.assign(colDefMerged, typeColDef);
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
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ColumnFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnUtils'),
        __metadata("design:type", columnUtils_1.ColumnUtils)
    ], ColumnFactory.prototype, "columnUtils", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], ColumnFactory.prototype, "context", void 0);
    __decorate([
        __param(0, context_1.Qualifier('loggerFactory')),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [logger_1.LoggerFactory]),
        __metadata("design:returntype", void 0)
    ], ColumnFactory.prototype, "setBeans", null);
    ColumnFactory = __decorate([
        context_1.Bean('columnFactory')
    ], ColumnFactory);
    return ColumnFactory;
}());
exports.ColumnFactory = ColumnFactory;
