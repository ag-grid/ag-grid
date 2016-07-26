/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var gridOptionsWrapper_1 = require('../gridOptionsWrapper');
var logger_1 = require('../logger');
var columnUtils_1 = require('../columnController/columnUtils');
var columnKeyCreator_1 = require("./columnKeyCreator");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var context_2 = require("../context/context");
var context_3 = require("../context/context");
var context_4 = require("../context/context");
// takes in a list of columns, as specified by the column definitions, and returns column groups
var BalancedColumnTreeBuilder = (function () {
    function BalancedColumnTreeBuilder() {
    }
    BalancedColumnTreeBuilder.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
    };
    BalancedColumnTreeBuilder.prototype.createBalancedColumnGroups = function (abstractColDefs, primaryColumns) {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that cold be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        var columnKeyCreator = new columnKeyCreator_1.ColumnKeyCreator();
        // create am unbalanced tree that maps the provided definitions
        var unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, columnKeyCreator, primaryColumns);
        var treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        var balancedTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
        this.columnUtils.deptFirstOriginalTreeSearch(balancedTree, function (child) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                child.calculateExpandable();
            }
        });
        return {
            balancedTree: balancedTree,
            treeDept: treeDept
        };
    };
    BalancedColumnTreeBuilder.prototype.balanceColumnTree = function (unbalancedTree, currentDept, columnDept, columnKeyCreator) {
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
                    var paddedGroup = new originalColumnGroup_1.OriginalColumnGroup(null, newColId);
                    paddedGroup.setChildren([newChild]);
                    newChild = paddedGroup;
                }
                result.push(newChild);
            }
        });
        return result;
    };
    BalancedColumnTreeBuilder.prototype.findMaxDept = function (treeChildren, dept) {
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
    BalancedColumnTreeBuilder.prototype.recursivelyCreateColumns = function (abstractColDefs, level, columnKeyCreator, primaryColumns) {
        var _this = this;
        var result = [];
        if (!abstractColDefs) {
            return result;
        }
        abstractColDefs.forEach(function (abstractColDef) {
            _this.checkForDeprecatedItems(abstractColDef);
            if (_this.isColumnGroup(abstractColDef)) {
                var groupColDef = abstractColDef;
                var groupId = columnKeyCreator.getUniqueKey(groupColDef.groupId, null);
                var originalGroup = new originalColumnGroup_1.OriginalColumnGroup(groupColDef, groupId);
                var children = _this.recursivelyCreateColumns(groupColDef.children, level + 1, columnKeyCreator, primaryColumns);
                originalGroup.setChildren(children);
                result.push(originalGroup);
            }
            else {
                var colDef = abstractColDef;
                var colId = columnKeyCreator.getUniqueKey(colDef.colId, colDef.field);
                var column = new column_1.Column(colDef, colId, primaryColumns);
                _this.context.wireBean(column);
                result.push(column);
            }
        });
        return result;
    };
    BalancedColumnTreeBuilder.prototype.checkForDeprecatedItems = function (colDef) {
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
    BalancedColumnTreeBuilder.prototype.isColumnGroup = function (abstractColDef) {
        return abstractColDef.children !== undefined;
    };
    __decorate([
        context_3.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], BalancedColumnTreeBuilder.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_3.Autowired('columnUtils'), 
        __metadata('design:type', columnUtils_1.ColumnUtils)
    ], BalancedColumnTreeBuilder.prototype, "columnUtils", void 0);
    __decorate([
        context_3.Autowired('context'), 
        __metadata('design:type', context_4.Context)
    ], BalancedColumnTreeBuilder.prototype, "context", void 0);
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], BalancedColumnTreeBuilder.prototype, "setBeans", null);
    BalancedColumnTreeBuilder = __decorate([
        context_1.Bean('balancedColumnTreeBuilder'), 
        __metadata('design:paramtypes', [])
    ], BalancedColumnTreeBuilder);
    return BalancedColumnTreeBuilder;
})();
exports.BalancedColumnTreeBuilder = BalancedColumnTreeBuilder;
