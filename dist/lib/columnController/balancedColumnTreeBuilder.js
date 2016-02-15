/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var columnKeyCreator_1 = require("./columnKeyCreator");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
var column_1 = require("../entities/column");
// takes in a list of columns, as specified by the column definitions, and returns column groups
var BalancedColumnTreeBuilder = (function () {
    function BalancedColumnTreeBuilder() {
    }
    BalancedColumnTreeBuilder.prototype.init = function (gridOptionsWrapper, loggerFactory, columnUtils) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.columnUtils = columnUtils;
        this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
    };
    BalancedColumnTreeBuilder.prototype.createBalancedColumnGroups = function (abstractColDefs) {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that cold be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        var columnKeyCreator = new columnKeyCreator_1.default();
        // create am unbalanced tree that maps the provided definitions
        var unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, columnKeyCreator);
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
    BalancedColumnTreeBuilder.prototype.recursivelyCreateColumns = function (abstractColDefs, level, columnKeyCreator) {
        var _this = this;
        var result = [];
        if (!abstractColDefs) {
            return result;
        }
        var minColWidth = this.gridOptionsWrapper.getMinColWidth();
        var maxColWidth = this.gridOptionsWrapper.getMaxColWidth();
        abstractColDefs.forEach(function (abstractColDef) {
            _this.checkForDeprecatedItems(abstractColDef);
            if (_this.isColumnGroup(abstractColDef)) {
                var groupColDef = abstractColDef;
                var groupId = columnKeyCreator.getUniqueKey(groupColDef.groupId, null);
                var originalGroup = new originalColumnGroup_1.OriginalColumnGroup(groupColDef, groupId);
                var children = _this.recursivelyCreateColumns(groupColDef.children, level + 1, columnKeyCreator);
                originalGroup.setChildren(children);
                result.push(originalGroup);
            }
            else {
                var colDef = abstractColDef;
                var width = _this.columnUtils.calculateColInitialWidth(colDef);
                var colId = columnKeyCreator.getUniqueKey(colDef.colId, colDef.field);
                var column = new column_1.default(colDef, width, colId, minColWidth, maxColWidth);
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
        }
    };
    // if object has children, we assume it's a group
    BalancedColumnTreeBuilder.prototype.isColumnGroup = function (abstractColDef) {
        return abstractColDef.children !== undefined;
    };
    return BalancedColumnTreeBuilder;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BalancedColumnTreeBuilder;
