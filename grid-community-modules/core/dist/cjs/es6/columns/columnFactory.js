/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
exports.ColumnFactory = void 0;
const columnKeyCreator_1 = require("./columnKeyCreator");
const providedColumnGroup_1 = require("../entities/providedColumnGroup");
const column_1 = require("../entities/column");
const context_1 = require("../context/context");
const defaultColumnTypes_1 = require("../entities/defaultColumnTypes");
const beanStub_1 = require("../context/beanStub");
const object_1 = require("../utils/object");
const generic_1 = require("../utils/generic");
const array_1 = require("../utils/array");
// takes ColDefs and ColGroupDefs and turns them into Columns and OriginalGroups
let ColumnFactory = class ColumnFactory extends beanStub_1.BeanStub {
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('ColumnFactory');
    }
    createColumnTree(defs, primaryColumns, existingTree) {
        // column key creator dishes out unique column id's in a deterministic way,
        // so if we have two grids (that could be master/slave) with same column definitions,
        // then this ensures the two grids use identical id's.
        const columnKeyCreator = new columnKeyCreator_1.ColumnKeyCreator();
        const { existingCols, existingGroups, existingColKeys } = this.extractExistingTreeData(existingTree);
        columnKeyCreator.addExistingKeys(existingColKeys);
        // create am unbalanced tree that maps the provided definitions
        const unbalancedTree = this.recursivelyCreateColumns(defs, 0, primaryColumns, existingCols, columnKeyCreator, existingGroups);
        const treeDept = this.findMaxDept(unbalancedTree, 0);
        this.logger.log('Number of levels for grouped columns is ' + treeDept);
        const columnTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
        const deptFirstCallback = (child, parent) => {
            if (child instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                child.setupExpandable();
            }
            // we set the original parents at the end, rather than when we go along, as balancing the tree
            // adds extra levels into the tree. so we can only set parents when balancing is done.
            child.setOriginalParent(parent);
        };
        this.columnUtils.depthFirstOriginalTreeSearch(null, columnTree, deptFirstCallback);
        return {
            columnTree,
            treeDept
        };
    }
    extractExistingTreeData(existingTree) {
        const existingCols = [];
        const existingGroups = [];
        const existingColKeys = [];
        if (existingTree) {
            this.columnUtils.depthFirstOriginalTreeSearch(null, existingTree, (item) => {
                if (item instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                    const group = item;
                    existingGroups.push(group);
                }
                else {
                    const col = item;
                    existingColKeys.push(col.getId());
                    existingCols.push(col);
                }
            });
        }
        return { existingCols, existingGroups, existingColKeys };
    }
    createForAutoGroups(autoGroupCols, gridBalancedTree) {
        return autoGroupCols.map((col) => this.createAutoGroupTreeItem(gridBalancedTree, col));
    }
    createAutoGroupTreeItem(balancedColumnTree, column) {
        const dept = this.findDepth(balancedColumnTree);
        // at the end, this will be the top of the tree item.
        let nextChild = column;
        for (let i = dept - 1; i >= 0; i--) {
            const autoGroup = new providedColumnGroup_1.ProvidedColumnGroup(null, `FAKE_PATH_${column.getId()}}_${i}`, true, i);
            this.createBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild.setOriginalParent(autoGroup);
            nextChild = autoGroup;
        }
        // at this point, the nextChild is the top most item in the tree
        return nextChild;
    }
    findDepth(balancedColumnTree) {
        let dept = 0;
        let pointer = balancedColumnTree;
        while (pointer && pointer[0] && pointer[0] instanceof providedColumnGroup_1.ProvidedColumnGroup) {
            dept++;
            pointer = pointer[0].getChildren();
        }
        return dept;
    }
    balanceColumnTree(unbalancedTree, currentDept, columnDept, columnKeyCreator) {
        const result = [];
        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        for (let i = 0; i < unbalancedTree.length; i++) {
            const child = unbalancedTree[i];
            if (child instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                // child is a group, all we do is go to the next level of recursion
                const originalGroup = child;
                const newChildren = this.balanceColumnTree(originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            }
            else {
                // child is a column - so here we add in the padded column groups if needed
                let firstPaddedGroup;
                let currentPaddedGroup;
                // this for loop will NOT run any loops if no padded column groups are needed
                for (let j = columnDept - 1; j >= currentDept; j--) {
                    const newColId = columnKeyCreator.getUniqueKey(null, null);
                    const colGroupDefMerged = this.createMergedColGroupDef(null);
                    const paddedGroup = new providedColumnGroup_1.ProvidedColumnGroup(colGroupDefMerged, newColId, true, currentDept);
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
                    const hasGroups = unbalancedTree.some(leaf => leaf instanceof providedColumnGroup_1.ProvidedColumnGroup);
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
    }
    findMaxDept(treeChildren, dept) {
        let maxDeptThisLevel = dept;
        for (let i = 0; i < treeChildren.length; i++) {
            const abstractColumn = treeChildren[i];
            if (abstractColumn instanceof providedColumnGroup_1.ProvidedColumnGroup) {
                const originalGroup = abstractColumn;
                const newDept = this.findMaxDept(originalGroup.getChildren(), dept + 1);
                if (maxDeptThisLevel < newDept) {
                    maxDeptThisLevel = newDept;
                }
            }
        }
        return maxDeptThisLevel;
    }
    recursivelyCreateColumns(defs, level, primaryColumns, existingColsCopy, columnKeyCreator, existingGroups) {
        return (defs || []).map((def) => {
            if (this.isColumnGroup(def)) {
                return this.createColumnGroup(primaryColumns, def, level, existingColsCopy, columnKeyCreator, existingGroups);
            }
            else {
                return this.createColumn(primaryColumns, def, existingColsCopy, columnKeyCreator);
            }
        });
    }
    createColumnGroup(primaryColumns, colGroupDef, level, existingColumns, columnKeyCreator, existingGroups) {
        const colGroupDefMerged = this.createMergedColGroupDef(colGroupDef);
        const groupId = columnKeyCreator.getUniqueKey(colGroupDefMerged.groupId || null, null);
        const existingGroup = this.findExistingGroup(colGroupDef, existingGroups);
        let providedGroup;
        if (existingGroup) {
            providedGroup = existingGroup;
            providedGroup.reset(colGroupDefMerged, level);
            array_1.removeFromArray(existingGroups, existingGroup);
        }
        else {
            providedGroup = new providedColumnGroup_1.ProvidedColumnGroup(colGroupDefMerged, groupId, false, level);
            this.createBean(providedGroup);
        }
        const children = this.recursivelyCreateColumns(colGroupDefMerged.children, level + 1, primaryColumns, existingColumns, columnKeyCreator, existingGroups);
        providedGroup.setChildren(children);
        return providedGroup;
    }
    createMergedColGroupDef(colGroupDef) {
        const colGroupDefMerged = {};
        Object.assign(colGroupDefMerged, this.gridOptionsService.get('defaultColGroupDef'));
        Object.assign(colGroupDefMerged, colGroupDef);
        return colGroupDefMerged;
    }
    createColumn(primaryColumns, colDef, existingColsCopy, columnKeyCreator) {
        const colDefMerged = this.mergeColDefs(colDef);
        // see if column already exists
        let column = this.findExistingColumn(colDef, existingColsCopy);
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (existingColsCopy && column) {
            array_1.removeFromArray(existingColsCopy, column);
        }
        if (!column) {
            // no existing column, need to create one
            const colId = columnKeyCreator.getUniqueKey(colDefMerged.colId, colDefMerged.field);
            column = new column_1.Column(colDefMerged, colDef, colId, primaryColumns);
            this.context.createBean(column);
        }
        else {
            column.setColDef(colDefMerged, colDef);
            this.applyColumnState(column, colDefMerged);
        }
        return column;
    }
    applyColumnState(column, colDef) {
        // flex
        const flex = generic_1.attrToNumber(colDef.flex);
        if (flex !== undefined) {
            column.setFlex(flex);
        }
        // width - we only set width if column is not flexing
        const noFlexThisCol = column.getFlex() <= 0;
        if (noFlexThisCol) {
            // both null and undefined means we skip, as it's not possible to 'clear' width (a column must have a width)
            const width = generic_1.attrToNumber(colDef.width);
            if (width != null) {
                column.setActualWidth(width);
            }
            else {
                // otherwise set the width again, in case min or max width has changed,
                // and width needs to be adjusted.
                const widthBeforeUpdate = column.getActualWidth();
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
        const sortIndex = generic_1.attrToNumber(colDef.sortIndex);
        if (sortIndex !== undefined) {
            column.setSortIndex(sortIndex);
        }
        // hide - anything but undefined, thus null will clear the hide
        const hide = generic_1.attrToBoolean(colDef.hide);
        if (hide !== undefined) {
            column.setVisible(!hide);
        }
        // pinned - anything but undefined, thus null or empty string will remove pinned
        if (colDef.pinned !== undefined) {
            column.setPinned(colDef.pinned);
        }
    }
    findExistingColumn(newColDef, existingColsCopy) {
        return (existingColsCopy || []).find(existingCol => {
            const existingColDef = existingCol.getUserProvidedColDef();
            if (!existingColDef) {
                return false;
            }
            const newHasId = newColDef.colId != null;
            const newHasField = newColDef.field != null;
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
    }
    findExistingGroup(newGroupDef, existingGroups) {
        return existingGroups.find(existingGroup => {
            const existingDef = existingGroup.getColGroupDef();
            if (!existingDef) {
                return false;
            }
            const newHasId = newGroupDef.groupId != null;
            if (newHasId) {
                return existingGroup.getId() === newGroupDef.groupId;
            }
            return false;
        });
    }
    mergeColDefs(colDef) {
        // start with empty merged definition
        const colDefMerged = {};
        // merge properties from default column definitions
        const defaultColDef = this.gridOptionsService.get('defaultColDef');
        object_1.mergeDeep(colDefMerged, defaultColDef, false, true);
        // merge properties from column type properties
        let columnType = colDef.type;
        if (!columnType) {
            columnType = defaultColDef && defaultColDef.type;
        }
        // if type of both colDef and defaultColDef, then colDef gets preference
        if (columnType) {
            this.assignColumnTypes(columnType, colDefMerged);
        }
        // merge properties from column definitions
        object_1.mergeDeep(colDefMerged, colDef, false, true);
        const autoGroupColDef = this.gridOptionsService.get('autoGroupColumnDef');
        const isSortingCoupled = this.gridOptionsService.isColumnsSortingCoupledToGroup();
        if (colDef.rowGroup && autoGroupColDef && isSortingCoupled) {
            // override the sort for row group columns where the autoGroupColDef defines these values.
            object_1.mergeDeep(colDefMerged, { sort: autoGroupColDef.sort, initialSort: autoGroupColDef.initialSort }, false, true);
        }
        return colDefMerged;
    }
    assignColumnTypes(type, colDefMerged) {
        let typeKeys = [];
        if (type instanceof Array) {
            const invalidArray = type.some(a => typeof a !== 'string');
            if (invalidArray) {
                console.warn("AG Grid: if colDef.type is supplied an array it should be of type 'string[]'");
            }
            else {
                typeKeys = type;
            }
        }
        else if (typeof type === 'string') {
            typeKeys = type.split(',');
        }
        else {
            console.warn("AG Grid: colDef.type should be of type 'string' | 'string[]'");
            return;
        }
        // merge user defined with default column types
        const allColumnTypes = Object.assign({}, defaultColumnTypes_1.DefaultColumnTypes);
        const userTypes = this.gridOptionsService.get('columnTypes') || {};
        object_1.iterateObject(userTypes, (key, value) => {
            if (key in allColumnTypes) {
                console.warn(`AG Grid: the column type '${key}' is a default column type and cannot be overridden.`);
            }
            else {
                allColumnTypes[key] = value;
            }
        });
        typeKeys.forEach((t) => {
            const typeColDef = allColumnTypes[t.trim()];
            if (typeColDef) {
                object_1.mergeDeep(colDefMerged, typeColDef, false, true);
            }
            else {
                console.warn("AG Grid: colDef.type '" + t + "' does not correspond to defined gridOptions.columnTypes");
            }
        });
    }
    // if object has children, we assume it's a group
    isColumnGroup(abstractColDef) {
        return abstractColDef.children !== undefined;
    }
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
exports.ColumnFactory = ColumnFactory;
