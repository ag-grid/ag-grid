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
var GroupStage = /** @class */ (function () {
    function GroupStage() {
        // we use a sequence variable so that each time we do a grouping, we don't
        // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
        // when it tries to animate between rows. we set to -1 as others row id 0 will be shared
        // with the other rows.
        this.groupIdSequence = new ag_grid_community_1.NumberSequence(1);
    }
    GroupStage.prototype.postConstruct = function () {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (this.usingTreeData) {
            this.getDataPath = this.gridOptionsWrapper.getDataPathFunc();
        }
    };
    GroupStage.prototype.execute = function (params) {
        var details = this.createGroupingDetails(params);
        if (details.transaction) {
            this.handleTransaction(details);
        }
        else {
            var afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
        this.sortGroupsWithComparator(details.rootNode);
        this.selectableService.updateSelectableAfterGrouping(details.rootNode);
    };
    GroupStage.prototype.createGroupingDetails = function (params) {
        var rowNode = params.rowNode, changedPath = params.changedPath, rowNodeTransaction = params.rowNodeTransaction, rowNodeOrder = params.rowNodeOrder;
        var groupedCols = this.usingTreeData ? null : this.columnController.getRowGroupColumns();
        var isGrouping = this.usingTreeData || (groupedCols && groupedCols.length > 0);
        var usingTransaction = isGrouping && ag_grid_community_1._.exists(rowNodeTransaction);
        var details = {
            // someone complained that the parent attribute was causing some change detection
            // to break is some angular add-on - which i never used. taking the parent out breaks
            // a cyclic dependency, hence this flag got introduced.
            includeParents: !this.gridOptionsWrapper.isSuppressParentsInRowNodes(),
            expandByDefault: this.gridOptionsWrapper.isGroupSuppressRow() ?
                -1 : this.gridOptionsWrapper.getGroupDefaultExpanded(),
            groupedCols: groupedCols,
            rootNode: rowNode,
            pivotMode: this.columnController.isPivotMode(),
            groupedColCount: this.usingTreeData || !groupedCols ? 0 : groupedCols.length,
            rowNodeOrder: rowNodeOrder,
            // important not to do transaction if we are not grouping, as otherwise the 'insert index' is ignored.
            // ie, if not grouping, then we just want to shotgun so the rootNode.allLeafChildren gets copied
            // to rootNode.childrenAfterGroup and maintaining order (as delta transaction misses the order).
            transaction: usingTransaction ? rowNodeTransaction : null,
            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath
        };
        return details;
    };
    GroupStage.prototype.handleTransaction = function (details) {
        var tran = details.transaction;
        if (tran.add) {
            this.insertNodes(tran.add, details);
        }
        if (tran.update) {
            this.moveNodesInWrongPath(tran.update, details);
        }
        if (tran.remove) {
            this.removeNodes(tran.remove, details);
        }
        if (details.rowNodeOrder) {
            this.sortChildren(details);
        }
    };
    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    GroupStage.prototype.sortChildren = function (details) {
        details.changedPath.forEachChangedNodeDepthFirst(function (rowNode) {
            ag_grid_community_1._.sortRowNodesByOrder(rowNode.childrenAfterGroup, details.rowNodeOrder);
        });
    };
    GroupStage.prototype.sortGroupsWithComparator = function (rootNode) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
        var comparator = this.gridOptionsWrapper.getDefaultGroupSortComparator();
        if (ag_grid_community_1._.exists(comparator)) {
            recursiveSort(rootNode);
        }
        function recursiveSort(rowNode) {
            var doSort = ag_grid_community_1._.exists(rowNode.childrenAfterGroup) &&
                // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
                !rowNode.leafGroup;
            if (doSort) {
                rowNode.childrenAfterGroup.sort(comparator);
                rowNode.childrenAfterGroup.forEach(function (childNode) { return recursiveSort(childNode); });
            }
        }
    };
    GroupStage.prototype.getExistingPathForNode = function (node, details) {
        var res = [];
        // when doing tree data, the node is part of the path,
        // but when doing grid grouping, the node is not part of the path so we start with the parent.
        var pointer = this.usingTreeData ? node : node.parent;
        while (pointer && pointer !== details.rootNode) {
            res.push({
                key: pointer.key,
                rowGroupColumn: pointer.rowGroupColumn,
                field: pointer.field
            });
            pointer = pointer.parent;
        }
        res.reverse();
        return res;
    };
    GroupStage.prototype.moveNodesInWrongPath = function (childNodes, details) {
        var _this = this;
        childNodes.forEach(function (childNode) {
            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(childNode.parent);
            }
            var infoToKeyMapper = function (item) { return item.key; };
            var oldPath = _this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            var newPath = _this.getGroupInfo(childNode, details).map(infoToKeyMapper);
            var nodeInCorrectPath = ag_grid_community_1._.compareArrays(oldPath, newPath);
            if (!nodeInCorrectPath) {
                _this.moveNode(childNode, details);
            }
        });
    };
    GroupStage.prototype.moveNode = function (childNode, details) {
        this.removeNodesInStages([childNode], details);
        this.insertOneNode(childNode, details);
        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        childNode.setData(childNode.data);
        // we add both old and new parents to changed path, as both will need to be refreshed.
        // we already added the old parent (in calling method), so just add the new parent here
        if (details.changedPath.isActive()) {
            var newParent = childNode.parent;
            details.changedPath.addParentNode(newParent);
        }
    };
    GroupStage.prototype.removeNodes = function (leafRowNodes, details) {
        this.removeNodesInStages(leafRowNodes, details);
        if (details.changedPath.isActive()) {
            leafRowNodes.forEach(function (rowNode) { return details.changedPath.addParentNode(rowNode.parent); });
        }
    };
    GroupStage.prototype.removeNodesInStages = function (leafRowNodes, details) {
        this.removeNodesFromParents(leafRowNodes, details);
        this.postRemoveCreateFillerNodes(leafRowNodes, details);
        this.postRemoveRemoveEmptyGroups(leafRowNodes, details);
    };
    GroupStage.prototype.forEachParentGroup = function (details, child, callback) {
        var pointer = child.parent;
        while (pointer && pointer !== details.rootNode) {
            callback(pointer);
            pointer = pointer.parent;
        }
    };
    GroupStage.prototype.removeNodesFromParents = function (nodesToRemove, details) {
        var _this = this;
        var batchRemover = new BatchRemover();
        nodesToRemove.forEach(function (nodeToRemove) {
            _this.removeFromParent(nodeToRemove, batchRemover);
            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            _this.forEachParentGroup(details, nodeToRemove, function (parentNode) {
                batchRemover.removeFromAllLeafChildren(parentNode, nodeToRemove);
            });
        });
        batchRemover.flush();
    };
    GroupStage.prototype.postRemoveCreateFillerNodes = function (nodesToRemove, details) {
        var _this = this;
        nodesToRemove.forEach(function (nodeToRemove) {
            // if not group, and children are present, need to move children to a group.
            // otherwise if no children, we can just remove without replacing.
            var replaceWithGroup = nodeToRemove.hasChildren();
            if (replaceWithGroup) {
                var oldPath = _this.getExistingPathForNode(nodeToRemove, details);
                // because we just removed the userGroup, this will always return new support group
                var newGroupNode_1 = _this.findParentForNode(nodeToRemove, oldPath, details);
                // these properties are the ones that will be incorrect in the newly created group,
                // so copy them from the old childNode
                newGroupNode_1.expanded = nodeToRemove.expanded;
                newGroupNode_1.allLeafChildren = nodeToRemove.allLeafChildren;
                newGroupNode_1.childrenAfterGroup = nodeToRemove.childrenAfterGroup;
                newGroupNode_1.childrenMapped = nodeToRemove.childrenMapped;
                newGroupNode_1.childrenAfterGroup.forEach(function (rowNode) { return rowNode.parent = newGroupNode_1; });
            }
        });
    };
    GroupStage.prototype.postRemoveRemoveEmptyGroups = function (nodesToRemove, details) {
        var _this = this;
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        var checkAgain = true;
        var groupShouldBeRemoved = function (rowNode) {
            // because of the while loop below, it's possible we already moved the node,
            // so double check before trying to remove again.
            var mapKey = _this.getChildrenMappedKey(rowNode.key, rowNode.rowGroupColumn);
            var parentRowNode = rowNode.parent;
            var groupAlreadyRemoved = (parentRowNode && parentRowNode.childrenMapped) ?
                !parentRowNode.childrenMapped[mapKey] : true;
            if (groupAlreadyRemoved) {
                // if not linked, then group was already removed
                return false;
            }
            else {
                // if still not removed, then we remove if this group is empty
                return rowNode.isEmptyRowGroupNode();
            }
        };
        var _loop_1 = function () {
            checkAgain = false;
            var batchRemover = new BatchRemover();
            nodesToRemove.forEach(function (nodeToRemove) {
                // remove empty groups
                _this.forEachParentGroup(details, nodeToRemove, function (rowNode) {
                    if (groupShouldBeRemoved(rowNode)) {
                        checkAgain = true;
                        _this.removeFromParent(rowNode, batchRemover);
                        // we remove selection on filler nodes here, as the selection would not be removed
                        // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                        rowNode.setSelected(false);
                    }
                });
            });
            batchRemover.flush();
        };
        while (checkAgain) {
            _loop_1();
        }
    };
    // removes the node from the parent by:
    // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
    // b) removing from childrenMapped (immediately)
    // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
    GroupStage.prototype.removeFromParent = function (child, batchRemover) {
        if (child.parent) {
            if (batchRemover) {
                batchRemover.removeFromChildrenAfterGroup(child.parent, child);
            }
            else {
                ag_grid_community_1._.removeFromArray(child.parent.childrenAfterGroup, child);
            }
        }
        var mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (child.parent && child.parent.childrenMapped) {
            child.parent.childrenMapped[mapKey] = undefined;
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
    };
    GroupStage.prototype.addToParent = function (child, parent) {
        var mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (parent) {
            if (parent.childrenMapped) {
                parent.childrenMapped[mapKey] = child;
            }
            parent.childrenAfterGroup.push(child);
        }
    };
    GroupStage.prototype.areGroupColsEqual = function (d1, d2) {
        if (d1 == null || d2 == null) {
            return false;
        }
        if (d1.pivotMode !== d2.pivotMode) {
            return false;
        }
        if (!ag_grid_community_1._.compareArrays(d1.groupedCols, d2.groupedCols)) {
            return false;
        }
        return true;
    };
    GroupStage.prototype.shotgunResetEverything = function (details, afterColumnsChanged) {
        var skipStage = afterColumnsChanged ?
            this.usingTreeData || this.areGroupColsEqual(details, this.oldGroupingDetails)
            : false;
        this.oldGroupingDetails = details;
        if (skipStage) {
            return;
        }
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        details.rootNode.leafGroup = this.usingTreeData ? false : details.groupedCols.length === 0;
        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        details.rootNode.childrenAfterGroup = [];
        details.rootNode.childrenMapped = {};
        this.insertNodes(details.rootNode.allLeafChildren, details);
    };
    GroupStage.prototype.insertNodes = function (newRowNodes, details) {
        var _this = this;
        newRowNodes.forEach(function (rowNode) {
            _this.insertOneNode(rowNode, details);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    };
    GroupStage.prototype.insertOneNode = function (childNode, details) {
        var path = this.getGroupInfo(childNode, details);
        var parentGroup = this.findParentForNode(childNode, path, details);
        if (!parentGroup.group) {
            console.warn("ag-Grid: duplicate group keys for row data, keys should be unique", [parentGroup.data, childNode.data]);
        }
        if (this.usingTreeData) {
            this.swapGroupWithUserNode(parentGroup, childNode);
        }
        else {
            childNode.parent = parentGroup;
            childNode.level = path.length;
            parentGroup.childrenAfterGroup.push(childNode);
        }
    };
    GroupStage.prototype.findParentForNode = function (childNode, path, details) {
        var _this = this;
        var nextNode = details.rootNode;
        path.forEach(function (groupInfo, level) {
            nextNode = _this.getOrCreateNextNode(nextNode, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes
            nextNode.allLeafChildren.push(childNode);
        });
        return nextNode;
    };
    GroupStage.prototype.swapGroupWithUserNode = function (fillerGroup, userGroup) {
        userGroup.parent = fillerGroup.parent;
        userGroup.key = fillerGroup.key;
        userGroup.field = fillerGroup.field;
        userGroup.groupData = fillerGroup.groupData;
        userGroup.level = fillerGroup.level;
        userGroup.expanded = fillerGroup.expanded;
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        userGroup.leafGroup = fillerGroup.leafGroup;
        // always null for userGroups, as row grouping is not allowed when doing tree data
        userGroup.rowGroupIndex = fillerGroup.rowGroupIndex;
        userGroup.allLeafChildren = fillerGroup.allLeafChildren;
        userGroup.childrenAfterGroup = fillerGroup.childrenAfterGroup;
        userGroup.childrenMapped = fillerGroup.childrenMapped;
        this.removeFromParent(fillerGroup);
        userGroup.childrenAfterGroup.forEach(function (rowNode) { return rowNode.parent = userGroup; });
        this.addToParent(userGroup, fillerGroup.parent);
    };
    GroupStage.prototype.getOrCreateNextNode = function (parentGroup, groupInfo, level, details) {
        var mapKey = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        var nextNode = parentGroup.childrenMapped ? parentGroup.childrenMapped[mapKey] : undefined;
        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }
        return nextNode;
    };
    GroupStage.prototype.createGroup = function (groupInfo, parent, level, details) {
        var _this = this;
        var groupNode = new ag_grid_community_1.RowNode();
        this.context.wireBean(groupNode);
        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;
        groupNode.groupData = {};
        var groupDisplayCols = this.columnController.getGroupDisplayColumns();
        groupDisplayCols.forEach(function (col) {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            var displayGroupForCol = _this.usingTreeData || (groupNode.rowGroupColumn ? col.isRowGroupDisplayed(groupNode.rowGroupColumn.getId()) : false);
            if (displayGroupForCol) {
                groupNode.groupData[col.getColId()] = groupInfo.key;
            }
        });
        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        groupNode.id = (this.groupIdSequence.next() * -1).toString();
        groupNode.key = groupInfo.key;
        groupNode.level = level;
        groupNode.leafGroup = this.usingTreeData ? false : level === (details.groupedColCount - 1);
        // if doing pivoting, then the leaf group is never expanded,
        // as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
        }
        else {
            groupNode.expanded = this.isExpanded(details.expandByDefault, level);
        }
        groupNode.allLeafChildren = [];
        // why is this done here? we are not updating the children could as we go,
        // i suspect this is updated in the filter stage
        groupNode.setAllChildrenCount(0);
        groupNode.rowGroupIndex = this.usingTreeData ? null : level;
        groupNode.childrenAfterGroup = [];
        groupNode.childrenMapped = {};
        groupNode.parent = details.includeParents ? parent : null;
        return groupNode;
    };
    GroupStage.prototype.getChildrenMappedKey = function (key, rowGroupColumn) {
        if (rowGroupColumn) {
            // grouping by columns
            return rowGroupColumn.getId() + '-' + key;
        }
        else {
            // tree data - we don't have rowGroupColumns
            return key;
        }
    };
    GroupStage.prototype.isExpanded = function (expandByDefault, level) {
        if (expandByDefault === -1) {
            return true;
        }
        else {
            return level < expandByDefault;
        }
    };
    GroupStage.prototype.getGroupInfo = function (rowNode, details) {
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        }
        else {
            return this.getGroupInfoFromGroupColumns(rowNode, details);
        }
    };
    GroupStage.prototype.getGroupInfoFromCallback = function (rowNode) {
        var keys = this.getDataPath ? this.getDataPath(rowNode.data) : null;
        if (keys === null || keys === undefined || keys.length === 0) {
            ag_grid_community_1._.doOnce(function () { return console.warn("getDataPath() should not return an empty path for data", rowNode.data); }, 'groupStage.getGroupInfoFromCallback');
        }
        var groupInfoMapper = function (key) { return ({ key: key, field: null, rowGroupColumn: null }); };
        return keys ? keys.map(groupInfoMapper) : [];
    };
    GroupStage.prototype.getGroupInfoFromGroupColumns = function (rowNode, details) {
        var _this = this;
        var res = [];
        details.groupedCols.forEach(function (groupCol) {
            var key = _this.valueService.getKeyForNode(groupCol, rowNode);
            var keyExists = key !== null && key !== undefined;
            // unbalanced tree and pivot mode don't work together - not because of the grid, it doesn't make
            // mathematical sense as you are building up a cube. so if pivot mode, we put in a blank key where missing.
            // this keeps the tree balanced and hence can be represented as a group.
            if (details.pivotMode && !keyExists) {
                key = ' ';
                keyExists = true;
            }
            if (keyExists) {
                var item = {
                    key: key,
                    field: groupCol.getColDef().field,
                    rowGroupColumn: groupCol
                };
                res.push(item);
            }
        });
        return res;
    };
    __decorate([
        ag_grid_community_1.Autowired('selectionController'),
        __metadata("design:type", ag_grid_community_1.SelectionController)
    ], GroupStage.prototype, "selectionController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], GroupStage.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], GroupStage.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('selectableService'),
        __metadata("design:type", ag_grid_community_1.SelectableService)
    ], GroupStage.prototype, "selectableService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('valueService'),
        __metadata("design:type", ag_grid_community_1.ValueService)
    ], GroupStage.prototype, "valueService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], GroupStage.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], GroupStage.prototype, "context", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], GroupStage.prototype, "postConstruct", null);
    GroupStage = __decorate([
        ag_grid_community_1.Bean('groupStage')
    ], GroupStage);
    return GroupStage;
}());
exports.GroupStage = GroupStage;
// doing _.removeFromArray() multiple times on a large list can be a bottleneck.
// when doing large deletes (eg removing 1,000 rows) then we would be calling _.removeFromArray()
// a thousands of times, in particular RootNode.allGroupChildren could be a large list, and
// 1,000 removes is time consuming as each one requires traversing the full list.
// to get around this, we do all the removes in a batch. this class manages the batch.
//
// This problem was brought to light by a client (AG-2879), with dataset of 20,000
// in 10,000 groups (2 items per group), then deleting all rows with transaction,
// it took about 20 seconds to delete. with the BathRemoved, the reduced to less than 1 second.
var BatchRemover = /** @class */ (function () {
    function BatchRemover() {
        this.allSets = {};
        this.allParents = [];
    }
    BatchRemover.prototype.removeFromChildrenAfterGroup = function (parent, child) {
        var set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id] = true;
    };
    BatchRemover.prototype.removeFromAllLeafChildren = function (parent, child) {
        var set = this.getSet(parent);
        set.removeFromAllLeafChildren[child.id] = true;
    };
    BatchRemover.prototype.getSet = function (parent) {
        if (!this.allSets[parent.id]) {
            this.allSets[parent.id] = {
                removeFromAllLeafChildren: {},
                removeFromChildrenAfterGroup: {}
            };
            this.allParents.push(parent);
        }
        return this.allSets[parent.id];
    };
    BatchRemover.prototype.flush = function () {
        var _this = this;
        this.allParents.forEach(function (parent) {
            var nodeDetails = _this.allSets[parent.id];
            parent.childrenAfterGroup = parent.childrenAfterGroup.filter(function (child) {
                var res = !nodeDetails.removeFromChildrenAfterGroup[child.id];
                return res;
            });
            parent.allLeafChildren = parent.allLeafChildren.filter(function (child) { return !nodeDetails.removeFromAllLeafChildren[child.id]; });
        });
        this.allSets = {};
        this.allParents.length = 0;
    };
    return BatchRemover;
}());
