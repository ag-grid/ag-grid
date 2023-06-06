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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { _, Autowired, Bean, BeanStub, NumberSequence, PostConstruct, RowNode } from "@ag-grid-community/core";
import { BatchRemover } from "./batchRemover";
var GroupStage = /** @class */ (function (_super) {
    __extends(GroupStage, _super);
    function GroupStage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // we use a sequence variable so that each time we do a grouping, we don't
        // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
        // when it tries to animate between rows.
        _this.groupIdSequence = new NumberSequence();
        return _this;
    }
    GroupStage.prototype.postConstruct = function () {
        this.usingTreeData = this.gridOptionsService.isTreeData();
        if (this.usingTreeData) {
            this.getDataPath = this.gridOptionsService.get('getDataPath');
        }
    };
    GroupStage.prototype.execute = function (params) {
        var details = this.createGroupingDetails(params);
        if (details.transactions) {
            this.handleTransaction(details);
        }
        else {
            var afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
        this.positionLeafsAndGroups(params.changedPath);
        this.orderGroups(details.rootNode);
        this.selectableService.updateSelectableAfterGrouping(details.rootNode);
    };
    GroupStage.prototype.positionLeafsAndGroups = function (changedPath) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
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
                group.childrenAfterGroup = __spreadArray(__spreadArray([], __read(leafNodes_1)), __read(groupNodes_1));
            }
        }, false);
    };
    GroupStage.prototype.createGroupingDetails = function (params) {
        var rowNode = params.rowNode, changedPath = params.changedPath, rowNodeTransactions = params.rowNodeTransactions, rowNodeOrder = params.rowNodeOrder;
        var groupedCols = this.usingTreeData ? null : this.columnModel.getRowGroupColumns();
        var details = {
            // someone complained that the parent attribute was causing some change detection
            // to break is some angular add-on - which i never used. taking the parent out breaks
            // a cyclic dependency, hence this flag got introduced.
            includeParents: !this.gridOptionsService.is('suppressParentsInRowNodes'),
            expandByDefault: this.gridOptionsService.getNum('groupDefaultExpanded'),
            groupedCols: groupedCols,
            rootNode: rowNode,
            pivotMode: this.columnModel.isPivotMode(),
            groupedColCount: this.usingTreeData || !groupedCols ? 0 : groupedCols.length,
            rowNodeOrder: rowNodeOrder,
            transactions: rowNodeTransactions,
            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath
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
            var batchRemover = !_this.usingTreeData ? new BatchRemover() : undefined;
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // as the order is important when a record with the same id is added and removed in the same
            // transaction.
            if (_.existsAndNotEmpty(tran.remove)) {
                _this.removeNodes(tran.remove, details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.update)) {
                _this.moveNodesInWrongPath(tran.update, details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.add)) {
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
            var didSort = _.sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
            if (didSort) {
                details.changedPath.addParentNode(node);
            }
        }, false, true);
    };
    GroupStage.prototype.orderGroups = function (rootNode) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
        var comparator = this.gridOptionsService.getCallback('initialGroupOrderComparator');
        if (_.exists(comparator)) {
            recursiveSort(rootNode);
        }
        function recursiveSort(rowNode) {
            var doSort = _.exists(rowNode.childrenAfterGroup) &&
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
            var nodeInCorrectPath = _.areEqual(oldPath, newPath);
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
        if (this.usingTreeData) {
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
        var batchRemoverToUse = provided ? provided : new BatchRemover();
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
            var batchRemover = new BatchRemover();
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
                _.removeFromArray(child.parent.childrenAfterGroup, child);
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
        return _.areEqual(d1.groupedCols, d2.groupedCols);
    };
    GroupStage.prototype.checkAllGroupDataAfterColsChanged = function (details) {
        var _this = this;
        var recurse = function (rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                var isLeafNode = !_this.usingTreeData && !rowNode.group;
                if (isLeafNode) {
                    return;
                }
                var groupInfo = {
                    field: rowNode.field,
                    key: rowNode.key,
                    rowGroupColumn: rowNode.rowGroupColumn
                };
                _this.setGroupData(rowNode, groupInfo);
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
        rootNode.leafGroup = this.usingTreeData ? false : groupedCols.length === 0;
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
            noFurtherProcessingNeeded = this.usingTreeData || this.areGroupColsEqual(details, this.oldGroupingDetails);
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
        newRowNodes.forEach(function (rowNode) {
            _this.insertOneNode(rowNode, details, isMove);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    };
    GroupStage.prototype.insertOneNode = function (childNode, details, isMove, batchRemover) {
        var path = this.getGroupInfo(childNode, details);
        var parentGroup = this.findParentForNode(childNode, path, details, batchRemover);
        if (!parentGroup.group) {
            console.warn("AG Grid: duplicate group keys for row data, keys should be unique", [parentGroup.data, childNode.data]);
        }
        if (this.usingTreeData) {
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
        var groupNode = new RowNode(this.beans);
        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;
        this.setGroupData(groupNode, groupInfo);
        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        groupNode.id = RowNode.ID_PREFIX_ROW_GROUP + this.groupIdSequence.next();
        groupNode.key = groupInfo.key;
        groupNode.level = level;
        groupNode.leafGroup = this.usingTreeData ? false : level === (details.groupedColCount - 1);
        groupNode.allLeafChildren = [];
        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        groupNode.setAllChildrenCount(0);
        groupNode.rowGroupIndex = this.usingTreeData ? null : level;
        groupNode.childrenAfterGroup = [];
        groupNode.childrenMapped = {};
        groupNode.updateHasChildren();
        groupNode.parent = details.includeParents ? parent : null;
        this.setExpandedInitialValue(details, groupNode);
        if (this.gridOptionsService.is('groupIncludeFooter')) {
            groupNode.createFooter();
        }
        return groupNode;
    };
    GroupStage.prototype.setGroupData = function (groupNode, groupInfo) {
        var _this = this;
        groupNode.groupData = {};
        var groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        groupDisplayCols.forEach(function (col) {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            var displayGroupForCol = _this.usingTreeData || (groupNode.rowGroupColumn ? col.isRowGroupDisplayed(groupNode.rowGroupColumn.getId()) : false);
            if (displayGroupForCol) {
                groupNode.groupData[col.getColId()] = groupInfo.key;
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
        var userCallback = this.gridOptionsService.getCallback('isGroupOpenByDefault');
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
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        }
        return this.getGroupInfoFromGroupColumns(rowNode, details);
    };
    GroupStage.prototype.getGroupInfoFromCallback = function (rowNode) {
        var keys = this.getDataPath ? this.getDataPath(rowNode.data) : null;
        if (keys === null || keys === undefined || keys.length === 0) {
            _.doOnce(function () { return console.warn("AG Grid: getDataPath() should not return an empty path for data", rowNode.data); }, 'groupStage.getGroupInfoFromCallback');
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
            var createGroupForEmpty = details.pivotMode || !_this.gridOptionsService.is('groupAllowUnbalanced');
            if (createGroupForEmpty && !keyExists) {
                key = '';
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
        Autowired('columnModel')
    ], GroupStage.prototype, "columnModel", void 0);
    __decorate([
        Autowired('selectableService')
    ], GroupStage.prototype, "selectableService", void 0);
    __decorate([
        Autowired('valueService')
    ], GroupStage.prototype, "valueService", void 0);
    __decorate([
        Autowired('beans')
    ], GroupStage.prototype, "beans", void 0);
    __decorate([
        Autowired('selectionService')
    ], GroupStage.prototype, "selectionService", void 0);
    __decorate([
        PostConstruct
    ], GroupStage.prototype, "postConstruct", null);
    GroupStage = __decorate([
        Bean('groupStage')
    ], GroupStage);
    return GroupStage;
}(BeanStub));
export { GroupStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBTdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9ncm91cFN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBT1IsY0FBYyxFQUNkLGFBQWEsRUFDYixPQUFPLEVBU1YsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFxQjlDO0lBQWdDLDhCQUFRO0lBQXhDO1FBQUEscUVBNnJCQztRQWhyQkcsMEVBQTBFO1FBQzFFLGtGQUFrRjtRQUNsRix5Q0FBeUM7UUFDakMscUJBQWUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDOztJQTZxQm5ELENBQUM7SUFqcUJXLGtDQUFhLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUQsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNqRTtJQUNMLENBQUM7SUFFTSw0QkFBTyxHQUFkLFVBQWUsTUFBMEI7UUFFckMsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5ELElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtZQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkM7YUFBTTtZQUNILElBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixLQUFLLElBQUksQ0FBQztZQUM3RCxJQUFJLENBQUMsc0JBQXNCLENBQUMs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