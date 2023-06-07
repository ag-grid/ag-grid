/**
          * @ag-grid-enterprise/row-grouping - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, PostConstruct, Bean, BeanStub, _, NumberSequence, RowNode, Optional, RefSelector, Component, Column, Events, KeyCode, DragSourceType, DragAndDropService, TouchListener, VirtualList, ManagedFocusFeature, PositionableFeature, TabGuardComp, AgSelect, AgPromise, AgInputTextField, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AggregationStage = class AggregationStage extends BeanStub {
    init() {
        this.alwaysAggregateAtRootLevel = this.gridOptionsService.is('alwaysAggregateAtRootLevel');
        this.addManagedPropertyListener('alwaysAggregateAtRootLevel', (propChange) => this.alwaysAggregateAtRootLevel = propChange.currentValue);
        this.groupIncludeTotalFooter = this.gridOptionsService.is('groupIncludeTotalFooter');
        this.addManagedPropertyListener('groupIncludeTotalFooter', (propChange) => this.groupIncludeTotalFooter = propChange.currentValue);
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    execute(params) {
        // if changed path is active, it means we came from a) change detection or b) transaction update.
        // for both of these, if no value columns are present, it means there is nothing to aggregate now
        // and there is no cleanup to be done (as value columns don't change between transactions or change
        // detections). if no value columns and no changed path, means we have to go through all nodes in
        // case we need to clean up agg data from before.
        const noValueColumns = _.missingOrEmpty(this.columnModel.getValueColumns());
        const noUserAgg = !this.gridOptionsService.getCallback('getGroupRowAgg');
        const changedPathActive = params.changedPath && params.changedPath.isActive();
        if (noValueColumns && noUserAgg && changedPathActive) {
            return;
        }
        const aggDetails = this.createAggDetails(params);
        this.recursivelyCreateAggData(aggDetails);
    }
    createAggDetails(params) {
        const pivotActive = this.columnModel.isPivotActive();
        const measureColumns = this.columnModel.getValueColumns();
        const pivotColumns = pivotActive ? this.columnModel.getPivotColumns() : [];
        const aggDetails = {
            changedPath: params.changedPath,
            valueColumns: measureColumns,
            pivotColumns: pivotColumns
        };
        return aggDetails;
    }
    isSuppressAggFilteredOnly() {
        const isGroupAggFiltering = this.gridOptionsService.getGroupAggFiltering() !== undefined;
        return isGroupAggFiltering || this.gridOptionsService.is('suppressAggFilteredOnly');
    }
    recursivelyCreateAggData(aggDetails) {
        // update prop, in case changed since last time
        this.filteredOnly = !this.isSuppressAggFilteredOnly();
        const callback = (rowNode) => {
            const hasNoChildren = !rowNode.hasChildren();
            if (hasNoChildren) {
                // this check is needed for TreeData, in case the node is no longer a child,
                // but it was a child previously.
                if (rowNode.aggData) {
                    rowNode.setAggData(null);
                }
                // never agg data for leaf nodes
                return;
            }
            //Optionally enable the aggregation at the root Node
            const isRootNode = rowNode.level === -1;
            // if total footer is displayed, the value is in use
            if (isRootNode && !this.groupIncludeTotalFooter) {
                const notPivoting = !this.columnModel.isPivotMode();
                if (!this.alwaysAggregateAtRootLevel && notPivoting) {
                    return;
                }
            }
            this.aggregateRowNode(rowNode, aggDetails);
        };
        aggDetails.changedPath.forEachChangedNodeDepthFirst(callback, true);
    }
    aggregateRowNode(rowNode, aggDetails) {
        const measureColumnsMissing = aggDetails.valueColumns.length === 0;
        const pivotColumnsMissing = aggDetails.pivotColumns.length === 0;
        const userFunc = this.gridOptionsService.getCallback('getGroupRowAgg');
        let aggResult;
        if (userFunc) {
            const params = { nodes: rowNode.childrenAfterFilter };
            aggResult = userFunc(params);
        }
        else if (measureColumnsMissing) {
            aggResult = null;
        }
        else if (pivotColumnsMissing) {
            aggResult = this.aggregateRowNodeUsingValuesOnly(rowNode, aggDetails);
        }
        else {
            aggResult = this.aggregateRowNodeUsingValuesAndPivot(rowNode);
        }
        rowNode.setAggData(aggResult);
        // if we are grouping, then it's possible there is a sibling footer
        // to the group, so update the data here also if there is one
        if (rowNode.sibling) {
            rowNode.sibling.setAggData(aggResult);
        }
    }
    aggregateRowNodeUsingValuesAndPivot(rowNode) {
        var _a;
        const result = {};
        const secondaryColumns = (_a = this.columnModel.getSecondaryColumns()) !== null && _a !== void 0 ? _a : [];
        secondaryColumns.forEach(secondaryCol => {
            const { pivotValueColumn, pivotTotalColumnIds, colId, pivotKeys } = secondaryCol.getColDef();
            if (_.exists(pivotTotalColumnIds)) {
                return;
            }
            const keys = pivotKeys !== null && pivotKeys !== void 0 ? pivotKeys : [];
            let values;
            if (rowNode.leafGroup) {
                // lowest level group, get the values from the mapped set
                values = this.getValuesFromMappedSet(rowNode.childrenMapped, keys, pivotValueColumn);
            }
            else {
                // value columns and pivot columns, non-leaf group
                values = this.getValuesPivotNonLeaf(rowNode, colId);
            }
            result[colId] = this.aggregateValues(values, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode, secondaryCol);
        });
        secondaryColumns.forEach(secondaryCol => {
            const { pivotValueColumn, pivotTotalColumnIds, colId } = secondaryCol.getColDef();
            if (!_.exists(pivotTotalColumnIds)) {
                return;
            }
            const aggResults = [];
            //retrieve results for colIds associated with this pivot total column
            if (!pivotTotalColumnIds || !pivotTotalColumnIds.length) {
                return;
            }
            pivotTotalColumnIds.forEach((currentColId) => {
                aggResults.push(result[currentColId]);
            });
            result[colId] = this.aggregateValues(aggResults, pivotValueColumn.getAggFunc(), pivotValueColumn, rowNode, secondaryCol);
        });
        return result;
    }
    aggregateRowNodeUsingValuesOnly(rowNode, aggDetails) {
        const result = {};
        const changedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : aggDetails.valueColumns;
        const notChangedValueColumns = aggDetails.changedPath.isActive() ?
            aggDetails.changedPath.getNotValueColumnsForNode(rowNode, aggDetails.valueColumns)
            : null;
        const values2d = this.getValuesNormal(rowNode, changedValueColumns);
        const oldValues = rowNode.aggData;
        changedValueColumns.forEach((valueColumn, index) => {
            result[valueColumn.getId()] = this.aggregateValues(values2d[index], valueColumn.getAggFunc(), valueColumn, rowNode);
        });
        if (notChangedValueColumns && oldValues) {
            notChangedValueColumns.forEach((valueColumn) => {
                result[valueColumn.getId()] = oldValues[valueColumn.getId()];
            });
        }
        return result;
    }
    getValuesPivotNonLeaf(rowNode, colId) {
        const values = [];
        rowNode.childrenAfterFilter.forEach((node) => {
            const value = node.aggData[colId];
            values.push(value);
        });
        return values;
    }
    getValuesFromMappedSet(mappedSet, keys, valueColumn) {
        let mapPointer = mappedSet;
        keys.forEach(key => (mapPointer = mapPointer ? mapPointer[key] : null));
        if (!mapPointer) {
            return [];
        }
        const values = [];
        mapPointer.forEach((rowNode) => {
            const value = this.valueService.getValue(valueColumn, rowNode);
            values.push(value);
        });
        return values;
    }
    getValuesNormal(rowNode, valueColumns) {
        // create 2d array, of all values for all valueColumns
        const values = [];
        valueColumns.forEach(() => values.push([]));
        const valueColumnCount = valueColumns.length;
        const nodeList = this.filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup;
        const rowCount = nodeList.length;
        for (let i = 0; i < rowCount; i++) {
            const childNode = nodeList[i];
            for (let j = 0; j < valueColumnCount; j++) {
                const valueColumn = valueColumns[j];
                // if the row is a group, then it will only have an agg result value,
                // which means valueGetter is never used.
                const value = this.valueService.getValue(valueColumn, childNode);
                values[j].push(value);
            }
        }
        return values;
    }
    aggregateValues(values, aggFuncOrString, column, rowNode, pivotResultColumn) {
        const aggFunc = typeof aggFuncOrString === 'string' ?
            this.aggFuncService.getAggFunc(aggFuncOrString) :
            aggFuncOrString;
        if (typeof aggFunc !== 'function') {
            console.error(`AG Grid: unrecognised aggregation function ${aggFuncOrString}`);
            return null;
        }
        const aggFuncAny = aggFunc;
        const params = {
            values: values,
            column: column,
            colDef: column ? column.getColDef() : undefined,
            pivotResultColumn: pivotResultColumn,
            rowNode: rowNode,
            data: rowNode ? rowNode.data : undefined,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context,
        }; // the "as any" is needed to allow the deprecation warning messages
        return aggFuncAny(params);
    }
};
__decorate$d([
    Autowired('columnModel')
], AggregationStage.prototype, "columnModel", void 0);
__decorate$d([
    Autowired('valueService')
], AggregationStage.prototype, "valueService", void 0);
__decorate$d([
    Autowired('aggFuncService')
], AggregationStage.prototype, "aggFuncService", void 0);
__decorate$d([
    Autowired('gridApi')
], AggregationStage.prototype, "gridApi", void 0);
__decorate$d([
    Autowired('columnApi')
], AggregationStage.prototype, "columnApi", void 0);
__decorate$d([
    PostConstruct
], AggregationStage.prototype, "init", null);
AggregationStage = __decorate$d([
    Bean('aggregationStage')
], AggregationStage);

class BatchRemover {
    constructor() {
        this.allSets = {};
        this.allParents = [];
    }
    removeFromChildrenAfterGroup(parent, child) {
        const set = this.getSet(parent);
        set.removeFromChildrenAfterGroup[child.id] = true;
    }
    isRemoveFromAllLeafChildren(parent, child) {
        const set = this.getSet(parent);
        return !!set.removeFromAllLeafChildren[child.id];
    }
    preventRemoveFromAllLeafChildren(parent, child) {
        const set = this.getSet(parent);
        delete set.removeFromAllLeafChildren[child.id];
    }
    removeFromAllLeafChildren(parent, child) {
        const set = this.getSet(parent);
        set.removeFromAllLeafChildren[child.id] = true;
    }
    getSet(parent) {
        if (!this.allSets[parent.id]) {
            this.allSets[parent.id] = {
                removeFromAllLeafChildren: {},
                removeFromChildrenAfterGroup: {}
            };
            this.allParents.push(parent);
        }
        return this.allSets[parent.id];
    }
    getAllParents() {
        return this.allParents;
    }
    flush() {
        this.allParents.forEach(parent => {
            const nodeDetails = this.allSets[parent.id];
            parent.childrenAfterGroup = parent.childrenAfterGroup.filter(child => !nodeDetails.removeFromChildrenAfterGroup[child.id]);
            parent.allLeafChildren = parent.allLeafChildren.filter(child => !nodeDetails.removeFromAllLeafChildren[child.id]);
            parent.updateHasChildren();
            if (parent.sibling) {
                parent.sibling.childrenAfterGroup = parent.childrenAfterGroup;
                parent.sibling.allLeafChildren = parent.allLeafChildren;
            }
        });
        this.allSets = {};
        this.allParents.length = 0;
    }
}

var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let GroupStage = class GroupStage extends BeanStub {
    constructor() {
        super(...arguments);
        // we use a sequence variable so that each time we do a grouping, we don't
        // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
        // when it tries to animate between rows.
        this.groupIdSequence = new NumberSequence();
    }
    postConstruct() {
        this.usingTreeData = this.gridOptionsService.isTreeData();
        if (this.usingTreeData) {
            this.getDataPath = this.gridOptionsService.get('getDataPath');
        }
    }
    execute(params) {
        const details = this.createGroupingDetails(params);
        if (details.transactions) {
            this.handleTransaction(details);
        }
        else {
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
        this.positionLeafsAndGroups(params.changedPath);
        this.orderGroups(details.rootNode);
        this.selectableService.updateSelectableAfterGrouping(details.rootNode);
    }
    positionLeafsAndGroups(changedPath) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
        changedPath.forEachChangedNodeDepthFirst(group => {
            if (group.childrenAfterGroup) {
                const leafNodes = [];
                const groupNodes = [];
                let unbalancedNode;
                group.childrenAfterGroup.forEach(row => {
                    var _a;
                    if (!((_a = row.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
                        leafNodes.push(row);
                    }
                    else {
                        if (row.key === '' && !unbalancedNode) {
                            unbalancedNode = row;
                        }
                        else {
                            groupNodes.push(row);
                        }
                    }
                });
                if (unbalancedNode) {
                    groupNodes.push(unbalancedNode);
                }
                group.childrenAfterGroup = [...leafNodes, ...groupNodes];
            }
        }, false);
    }
    createGroupingDetails(params) {
        const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;
        const groupedCols = this.usingTreeData ? null : this.columnModel.getRowGroupColumns();
        const details = {
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
    }
    handleTransaction(details) {
        details.transactions.forEach(tran => {
            // we don't allow batch remover for tree data as tree data uses Filler Nodes,
            // and creating/deleting filler nodes needs to be done alongside the node deleting
            // and moving. if we want to Batch Remover working with tree data then would need
            // to consider how Filler Nodes would be impacted (it's possible that it can be easily
            // modified to work, however for now I don't have the brain energy to work it all out).
            const batchRemover = !this.usingTreeData ? new BatchRemover() : undefined;
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // as the order is important when a record with the same id is added and removed in the same
            // transaction.
            if (_.existsAndNotEmpty(tran.remove)) {
                this.removeNodes(tran.remove, details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.update)) {
                this.moveNodesInWrongPath(tran.update, details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.add)) {
                this.insertNodes(tran.add, details, false);
            }
            // must flush here, and not allow another transaction to be applied,
            // as each transaction must finish leaving the data in a consistent state.
            if (batchRemover) {
                const parentsWithChildrenRemoved = batchRemover.getAllParents().slice();
                batchRemover.flush();
                this.removeEmptyGroups(parentsWithChildrenRemoved, details);
            }
        });
        if (details.rowNodeOrder) {
            this.sortChildren(details);
        }
    }
    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    sortChildren(details) {
        details.changedPath.forEachChangedNodeDepthFirst(node => {
            if (!node.childrenAfterGroup) {
                return;
            }
            const didSort = _.sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
            if (didSort) {
                details.changedPath.addParentNode(node);
            }
        }, false, true);
    }
    orderGroups(rootNode) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
        const comparator = this.gridOptionsService.getCallback('initialGroupOrderComparator');
        if (_.exists(comparator)) {
            recursiveSort(rootNode);
        }
        function recursiveSort(rowNode) {
            const doSort = _.exists(rowNode.childrenAfterGroup) &&
                // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
                !rowNode.leafGroup;
            if (doSort) {
                rowNode.childrenAfterGroup.sort((nodeA, nodeB) => comparator({ nodeA, nodeB }));
                rowNode.childrenAfterGroup.forEach((childNode) => recursiveSort(childNode));
            }
        }
    }
    getExistingPathForNode(node, details) {
        const res = [];
        // when doing tree data, the node is part of the path,
        // but when doing grid grouping, the node is not part of the path so we start with the parent.
        let pointer = this.usingTreeData ? node : node.parent;
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
    }
    moveNodesInWrongPath(childNodes, details, batchRemover) {
        childNodes.forEach(childNode => {
            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(childNode.parent);
            }
            const infoToKeyMapper = (item) => item.key;
            const oldPath = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            const newPath = this.getGroupInfo(childNode, details).map(infoToKeyMapper);
            const nodeInCorrectPath = _.areEqual(oldPath, newPath);
            if (!nodeInCorrectPath) {
                this.moveNode(childNode, details, batchRemover);
            }
        });
    }
    moveNode(childNode, details, batchRemover) {
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
            const newParent = childNode.parent;
            details.changedPath.addParentNode(newParent);
        }
    }
    removeNodes(leafRowNodes, details, batchRemover) {
        this.removeNodesInStages(leafRowNodes, details, batchRemover);
        if (details.changedPath.isActive()) {
            leafRowNodes.forEach(rowNode => details.changedPath.addParentNode(rowNode.parent));
        }
    }
    removeNodesInStages(leafRowNodes, details, batchRemover) {
        this.removeNodesFromParents(leafRowNodes, details, batchRemover);
        if (this.usingTreeData) {
            this.postRemoveCreateFillerNodes(leafRowNodes, details);
            // When not TreeData, then removeEmptyGroups is called just before the BatchRemover is flushed.
            // However for TreeData, there is no BatchRemover, so we have to call removeEmptyGroups here.
            const nodeParents = leafRowNodes.map(n => n.parent);
            this.removeEmptyGroups(nodeParents, details);
        }
    }
    forEachParentGroup(details, group, callback) {
        let pointer = group;
        while (pointer && pointer !== details.rootNode) {
            callback(pointer);
            pointer = pointer.parent;
        }
    }
    removeNodesFromParents(nodesToRemove, details, provided) {
        // this method can be called with BatchRemover as optional. if it is missed, we created a local version
        // and flush it at the end. if one is provided, we add to the provided one and it gets flushed elsewhere.
        const batchRemoverIsLocal = provided == null;
        const batchRemoverToUse = provided ? provided : new BatchRemover();
        nodesToRemove.forEach(nodeToRemove => {
            this.removeFromParent(nodeToRemove, batchRemoverToUse);
            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            this.forEachParentGroup(details, nodeToRemove.parent, parentNode => {
                batchRemoverToUse.removeFromAllLeafChildren(parentNode, nodeToRemove);
            });
        });
        if (batchRemoverIsLocal) {
            batchRemoverToUse.flush();
        }
    }
    postRemoveCreateFillerNodes(nodesToRemove, details) {
        nodesToRemove.forEach(nodeToRemove => {
            // if not group, and children are present, need to move children to a group.
            // otherwise if no children, we can just remove without replacing.
            const replaceWithGroup = nodeToRemove.hasChildren();
            if (replaceWithGroup) {
                const oldPath = this.getExistingPathForNode(nodeToRemove, details);
                // because we just removed the userGroup, this will always return new support group
                const newGroupNode = this.findParentForNode(nodeToRemove, oldPath, details);
                // these properties are the ones that will be incorrect in the newly created group,
                // so copy them from the old childNode
                newGroupNode.expanded = nodeToRemove.expanded;
                newGroupNode.allLeafChildren = nodeToRemove.allLeafChildren;
                newGroupNode.childrenAfterGroup = nodeToRemove.childrenAfterGroup;
                newGroupNode.childrenMapped = nodeToRemove.childrenMapped;
                newGroupNode.updateHasChildren();
                newGroupNode.childrenAfterGroup.forEach(rowNode => rowNode.parent = newGroupNode);
            }
        });
    }
    removeEmptyGroups(possibleEmptyGroups, details) {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        let checkAgain = true;
        const groupShouldBeRemoved = (rowNode) => {
            // because of the while loop below, it's possible we already moved the node,
            // so double check before trying to remove again.
            const mapKey = this.getChildrenMappedKey(rowNode.key, rowNode.rowGroupColumn);
            const parentRowNode = rowNode.parent;
            const groupAlreadyRemoved = (parentRowNode && parentRowNode.childrenMapped) ?
                !parentRowNode.childrenMapped[mapKey] : true;
            if (groupAlreadyRemoved) {
                // if not linked, then group was already removed
                return false;
            }
            // if still not removed, then we remove if this group is empty
            return !!rowNode.isEmptyRowGroupNode();
        };
        while (checkAgain) {
            checkAgain = false;
            const batchRemover = new BatchRemover();
            possibleEmptyGroups.forEach(possibleEmptyGroup => {
                // remove empty groups
                this.forEachParentGroup(details, possibleEmptyGroup, rowNode => {
                    if (groupShouldBeRemoved(rowNode)) {
                        checkAgain = true;
                        this.removeFromParent(rowNode, batchRemover);
                        // we remove selection on filler nodes here, as the selection would not be removed
                        // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                        rowNode.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
                    }
                });
            });
            batchRemover.flush();
        }
    }
    // removes the node from the parent by:
    // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
    // b) removing from childrenMapped (immediately)
    // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
    // d) setRowIndex(null) - as the rowNode will no longer be displayed.
    removeFromParent(child, batchRemover) {
        if (child.parent) {
            if (batchRemover) {
                batchRemover.removeFromChildrenAfterGroup(child.parent, child);
            }
            else {
                _.removeFromArray(child.parent.childrenAfterGroup, child);
                child.parent.updateHasChildren();
            }
        }
        const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (child.parent && child.parent.childrenMapped) {
            child.parent.childrenMapped[mapKey] = undefined;
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
    }
    addToParent(child, parent) {
        const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (parent) {
            const children = parent.childrenMapped != null;
            if (children) {
                parent.childrenMapped[mapKey] = child;
            }
            parent.childrenAfterGroup.push(child);
            parent.updateHasChildren();
        }
    }
    areGroupColsEqual(d1, d2) {
        if (d1 == null || d2 == null || d1.pivotMode !== d2.pivotMode) {
            return false;
        }
        return _.areEqual(d1.groupedCols, d2.groupedCols);
    }
    checkAllGroupDataAfterColsChanged(details) {
        const recurse = (rowNodes) => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(rowNode => {
                const isLeafNode = !this.usingTreeData && !rowNode.group;
                if (isLeafNode) {
                    return;
                }
                const groupInfo = {
                    field: rowNode.field,
                    key: rowNode.key,
                    rowGroupColumn: rowNode.rowGroupColumn
                };
                this.setGroupData(rowNode, groupInfo);
                recurse(rowNode.childrenAfterGroup);
            });
        };
        recurse(details.rootNode.childrenAfterGroup);
    }
    shotgunResetEverything(details, afterColumnsChanged) {
        if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
            return;
        }
        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node) => node && !node.group);
        const { rootNode, groupedCols } = details;
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        rootNode.leafGroup = this.usingTreeData ? false : groupedCols.length === 0;
        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();
        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }
        this.insertNodes(rootNode.allLeafChildren, details, false);
    }
    noChangeInGroupingColumns(details, afterColumnsChanged) {
        let noFurtherProcessingNeeded = false;
        const groupDisplayColumns = this.columnModel.getGroupDisplayColumns();
        const newGroupDisplayColIds = groupDisplayColumns ?
            groupDisplayColumns.map(c => c.getId()).join('-') : '';
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
    }
    insertNodes(newRowNodes, details, isMove) {
        newRowNodes.forEach(rowNode => {
            this.insertOneNode(rowNode, details, isMove);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    }
    insertOneNode(childNode, details, isMove, batchRemover) {
        const path = this.getGroupInfo(childNode, details);
        const parentGroup = this.findParentForNode(childNode, path, details, batchRemover);
        if (!parentGroup.group) {
            console.warn(`AG Grid: duplicate group keys for row data, keys should be unique`, [parentGroup.data, childNode.data]);
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
    }
    findParentForNode(childNode, path, details, batchRemover) {
        let nextNode = details.rootNode;
        path.forEach((groupInfo, level) => {
            nextNode = this.getOrCreateNextNode(nextNode, groupInfo, level, details);
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
    }
    swapGroupWithUserNode(fillerGroup, userGroup, isMove) {
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
        userGroup.childrenAfterGroup.forEach((rowNode) => rowNode.parent = userGroup);
        this.addToParent(userGroup, fillerGroup.parent);
    }
    getOrCreateNextNode(parentGroup, groupInfo, level, details) {
        const key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        let nextNode = parentGroup.childrenMapped ? parentGroup.childrenMapped[key] : undefined;
        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }
        return nextNode;
    }
    createGroup(groupInfo, parent, level, details) {
        const groupNode = new RowNode(this.beans);
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
    }
    setGroupData(groupNode, groupInfo) {
        groupNode.groupData = {};
        const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        groupDisplayCols.forEach(col => {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            const displayGroupForCol = this.usingTreeData || (groupNode.rowGroupColumn ? col.isRowGroupDisplayed(groupNode.rowGroupColumn.getId()) : false);
            if (displayGroupForCol) {
                groupNode.groupData[col.getColId()] = groupInfo.key;
            }
        });
    }
    getChildrenMappedKey(key, rowGroupColumn) {
        if (rowGroupColumn) {
            // grouping by columns
            return rowGroupColumn.getId() + '-' + key;
        }
        // tree data - we don't have rowGroupColumns
        return key;
    }
    setExpandedInitialValue(details, groupNode) {
        // if pivoting the leaf group is never expanded as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
            return;
        }
        // use callback if exists
        const userCallback = this.gridOptionsService.getCallback('isGroupOpenByDefault');
        if (userCallback) {
            const params = {
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
        const { expandByDefault } = details;
        if (details.expandByDefault === -1) {
            groupNode.expanded = true;
            return;
        }
        // otherwise
        groupNode.expanded = groupNode.level < expandByDefault;
    }
    getGroupInfo(rowNode, details) {
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        }
        return this.getGroupInfoFromGroupColumns(rowNode, details);
    }
    getGroupInfoFromCallback(rowNode) {
        const keys = this.getDataPath ? this.getDataPath(rowNode.data) : null;
        if (keys === null || keys === undefined || keys.length === 0) {
            _.doOnce(() => console.warn(`AG Grid: getDataPath() should not return an empty path for data`, rowNode.data), 'groupStage.getGroupInfoFromCallback');
        }
        const groupInfoMapper = (key) => ({ key, field: null, rowGroupColumn: null });
        return keys ? keys.map(groupInfoMapper) : [];
    }
    getGroupInfoFromGroupColumns(rowNode, details) {
        const res = [];
        details.groupedCols.forEach(groupCol => {
            let key = this.valueService.getKeyForNode(groupCol, rowNode);
            let keyExists = key !== null && key !== undefined && key !== '';
            // unbalanced tree and pivot mode don't work together - not because of the grid, it doesn't make
            // mathematical sense as you are building up a cube. so if pivot mode, we put in a blank key where missing.
            // this keeps the tree balanced and hence can be represented as a group.
            const createGroupForEmpty = details.pivotMode || !this.gridOptionsService.is('groupAllowUnbalanced');
            if (createGroupForEmpty && !keyExists) {
                key = '';
                keyExists = true;
            }
            if (keyExists) {
                const item = {
                    key: key,
                    field: groupCol.getColDef().field,
                    rowGroupColumn: groupCol
                };
                res.push(item);
            }
        });
        return res;
    }
};
__decorate$c([
    Autowired('columnModel')
], GroupStage.prototype, "columnModel", void 0);
__decorate$c([
    Autowired('selectableService')
], GroupStage.prototype, "selectableService", void 0);
__decorate$c([
    Autowired('valueService')
], GroupStage.prototype, "valueService", void 0);
__decorate$c([
    Autowired('beans')
], GroupStage.prototype, "beans", void 0);
__decorate$c([
    Autowired('selectionService')
], GroupStage.prototype, "selectionService", void 0);
__decorate$c([
    PostConstruct
], GroupStage.prototype, "postConstruct", null);
GroupStage = __decorate$c([
    Bean('groupStage')
], GroupStage);

var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PivotColDefService_1;
let PivotColDefService = PivotColDefService_1 = class PivotColDefService extends BeanStub {
    createPivotColumnDefs(uniqueValues) {
        // this is passed to the columnModel, to configure the columns and groups we show
        const pivotColumns = this.columnModel.getPivotColumns();
        const valueColumns = this.columnModel.getValueColumns();
        const levelsDeep = pivotColumns.length;
        const pivotColumnGroupDefs = this.recursiveBuildGroup(0, uniqueValues, [], levelsDeep, pivotColumns);
        function extractColDefs(input, arr = []) {
            input.forEach((def) => {
                if (def.children !== undefined) {
                    extractColDefs(def.children, arr);
                }
                else {
                    arr.push(def);
                }
            });
            return arr;
        }
        const pivotColumnDefs = extractColDefs(pivotColumnGroupDefs);
        // additional columns that contain the aggregated total for each value column per row
        this.addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns);
        // additional group columns that contain child totals for each collapsed child column / group
        this.addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs);
        // additional group columns that contain an aggregated total across all child columns
        this.addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs);
        // we clone, so the colDefs in pivotColumnsGroupDefs and pivotColumnDefs are not shared. this is so that
        // any changes the user makes (via processSecondaryColumnDefinitions) don't impact the internal aggregations,
        // as these use the col defs also
        const pivotColumnDefsClone = pivotColumnDefs.map(colDef => _.cloneObject(colDef));
        return {
            pivotColumnGroupDefs: pivotColumnGroupDefs,
            pivotColumnDefs: pivotColumnDefsClone
        };
    }
    recursiveBuildGroup(index, uniqueValue, pivotKeys, maxDepth, primaryPivotColumns) {
        const measureColumns = this.columnModel.getValueColumns();
        if (index >= maxDepth) { // Base case - build the measure columns
            return this.buildMeasureCols(pivotKeys);
        }
        // sort by either user provided comparator, or our own one
        const primaryPivotColumnDefs = primaryPivotColumns[index].getColDef();
        const comparator = this.headerNameComparator.bind(this, primaryPivotColumnDefs.pivotComparator);
        // Base case for the compact layout, instead of recursing build the last layer of groups as measure columns instead
        if (measureColumns.length === 1 && this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn') && index === maxDepth - 1) {
            const leafCols = [];
            _.iterateObject(uniqueValue, (key) => {
                const newPivotKeys = [...pivotKeys, key];
                leafCols.push(Object.assign(Object.assign({}, this.createColDef(measureColumns[0], key, newPivotKeys)), { columnGroupShow: 'open' }));
            });
            leafCols.sort(comparator);
            return leafCols;
        }
        // Recursive case
        const groups = [];
        _.iterateObject(uniqueValue, (key, value) => {
            const newPivotKeys = [...pivotKeys, key];
            groups.push({
                children: this.recursiveBuildGroup(index + 1, value, newPivotKeys, maxDepth, primaryPivotColumns),
                headerName: key,
                pivotKeys: newPivotKeys,
                columnGroupShow: 'open',
                groupId: this.generateColumnGroupId(newPivotKeys),
            });
        });
        groups.sort(comparator);
        return groups;
    }
    buildMeasureCols(pivotKeys) {
        const measureColumns = this.columnModel.getValueColumns();
        if (measureColumns.length === 0) {
            // if no value columns selected, then we insert one blank column, so the user at least sees columns
            // rendered. otherwise the grid would render with no columns (just empty groups) which would give the
            // impression that the grid is broken
            return [this.createColDef(null, '-', pivotKeys)];
        }
        return measureColumns.map((measureCol) => {
            const columnName = this.columnModel.getDisplayNameForColumn(measureCol, 'header');
            return Object.assign(Object.assign({}, this.createColDef(measureCol, columnName, pivotKeys)), { columnGroupShow: 'open' });
        });
    }
    ;
    addExpandablePivotGroups(pivotColumnGroupDefs, pivotColumnDefs) {
        if (this.gridOptionsService.is('suppressExpandablePivotGroups') ||
            this.gridOptionsService.get('pivotColumnGroupTotals')) {
            return;
        }
        const recursivelyAddSubTotals = (groupDef, currentPivotColumnDefs, acc) => {
            const group = groupDef;
            if (group.children) {
                const childAcc = new Map();
                group.children.forEach((grp) => {
                    recursivelyAddSubTotals(grp, currentPivotColumnDefs, childAcc);
                });
                const firstGroup = !group.children.some(child => child.children);
                this.columnModel.getValueColumns().forEach(valueColumn => {
                    const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
                    const totalColDef = this.createColDef(valueColumn, columnName, groupDef.pivotKeys);
                    totalColDef.pivotTotalColumnIds = childAcc.get(valueColumn.getColId());
                    totalColDef.columnGroupShow = 'closed';
                    totalColDef.aggFunc = valueColumn.getAggFunc();
                    if (!firstGroup) {
                        // add total colDef to group and pivot colDefs array
                        const children = groupDef.children;
                        children.push(totalColDef);
                        currentPivotColumnDefs.push(totalColDef);
                    }
                });
                this.merge(acc, childAcc);
            }
            else {
                const def = groupDef;
                // check that value column exists, i.e. aggFunc is supplied
                if (!def.pivotValueColumn) {
                    return;
                }
                const pivotValueColId = def.pivotValueColumn.getColId();
                const arr = acc.has(pivotValueColId) ? acc.get(pivotValueColId) : [];
                arr.push(def.colId);
                acc.set(pivotValueColId, arr);
            }
        };
        pivotColumnGroupDefs.forEach((groupDef) => {
            recursivelyAddSubTotals(groupDef, pivotColumnDefs, new Map());
        });
    }
    addPivotTotalsToGroups(pivotColumnGroupDefs, pivotColumnDefs) {
        if (!this.gridOptionsService.get('pivotColumnGroupTotals')) {
            return;
        }
        const insertAfter = this.gridOptionsService.get('pivotColumnGroupTotals') === 'after';
        const valueCols = this.columnModel.getValueColumns();
        const aggFuncs = valueCols.map(valueCol => valueCol.getAggFunc());
        // don't add pivot totals if there is less than 1 aggFunc or they are not all the same
        if (!aggFuncs || aggFuncs.length < 1 || !this.sameAggFuncs(aggFuncs)) {
            // console.warn('AG Grid: aborting adding pivot total columns - value columns require same aggFunc');
            return;
        }
        // arbitrarily select a value column to use as a template for pivot columns
        const valueColumn = valueCols[0];
        pivotColumnGroupDefs.forEach((groupDef) => {
            this.recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter);
        });
    }
    recursivelyAddPivotTotal(groupDef, pivotColumnDefs, valueColumn, insertAfter) {
        const group = groupDef;
        if (!group.children) {
            const def = groupDef;
            return def.colId ? [def.colId] : null;
        }
        let colIds = [];
        // need to recurse children first to obtain colIds used in the aggregation stage
        group.children
            .forEach((grp) => {
            const childColIds = this.recursivelyAddPivotTotal(grp, pivotColumnDefs, valueColumn, insertAfter);
            if (childColIds) {
                colIds = colIds.concat(childColIds);
            }
        });
        // only add total colDef if there is more than 1 child node
        if (group.children.length > 1) {
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            const headerName = localeTextFunc('pivotColumnGroupTotals', 'Total');
            //create total colDef using an arbitrary value column as a template
            const totalColDef = this.createColDef(valueColumn, headerName, groupDef.pivotKeys, true);
            totalColDef.pivotTotalColumnIds = colIds;
            totalColDef.aggFunc = valueColumn.getAggFunc();
            // add total colDef to group and pivot colDefs array
            const children = groupDef.children;
            insertAfter ? children.push(totalColDef) : children.unshift(totalColDef);
            pivotColumnDefs.push(totalColDef);
        }
        return colIds;
    }
    addRowGroupTotals(pivotColumnGroupDefs, pivotColumnDefs, valueColumns) {
        if (!this.gridOptionsService.get('pivotRowTotals')) {
            return;
        }
        const insertAfter = this.gridOptionsService.get('pivotRowTotals') === 'after';
        // order of row group totals depends on position
        const valueCols = insertAfter ? valueColumns.slice() : valueColumns.slice().reverse();
        for (let i = 0; i < valueCols.length; i++) {
            const valueCol = valueCols[i];
            let colIds = [];
            pivotColumnGroupDefs.forEach((groupDef) => {
                colIds = colIds.concat(this.extractColIdsForValueColumn(groupDef, valueCol));
            });
            const withGroup = valueCols.length > 1 || !this.gridOptionsService.is('removePivotHeaderRowWhenSingleValueColumn');
            this.createRowGroupTotal(pivotColumnGroupDefs, pivotColumnDefs, valueCol, colIds, insertAfter, withGroup);
        }
    }
    extractColIdsForValueColumn(groupDef, valueColumn) {
        const group = groupDef;
        if (!group.children) {
            const colDef = group;
            return colDef.pivotValueColumn === valueColumn && colDef.colId ? [colDef.colId] : [];
        }
        let colIds = [];
        group.children
            .forEach((grp) => {
            this.extractColIdsForValueColumn(grp, valueColumn);
            const childColIds = this.extractColIdsForValueColumn(grp, valueColumn);
            colIds = colIds.concat(childColIds);
        });
        return colIds;
    }
    createRowGroupTotal(parentChildren, pivotColumnDefs, valueColumn, colIds, insertAfter, addGroup) {
        const measureColumns = this.columnModel.getValueColumns();
        let colDef;
        if (measureColumns.length === 0) {
            colDef = this.createColDef(null, '-', []);
        }
        else {
            const columnName = this.columnModel.getDisplayNameForColumn(valueColumn, 'header');
            colDef = this.createColDef(valueColumn, columnName, []);
            colDef.pivotTotalColumnIds = colIds;
        }
        colDef.colId = PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX + colDef.colId;
        pivotColumnDefs.push(colDef);
        const valueGroup = addGroup ? {
            children: [colDef],
            pivotKeys: [],
            groupId: `${PivotColDefService_1.PIVOT_ROW_TOTAL_PREFIX}_pivotGroup_${valueColumn.getColId()}`,
        } : colDef;
        insertAfter ? parentChildren.push(valueGroup) : parentChildren.unshift(valueGroup);
    }
    createColDef(valueColumn, headerName, pivotKeys, totalColumn = false) {
        const colDef = {};
        // This is null when there are no measure columns and we're creating placeholder columns
        if (valueColumn) {
            const colDefToCopy = valueColumn.getColDef();
            Object.assign(colDef, colDefToCopy);
            // even if original column was hidden, we always show the pivot value column, otherwise it would be
            // very confusing for people thinking the pivot is broken
            colDef.hide = false;
        }
        colDef.headerName = headerName;
        colDef.colId = this.generateColumnId(pivotKeys || [], valueColumn && !totalColumn ? valueColumn.getColId() : '');
        // pivot columns repeat over field, so it makes sense to use the unique id instead. For example if you want to
        // assign values to pinned bottom rows using setPinnedBottomRowData the value service will use this colId.
        colDef.field = colDef.colId;
        // this is to support using pinned rows, normally the data will be extracted from the aggData object using the colId
        // however pinned rows still access the data object by field, this prevents values with dots from being treated as complex objects
        colDef.valueGetter = (params) => { var _a; return (_a = params.data) === null || _a === void 0 ? void 0 : _a[params.colDef.field]; };
        colDef.pivotKeys = pivotKeys;
        colDef.pivotValueColumn = valueColumn;
        if (colDef.filter === true) {
            colDef.filter = 'agNumberColumnFilter';
        }
        return colDef;
    }
    sameAggFuncs(aggFuncs) {
        if (aggFuncs.length == 1) {
            return true;
        }
        //check if all aggFunc's match
        for (let i = 1; i < aggFuncs.length; i++) {
            if (aggFuncs[i] !== aggFuncs[0]) {
                return false;
            }
        }
        return true;
    }
    headerNameComparator(userComparator, a, b) {
        if (userComparator) {
            return userComparator(a.headerName, b.headerName);
        }
        else {
            if (a.headerName && !b.headerName) {
                return 1;
            }
            else if (!a.headerName && b.headerName) {
                return -1;
            }
            // slightly naff here - just to satify typescript
            // really should be &&, but if so ts complains
            // the above if/else checks would deal with either being falsy, so at this stage if either are falsy, both are
            // ..still naff though
            if (!a.headerName || !b.headerName) {
                return 0;
            }
            if (a.headerName < b.headerName) {
                return -1;
            }
            if (a.headerName > b.headerName) {
                return 1;
            }
            return 0;
        }
    }
    merge(m1, m2) {
        m2.forEach((value, key, map) => {
            const existingList = m1.has(key) ? m1.get(key) : [];
            const updatedList = [...existingList, ...value];
            m1.set(key, updatedList);
        });
    }
    generateColumnGroupId(pivotKeys) {
        const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
        return `pivotGroup_${pivotCols.join('-')}_${pivotKeys.join('-')}`;
    }
    generateColumnId(pivotKeys, measureColumnId) {
        const pivotCols = this.columnModel.getPivotColumns().map((col) => col.getColId());
        return `pivot_${pivotCols.join('-')}_${pivotKeys.join('-')}_${measureColumnId}`;
    }
};
PivotColDefService.PIVOT_ROW_TOTAL_PREFIX = 'PivotRowTotal_';
__decorate$b([
    Autowired('columnModel')
], PivotColDefService.prototype, "columnModel", void 0);
PivotColDefService = PivotColDefService_1 = __decorate$b([
    Bean('pivotColDefService')
], PivotColDefService);

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let PivotStage = class PivotStage extends BeanStub {
    constructor() {
        super(...arguments);
        this.uniqueValues = {};
    }
    execute(params) {
        const changedPath = params.changedPath;
        if (this.columnModel.isPivotActive()) {
            this.executePivotOn(changedPath);
        }
        else {
            this.executePivotOff(changedPath);
        }
    }
    executePivotOff(changedPath) {
        this.aggregationColumnsHashLastTime = null;
        this.uniqueValues = {};
        if (this.columnModel.isSecondaryColumnsPresent()) {
            this.columnModel.setSecondaryColumns(null, "rowModelUpdated");
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }
    executePivotOn(changedPath) {
        const uniqueValues = this.bucketUpRowNodes(changedPath);
        const uniqueValuesChanged = this.setUniqueValues(uniqueValues);
        const aggregationColumns = this.columnModel.getValueColumns();
        const aggregationColumnsHash = aggregationColumns.map((column) => `${column.getId()}-${column.getColDef().headerName}`).join('#');
        const aggregationFuncsHash = aggregationColumns.map((column) => column.getAggFunc().toString()).join('#');
        const aggregationColumnsChanged = this.aggregationColumnsHashLastTime !== aggregationColumnsHash;
        const aggregationFuncsChanged = this.aggregationFuncsHashLastTime !== aggregationFuncsHash;
        this.aggregationColumnsHashLastTime = aggregationColumnsHash;
        this.aggregationFuncsHashLastTime = aggregationFuncsHash;
        const groupColumnsHash = this.columnModel.getRowGroupColumns().map((column) => column.getId()).join('#');
        const groupColumnsChanged = groupColumnsHash !== this.groupColumnsHashLastTime;
        this.groupColumnsHashLastTime = groupColumnsHash;
        if (uniqueValuesChanged || aggregationColumnsChanged || groupColumnsChanged || aggregationFuncsChanged) {
            const { pivotColumnGroupDefs, pivotColumnDefs } = this.pivotColDefService.createPivotColumnDefs(this.uniqueValues);
            this.pivotColumnDefs = pivotColumnDefs;
            this.columnModel.setSecondaryColumns(pivotColumnGroupDefs, "rowModelUpdated");
            // because the secondary columns have changed, then the aggregation needs to visit the whole
            // tree again, so we make the changedPath not active, to force aggregation to visit all paths.
            if (changedPath) {
                changedPath.setInactive();
            }
        }
    }
    setUniqueValues(newValues) {
        const json1 = JSON.stringify(newValues);
        const json2 = JSON.stringify(this.uniqueValues);
        const uniqueValuesChanged = json1 !== json2;
        // we only continue the below if the unique values are different, as otherwise
        // the result will be the same as the last time we did it
        if (uniqueValuesChanged) {
            this.uniqueValues = newValues;
            return true;
        }
        else {
            return false;
        }
    }
    bucketUpRowNodes(changedPath) {
        // accessed from inside inner function
        const uniqueValues = {};
        // ensure childrenMapped is cleared, as if a node has been filtered out it should not have mapped children.
        changedPath.forEachChangedNodeDepthFirst(node => {
            if (node.leafGroup) {
                node.childrenMapped = null;
            }
        });
        const recursivelyBucketFilteredChildren = (node) => {
            var _a;
            if (node.leafGroup) {
                this.bucketRowNode(node, uniqueValues);
            }
            else {
                (_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.forEach(recursivelyBucketFilteredChildren);
            }
        };
        changedPath.executeFromRootNode(recursivelyBucketFilteredChildren);
        return uniqueValues;
    }
    bucketRowNode(rowNode, uniqueValues) {
        const pivotColumns = this.columnModel.getPivotColumns();
        if (pivotColumns.length === 0) {
            rowNode.childrenMapped = null;
        }
        else {
            rowNode.childrenMapped = this.bucketChildren(rowNode.childrenAfterFilter, pivotColumns, 0, uniqueValues);
        }
        if (rowNode.sibling) {
            rowNode.sibling.childrenMapped = rowNode.childrenMapped;
        }
    }
    bucketChildren(children, pivotColumns, pivotIndex, uniqueValues) {
        const mappedChildren = {};
        const pivotColumn = pivotColumns[pivotIndex];
        // map the children out based on the pivot column
        children.forEach((child) => {
            let key = this.valueService.getKeyForNode(pivotColumn, child);
            if (_.missing(key)) {
                key = '';
            }
            if (!uniqueValues[key]) {
                uniqueValues[key] = {};
            }
            if (!mappedChildren[key]) {
                mappedChildren[key] = [];
            }
            mappedChildren[key].push(child);
        });
        // if it's the last pivot column, return as is, otherwise go one level further in the map
        if (pivotIndex === pivotColumns.length - 1) {
            return mappedChildren;
        }
        else {
            const result = {};
            _.iterateObject(mappedChildren, (key, value) => {
                result[key] = this.bucketChildren(value, pivotColumns, pivotIndex + 1, uniqueValues[key]);
            });
            return result;
        }
    }
    getPivotColumnDefs() {
        return this.pivotColumnDefs;
    }
};
__decorate$a([
    Autowired('valueService')
], PivotStage.prototype, "valueService", void 0);
__decorate$a([
    Autowired('columnModel')
], PivotStage.prototype, "columnModel", void 0);
__decorate$a([
    Autowired('pivotColDefService')
], PivotStage.prototype, "pivotColDefService", void 0);
PivotStage = __decorate$a([
    Bean('pivotStage')
], PivotStage);

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AggFuncService_1;
// @ts-ignore
const AGBigInt = typeof BigInt === 'undefined' ? null : BigInt;
let AggFuncService = AggFuncService_1 = class AggFuncService extends BeanStub {
    constructor() {
        super(...arguments);
        this.aggFuncsMap = {};
        this.initialised = false;
    }
    init() {
        if (this.initialised) {
            return;
        }
        this.initialiseWithDefaultAggregations();
        this.addAggFuncs(this.gridOptionsService.get('aggFuncs'));
    }
    initialiseWithDefaultAggregations() {
        this.aggFuncsMap[AggFuncService_1.AGG_SUM] = aggSum;
        this.aggFuncsMap[AggFuncService_1.AGG_FIRST] = aggFirst;
        this.aggFuncsMap[AggFuncService_1.AGG_LAST] = aggLast;
        this.aggFuncsMap[AggFuncService_1.AGG_MIN] = aggMin;
        this.aggFuncsMap[AggFuncService_1.AGG_MAX] = aggMax;
        this.aggFuncsMap[AggFuncService_1.AGG_COUNT] = aggCount;
        this.aggFuncsMap[AggFuncService_1.AGG_AVG] = aggAvg;
        this.initialised = true;
    }
    isAggFuncPossible(column, func) {
        const allKeys = this.getFuncNames(column);
        const allowed = _.includes(allKeys, func);
        const funcExists = _.exists(this.aggFuncsMap[func]);
        return allowed && funcExists;
    }
    getDefaultAggFunc(column) {
        const defaultAgg = column.getColDef().defaultAggFunc;
        if (_.exists(defaultAgg) && this.isAggFuncPossible(column, defaultAgg)) {
            return defaultAgg;
        }
        if (this.isAggFuncPossible(column, AggFuncService_1.AGG_SUM)) {
            return AggFuncService_1.AGG_SUM;
        }
        const allKeys = this.getFuncNames(column);
        return _.existsAndNotEmpty(allKeys) ? allKeys[0] : null;
    }
    addAggFuncs(aggFuncs) {
        _.iterateObject(aggFuncs, this.addAggFunc.bind(this));
    }
    addAggFunc(key, aggFunc) {
        this.init();
        this.aggFuncsMap[key] = aggFunc;
    }
    getAggFunc(name) {
        this.init();
        return this.aggFuncsMap[name];
    }
    getFuncNames(column) {
        const userAllowedFuncs = column.getColDef().allowedAggFuncs;
        return userAllowedFuncs == null ? Object.keys(this.aggFuncsMap).sort() : userAllowedFuncs;
    }
    clear() {
        this.aggFuncsMap = {};
    }
};
AggFuncService.AGG_SUM = 'sum';
AggFuncService.AGG_FIRST = 'first';
AggFuncService.AGG_LAST = 'last';
AggFuncService.AGG_MIN = 'min';
AggFuncService.AGG_MAX = 'max';
AggFuncService.AGG_COUNT = 'count';
AggFuncService.AGG_AVG = 'avg';
__decorate$9([
    PostConstruct
], AggFuncService.prototype, "init", null);
AggFuncService = AggFuncService_1 = __decorate$9([
    Bean('aggFuncService')
], AggFuncService);
function aggSum(params) {
    const { values } = params;
    let result = null; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (typeof value === 'number') {
            if (result === null) {
                result = value;
            }
            else {
                if (AGBigInt) {
                    result += typeof result === 'number' ? value : AGBigInt(value);
                }
                else {
                    result += value;
                }
            }
        }
        else if (typeof value === 'bigint') {
            if (result === null) {
                result = value;
            }
            else {
                result = (typeof result === 'bigint' ? result : AGBigInt(result)) + value;
            }
        }
    }
    return result;
}
function aggFirst(params) {
    return params.values.length > 0 ? params.values[0] : null;
}
function aggLast(params) {
    return params.values.length > 0 ? _.last(params.values) : null;
}
function aggMin(params) {
    const { values } = params;
    let result = null;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if ((typeof value === 'number' || typeof value === 'bigint') && (result === null || result > value)) {
            result = value;
        }
    }
    return result;
}
function aggMax(params) {
    const { values } = params;
    let result = null;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if ((typeof value === 'number' || typeof value === 'bigint') && (result === null || result < value)) {
            result = value;
        }
    }
    return result;
}
function aggCount(params) {
    const { values } = params;
    let result = 0;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        // check if the value is from a group, in which case use the group's count
        result += value != null && typeof value.value === 'number' ? value.value : 1;
    }
    return result;
}
// the average function is tricky as the multiple levels require weighted averages
// for the non-leaf node aggregations.
function aggAvg(params) {
    var _a, _b, _c;
    const { values } = params;
    let sum = 0; // the logic ensures that we never combine bigint arithmetic with numbers, but TS is hard to please
    let count = 0;
    // for optimum performance, we use a for loop here rather than calling any helper methods or using functional code
    for (let i = 0; i < values.length; i++) {
        const currentValue = values[i];
        let valueToAdd = null;
        if (typeof currentValue === 'number' || typeof currentValue === 'bigint') {
            valueToAdd = currentValue;
            count++;
        }
        else if (currentValue != null && (typeof currentValue.value === 'number' || typeof currentValue.value === 'bigint') && typeof currentValue.count === 'number') {
            // we are aggregating groups, so we take the aggregated values to calculated a weighted average
            if (AGBigInt) {
                valueToAdd = currentValue.value * (typeof currentValue.value === 'number' ? currentValue.count : AGBigInt(currentValue.count));
            }
            else {
                valueToAdd = currentValue.value * currentValue.count;
            }
            count += currentValue.count;
        }
        if (typeof valueToAdd === 'number') {
            if (AGBigInt) {
                sum += typeof sum === 'number' ? valueToAdd : AGBigInt(valueToAdd);
            }
            else {
                sum += valueToAdd;
            }
        }
        else if (typeof valueToAdd === 'bigint') {
            sum = (typeof sum === 'bigint' ? sum : AGBigInt(sum)) + valueToAdd;
        }
    }
    let value = null;
    // avoid divide by zero error
    if (count > 0) {
        if (AGBigInt) {
            value = sum / (typeof sum === 'number' ? count : AGBigInt(count));
        }
        else {
            value = sum / count;
        }
    }
    // the previous aggregation data
    const existingAggData = (_b = (_a = params.rowNode) === null || _a === void 0 ? void 0 : _a.aggData) === null || _b === void 0 ? void 0 : _b[(_c = params.column) === null || _c === void 0 ? void 0 : _c.getColId()];
    if (existingAggData && existingAggData.count === count && existingAggData.value === value) {
        // the underlying values haven't changed, return the old object to avoid triggering change detection
        return existingAggData;
    }
    // the result will be an object. when this cell is rendered, only the avg is shown.
    // however when this cell is part of another aggregation, the count is also needed
    // to create a weighted average for the next level.
    return {
        count,
        value,
        // the grid by default uses toString to render values for an object, so this
        // is a trick to get the default cellRenderer to display the avg value
        toString: function () {
            return typeof this.value === 'number' || typeof this.value === 'bigint' ? this.value.toString() : '';
        },
        // used for sorting
        toNumber: function () {
            return this.value;
        }
    };
}

var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class DropZoneColumnComp extends Component {
    constructor(column, dragSourceDropTarget, ghost, dropZonePurpose, horizontal) {
        super();
        this.column = column;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.ghost = ghost;
        this.dropZonePurpose = dropZonePurpose;
        this.horizontal = horizontal;
        this.popupShowing = false;
    }
    init() {
        this.setTemplate(DropZoneColumnComp.TEMPLATE);
        const eGui = this.getGui();
        const isFunctionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
        this.addElementClasses(eGui);
        this.addElementClasses(this.eDragHandle, 'drag-handle');
        this.addElementClasses(this.eText, 'text');
        this.addElementClasses(this.eButton, 'button');
        this.eDragHandle.appendChild(_.createIconNoSpan('columnDrag', this.gridOptionsService));
        this.eButton.appendChild(_.createIconNoSpan('cancel', this.gridOptionsService));
        this.setupSort();
        this.displayName = this.columnModel.getDisplayNameForColumn(this.column, 'columnDrop');
        this.setupComponents();
        if (!this.ghost && !isFunctionsReadOnly) {
            this.addDragSource();
        }
        this.setupAria();
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, () => {
            this.setupAria();
        });
        this.setupTooltip();
    }
    setupAria() {
        const translate = this.localeService.getLocaleTextFunc();
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const aggSeparator = translate('ariaDropZoneColumnComponentAggFuncSeperator', ' of ');
        const sortDirection = {
            asc: translate('ariaDropZoneColumnComponentSortAscending', 'ascending'),
            desc: translate('ariaDropZoneColumnComponentSortDescending', 'descending'),
        };
        const columnSort = this.column.getSort();
        const isSortSuppressed = this.gridOptionsService.is('rowGroupPanelSuppressSort');
        const ariaInstructions = [
            [
                aggFuncName && `${aggFuncName}${aggSeparator}`,
                name,
                this.isGroupingZone() && !isSortSuppressed && columnSort && `, ${sortDirection[columnSort]}`
            ].filter(part => !!part).join(''),
        ];
        const isFunctionsReadOnly = this.gridOptionsService.is('functionsReadOnly');
        if (this.isAggregationZone() && !isFunctionsReadOnly) {
            const aggregationMenuAria = translate('ariaDropZoneColumnValueItemDescription', 'Press ENTER to change the aggregation type');
            ariaInstructions.push(aggregationMenuAria);
        }
        if (this.isGroupingZone() && this.column.getColDef().sortable && !isSortSuppressed) {
            const sortProgressAria = translate('ariaDropZoneColumnGroupItemDescription', 'Press ENTER to sort');
            ariaInstructions.push(sortProgressAria);
        }
        const deleteAria = translate('ariaDropZoneColumnComponentDescription', 'Press DELETE to remove');
        ariaInstructions.push(deleteAria);
        _.setAriaLabel(this.getGui(), ariaInstructions.join('. '));
    }
    setupTooltip() {
        const refresh = () => {
            const newTooltipText = this.column.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    setupSort() {
        const canSort = this.column.getColDef().sortable;
        const isGroupingZone = this.isGroupingZone();
        if (!canSort || !isGroupingZone) {
            return;
        }
        if (!this.gridOptionsService.is('rowGroupPanelSuppressSort')) {
            this.eSortIndicator.setupSort(this.column, true);
            const performSort = (event) => {
                event.preventDefault();
                const sortUsingCtrl = this.gridOptionsService.get('multiSortKey') === 'ctrl';
                const multiSort = sortUsingCtrl ? (event.ctrlKey || event.metaKey) : event.shiftKey;
                this.sortController.progressSort(this.column, multiSort, 'uiColumnSorted');
            };
            this.addGuiEventListener('click', performSort);
            this.addGuiEventListener('keydown', (e) => {
                const isEnter = e.key === KeyCode.ENTER;
                if (isEnter && this.isGroupingZone()) {
                    performSort(e);
                }
            });
        }
    }
    addDragSource() {
        const dragSource = {
            type: DragSourceType.ToolPanel,
            eElement: this.eDragHandle,
            defaultIconName: DragAndDropService.ICON_HIDE,
            getDragItem: () => this.createDragItem(),
            dragItemName: this.displayName,
            dragSourceDropTarget: this.dragSourceDropTarget
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
    createDragItem() {
        const visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }
    setupComponents() {
        this.setTextValue();
        this.setupRemove();
        if (this.ghost) {
            this.addCssClass('ag-column-drop-cell-ghost');
        }
        if (this.isAggregationZone() && !this.gridOptionsService.is('functionsReadOnly')) {
            this.addGuiEventListener('click', this.onShowAggFuncSelection.bind(this));
        }
    }
    setupRemove() {
        _.setDisplayed(this.eButton, !this.gridOptionsService.is('functionsReadOnly'));
        const agEvent = { type: DropZoneColumnComp.EVENT_COLUMN_REMOVE };
        this.addGuiEventListener('keydown', (e) => {
            const isEnter = e.key === KeyCode.ENTER;
            const isDelete = e.key === KeyCode.DELETE;
            if (isDelete) {
                e.preventDefault();
                this.dispatchEvent(agEvent);
            }
            if (isEnter && this.isAggregationZone() && !this.gridOptionsService.is('functionsReadOnly')) {
                e.preventDefault();
                this.onShowAggFuncSelection();
            }
        });
        this.addManagedListener(this.eButton, 'click', (mouseEvent) => {
            this.dispatchEvent(agEvent);
            mouseEvent.stopPropagation();
        });
        const touchListener = new TouchListener(this.eButton);
        this.addManagedListener(touchListener, TouchListener.EVENT_TAP, () => {
            this.dispatchEvent(agEvent);
        });
        this.addDestroyFunc(touchListener.destroy.bind(touchListener));
    }
    getColumnAndAggFuncName() {
        const name = this.displayName;
        let aggFuncName = '';
        if (this.isAggregationZone()) {
            const aggFunc = this.column.getAggFunc();
            // if aggFunc is a string, we can use it, but if it's a function, then we swap with 'func'
            const aggFuncString = typeof aggFunc === 'string' ? aggFunc : 'agg';
            const localeTextFunc = this.localeService.getLocaleTextFunc();
            aggFuncName = localeTextFunc(aggFuncString, aggFuncString);
        }
        return { name, aggFuncName };
    }
    setTextValue() {
        const { name, aggFuncName } = this.getColumnAndAggFuncName();
        const displayValue = this.isAggregationZone() ? `${aggFuncName}(${name})` : name;
        const displayValueSanitised = _.escapeString(displayValue);
        this.eText.innerHTML = displayValueSanitised;
    }
    onShowAggFuncSelection() {
        if (this.popupShowing) {
            return;
        }
        this.popupShowing = true;
        const virtualList = new VirtualList('select-agg-func');
        const rows = this.aggFuncService.getFuncNames(this.column);
        const eGui = this.getGui();
        const virtualListGui = virtualList.getGui();
        virtualList.setModel({
            getRow: function (index) { return rows[index]; },
            getRowCount: function () { return rows.length; }
        });
        this.getContext().createBean(virtualList);
        const ePopup = _.loadTemplate(/* html*/ `<div class="ag-select-agg-func-popup"></div>`);
        ePopup.style.top = '0px';
        ePopup.style.left = '0px';
        ePopup.appendChild(virtualListGui);
        // ePopup.style.height = this.gridOptionsService.getAggFuncPopupHeight() + 'px';
        ePopup.style.width = `${eGui.clientWidth}px`;
        const popupHiddenFunc = () => {
            this.destroyBean(virtualList);
            this.popupShowing = false;
            eGui.focus();
        };
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            closeOnEsc: true,
            closedCallback: popupHiddenFunc,
            ariaLabel: translate('ariaLabelAggregationFunction', 'Aggregation Function')
        });
        if (addPopupRes) {
            virtualList.setComponentCreator(this.createAggSelect.bind(this, addPopupRes.hideFunc));
        }
        virtualList.addGuiEventListener('keydown', (e) => {
            if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                const row = virtualList.getLastFocusedRow();
                if (row == null) {
                    return;
                }
                const comp = virtualList.getComponentAt(row);
                if (comp) {
                    comp.selectItem();
                }
            }
        });
        this.popupService.positionPopupByComponent({
            type: 'aggFuncSelect',
            eventSource: eGui,
            ePopup: ePopup,
            keepWithinBounds: true,
            column: this.column,
            position: 'under'
        });
        virtualList.refresh();
        let rowToFocus = rows.findIndex(r => r === this.column.getAggFunc());
        if (rowToFocus === -1) {
            rowToFocus = 0;
        }
        virtualList.focusRow(rowToFocus);
    }
    createAggSelect(hidePopup, value) {
        const itemSelected = () => {
            hidePopup();
            if (this.gridOptionsService.is('functionsPassive')) {
                const event = {
                    type: Events.EVENT_COLUMN_AGG_FUNC_CHANGE_REQUEST,
                    columns: [this.column],
                    aggFunc: value
                };
                this.eventService.dispatchEvent(event);
            }
            else {
                this.columnModel.setColumnAggFunc(this.column, value, "toolPanelDragAndDrop");
            }
        };
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const aggFuncString = value.toString();
        const aggFuncStringTranslated = localeTextFunc(aggFuncString, aggFuncString);
        const comp = new AggItemComp(itemSelected, aggFuncStringTranslated);
        return comp;
    }
    addElementClasses(el, suffix) {
        suffix = suffix ? `-${suffix}` : '';
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add(`ag-column-drop-cell${suffix}`, `ag-column-drop-${direction}-cell${suffix}`);
    }
    isAggregationZone() {
        return this.dropZonePurpose === 'aggregation';
    }
    isGroupingZone() {
        return this.dropZonePurpose === 'rowGroup';
    }
}
DropZoneColumnComp.EVENT_COLUMN_REMOVE = 'columnRemove';
DropZoneColumnComp.TEMPLATE = `<span role="option" tabindex="0">
          <span ref="eDragHandle" class="ag-drag-handle ag-column-drop-cell-drag-handle" role="presentation"></span>
          <span ref="eText" class="ag-column-drop-cell-text" aria-hidden="true"></span>
          <ag-sort-indicator ref="eSortIndicator"></ag-sort-indicator>
          <span ref="eButton" class="ag-column-drop-cell-button" role="presentation"></span>
        </span>`;
