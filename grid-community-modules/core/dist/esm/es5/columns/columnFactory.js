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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ColumnKeyCreator } from "./columnKeyCreator";
import { ProvidedColumnGroup } from "../entities/providedColumnGroup";
import { Column } from "../entities/column";
import { Autowired, Bean, Qualifier } from "../context/context";
import { DefaultColumnTypes } from "../entities/defaultColumnTypes";
import { BeanStub } from "../context/beanStub";
import { iterateObject, mergeDeep } from '../utils/object';
import { attrToNumber, attrToBoolean } from '../utils/generic';
import { warnOnce } from '../utils/function';
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
        var columnKeyCreator = new ColumnKeyCreator();
        var _a = this.extractExistingTreeData(existingTree), existingCols = _a.existingCols, existingGroups = _a.existingGroups, existingColKeys = _a.existingColKeys;
        columnKeyCreator.addExistingKeys(existingColKeys);
        // create am unbalanced tree that maps the provided definitions
        var unbalancedTree = this.recursivelyCreateColumns(defs, 0, primaryColumns, existingCols, columnKeyCreator, existingGroups);
        var treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        var columnTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
        var deptFirstCallback = function (child, parent) {
            if (child instanceof ProvidedColumnGroup) {
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
                if (item instanceof ProvidedColumnGroup) {
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
        return autoGroupCols.map(function (col) { return _this.createAutoGroupTreeItem(gridBalancedTree, col); });
    };
    ColumnFactory.prototype.createAutoGroupTreeItem = function (balancedColumnTree, column) {
        var dept = this.findDepth(balancedColumnTree);
        // at the end, this will be the top of the tree item.
        var nextChild = column;
        for (var i = dept - 1; i >= 0; i--) {
            var autoGroup = new ProvidedColumnGroup(null, "FAKE_PATH_".concat(column.getId(), "}_").concat(i), true, i);
            this.createBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild.setOriginalParent(autoGroup);
            nextChild = autoGroup;
        }
        if (dept === 0) {
            column.setOriginalParent(null);
        }
        // at this point, the nextChild is the top most item in the tree
        return nextChild;
    };
    ColumnFactory.prototype.findDepth = function (balancedColumnTree) {
        var dept = 0;
        var pointer = balancedColumnTree;
        while (pointer && pointer[0] && pointer[0] instanceof ProvidedColumnGroup) {
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
            if (child instanceof ProvidedColumnGroup) {
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
                    var paddedGroup = new ProvidedColumnGroup(colGroupDefMerged, newColId, true, currentDept);
                    this.createBean(paddedGroup);
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
                    var hasGroups = unbalancedTree.some(function (leaf) { return leaf instanceof ProvidedColumnGroup; });
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
            if (abstractColumn instanceof ProvidedColumnGroup) {
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
        if (!defs)
            return [];
        var result = new Array(defs.length);
        for (var i = 0; i < result.length; i++) {
            var def = defs[i];
            if (this.isColumnGroup(def)) {
                result[i] = this.createColumnGroup(primaryColumns, def, level, existingColsCopy, columnKeyCreator, existingGroups);
            }
            else {
                result[i] = this.createColumn(primaryColumns, def, existingColsCopy, columnKeyCreator);
            }
        }
        return result;
    };
    ColumnFactory.prototype.createColumnGroup = function (primaryColumns, colGroupDef, level, existingColumns, columnKeyCreator, existingGroups) {
        var colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);
        var groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId || null, null);
        var providedGroup = new ProvidedColumnGroup(colGroupDefMerged, groupId, false, level);
        this.createBean(providedGroup);
        var existingGroupAndIndex = this.findExistingGroup(colGroupDef, existingGroups);
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (existingGroupAndIndex) {
            existingGroups.splice(existingGroupAndIndex.idx, 1);
        }
        var existingGroup = existingGroupAndIndex === null || existingGroupAndIndex === void 0 ? void 0 : existingGroupAndIndex.group;
        if (existingGroup) {
            providedGroup.setExpanded(existingGroup.isExpanded());
        }
        var children = this.recursivelyCreateColumns(colGroupDefMerged.children, level + 1, primaryColumns, existingColumns, columnKeyCreator, existingGroups);
        providedGroup.setChildren(children);
        return providedGroup;
    };
    ColumnFactory.prototype.createMergedColGroupDef = function (colGroupDef) {
        var colGroupDefMerged = {};
        Object.assign(colGroupDefMerged, this.gridOptionsService.get('defaultColGroupDef'));
        Object.assign(colGroupDefMerged, colGroupDef);
        return colGroupDefMerged;
    };
    ColumnFactory.prototype.createColumn = function (primaryColumns, colDef, existingColsCopy, columnKeyCreator) {
        // see if column already exists
        var existingColAndIndex = this.findExistingColumn(colDef, existingColsCopy);
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (existingColAndIndex) {
            existingColsCopy === null || existingColsCopy === void 0 ? void 0 : existingColsCopy.splice(existingColAndIndex.idx, 1);
        }
        var column = existingColAndIndex === null || existingColAndIndex === void 0 ? void 0 : existingColAndIndex.column;
        if (!column) {
            // no existing column, need to create one
            var colId = columnKeyCreator.getUniqueKey(colDef.colId, colDef.field);
            var colDefMerged = this.addColumnDefaultAndTypes(colDef, colId);
            column = new Column(colDefMerged, colDef, colId, primaryColumns);
            this.context.createBean(column);
        }
        else {
            var colDefMerged = this.addColumnDefaultAndTypes(colDef, column.getColId());
            column.setColDef(colDefMerged, colDef);
            this.applyColumnState(column, colDefMerged);
        }
        this.dataTypeService.addColumnListeners(column);
        return column;
    };
    ColumnFactory.prototype.applyColumnState = function (column, colDef) {
        // flex
        var flex = attrToNumber(colDef.flex);
        if (flex !== undefined) {
            column.setFlex(flex);
        }
        // width - we only set width if column is not flexing
        var noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            var width = attrToNumber(colDef.width);
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
            if (colDef.sort == 'asc' || colDef.sort == 'desc') {
                column.setSort(colDef.sort);
            }
            else {
                column.setSort(undefined);
            }
        }
        // sorted at - anything but undefined, thus null will clear the sortIndex
        var sortIndex = attrToNumber(colDef.sortIndex);
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }
        // hide - anything but undefined, thus null will clear the hide
        var hide = attrToBoolean(colDef.hide);
        if (hide !== undefined) {
            column.setVisible(!hide);
        }
        // pinned - anything but undefined, thus null or empty string will remove pinned
        if (colDef.pinned !== undefined) {
            column.setPinned(colDef.pinned);
        }
    };
    ColumnFactory.prototype.findExistingColumn = function (newColDef, existingColsCopy) {
        if (!existingColsCopy)
            return undefined;
        for (var i = 0; i < existingColsCopy.length; i++) {
            var def = existingColsCopy[i].getUserProvidedColDef();
            if (!def)
                continue;
            var newHasId = newColDef.colId != null;
            if (newHasId) {
                if (existingColsCopy[i].getId() === newColDef.colId) {
                    return { idx: i, column: existingColsCopy[i] };
                }
                continue;
            }
            var newHasField = newColDef.field != null;
            if (newHasField) {
                if (def.field === newColDef.field) {
                    return { idx: i, column: existingColsCopy[i] };
                }
                continue;
            }
            if (def === newColDef) {
                return { idx: i, column: existingColsCopy[i] };
            }
        }
        return undefined;
    };
    ColumnFactory.prototype.findExistingGroup = function (newGroupDef, existingGroups) {
        var newHasId = newGroupDef.groupId != null;
        if (!newHasId) {
            return undefined;
        }
        for (var i = 0; i < existingGroups.length; i++) {
            var existingGroup = existingGroups[i];
            var existingDef = existingGroup.getColGroupDef();
            if (!existingDef) {
                continue;
            }
            if (existingGroup.getId() === newGroupDef.groupId) {
                return { idx: i, group: existingGroup };
            }
        }
        return undefined;
    };
    ColumnFactory.prototype.addColumnDefaultAndTypes = function (colDef, colId) {
        // start with empty merged definition
        var res = {};
        // merge properties from default column definitions
        var defaultColDef = this.gridOptionsService.get('defaultColDef');
        mergeDeep(res, defaultColDef, false, true);
        var columnType = this.dataTypeService.updateColDefAndGetColumnType(res, colDef, colId);
        if (columnType) {
            this.assignColumnTypes(columnType, res);
        }
        // merge properties from column definitions
        mergeDeep(res, colDef, false, true);
        var autoGroupColDef = this.gridOptionsService.get('autoGroupColumnDef');
        var isSortingCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        if (colDef.rowGroup && autoGroupColDef && isSortingCoupled) {
            // override the sort for row group columns where the autoGroupColDef defines these values.
            mergeDeep(res, { sort: autoGroupColDef.sort, initialSort: autoGroupColDef.initialSort }, false, true);
        }
        this.dataTypeService.validateColDef(res);
        return res;
    };
    ColumnFactory.prototype.assignColumnTypes = function (typeKeys, colDefMerged) {
        if (!typeKeys.length) {
            return;
        }
        // merge user defined with default column types
        var allColumnTypes = Object.assign({}, DefaultColumnTypes);
        var userTypes = this.gridOptionsService.get('columnTypes') || {};
        iterateObject(userTypes, function (key, value) {
            if (key in allColumnTypes) {
                console.warn("AG Grid: the column type '".concat(key, "' is a default column type and cannot be overridden."));
            }
            else {
                var colType = value;
                if (colType.type) {
                    warnOnce("Column type definitions 'columnTypes' with a 'type' attribute are not supported " +
                        "because a column type cannot refer to another column type. Only column definitions " +
                        "'columnDefs' can use the 'type' attribute to refer to a column type.");
                }
                allColumnTypes[key] = value;
            }
        });
        typeKeys.forEach(function (t) {
            var typeColDef = allColumnTypes[t.trim()];
            if (typeColDef) {
                mergeDeep(colDefMerged, typeColDef, false, true);
            }
            else {
                console.warn("AG Grid: colDef.type '" + t + "' does not correspond to defined gridOptions.columnTypes");
            }
        });
    };
    // if object has children, we assume it's a group
    ColumnFactory.prototype.isColumnGroup = function (abstractColDef) {
        return abstractColDef.children !== undefined;
    };
    __decorate([
        Autowired('columnUtils')
    ], ColumnFactory.prototype, "columnUtils", void 0);
    __decorate([
        Autowired('dataTypeService')
    ], ColumnFactory.prototype, "dataTypeService", void 0);
    __decorate([
        __param(0, Qualifier('loggerFactory'))
    ], ColumnFactory.prototype, "setBeans", null);
    ColumnFactory = __decorate([
        Bean('columnFactory')
    ], ColumnFactory);
    return ColumnFactory;
}(BeanStub));
export { ColumnFactory };
