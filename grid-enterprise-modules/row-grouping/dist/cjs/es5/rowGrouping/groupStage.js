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
exports.GroupStage = void 0;
var core_1 = require("@ag-grid-community/core");
var batchRemover_1 = require("./batchRemover");
var GroupStage = /** @class */ (function (_super) {
    __extends(GroupStage, _super);
    function GroupStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupStage.prototype.execute = function (params) {
        var details = this.createGroupingDetails(params);
        if (details.transactions) {
            this.handleTransaction(details);
        }
        else {
            var afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
        if (!details.usingTreeData) {
            // we don't do group sorting for tree data
            this.positionLeafsAndGroups(params.changedPath);
            this.orderGroups(details);
        }
        this.selectableService.updateSelectableAfterGrouping();
    };
    GroupStage.prototype.positionLeafsAndGroups = function (changedPath) {
        changedPath.forEachChangedNodeDepthFirst(function (group) {
            if (group.childrenAfterGroup) {
                var leafNodes_1 = [];
                var groupNodes_1 = [];
                var unbalancedNode_1;
                group.childrenAfterGroup.forEach(function (row) {
                    var _a;
                    if (!((_a = row.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
                        leafNodes_1.push(row);
                    }
                    else {
                        if (row.key === '' && !unbalancedNode_1) {
                            unbalancedNode_1 = row;
                        }
                        else {
                            groupNodes_1.push(row);
                        }
                    }
                });
                if (unbalancedNode_1) {
                    groupNodes_1.push(unbalancedNode_1);
                }
                group.childrenAfterGroup = __spreadArray(__spreadArray([], __read(leafNodes_1), false), __read(groupNodes_1), false);
            }
        }, false);
    };
    GroupStage.prototype.createGroupingDetails = function (params) {
        var _a;
        var rowNode = params.rowNode, changedPath = params.changedPath, rowNodeTransactions = params.rowNodeTransactions, rowNodeOrder = params.rowNodeOrder;
        var usingTreeData = this.gridOptionsService.get('treeData');
        var groupedCols = usingTreeData ? null : this.columnModel.getRowGroupColumns();
        var details = {
            // someone complained that the parent attribute was causing some change detection
            // to break in an angular add-on.  Taking the parent out breaks a cyclic dependency, hence this flag got introduced.
            includeParents: !this.gridOptionsService.get('suppressParentsInRowNodes'),
            expandByDefault: this.gridOptionsService.get('groupDefaultExpanded'),
            groupedCols: groupedCols,
            rootNode: rowNode,
            pivotMode: this.columnModel.isPivotMode(),
            groupedColCount: usingTreeData || !groupedCols ? 0 : groupedCols.length,
            rowNodeOrder: rowNodeOrder,
            transactions: rowNodeTransactions,
            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath,
            groupAllowUnbalanced: this.gridOptionsService.get('groupAllowUnbalanced'),
            isGroupOpenByDefault: this.gridOptionsService.getCallback('isGroupOpenByDefault'),
            initialGroupOrderComparator: this.gridOptionsService.getCallback('initialGroupOrderComparator'),
            usingTreeData: usingTreeData,
            suppressGroupMaintainValueType: this.gridOptionsService.get('suppressGroupMaintainValueType'),
            getDataPath: usingTreeData ? this.gridOptionsService.get('getDataPath') : undefined,
            keyCreators: (_a = groupedCols === null || groupedCols === void 0 ? void 0 : groupedCols.map(function (column) { return column.getColDef().keyCreator; })) !== null && _a !== void 0 ? _a : []
        };
        return details;
    };
    GroupStage.prototype.handleTransaction = function (details) {
        var _this = this;
        details.transactions.forEach(function (tran) {
            // we don't allow batch remover for tree data as tree data uses Filler Nodes,
            // and creating/deleting filler nodes needs to be done alongside the node deleting
            // and moving. if we want to Batch Remover working with tree data then would need
            // to consider how Filler Nodes would be impacted (it's possible that it can be easily
            // modified to work, however for now I don't have the brain energy to work it all out).
            var batchRemover = !details.usingTreeData ? new batchRemover_1.BatchRemover() : undefined;
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // as the order is important when a record with the same id is added and removed in the same
            // transaction.
            if (core_1._.existsAndNotEmpty(tran.remove)) {
                _this.removeNodes(tran.remove, details, batchRemover);
            }
            if (core_1._.existsAndNotEmpty(tran.update)) {
                _this.moveNodesInWrongPath(tran.update, details, batchRemover);
            }
            if (core_1._.existsAndNotEmpty(tran.add)) {
                _this.insertNodes(tran.add, details, false);
            }
            // must flush here, and not allow another transaction to be applied,
            // as each transaction must finish leaving the data in a consistent state.
            if (batchRemover) {
                var parentsWithChildrenRemoved = batchRemover.getAllParents().slice();
                batchRemover.flush();
                _this.removeEmptyGroups(parentsWithChildrenRemoved, details);
            }
        });
        if (details.rowNodeOrder) {
            this.sortChildren(details);
        }
    };
    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    GroupStage.prototype.sortChildren = function (details) {
        details.changedPath.forEachChangedNodeDepthFirst(function (node) {
            if (!node.childrenAfterGroup) {
                return;
            }
            var didSort = core_1._.sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
            if (didSort) {
                details.changedPath.addParentNode(node);
            }
        }, false, true);
    };
    GroupStage.prototype.orderGroups = function (details) {
        var comparator = details.initialGroupOrderComparator;
        if (core_1._.exists(comparator)) {
            recursiveSort(details.rootNode);
        }
        function recursiveSort(rowNode) {
            var doSort = core_1._.exists(rowNode.childrenAfterGroup) &&
                // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
                !rowNode.leafGroup;
            if (doSort) {
                rowNode.childrenAfterGroup.sort(function (nodeA, nodeB) { return comparator({ nodeA: nodeA, nodeB: nodeB }); });
                rowNode.childrenAfterGroup.forEach(function (childNode) { return recursiveSort(childNode); });
            }
        }
    };
    GroupStage.prototype.getExistingPathForNode = function (node, details) {
        var res = [];
        // when doing tree data, the node is part of the path,
        // but when doing grid grouping, the node is not part of the path so we start with the parent.
        var pointer = details.usingTreeData ? node : node.parent;
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
    GroupStage.prototype.moveNodesInWrongPath = function (childNodes, details, batchRemover) {
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
            var nodeInCorrectPath = core_1._.areEqual(oldPath, newPath);
            if (!nodeInCorrectPath) {
                _this.moveNode(childNode, details, batchRemover);
            }
        });
    };
    GroupStage.prototype.moveNode = function (childNode, details, batchRemover) {
        this.removeNodesInStages([childNode], details, batchRemover);
        this.insertOneNode(childNode, details, true, batchRemover);
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
    GroupStage.prototype.removeNodes = function (leafRowNodes, details, batchRemover) {
        this.removeNodesInStages(leafRowNodes, details, batchRemover);
        if (details.changedPath.isActive()) {
            leafRowNodes.forEach(function (rowNode) { return details.changedPath.addParentNode(rowNode.parent); });
        }
    };
    GroupStage.prototype.removeNodesInStages = function (leafRowNodes, details, batchRemover) {
        this.removeNodesFromParents(leafRowNodes, details, batchRemover);
        if (details.usingTreeData) {
            this.postRemoveCreateFillerNodes(leafRowNodes, details);
            // When not TreeData, then removeEmptyGroups is called just before the BatchRemover is flushed.
            // However for TreeData, there is no BatchRemover, so we have to call removeEmptyGroups here.
            var nodeParents = leafRowNodes.map(function (n) { return n.parent; });
            this.removeEmptyGroups(nodeParents, details);
        }
    };
    GroupStage.prototype.forEachParentGroup = function (details, group, callback) {
        var pointer = group;
        while (pointer && pointer !== details.rootNode) {
            callback(pointer);
            pointer = pointer.parent;
        }
    };
    GroupStage.prototype.removeNodesFromParents = function (nodesToRemove, details, provided) {
        var _this = this;
        // this method can be called with BatchRemover as optional. if it is missed, we created a local version
        // and flush it at the end. if one is provided, we add to the provided one and it gets flushed elsewhere.
        var batchRemoverIsLocal = provided == null;
        var batchRemoverToUse = provided ? provided : new batchRemover_1.BatchRemover();
        nodesToRemove.forEach(function (nodeToRemove) {
            _this.removeFromParent(nodeToRemove, batchRemoverToUse);
            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            _this.forEachParentGroup(details, nodeToRemove.parent, function (parentNode) {
                batchRemoverToUse.removeFromAllLeafChildren(parentNode, nodeToRemove);
            });
        });
        if (batchRemoverIsLocal) {
            batchRemoverToUse.flush();
        }
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
                newGroupNode_1.updateHasChildren();
                newGroupNode_1.childrenAfterGroup.forEach(function (rowNode) { return rowNode.parent = newGroupNode_1; });
            }
        });
    };
    GroupStage.prototype.removeEmptyGroups = function (possibleEmptyGroups, details) {
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
            // if still not removed, then we remove if this group is empty
            return !!rowNode.isEmptyRowGroupNode();
        };
        var _loop_1 = function () {
            checkAgain = false;
            var batchRemover = new batchRemover_1.BatchRemover();
            possibleEmptyGroups.forEach(function (possibleEmptyGroup) {
                // remove empty groups
                _this.forEachParentGroup(details, possibleEmptyGroup, function (rowNode) {
                    if (groupShouldBeRemoved(rowNode)) {
                        checkAgain = true;
                        _this.removeFromParent(rowNode, batchRemover);
                        // we remove selection on filler nodes here, as the selection would not be removed
                        // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                        rowNode.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
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
    // d) setRowIndex(null) - as the rowNode will no longer be displayed.
    GroupStage.prototype.removeFromParent = function (child, batchRemover) {
        if (child.parent) {
            if (batchRemover) {
                batchRemover.removeFromChildrenAfterGroup(child.parent, child);
            }
            else {
                core_1._.removeFromArray(child.parent.childrenAfterGroup, child);
                child.parent.updateHasChildren();
            }
        }
        var mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (child.parent && child.parent.childrenMapped) {
            child.parent.childrenMapped[mapKey] = undefined;
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
    };
    GroupStage.prototype.addToParent = function (child, parent) {
        var mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (parent) {
            var children = parent.childrenMapped != null;
            if (children) {
                parent.childrenMapped[mapKey] = child;
            }
            parent.childrenAfterGroup.push(child);
            parent.updateHasChildren();
        }
    };
    GroupStage.prototype.areGroupColsEqual = function (d1, d2) {
        if (d1 == null || d2 == null || d1.pivotMode !== d2.pivotMode) {
            return false;
        }
        return core_1._.areEqual(d1.groupedCols, d2.groupedCols) && core_1._.areEqual(d1.keyCreators, d2.keyCreators);
    };
    GroupStage.prototype.checkAllGroupDataAfterColsChanged = function (details) {
        var _this = this;
        var recurse = function (rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                var isLeafNode = !details.usingTreeData && !rowNode.group;
                if (isLeafNode) {
                    return;
                }
                var groupInfo = {
                    field: rowNode.field,
                    key: rowNode.key,
                    rowGroupColumn: rowNode.rowGroupColumn,
                    leafNode: rowNode.allLeafChildren[0],
                };
                _this.setGroupData(rowNode, groupInfo, details);
                recurse(rowNode.childrenAfterGroup);
            });
        };
        recurse(details.rootNode.childrenAfterGroup);
    };
    GroupStage.prototype.shotgunResetEverything = function (details, afterColumnsChanged) {
        if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
            return;
        }
        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection(function (node) { return node && !node.group; });
        var rootNode = details.rootNode, groupedCols = details.groupedCols;
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        rootNode.leafGroup = details.usingTreeData ? false : groupedCols.length === 0;
        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();
        var sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }
        this.insertNodes(rootNode.allLeafChildren, details, false);
    };
    GroupStage.prototype.noChangeInGroupingColumns = function (details, afterColumnsChanged) {
        var noFurtherProcessingNeeded = false;
        var groupDisplayColumns = this.columnModel.getGroupDisplayColumns();
        var newGroupDisplayColIds = groupDisplayColumns ?
            groupDisplayColumns.map(function (c) { return c.getId(); }).join('-') : '';
        if (afterColumnsChanged) {
            // we only need to redo grouping if doing normal grouping (ie not tree data)
            // and the group cols have changed.
            noFurtherProcessingNeeded = details.usingTreeData || this.areGroupColsEqual(details, this.oldGroupingDetails);
            // if the group display cols have changed, then we need to update rowNode.groupData
            // (regardless of tree data or row grouping)
            if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
                this.checkAllGroupDataAfterColsChanged(details);
            }
        }
        this.oldGroupingDetails = details;
        this.oldGroupDisplayColIds = newGroupDisplayColIds;
        return noFurtherProcessingNeeded;
    };
    GroupStage.prototype.insertNodes = function (newRowNodes, details, isMove) {
        var _this = this;
        if (details.usingTreeData) {
            var longestPath_1 = 1;
            var rowNodesAndPaths = newRowNodes.map(function (node) {
                var path = _this.getGroupInfo(node, details);
                longestPath_1 = Math.max(longestPath_1, path.length);
                return [node, path];
            });
            var _loop_2 = function (checkedLevel) {
                rowNodesAndPaths.forEach(function (_a) {
                    var _b = __read(_a, 2), rowNode = _b[0], path = _b[1];
                    if (path.length !== checkedLevel) {
                        return;
                    }
                    _this.insertOneNode(rowNode, details, isMove, undefined, path);
                    if (details.changedPath.isActive()) {
                        details.changedPath.addParentNode(rowNode.parent);
                    }
                });
            };
            // a performance improvement for tree data, by starting at the shortest paths,
            // less redundant groups need created and destroyed
            for (var checkedLevel = 1; checkedLevel < longestPath_1; checkedLevel++) {
                _loop_2(checkedLevel);
            }
            return;
        }
        newRowNodes.forEach(function (rowNode) {
            _this.insertOneNode(rowNode, details, isMove);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    };
    GroupStage.prototype.insertOneNode = function (childNode, details, isMove, batchRemover, providedPath) {
        var path = providedPath !== null && providedPath !== void 0 ? providedPath : this.getGroupInfo(childNode, details);
        var parentGroup = this.findParentForNode(childNode, path, details, batchRemover);
        if (!parentGroup.group) {
            console.warn("AG Grid: duplicate group keys for row data, keys should be unique", [parentGroup.data, childNode.data]);
        }
        if (details.usingTreeData) {
            this.swapGroupWithUserNode(parentGroup, childNode, isMove);
        }
        else {
            childNode.parent = parentGroup;
            childNode.level = path.length;
            parentGroup.childrenAfterGroup.push(childNode);
            parentGroup.updateHasChildren();
        }
    };
    GroupStage.prototype.findParentForNode = function (childNode, path, details, batchRemover) {
        var _this = this;
        var nextNode = details.rootNode;
        path.forEach(function (groupInfo, level) {
            nextNode = _this.getOrCreateNextNode(nextNode, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes
            if (!(batchRemover === null || batchRemover === void 0 ? void 0 : batchRemover.isRemoveFromAllLeafChildren(nextNode, childNode))) {
                nextNode.allLeafChildren.push(childNode);
            }
            else {
                // if this node is about to be removed, prevent that
                batchRemover === null || batchRemover === void 0 ? void 0 : batchRemover.preventRemoveFromAllLeafChildren(nextNode, childNode);
            }
        });
        return nextNode;
    };
    GroupStage.prototype.swapGroupWithUserNode = function (fillerGroup, userGroup, isMove) {
        userGroup.parent = fillerGroup.parent;
        userGroup.key = fillerGroup.key;
        userGroup.field = fillerGroup.field;
        userGroup.groupData = fillerGroup.groupData;
        userGroup.level = fillerGroup.level;
        // AG-3441 - preserve the existing expanded status of the node if we're moving it, so that
        // you can drag a sub tree from one parent to another without changing its expansion
        if (!isMove) {
            userGroup.expanded = fillerGroup.expanded;
        }
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        userGroup.leafGroup = fillerGroup.leafGroup;
        // always null for userGroups, as row grouping is not allowed when doing tree data
        userGroup.rowGroupIndex = fillerGroup.rowGroupIndex;
        userGroup.allLeafChildren = fillerGroup.allLeafChildren;
        userGroup.childrenAfterGroup = fillerGroup.childrenAfterGroup;
        userGroup.childrenMapped = fillerGroup.childrenMapped;
        userGroup.sibling = fillerGroup.sibling;
        userGroup.updateHasChildren();
        this.removeFromParent(fillerGroup);
        userGroup.childrenAfterGroup.forEach(function (rowNode) { return rowNode.parent = userGroup; });
        this.addToParent(userGroup, fillerGroup.parent);
    };
    GroupStage.prototype.getOrCreateNextNode = function (parentGroup, groupInfo, level, details) {
        var key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        var nextNode = parentGroup.childrenMapped ? parentGroup.childrenMapped[key] : undefined;
        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }
        return nextNode;
    };
    GroupStage.prototype.createGroup = function (groupInfo, parent, level, details) {
        var groupNode = new core_1.RowNode(this.beans);
        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;
        this.setGroupData(groupNode, groupInfo, details);
        groupNode.key = groupInfo.key;
        groupNode.id = this.createGroupId(groupNode, parent, details.usingTreeData, level);
        groupNode.level = level;
        groupNode.leafGroup = details.usingTreeData ? false : level === (details.groupedColCount - 1);
        groupNode.allLeafChildren = [];
        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        groupNode.setAllChildrenCount(0);
        groupNode.rowGroupIndex = details.usingTreeData ? null : level;
        groupNode.childrenAfterGroup = [];
        groupNode.childrenMapped = {};
        groupNode.updateHasChildren();
        groupNode.parent = details.includeParents ? parent : null;
        this.setExpandedInitialValue(details, groupNode);
        return groupNode;
    };
    GroupStage.prototype.createGroupId = function (node, parent, usingTreeData, level) {
        var createGroupId;
        if (usingTreeData) {
            createGroupId = function (node, parent, level) {
                if (level < 0) {
                    return null;
                } // root node
                var parentId = parent ? createGroupId(parent, parent.parent, level - 1) : null;
                return "".concat(parentId == null ? '' : parentId + '-').concat(level, "-").concat(node.key);
            };
        }
        else {
            createGroupId = function (node, parent) {
                if (!node.rowGroupColumn) {
                    return null;
                } // root node
                var parentId = parent ? createGroupId(parent, parent.parent, 0) : null;
                return "".concat(parentId == null ? '' : parentId + '-').concat(node.rowGroupColumn.getColId(), "-").concat(node.key);
            };
        }
        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        return core_1.RowNode.ID_PREFIX_ROW_GROUP + createGroupId(node, parent, level);
    };
    GroupStage.prototype.setGroupData = function (groupNode, groupInfo, details) {
        var _this = this;
        groupNode.groupData = {};
        var groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        groupDisplayCols.forEach(function (col) {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            var isTreeData = details.usingTreeData;
            if (isTreeData) {
                groupNode.groupData[col.getColId()] = groupInfo.key;
                return;
            }
            var groupColumn = groupNode.rowGroupColumn;
            var isRowGroupDisplayed = groupColumn !== null && col.isRowGroupDisplayed(groupColumn.getId());
            if (isRowGroupDisplayed) {
                if (details.suppressGroupMaintainValueType) {
                    groupNode.groupData[col.getColId()] = groupInfo.key;
                }
                else {
                    // if maintain group value type, get the value from any leaf node.
                    groupNode.groupData[col.getColId()] = _this.valueService.getValue(groupColumn, groupInfo.leafNode);
                }
            }
        });
    };
    GroupStage.prototype.getChildrenMappedKey = function (key, rowGroupColumn) {
        if (rowGroupColumn) {
            // grouping by columns
            return rowGroupColumn.getId() + '-' + key;
        }
        // tree data - we don't have rowGroupColumns
        return key;
    };
    GroupStage.prototype.setExpandedInitialValue = function (details, groupNode) {
        // if pivoting the leaf group is never expanded as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
            return;
        }
        // use callback if exists
        var userCallback = details.isGroupOpenByDefault;
        if (userCallback) {
            var params = {
                rowNode: groupNode,
                field: groupNode.field,
                key: groupNode.key,
                level: groupNode.level,
                rowGroupColumn: groupNode.rowGroupColumn
            };
            groupNode.expanded = userCallback(params) == true;
            return;
        }
        // use expandByDefault if exists
        var expandByDefault = details.expandByDefault;
        if (details.expandByDefault === -1) {
            groupNode.expanded = true;
            return;
        }
        // otherwise
        groupNode.expanded = groupNode.level < expandByDefault;
    };
    GroupStage.prototype.getGroupInfo = function (rowNode, details) {
        if (details.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode, details);
        }
        return this.getGroupInfoFromGroupColumns(rowNode, details);
    };
    GroupStage.prototype.getGroupInfoFromCallback = function (rowNode, details) {
        var keys = details.getDataPath ? details.getDataPath(rowNode.data) : null;
        if (keys === null || keys === undefined || keys.length === 0) {
            core_1._.warnOnce("getDataPath() should not return an empty path for data ".concat(rowNode.data));
        }
        var groupInfoMapper = function (key) { return ({ key: key, field: null, rowGroupColumn: null }); };
        return keys ? keys.map(groupInfoMapper) : [];
    };
    GroupStage.prototype.getGroupInfoFromGroupColumns = function (rowNode, details) {
        var _this = this;
        var res = [];
        details.groupedCols.forEach(function (groupCol) {
            var key = _this.valueService.getKeyForNode(groupCol, rowNode);
            var keyExists = key !== null && key !== undefined && key !== '';
            // unbalanced tree and pivot mode don't work together - not because of the grid, it doesn't make
            // mathematical sense as you are building up a cube. so if pivot mode, we put in a blank key where missing.
            // this keeps the tree balanced and hence can be represented as a group.
            var createGroupForEmpty = details.pivotMode || !details.groupAllowUnbalanced;
            if (createGroupForEmpty && !keyExists) {
                key = '';
                keyExists = true;
            }
            if (keyExists) {
                var item = {
                    key: key,
                    field: groupCol.getColDef().field,
                    rowGroupColumn: groupCol,
                    leafNode: rowNode,
                };
                res.push(item);
            }
        });
        return res;
    };
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], GroupStage.prototype, "columnModel", void 0);
    __decorate([
        (0, core_1.Autowired)('selectableService')
    ], GroupStage.prototype, "selectableService", void 0);
    __decorate([
        (0, core_1.Autowired)('valueService')
    ], GroupStage.prototype, "valueService", void 0);
    __decorate([
        (0, core_1.Autowired)('beans')
    ], GroupStage.prototype, "beans", void 0);
    __decorate([
        (0, core_1.Autowired)('selectionService')
    ], GroupStage.prototype, "selectionService", void 0);
    GroupStage = __decorate([
        (0, core_1.Bean)('groupStage')
    ], GroupStage);
    return GroupStage;
}(core_1.BeanStub));
exports.GroupStage = GroupStage;
