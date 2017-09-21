// ag-grid-enterprise v13.2.0
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
var main_1 = require("ag-grid/main");
var GroupStage = (function () {
    function GroupStage() {
        // we use a sequence variable so that each time we do a grouping, we don't
        // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
        // when it tries to animate between rows. we set to -1 as others row id 0 will be shared
        // with the other rows.
        this.groupIdSequence = new main_1.NumberSequence(1);
    }
    // when grouping, these items are of note:
    // rowNode.parent: RowNode: set to the parent
    // rowNode.childrenAfterGroup: RowNode[] = the direct children of this group
    // rowNode.childrenMapped: string=>RowNode = children mapped by group key (when groups) or an empty map if leaf group (this is then used by pivot)
    // for leaf groups, rowNode.childrenAfterGroup = rowNode.allLeafChildren;
    GroupStage.prototype.execute = function (params) {
        var rowNode = params.rowNode, changedPath = params.changedPath, rowNodeTransaction = params.rowNodeTransaction;
        var groupedCols = this.columnController.getRowGroupColumns();
        var expandByDefault;
        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        }
        else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        var isPivot = this.columnController.isPivotMode();
        var isGrouping = groupedCols.length > 0;
        // important not to do transaction if we are not grouping, as otherwise the 'insert index' is ignored.
        // ie, if not grouping, then we just want to shotgun so the rootNode.allLeafChildren gets copied
        // to rootNode.childrenAfterGroup and maintaining order (as delta transaction misses the order).
        var doTransaction = isGrouping && main_1._.exists(rowNodeTransaction);
        if (doTransaction) {
            this.handleTransaction(rowNodeTransaction, changedPath, rowNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
        else {
            this.shotgunResetEverything(rowNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
    };
    GroupStage.prototype.handleTransaction = function (tran, changedPath, rootNode, groupedCols, expandByDefault, includeParents, isPivot) {
        if (tran.add) {
            this.insertRowNodesIntoGroups(tran.add, changedPath, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
        if (tran.update) {
            // the InMemoryNodeManager already updated the value, however we
            // need to check the grouping, in case a dimension changed.
            this.checkParents(tran.update, changedPath, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
        if (tran.remove) {
            this.removeRowNodesFromGroups(tran.remove, changedPath, rootNode);
        }
    };
    GroupStage.prototype.checkParents = function (leafRowNodes, changedPath, rootNode, groupColumns, expandByDefault, includeParents, isPivot) {
        var _this = this;
        leafRowNodes.forEach(function (nodeToPlace) {
            // always add existing parent, as if row is moved, then old parent needs
            // to be recomputed
            if (changedPath) {
                changedPath.addParentNode(nodeToPlace.parent);
            }
            var groupKeys = groupColumns.map(function (col) { return _this.getKeyForNode(col, nodeToPlace); });
            var parent = nodeToPlace.parent;
            var keysMatch = true;
            groupKeys.forEach(function (key) {
                if (parent.key !== key) {
                    keysMatch = false;
                }
                parent = parent.parent;
            });
            if (!keysMatch) {
                _this.removeRowNodeFromGroups(nodeToPlace, rootNode);
                _this.insertRowNodeIntoGroups(nodeToPlace, rootNode, groupColumns, expandByDefault, includeParents, isPivot);
                // add in new parent
                if (changedPath) {
                    changedPath.addParentNode(nodeToPlace.parent);
                }
            }
        });
    };
    GroupStage.prototype.removeRowNodesFromGroups = function (leafRowNodes, changedPath, rootNode) {
        var _this = this;
        leafRowNodes.forEach(function (leafToRemove) {
            _this.removeRowNodeFromGroups(leafToRemove, rootNode);
            if (changedPath) {
                changedPath.addParentNode(leafToRemove.parent);
            }
        });
    };
    GroupStage.prototype.removeRowNodeFromGroups = function (leafToRemove, rootNode) {
        // step 1 - remove leaf from direct parent
        main_1._.removeFromArray(leafToRemove.parent.childrenAfterGroup, leafToRemove);
        // step 2 - go up the row group hierarchy and:
        //  a) remove from allLeafChildren
        //  b) remove empty groups
        var groupPointer = leafToRemove.parent;
        while (groupPointer !== rootNode) {
            main_1._.removeFromArray(groupPointer.allLeafChildren, leafToRemove);
            var isEmptyGroup = groupPointer.allLeafChildren.length === 0;
            if (isEmptyGroup) {
                this.removeGroupFromParent(groupPointer);
            }
            groupPointer = groupPointer.parent;
        }
    };
    GroupStage.prototype.removeGroupFromParent = function (groupPointer) {
        main_1._.removeFromArray(groupPointer.parent.childrenAfterGroup, groupPointer);
        groupPointer.parent.childrenMapped[groupPointer.key] = undefined;
    };
    GroupStage.prototype.shotgunResetEverything = function (rootNode, groupedCols, expandByDefault, includeParents, isPivot) {
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        rootNode.leafGroup = groupedCols.length === 0;
        // we are going everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        this.insertRowNodesIntoGroups(rootNode.allLeafChildren, null, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
    };
    GroupStage.prototype.insertRowNodesIntoGroups = function (newRowNodes, changedPath, rootNode, groupColumns, expandByDefault, includeParents, isPivot) {
        var _this = this;
        newRowNodes.forEach(function (rowNode) {
            _this.insertRowNodeIntoGroups(rowNode, rootNode, groupColumns, expandByDefault, includeParents, isPivot);
            if (changedPath) {
                changedPath.addParentNode(rowNode.parent);
            }
        });
    };
    GroupStage.prototype.insertRowNodeIntoGroups = function (rowNode, rootNode, groupColumns, expandByDefault, includeParents, isPivot) {
        var _this = this;
        var nextGroup = rootNode;
        groupColumns.forEach(function (groupColumn, level) {
            nextGroup = _this.getOrCreateNextGroup(nextGroup, rowNode, groupColumn, expandByDefault, level, includeParents, groupColumns.length, isPivot);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes, not impacted by grouping
            nextGroup.allLeafChildren.push(rowNode);
        });
        rowNode.parent = nextGroup;
        rowNode.level = groupColumns.length;
        nextGroup.childrenAfterGroup.push(rowNode);
    };
    GroupStage.prototype.getOrCreateNextGroup = function (parentGroup, nodeToPlace, groupColumn, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot) {
        var groupKey = this.getKeyForNode(groupColumn, nodeToPlace);
        var nextGroup = parentGroup.childrenMapped[groupKey];
        if (!nextGroup) {
            nextGroup = this.createSubGroup(groupKey, groupColumn, parentGroup, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot);
            // attach the new group to the parent
            parentGroup.childrenMapped[groupKey] = nextGroup;
            parentGroup.childrenAfterGroup.push(nextGroup);
        }
        return nextGroup;
    };
    GroupStage.prototype.getKeyForNode = function (groupColumn, rowNode) {
        var value = this.valueService.getValue(groupColumn, rowNode);
        var result;
        var keyCreator = groupColumn.getColDef().keyCreator;
        if (keyCreator) {
            result = keyCreator({ value: value });
        }
        else {
            result = value;
        }
        return result;
    };
    GroupStage.prototype.createSubGroup = function (groupKey, groupColumn, parent, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot) {
        var newGroup = new main_1.RowNode();
        this.context.wireBean(newGroup);
        newGroup.group = true;
        newGroup.field = groupColumn.getColDef().field;
        newGroup.rowGroupColumn = groupColumn;
        newGroup.groupData = {};
        var groupDisplayCols = this.columnController.getGroupDisplayColumns();
        groupDisplayCols.forEach(function (col) {
            if (col.isRowGroupDisplayed(newGroup.rowGroupColumn.getId())) {
                newGroup.groupData[col.getColId()] = groupKey;
            }
        });
        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        newGroup.id = (this.groupIdSequence.next() * -1).toString();
        newGroup.key = groupKey;
        newGroup.level = level;
        newGroup.leafGroup = level === (numberOfGroupColumns - 1);
        // if doing pivoting, then the leaf group is never expanded,
        // as we do not show leaf rows
        if (isPivot && newGroup.leafGroup) {
            newGroup.expanded = false;
        }
        else {
            newGroup.expanded = this.isExpanded(expandByDefault, level);
        }
        newGroup.allLeafChildren = [];
        // why is this done here? we are not updating the children could as we go,
        // i suspect this is updated in the filter stage
        newGroup.setAllChildrenCount(0);
        newGroup.rowGroupIndex = level;
        newGroup.childrenAfterGroup = [];
        newGroup.childrenMapped = {};
        newGroup.parent = includeParents ? parent : null;
        return newGroup;
    };
    GroupStage.prototype.isExpanded = function (expandByDefault, level) {
        if (expandByDefault === -1) {
            return true;
        }
        else {
            return level < expandByDefault;
        }
    };
    __decorate([
        main_1.Autowired('selectionController'),
        __metadata("design:type", main_1.SelectionController)
    ], GroupStage.prototype, "selectionController", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], GroupStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], GroupStage.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('valueService'),
        __metadata("design:type", main_1.ValueService)
    ], GroupStage.prototype, "valueService", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], GroupStage.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], GroupStage.prototype, "context", void 0);
    GroupStage = __decorate([
        main_1.Bean('groupStage')
    ], GroupStage);
    return GroupStage;
}());
exports.GroupStage = GroupStage;