__decorate$8([
    Autowired('dragAndDropService')
], DropZoneColumnComp.prototype, "dragAndDropService", void 0);
__decorate$8([
    Autowired('columnModel')
], DropZoneColumnComp.prototype, "columnModel", void 0);
__decorate$8([
    Autowired('popupService')
], DropZoneColumnComp.prototype, "popupService", void 0);
__decorate$8([
    Optional('aggFuncService')
], DropZoneColumnComp.prototype, "aggFuncService", void 0);
__decorate$8([
    Autowired('sortController')
], DropZoneColumnComp.prototype, "sortController", void 0);
__decorate$8([
    RefSelector('eText')
], DropZoneColumnComp.prototype, "eText", void 0);
__decorate$8([
    RefSelector('eDragHandle')
], DropZoneColumnComp.prototype, "eDragHandle", void 0);
__decorate$8([
    RefSelector('eButton')
], DropZoneColumnComp.prototype, "eButton", void 0);
__decorate$8([
    RefSelector('eSortIndicator')
], DropZoneColumnComp.prototype, "eSortIndicator", void 0);
__decorate$8([
    PostConstruct
], DropZoneColumnComp.prototype, "init", null);
class AggItemComp extends Component {
    constructor(itemSelected, value) {
        super(/* html */ `<div class="ag-select-agg-func-item"/>`);
        this.selectItem = itemSelected;
        this.getGui().innerText = value;
        this.addGuiEventListener('click', this.selectItem);
    }
}

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class BaseDropZonePanel extends Component {
    constructor(horizontal, dropZonePurpose) {
        super(/* html */ `<div class="ag-unselectable" role="presentation"></div>`);
        this.horizontal = horizontal;
        this.dropZonePurpose = dropZonePurpose;
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
        this.guiDestroyFunctions = [];
        this.childColumnComponents = [];
        this.resizeEnabled = false;
        this.addElementClasses(this.getGui());
        this.eColumnDropList = document.createElement('div');
        this.addElementClasses(this.eColumnDropList, 'list');
        _.setAriaRole(this.eColumnDropList, 'listbox');
    }
    isHorizontal() {
        return this.horizontal;
    }
    toggleResizable(resizable) {
        this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
        this.resizeEnabled = resizable;
    }
    setBeans(beans) {
        this.beans = beans;
    }
    destroy() {
        this.destroyGui();
        super.destroy();
    }
    destroyGui() {
        this.guiDestroyFunctions.forEach(func => func());
        this.guiDestroyFunctions.length = 0;
        this.childColumnComponents.length = 0;
        _.clearElement(this.getGui());
        _.clearElement(this.eColumnDropList);
    }
    init(params) {
        this.params = params;
        this.createManagedBean(new ManagedFocusFeature(this.getFocusableElement(), {
            handleKeyDown: this.handleKeyDown.bind(this)
        }));
        this.addManagedListener(this.beans.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refreshGui.bind(this));
        this.addManagedPropertyListener('functionsReadOnly', this.refreshGui.bind(this));
        this.setupDropTarget();
        this.positionableFeature = new PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
        // we don't know if this bean will be initialised before columnModel.
        // if columnModel first, then below will work
        // if columnModel second, then below will put blank in, and then above event gets first when columnModel is set up
        this.refreshGui();
        _.setAriaLabel(this.eColumnDropList, this.getAriaLabel());
    }
    handleKeyDown(e) {
        const isVertical = !this.horizontal;
        let isNext = e.key === KeyCode.DOWN;
        let isPrevious = e.key === KeyCode.UP;
        if (!isVertical) {
            const isRtl = this.gridOptionsService.is('enableRtl');
            isNext = (!isRtl && e.key === KeyCode.RIGHT) || (isRtl && e.key === KeyCode.LEFT);
            isPrevious = (!isRtl && e.key === KeyCode.LEFT) || (isRtl && e.key === KeyCode.RIGHT);
        }
        if (!isNext && !isPrevious) {
            return;
        }
        const el = this.focusService.findNextFocusableElement(this.getFocusableElement(), false, isPrevious);
        if (el) {
            e.preventDefault();
            el.focus();
        }
    }
    addElementClasses(el, suffix) {
        suffix = suffix ? `-${suffix}` : '';
        const direction = this.horizontal ? 'horizontal' : 'vertical';
        el.classList.add(`ag-column-drop${suffix}`, `ag-column-drop-${direction}${suffix}`);
    }
    setupDropTarget() {
        this.dropTarget = {
            getContainer: this.getGui.bind(this),
            getIconName: this.getIconName.bind(this),
            onDragging: this.onDragging.bind(this),
            onDragEnter: this.onDragEnter.bind(this),
            onDragLeave: this.onDragLeave.bind(this),
            onDragStop: this.onDragStop.bind(this),
            isInterestedIn: this.isInterestedIn.bind(this)
        };
        this.beans.dragAndDropService.addDropTarget(this.dropTarget);
    }
    isInterestedIn(type) {
        // not interested in row drags
        return type === DragSourceType.HeaderCell || type === DragSourceType.ToolPanel;
    }
    checkInsertIndex(draggingEvent) {
        const newIndex = this.getNewInsertIndex(draggingEvent);
        // <0 happens when drag is no a direction we are interested in, eg drag is up/down but in horizontal panel
        if (newIndex < 0) {
            return false;
        }
        const changed = newIndex !== this.insertIndex;
        if (changed) {
            this.insertIndex = newIndex;
        }
        return changed;
    }
    getNewInsertIndex(draggingEvent) {
        const mouseEvent = draggingEvent.event;
        const mouseLocation = this.horizontal ? mouseEvent.clientX : mouseEvent.clientY;
        const boundsList = this.childColumnComponents.map(col => (col.getGui().getBoundingClientRect()));
        // find the non-ghost component we're hovering
        const hoveredIndex = boundsList.findIndex(rect => (this.horizontal ? (rect.right > mouseLocation && rect.left < mouseLocation) : (rect.top < mouseLocation && rect.bottom > mouseLocation)));
        // not hovering a non-ghost component
        if (hoveredIndex === -1) {
            const enableRtl = this.beans.gridOptionsService.is('enableRtl');
            // if mouse is below or right of all components then new index should be placed last
            const isLast = boundsList.every(rect => (mouseLocation > (this.horizontal ? rect.right : rect.bottom)));
            if (isLast) {
                return enableRtl && this.horizontal ? 0 : this.childColumnComponents.length;
            }
            // if mouse is above or left of all components, new index is first
            const isFirst = boundsList.every(rect => (mouseLocation < (this.horizontal ? rect.left : rect.top)));
            if (isFirst) {
                return enableRtl && this.horizontal ? this.childColumnComponents.length : 0;
            }
            // must be hovering a ghost, don't change the index
            return this.insertIndex;
        }
        // if the old index is equal to or less than the index of our new target
        // we need to shift right, to insert after rather than before
        if (this.insertIndex <= hoveredIndex) {
            return hoveredIndex + 1;
        }
        return hoveredIndex;
    }
    checkDragStartedBySelf(draggingEvent) {
        if (this.state !== BaseDropZonePanel.STATE_NOT_DRAGGING) {
            return;
        }
        this.state = BaseDropZonePanel.STATE_REARRANGE_COLUMNS;
        this.potentialDndColumns = draggingEvent.dragSource.getDragItem().columns || [];
        this.refreshGui();
        this.checkInsertIndex(draggingEvent);
        this.refreshGui();
    }
    onDragging(draggingEvent) {
        this.checkDragStartedBySelf(draggingEvent);
        if (this.checkInsertIndex(draggingEvent)) {
            this.refreshGui();
        }
    }
    onDragEnter(draggingEvent) {
        // this will contain all columns that are potential drops
        const dragColumns = draggingEvent.dragSource.getDragItem().columns || [];
        this.state = BaseDropZonePanel.STATE_NEW_COLUMNS_IN;
        // take out columns that are not droppable
        const goodDragColumns = dragColumns.filter(this.isColumnDroppable.bind(this));
        if (goodDragColumns.length > 0) {
            const hideColumnOnExit = this.isRowGroupPanel() && !this.gridOptionsService.is('suppressRowGroupHidesColumns') && !draggingEvent.fromNudge;
            if (hideColumnOnExit) {
                const dragItem = draggingEvent.dragSource.getDragItem();
                const columns = dragItem.columns;
                this.setColumnsVisible(columns, false, "uiColumnDragged");
            }
            this.potentialDndColumns = goodDragColumns;
            this.checkInsertIndex(draggingEvent);
            this.refreshGui();
        }
    }
    setColumnsVisible(columns, visible, source = "api") {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockVisible);
            this.colModel.setColumnsVisible(allowedCols, visible, source);
        }
    }
    isPotentialDndColumns() {
        return _.existsAndNotEmpty(this.potentialDndColumns);
    }
    isRowGroupPanel() {
        return this.dropZonePurpose === 'rowGroup';
    }
    onDragLeave(draggingEvent) {
        // if the dragging started from us, we remove the group, however if it started
        // some place else, then we don't, as it was only 'asking'
        if (this.state === BaseDropZonePanel.STATE_REARRANGE_COLUMNS) {
            const columns = draggingEvent.dragSource.getDragItem().columns || [];
            this.removeColumns(columns);
        }
        if (this.isPotentialDndColumns()) {
            const showColumnOnExit = this.isRowGroupPanel() && !this.gridOptionsService.is('suppressMakeColumnVisibleAfterUnGroup') && !draggingEvent.fromNudge;
            if (showColumnOnExit) {
                const dragItem = draggingEvent.dragSource.getDragItem();
                this.setColumnsVisible(dragItem.columns, true, "uiColumnDragged");
            }
            this.potentialDndColumns = [];
            this.refreshGui();
        }
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    }
    onDragStop() {
        if (this.isPotentialDndColumns()) {
            let success = false;
            if (this.state === BaseDropZonePanel.STATE_NEW_COLUMNS_IN) {
                this.addColumns(this.potentialDndColumns);
                success = true;
            }
            else {
                success = this.rearrangeColumns(this.potentialDndColumns);
            }
            this.potentialDndColumns = [];
            // If the function is passive, then we don't refresh, as we assume the client application
            // is going to call setRowGroups / setPivots / setValues at a later point which will then
            // cause a refresh. This gives a nice GUI where the ghost stays until the app has caught
            // up with the changes. However, if there was no change in the order, then we do need to
            // refresh to reset the columns
            if (!this.beans.gridOptionsService.is('functionsPassive') || !success) {
                this.refreshGui();
            }
        }
        this.state = BaseDropZonePanel.STATE_NOT_DRAGGING;
    }
    removeColumns(columnsToRemove) {
        const newColumnList = this.getExistingColumns().filter(col => !_.includes(columnsToRemove, col));
        this.updateColumns(newColumnList);
    }
    addColumns(columnsToAdd) {
        if (!columnsToAdd) {
            return;
        }
        const newColumnList = this.getExistingColumns().slice();
        const colsToAddNoDuplicates = columnsToAdd.filter(col => newColumnList.indexOf(col) < 0);
        _.insertArrayIntoArray(newColumnList, colsToAddNoDuplicates, this.insertIndex);
        this.updateColumns(newColumnList);
    }
    rearrangeColumns(columnsToAdd) {
        const newColumnList = this.getNonGhostColumns().slice();
        _.insertArrayIntoArray(newColumnList, columnsToAdd, this.insertIndex);
        if (_.areEqual(newColumnList, this.getExistingColumns())) {
            return false;
        }
        this.updateColumns(newColumnList);
        return true;
    }
    refreshGui() {
        // we reset the scroll position after the refresh.
        // if we don't do this, then the list will always scroll to the top
        // each time we refresh it. this is because part of the refresh empties
        // out the list which sets scroll to zero. so the user could be just
        // reordering the list - we want to prevent the resetting of the scroll.
        // this is relevant for vertical display only (as horizontal has no scroll)
        const scrollTop = this.eColumnDropList.scrollTop;
        const resizeEnabled = this.resizeEnabled;
        const focusedIndex = this.getFocusedItem();
        let alternateElement = this.focusService.findNextFocusableElement();
        if (!alternateElement) {
            alternateElement = this.focusService.findNextFocusableElement(undefined, false, true);
        }
        this.toggleResizable(false);
        this.destroyGui();
        this.addIconAndTitleToGui();
        this.addEmptyMessageToGui();
        this.addColumnsToGui();
        if (!this.isHorizontal()) {
            this.eColumnDropList.scrollTop = scrollTop;
        }
        if (resizeEnabled) {
            this.toggleResizable(resizeEnabled);
        }
        // focus should only be restored when keyboard mode
        // otherwise mouse clicks will cause containers to scroll
        // without no apparent reason.
        if (this.focusService.isKeyboardMode()) {
            this.restoreFocus(focusedIndex, alternateElement);
        }
    }
    getFocusedItem() {
        const eGui = this.getGui();
        const activeElement = this.gridOptionsService.getDocument().activeElement;
        if (!eGui.contains(activeElement)) {
            return -1;
        }
        const items = Array.from(eGui.querySelectorAll('.ag-column-drop-cell'));
        return items.indexOf(activeElement);
    }
    restoreFocus(index, alternateElement) {
        const eGui = this.getGui();
        const items = Array.from(eGui.querySelectorAll('.ag-column-drop-cell'));
        if (index === -1) {
            return;
        }
        if (items.length === 0) {
            alternateElement.focus();
        }
        const indexToFocus = Math.min(items.length - 1, index);
        const el = items[indexToFocus];
        if (el) {
            el.focus();
        }
    }
    getNonGhostColumns() {
        const existingColumns = this.getExistingColumns();
        if (this.isPotentialDndColumns()) {
            return existingColumns.filter(column => !_.includes(this.potentialDndColumns, column));
        }
        return existingColumns;
    }
    addColumnsToGui() {
        const nonGhostColumns = this.getNonGhostColumns();
        const itemsToAddToGui = nonGhostColumns.map(column => (this.createColumnComponent(column, false)));
        if (this.isPotentialDndColumns()) {
            const dndColumns = this.potentialDndColumns.map(column => (this.createColumnComponent(column, true)));
            if (this.insertIndex >= itemsToAddToGui.length) {
                itemsToAddToGui.push(...dndColumns);
            }
            else {
                itemsToAddToGui.splice(this.insertIndex, 0, ...dndColumns);
            }
        }
        this.appendChild(this.eColumnDropList);
        itemsToAddToGui.forEach((columnComponent, index) => {
            if (index > 0) {
                this.addArrow(this.eColumnDropList);
            }
            this.eColumnDropList.appendChild(columnComponent.getGui());
        });
        this.addAriaLabelsToComponents();
    }
    addAriaLabelsToComponents() {
        this.childColumnComponents.forEach((comp, idx) => {
            const eGui = comp.getGui();
            _.setAriaPosInSet(eGui, idx + 1);
            _.setAriaSetSize(eGui, this.childColumnComponents.length);
        });
    }
    createColumnComponent(column, ghost) {
        const columnComponent = new DropZoneColumnComp(column, this.dropTarget, ghost, this.dropZonePurpose, this.horizontal);
        columnComponent.addEventListener(DropZoneColumnComp.EVENT_COLUMN_REMOVE, this.removeColumns.bind(this, [column]));
        this.beans.context.createBean(columnComponent);
        this.guiDestroyFunctions.push(() => this.destroyBean(columnComponent));
        if (!ghost) {
            this.childColumnComponents.push(columnComponent);
        }
        return columnComponent;
    }
    addIconAndTitleToGui() {
        const eGroupIcon = this.params.icon;
        const eTitleBar = document.createElement('div');
        _.setAriaHidden(eTitleBar, true);
        this.addElementClasses(eTitleBar, 'title-bar');
        this.addElementClasses(eGroupIcon, 'icon');
        this.addOrRemoveCssClass('ag-column-drop-empty', this.isExistingColumnsEmpty());
        eTitleBar.appendChild(eGroupIcon);
        if (!this.horizontal) {
            const eTitle = document.createElement('span');
            this.addElementClasses(eTitle, 'title');
            eTitle.innerHTML = this.params.title;
            eTitleBar.appendChild(eTitle);
        }
        this.appendChild(eTitleBar);
    }
    isExistingColumnsEmpty() {
        return this.getExistingColumns().length === 0;
    }
    addEmptyMessageToGui() {
        if (!this.isExistingColumnsEmpty() || this.isPotentialDndColumns()) {
            return;
        }
        const eMessage = document.createElement('span');
        eMessage.innerHTML = this.params.emptyMessage;
        this.addElementClasses(eMessage, 'empty-message');
        this.eColumnDropList.appendChild(eMessage);
    }
    addArrow(eParent) {
        // only add the arrows if the layout is horizontal
        if (this.horizontal) {
            // for RTL it's a left arrow, otherwise it's a right arrow
            const enableRtl = this.beans.gridOptionsService.is('enableRtl');
            const icon = _.createIconNoSpan(enableRtl ? 'smallLeft' : 'smallRight', this.beans.gridOptionsService);
            this.addElementClasses(icon, 'cell-separator');
            eParent.appendChild(icon);
        }
    }
}
BaseDropZonePanel.STATE_NOT_DRAGGING = 'notDragging';
BaseDropZonePanel.STATE_NEW_COLUMNS_IN = 'newColumnsIn';
BaseDropZonePanel.STATE_REARRANGE_COLUMNS = 'rearrangeColumns';
__decorate$7([
    Autowired('columnModel')
], BaseDropZonePanel.prototype, "colModel", void 0);
__decorate$7([
    Autowired('focusService')
], BaseDropZonePanel.prototype, "focusService", void 0);

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class RowGroupDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal) {
        super(horizontal, 'rowGroup');
    }
    passBeansUp() {
        super.setBeans({
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('rowGroupColumnsEmptyMessage', 'Drag here to set row groups');
        const title = localeTextFunc('groups', 'Row Groups');
        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('rowGroupPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.refreshGui.bind(this));
    }
    getAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const label = translate('ariaRowGroupDropZonePanelLabel', 'Row Groups');
        return label;
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'rowGroupColumnsList';
        return res;
    }
    isColumnDroppable(column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowRowGroup() && !column.isRowGroupActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event = {
                type: Events.EVENT_COLUMN_ROW_GROUP_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setRowGroupColumns(columns, "toolPanelUi");
        }
    }
    getIconName() {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_GROUP : DragAndDropService.ICON_NOT_ALLOWED;
    }
    getExistingColumns() {
        return this.columnModel.getRowGroupColumns();
    }
}
__decorate$6([
    Autowired('columnModel')
], RowGroupDropZonePanel.prototype, "columnModel", void 0);
__decorate$6([
    Autowired('loggerFactory')
], RowGroupDropZonePanel.prototype, "loggerFactory", void 0);
__decorate$6([
    Autowired('dragAndDropService')
], RowGroupDropZonePanel.prototype, "dragAndDropService", void 0);
__decorate$6([
    PostConstruct
], RowGroupDropZonePanel.prototype, "passBeansUp", null);

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class PivotDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal) {
        super(horizontal, 'pivot');
    }
    passBeansUp() {
        super.setBeans({
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('pivotColumnsEmptyMessage', 'Drag here to set column labels');
        const title = localeTextFunc('pivots', 'Column Labels');
        super.init({
            dragAndDropIcon: DragAndDropService.ICON_GROUP,
            icon: _.createIconNoSpan('pivotPanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.checkVisibility.bind(this));
        this.refresh();
    }
    getAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const label = translate('ariaPivotDropZonePanelLabel', 'Column Labels');
        return label;
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'pivotColumnsList';
        return res;
    }
    refresh() {
        this.checkVisibility();
        this.refreshGui();
    }
    checkVisibility() {
        const pivotMode = this.columnModel.isPivotMode();
        if (this.isHorizontal()) {
            // what we do for horizontal (ie the pivot panel at the top) depends
            // on the user property as well as pivotMode.
            switch (this.gridOptionsService.get('pivotPanelShow')) {
                case 'always':
                    this.setDisplayed(pivotMode);
                    break;
                case 'onlyWhenPivoting':
                    const pivotActive = this.columnModel.isPivotActive();
                    this.setDisplayed(pivotMode && pivotActive);
                    break;
                default:
                    // never show it
                    this.setDisplayed(false);
                    break;
            }
        }
        else {
            // in toolPanel, the pivot panel is always shown when pivot mode is on
            this.setDisplayed(pivotMode);
        }
    }
    isColumnDroppable(column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowPivot() && !column.isPivotActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event = {
                type: Events.EVENT_COLUMN_PIVOT_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setPivotColumns(columns, "toolPanelUi");
        }
    }
    getIconName() {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_PIVOT : DragAndDropService.ICON_NOT_ALLOWED;
    }
    getExistingColumns() {
        return this.columnModel.getPivotColumns();
    }
}
__decorate$5([
    Autowired('columnModel')
], PivotDropZonePanel.prototype, "columnModel", void 0);
__decorate$5([
    Autowired('loggerFactory')
], PivotDropZonePanel.prototype, "loggerFactory", void 0);
__decorate$5([
    Autowired('dragAndDropService')
], PivotDropZonePanel.prototype, "dragAndDropService", void 0);
__decorate$5([
    PostConstruct
], PivotDropZonePanel.prototype, "passBeansUp", null);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class GridHeaderDropZones extends Component {
    constructor() {
        super();
    }
    postConstruct() {
        this.setGui(this.createNorthPanel());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onRowGroupChanged.bind(this));
        this.addManagedPropertyListener('rowGroupPanelShow', this.onRowGroupChanged.bind(this));
        this.onRowGroupChanged();
    }
    createNorthPanel() {
        const topPanelGui = document.createElement('div');
        const dropPanelVisibleListener = this.onDropPanelVisible.bind(this);
        topPanelGui.classList.add('ag-column-drop-wrapper');
        _.setAriaRole(topPanelGui, 'presentation');
        this.rowGroupComp = new RowGroupDropZonePanel(true);
        this.createManagedBean(this.rowGroupComp);
        this.pivotComp = new PivotDropZonePanel(true);
        this.createManagedBean(this.pivotComp);
        topPanelGui.appendChild(this.rowGroupComp.getGui());
        topPanelGui.appendChild(this.pivotComp.getGui());
        this.addManagedListener(this.rowGroupComp, Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.addManagedListener(this.pivotComp, Component.EVENT_DISPLAYED_CHANGED, dropPanelVisibleListener);
        this.onDropPanelVisible();
        return topPanelGui;
    }
    onDropPanelVisible() {
        const bothDisplayed = this.rowGroupComp.isDisplayed() && this.pivotComp.isDisplayed();
        this.rowGroupComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
        this.pivotComp.addOrRemoveCssClass('ag-column-drop-horizontal-half-width', bothDisplayed);
    }
    onRowGroupChanged() {
        if (!this.rowGroupComp) {
            return;
        }
        const rowGroupPanelShow = this.gridOptionsService.get('rowGroupPanelShow');
        if (rowGroupPanelShow === 'always') {
            this.rowGroupComp.setDisplayed(true);
        }
        else if (rowGroupPanelShow === 'onlyWhenGrouping') {
            const grouping = !this.columnModel.isRowGroupEmpty();
            this.rowGroupComp.setDisplayed(grouping);
        }
        else {
            this.rowGroupComp.setDisplayed(false);
        }
    }
}
__decorate$4([
    Autowired('columnModel')
], GridHeaderDropZones.prototype, "columnModel", void 0);
__decorate$4([
    PostConstruct
], GridHeaderDropZones.prototype, "postConstruct", null);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FilterAggregatesStage = class FilterAggregatesStage extends BeanStub {
    execute(params) {
        const isPivotMode = this.columnModel.isPivotMode();
        const isAggFilterActive = this.filterManager.isAggregateFilterPresent()
            || this.filterManager.isAggregateQuickFilterPresent();
        // This is the default filter for applying only to leaf nodes, realistically this should not apply as primary agg columns,
        // should not be applied by the filterManager if getGroupAggFiltering is missing. Predicate will apply filters to leaf level.
        const defaultPrimaryColumnPredicate = (params) => !params.node.group;
        // Default secondary column predicate, selecting only leaf level groups.
        const defaultSecondaryColumnPredicate = ((params) => params.node.leafGroup);
        // The predicate to determine whether filters should apply to this row. Either defined by the user in groupAggFiltering or a default depending
        // on current pivot mode status.
        const applyFilterToNode = this.gridOptionsService.getGroupAggFiltering()
            || (isPivotMode ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);
        const { changedPath } = params;
        const preserveChildren = (node, recursive = false) => {
            if (node.childrenAfterFilter) {
                node.childrenAfterAggFilter = node.childrenAfterFilter;
                if (recursive) {
                    node.childrenAfterAggFilter.forEach((child) => preserveChildren(child, recursive));
                }
                this.setAllChildrenCount(node);
            }
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        const filterChildren = (node) => {
            var _a;
            node.childrenAfterAggFilter = ((_a = node.childrenAfterFilter) === null || _a === void 0 ? void 0 : _a.filter((child) => {
                var _a;
                const shouldFilterRow = applyFilterToNode({ node: child });
                if (shouldFilterRow) {
                    const doesNodePassFilter = this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
                    if (doesNodePassFilter) {
                        // Node has passed, so preserve children
                        preserveChildren(child, true);
                        return true;
                    }
                }
                const hasChildPassed = (_a = child.childrenAfterAggFilter) === null || _a === void 0 ? void 0 : _a.length;
                return hasChildPassed;
            })) || null;
            this.setAllChildrenCount(node);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };
        changedPath.forEachChangedNodeDepthFirst(isAggFilterActive ? filterChildren : preserveChildren, true);
    }
    setAllChildrenCountTreeData(rowNode) {
        // for tree data, we include all children, groups and leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterAggFilter.forEach((child) => {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }
    setAllChildrenCountGridGrouping(rowNode) {
        // for grid data, we only count the leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterAggFilter.forEach((child) => {
            if (child.group) {
                allChildrenCount += child.allChildrenCount;
            }
            else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }
    setAllChildrenCount(rowNode) {
        if (!rowNode.hasChildren()) {
            rowNode.setAllChildrenCount(null);
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
            this.setAllChildrenCountTreeData(rowNode);
        }
        else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    }
};
__decorate$3([
    Autowired('filterManager')
], FilterAggregatesStage.prototype, "filterManager", void 0);
__decorate$3([
    Autowired('columnModel')
], FilterAggregatesStage.prototype, "columnModel", void 0);
FilterAggregatesStage = __decorate$3([
    Bean('filterAggregatesStage')
], FilterAggregatesStage);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class GroupFilter extends TabGuardComp {
    constructor() {
        super(/* html */ `
            <div class="ag-group-filter">
                <div ref="eGroupField"></div>
                <div ref="eUnderlyingFilter"></div>
            </div>
        `);
    }
    postConstruct() {
        this.initialiseTabGuard({});
    }
    init(params) {
        this.params = params;
        this.validateParams();
        return this.updateGroups().then(() => {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
        });
    }
    validateParams() {
        const { colDef } = this.params;
        if (colDef.field) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "field". This property will be ignored.'), 'groupFilterFieldParam');
        }
        if (colDef.filterValueGetter) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'), 'groupFilterFilterValueGetterParam');
        }
        if (colDef.filterParams) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'), 'groupFilterFilterParams');
        }
    }
    updateGroups() {
        const sourceColumns = this.updateGroupField();
        return this.getUnderlyingFilters(sourceColumns);
    }
    getSourceColumns() {
        this.groupColumn = this.params.column;
        if (this.gridOptionsService.is('treeData')) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'), 'groupFilterTreeData');
            return [];
        }
        const sourceColumns = this.columnModel.getSourceColumnsForGroupColumn(this.groupColumn);
        if (!sourceColumns) {
            _.doOnce(() => console.warn('AG Grid: Group Column Filter only works on group columns. Please use a different filter.'), 'groupFilterNotGroupColumn');
            return [];
        }
        return sourceColumns;
    }
    updateGroupField() {
        _.clearElement(this.eGroupField);
        if (this.eGroupFieldSelect) {
            this.destroyBean(this.eGroupFieldSelect);
        }
        const allSourceColumns = this.getSourceColumns();
        const sourceColumns = allSourceColumns.filter(sourceColumn => sourceColumn.isFilterAllowed());
        if (!sourceColumns.length) {
            this.selectedColumn = undefined;
            _.setDisplayed(this.eGroupField, false);
            return null;
        }
        if (allSourceColumns.length === 1) {
            // we only want to hide the group field element if there's only one group column.
            // If there's one group column that has a filter, but multiple columns in total,
            // we should still show the select so the user knows which column it's for.
            this.selectedColumn = sourceColumns[0];
            _.setDisplayed(this.eGroupField, false);
        }
        else {
            // keep the old selected column if it's still valid
            if (!this.selectedColumn || !sourceColumns.some(column => column.getId() === this.selectedColumn.getId())) {
                this.selectedColumn = sourceColumns[0];
            }
            this.createGroupFieldSelectElement(sourceColumns);
            this.eGroupField.appendChild(this.eGroupFieldSelect.getGui());
            this.eGroupField.appendChild(_.loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
            _.setDisplayed(this.eGroupField, true);
        }
        return sourceColumns;
    }
    createGroupFieldSelectElement(sourceColumns) {
        this.eGroupFieldSelect = this.createManagedBean(new AgSelect());
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        this.eGroupFieldSelect.setLabel(localeTextFunc('groupFilterSelect', 'Select field:'));
        this.eGroupFieldSelect.setLabelAlignment('top');
        this.eGroupFieldSelect.addOptions(sourceColumns.map(sourceColumn => {
            var _a;
            return ({
                value: sourceColumn.getId(),
                text: (_a = this.columnModel.getDisplayNameForColumn(sourceColumn, 'groupFilter', false)) !== null && _a !== void 0 ? _a : undefined
            });
        }));
        this.eGroupFieldSelect.setValue(this.selectedColumn.getId());
        this.eGroupFieldSelect.onValueChange((newValue) => this.updateSelectedColumn(newValue));
        this.eGroupFieldSelect.addCssClass('ag-group-filter-field-select-wrapper');
        if (sourceColumns.length === 1) {
            this.eGroupFieldSelect.setDisabled(true);
        }
    }
    getUnderlyingFilters(sourceColumns) {
        if (!sourceColumns) {
            this.filterColumnPairs = undefined;
            this.selectedFilter = undefined;
            this.groupColumn.setFilterActive(false, 'columnRowGroupChanged');
            return AgPromise.resolve();
        }
        const filterPromises = [];
        const filterColumnPairs = [];
        sourceColumns.forEach(column => {
            const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
            if (filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) {
                filterPromises.push(filterWrapper.filterPromise.then(filter => {
                    if (filter) {
                        filterColumnPairs.push({
                            filter,
                            column
                        });
                    }
                    if (column.getId() === this.selectedColumn.getId()) {
                        this.selectedFilter = filter !== null && filter !== void 0 ? filter : undefined;
                    }
                    return filter;
                }));
            }
        });
        return AgPromise.all(filterPromises).then(() => {
            this.filterColumnPairs = filterColumnPairs;
            this.groupColumn.setFilterActive(this.isFilterActive(), 'columnRowGroupChanged');
        });
    }
    addUnderlyingFilterElement() {
        _.clearElement(this.eUnderlyingFilter);
        if (!this.selectedColumn) {
            return AgPromise.resolve();
        }
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.selectedColumn, 'COLUMN_MENU');
        if (!filterWrapper) {
            return AgPromise.resolve();
        }
        return filterWrapper.guiPromise.then(gui => {
            var _a;
            this.eUnderlyingFilter.appendChild(gui);
            (_a = filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(filter => {
                var _a, _b;
                (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiAttached) === null || _a === void 0 ? void 0 : _a.call(filter, this.afterGuiAttachedParams);
                if (!((_b = this.afterGuiAttachedParams) === null || _b === void 0 ? void 0 : _b.suppressFocus) && this.eGroupFieldSelect && !this.eGroupFieldSelect.isDisabled()) {
                    this.eGroupFieldSelect.getFocusableElement().focus();
                }
            });
        });
    }
    updateSelectedColumn(columnId) {
        var _a, _b;
        if (!columnId) {
            return;
        }
        (_b = (_a = this.selectedFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
        const selectedFilterColumnPair = this.getFilterColumnPair(columnId);
        this.selectedColumn = selectedFilterColumnPair === null || selectedFilterColumnPair === void 0 ? void 0 : selectedFilterColumnPair.column;
        this.selectedFilter = selectedFilterColumnPair === null || selectedFilterColumnPair === void 0 ? void 0 : selectedFilterColumnPair.filter;
        this.dispatchEvent({
            type: GroupFilter.EVENT_SELECTED_COLUMN_CHANGED
        });
        this.addUnderlyingFilterElement();
    }
    isFilterActive() {
        var _a;
        return !!((_a = this.filterColumnPairs) === null || _a === void 0 ? void 0 : _a.some(({ filter }) => filter.isFilterActive()));
    }
    doesFilterPass() {
        return true;
    }
    getModel() {
        return null;
    }
    setModel() {
        return AgPromise.resolve();
    }
    afterGuiAttached(params) {
        this.afterGuiAttachedParams = params;
        this.addUnderlyingFilterElement();
    }
    afterGuiDetached() {
        var _a, _b;
        _.clearElement(this.eUnderlyingFilter);
        (_b = (_a = this.selectedFilter) === null || _a === void 0 ? void 0 : _a.afterGuiDetached) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    onColumnRowGroupChanged() {
        this.updateGroups().then(() => {
            this.dispatchEvent({
                type: GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED
            });
            this.eventService.dispatchEvent({
                type: 'filterAllowedUpdated'
            });
        });
    }
    getFilterColumnPair(columnId) {
        var _a;
        if (!columnId) {
            return undefined;
        }
        return (_a = this.filterColumnPairs) === null || _a === void 0 ? void 0 : _a.find(({ column }) => column.getId() === columnId);
    }
    getSelectedFilter() {
        return this.selectedFilter;
    }
    getSelectedColumn() {
        return this.selectedColumn;
    }
    isFilterAllowed() {
        return !!this.selectedColumn;
    }
    destroy() {
        super.destroy();
    }
}
GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED = 'columnRowGroupChanged';
GroupFilter.EVENT_SELECTED_COLUMN_CHANGED = 'selectedColumnChanged';
__decorate$2([
    Autowired('filterManager')
], GroupFilter.prototype, "filterManager", void 0);
__decorate$2([
    Autowired('columnModel')
], GroupFilter.prototype, "columnModel", void 0);
__decorate$2([
    RefSelector('eGroupField')
], GroupFilter.prototype, "eGroupField", void 0);
__decorate$2([
    RefSelector('eUnderlyingFilter')
], GroupFilter.prototype, "eUnderlyingFilter", void 0);
__decorate$2([
    PostConstruct
], GroupFilter.prototype, "postConstruct", null);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class GroupFloatingFilterComp extends Component {
    constructor() {
        super(/* html */ `
            <div ref="eFloatingFilter" class="ag-group-floating-filter ag-floating-filter-input" role="presentation"></div>
        `);
    }
    init(params) {
        this.params = params;
        // we only support showing the underlying floating filter for multiple group columns
        const canShowUnderlyingFloatingFilter = this.gridOptionsService.get('groupDisplayType') === 'multipleColumns';
        return new AgPromise(resolve => {
            this.params.parentFilterInstance(parentFilterInstance => {
                this.parentFilterInstance = parentFilterInstance;
                if (canShowUnderlyingFloatingFilter) {
                    this.setupUnderlyingFloatingFilterElement().then(() => resolve());
                }
                else {
                    this.setupReadOnlyFloatingFilterElement();
                    resolve();
                }
            });
        }).then(() => {
            this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_SELECTED_COLUMN_CHANGED, () => this.onSelectedColumnChanged());
            this.addManagedListener(this.parentFilterInstance, GroupFilter.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onColumnRowGroupChanged());
        });
    }
    setupReadOnlyFloatingFilterElement() {
        if (!this.eFloatingFilterText) {
            this.eFloatingFilterText = this.createManagedBean(new AgInputTextField());
            const displayName = this.columnModel.getDisplayNameForColumn(this.params.column, 'header', true);
            const translate = this.localeService.getLocaleTextFunc();
            this.eFloatingFilterText
                .setDisabled(true)
                .setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`)
                .addGuiEventListener('click', () => this.params.showParentFilter());
        }
        this.updateDisplayedValue();
        this.eFloatingFilter.appendChild(this.eFloatingFilterText.getGui());
    }
    setupUnderlyingFloatingFilterElement() {
        this.showingUnderlyingFloatingFilter = false;
        this.underlyingFloatingFilter = undefined;
        _.clearElement(this.eFloatingFilter);
        const column = this.parentFilterInstance.getSelectedColumn();
        // we can only show the underlying filter if there is one instance (e.g. the underlying column is not visible)
        if (column && !column.isVisible()) {
            const compDetails = this.filterManager.getFloatingFilterCompDetails(column, this.params.showParentFilter);
            if (compDetails) {
                if (!this.columnVisibleChangedListener) {
                    this.columnVisibleChangedListener = this.addManagedListener(column, Column.EVENT_VISIBLE_CHANGED, this.onColumnVisibleChanged.bind(this));
                }
                return compDetails.newAgStackInstance().then(floatingFilter => {
                    var _a, _b;
                    this.underlyingFloatingFilter = floatingFilter;
                    (_a = this.underlyingFloatingFilter) === null || _a === void 0 ? void 0 : _a.onParentModelChanged((_b = this.parentFilterInstance.getSelectedFilter()) === null || _b === void 0 ? void 0 : _b.getModel());
                    this.appendChild(floatingFilter.getGui());
                    this.showingUnderlyingFloatingFilter = true;
                });
            }
        }
        // fallback to the read-only version
        this.setupReadOnlyFloatingFilterElement();
        return AgPromise.resolve();
    }
    onColumnVisibleChanged() {
        this.setupUnderlyingFloatingFilterElement();
    }
    onParentModelChanged(_model, event) {
        var _a, _b;
        if (this.showingUnderlyingFloatingFilter) {
            (_a = this.underlyingFloatingFilter) === null || _a === void 0 ? void 0 : _a.onParentModelChanged((_b = this.parentFilterInstance.getSelectedFilter()) === null || _b === void 0 ? void 0 : _b.getModel(), event);
        }
        else {
            this.updateDisplayedValue();
        }
    }
    updateDisplayedValue() {
        if (!this.parentFilterInstance || !this.eFloatingFilterText) {
            return;
        }
        const selectedFilter = this.parentFilterInstance.getSelectedFilter();
        if (!selectedFilter) {
            this.eFloatingFilterText.setValue('');
            this.eFloatingFilterText.setDisplayed(false);
            return;
        }
        this.eFloatingFilterText.setDisplayed(true);
        if (selectedFilter.getModelAsString) {
            const filterModel = selectedFilter.getModel();
            this.eFloatingFilterText.setValue(filterModel == null ? '' : selectedFilter.getModelAsString(filterModel));
        }
        else {
            this.eFloatingFilterText.setValue('');
        }
    }
    onSelectedColumnChanged() {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }
    onColumnRowGroupChanged() {
        if (!this.showingUnderlyingFloatingFilter) {
            this.updateDisplayedValue();
        }
    }
    destroy() {
        super.destroy();
    }
}
__decorate$1([
    Autowired('columnModel')
], GroupFloatingFilterComp.prototype, "columnModel", void 0);
__decorate$1([
    Autowired('filterManager')
], GroupFloatingFilterComp.prototype, "filterManager", void 0);
__decorate$1([
    RefSelector('eFloatingFilter')
], GroupFloatingFilterComp.prototype, "eFloatingFilter", void 0);

const RowGroupingModule = {
    version: VERSION,
    moduleName: ModuleNames.RowGroupingModule,
    beans: [AggregationStage, FilterAggregatesStage, GroupStage, PivotColDefService, PivotStage, AggFuncService],
    agStackComponents: [
        { componentName: 'AgGridHeaderDropZones', componentClass: GridHeaderDropZones }
    ],
    userComponents: [
        { componentName: 'agGroupColumnFilter', componentClass: GroupFilter },
        { componentName: 'agGroupColumnFloatingFilter', componentClass: GroupFloatingFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class ValuesDropZonePanel extends BaseDropZonePanel {
    constructor(horizontal) {
        super(horizontal, 'aggregation');
    }
    passBeansUp() {
        super.setBeans({
            gridOptionsService: this.gridOptionsService,
            eventService: this.eventService,
            context: this.getContext(),
            loggerFactory: this.loggerFactory,
            dragAndDropService: this.dragAndDropService
        });
        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const emptyMessage = localeTextFunc('valueColumnsEmptyMessage', 'Drag here to aggregate');
        const title = localeTextFunc('values', 'Values');
        super.init({
            dragAndDropIcon: DragAndDropService.ICON_AGGREGATE,
            icon: _.createIconNoSpan('valuePanel', this.gridOptionsService, null),
            emptyMessage: emptyMessage,
            title: title
        });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.refreshGui.bind(this));
    }
    getAriaLabel() {
        const translate = this.localeService.getLocaleTextFunc();
        const label = translate('ariaValuesDropZonePanelLabel', 'Values');
        return label;
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'valueColumnsList';
        return res;
    }
    getIconName() {
        return this.isPotentialDndColumns() ? DragAndDropService.ICON_AGGREGATE : DragAndDropService.ICON_NOT_ALLOWED;
    }
    isColumnDroppable(column) {
        // we never allow grouping of secondary columns
        if (this.gridOptionsService.is('functionsReadOnly') || !column.isPrimary()) {
            return false;
        }
        return column.isAllowValue() && !column.isValueActive();
    }
    updateColumns(columns) {
        if (this.gridOptionsService.is('functionsPassive')) {
            const event = {
                type: Events.EVENT_COLUMN_VALUE_CHANGE_REQUEST,
                columns: columns
            };
            this.eventService.dispatchEvent(event);
        }
        else {
            this.columnModel.setValueColumns(columns, "toolPanelUi");
        }
    }
    getExistingColumns() {
        return this.columnModel.getValueColumns();
    }
}
__decorate([
    Autowired('columnModel')
], ValuesDropZonePanel.prototype, "columnModel", void 0);
__decorate([
    Autowired('loggerFactory')
], ValuesDropZonePanel.prototype, "loggerFactory", void 0);
__decorate([
    Autowired('dragAndDropService')
], ValuesDropZonePanel.prototype, "dragAndDropService", void 0);
__decorate([
    PostConstruct
], ValuesDropZonePanel.prototype, "passBeansUp", null);

export { PivotDropZonePanel, RowGroupDropZonePanel, RowGroupingModule, ValuesDropZonePanel };
