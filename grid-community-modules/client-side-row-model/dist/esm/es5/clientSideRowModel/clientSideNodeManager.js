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
import { Events, RowNode, _, } from "@ag-grid-community/core";
var ClientSideNodeManager = /** @class */ (function () {
    function ClientSideNodeManager(rootNode, gridOptionsService, eventService, columnModel, selectionService, beans) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.rootNode = rootNode;
        this.gridOptionsService = gridOptionsService;
        this.eventService = eventService;
        this.columnModel = columnModel;
        this.beans = beans;
        this.selectionService = selectionService;
        this.rootNode.group = true;
        this.rootNode.level = -1;
        this.rootNode.id = ClientSideNodeManager.ROOT_NODE_ID;
        this.rootNode.allLeafChildren = [];
        this.rootNode.childrenAfterGroup = [];
        this.rootNode.childrenAfterSort = [];
        this.rootNode.childrenAfterAggFilter = [];
        this.rootNode.childrenAfterFilter = [];
        // if we make this class a bean, then can annotate postConstruct
        this.postConstruct();
    }
    // @PostConstruct - this is not a bean, so postConstruct called by constructor
    ClientSideNodeManager.prototype.postConstruct = function () {
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.suppressParentsInRowNodes = this.gridOptionsService.is('suppressParentsInRowNodes');
        this.isRowMasterFunc = this.gridOptionsService.get('isRowMaster');
        this.doingTreeData = this.gridOptionsService.isTreeData();
        this.doingMasterDetail = this.gridOptionsService.isMasterDetail();
    };
    ClientSideNodeManager.prototype.getCopyOfNodesMap = function () {
        return _.cloneObject(this.allNodesMap);
    };
    ClientSideNodeManager.prototype.getRowNode = function (id) {
        return this.allNodesMap[id];
    };
    ClientSideNodeManager.prototype.setRowData = function (rowData) {
        var _this = this;
        if (typeof rowData === 'string') {
            console.warn('AG Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }
        var rootNode = this.rootNode;
        var sibling = this.rootNode.sibling;
        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();
        this.nextId = 0;
        this.allNodesMap = {};
        if (rowData) {
            // we use rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
            // sets the parent node on each row (even if we are not grouping). so setting parent node
            // here is for benefit of ag-grid-community users
            rootNode.allLeafChildren = rowData.map(function (dataItem) { return _this.createNode(dataItem, _this.rootNode, ClientSideNodeManager.TOP_LEVEL); });
        }
        else {
            rootNode.allLeafChildren = [];
            rootNode.childrenAfterGroup = [];
        }
        if (sibling) {
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
            sibling.childrenAfterSort = rootNode.childrenAfterSort;
            sibling.childrenMapped = rootNode.childrenMapped;
            sibling.allLeafChildren = rootNode.allLeafChildren;
        }
    };
    ClientSideNodeManager.prototype.updateRowData = function (rowDataTran, rowNodeOrder) {
        var rowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };
        var nodesToUnselect = [];
        this.executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeAdd(rowDataTran, rowNodeTransaction);
        this.updateSelection(nodesToUnselect, 'rowDataChanged');
        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    };
    ClientSideNodeManager.prototype.updateSelection = function (nodesToUnselect, source) {
        var selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            this.selectionService.setNodesSelected({
                newValue: false,
                nodes: nodesToUnselect,
                suppressFinishActions: true,
                source: source,
            });
        }
        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        this.selectionService.updateGroupsFromChildrenSelections(source);
        if (selectionChanged) {
            var event_1 = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: source
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ClientSideNodeManager.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var _a;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (_.missingOrEmpty(add)) {
            return;
        }
        // create new row nodes for each data item
        var newNodes = add.map(function (item) { return _this.createNode(item, _this.rootNode, ClientSideNodeManager.TOP_LEVEL); });
        if (typeof addIndex === 'number' && addIndex >= 0) {
            // new rows are inserted in one go by concatenating them in between the existing rows at the desired index.
            // this is much faster than splicing them individually into 'allLeafChildren' when there are large inserts.
            var allLeafChildren = this.rootNode.allLeafChildren;
            var len = allLeafChildren.length;
            var normalisedAddIndex = addIndex;
            if (this.doingTreeData && addIndex > 0 && len > 0) {
                for (var i = 0; i < len; i++) {
                    if (((_a = allLeafChildren[i]) === null || _a === void 0 ? void 0 : _a.rowIndex) == addIndex - 1) {
                        normalisedAddIndex = i + 1;
                        break;
                    }
                }
            }
            var nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
            var nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
            this.rootNode.allLeafChildren = __spreadArray(__spreadArray(__spreadArray([], __read(nodesBeforeIndex)), __read(newNodes)), __read(nodesAfterIndex));
        }
        else {
            this.rootNode.allLeafChildren = __spreadArray(__spreadArray([], __read(this.rootNode.allLeafChildren)), __read(newNodes));
        }
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
        // add new row nodes to the transaction add items
        rowNodeTransaction.add = newNodes;
    };
    ClientSideNodeManager.prototype.executeRemove = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var remove = rowDataTran.remove;
        if (_.missingOrEmpty(remove)) {
            return;
        }
        var rowIdsRemoved = {};
        remove.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();
            // NOTE: were we could remove from allLeaveChildren, however _.removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id] = true;
            // _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete _this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
        });
        this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter(function (rowNode) { return !rowIdsRemoved[rowNode.id]; });
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    };
    ClientSideNodeManager.prototype.executeUpdate = function (rowDataTran, rowNodeTransaction, nodesToUnselect) {
        var _this = this;
        var update = rowDataTran.update;
        if (_.missingOrEmpty(update)) {
            return;
        }
        update.forEach(function (item) {
            var rowNode = _this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            _this.setMasterForRow(rowNode, item, ClientSideNodeManager.TOP_LEVEL, false);
            rowNodeTransaction.update.push(rowNode);
        });
    };
    ClientSideNodeManager.prototype.lookupRowNode = function (data) {
        var getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        var rowNode;
        if (getRowIdFunc) {
            // find rowNode using id
            var id = getRowIdFunc({ data: data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error("AG Grid: could not find row id=" + id + ", data item was not found for this id");
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren.find(function (node) { return node.data === data; });
            if (!rowNode) {
                console.error("AG Grid: could not find data item as object was not found", data);
                console.error("Consider using getRowId to help the Grid find matching row data");
                return null;
            }
        }
        return rowNode || null;
    };
    ClientSideNodeManager.prototype.createNode = function (dataItem, parent, level) {
        var node = new RowNode(this.beans);
        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);
        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        if (this.allNodesMap[node.id]) {
            console.warn("AG Grid: duplicate node id '" + node.id + "' detected from getRowId callback, this could cause issues in your grid.");
        }
        this.allNodesMap[node.id] = node;
        this.nextId++;
        return node;
    };
    ClientSideNodeManager.prototype.setMasterForRow = function (rowNode, data, level, setExpanded) {
        if (this.doingTreeData) {
            rowNode.setMaster(false);
            if (setExpanded) {
                rowNode.expanded = false;
            }
        }
        else {
            // this is the default, for when doing grid data
            if (this.doingMasterDetail) {
                // if we are doing master detail, then the
                // default is that everything can be a Master Row.
                if (this.isRowMasterFunc) {
                    rowNode.setMaster(this.isRowMasterFunc(data));
                }
                else {
                    rowNode.setMaster(true);
                }
            }
            else {
                rowNode.setMaster(false);
            }
            if (setExpanded) {
                var rowGroupColumns = this.columnModel.getRowGroupColumns();
                var numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;
                // need to take row group into account when determining level
                var masterRowLevel = level + numRowGroupColumns;
                rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
            }
        }
    };
    ClientSideNodeManager.prototype.isExpanded = function (level) {
        var expandByDefault = this.gridOptionsService.getNum('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    };
    ClientSideNodeManager.TOP_LEVEL = 0;
    ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
    return ClientSideNodeManager;
}());
export { ClientSideNodeManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50U2lkZU5vZGVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbC9jbGllbnRTaWRlTm9kZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNpQixNQUFNLEVBSTFCLE9BQU8sRUFHUCxDQUFDLEdBS0osTUFBTSx5QkFBeUIsQ0FBQztBQUVqQztJQXlCSSwrQkFBWSxRQUFpQixFQUFFLGtCQUFzQyxFQUFFLFlBQTBCLEVBQzdGLFdBQXdCLEVBQUUsZ0JBQW1DLEVBQUUsS0FBWTtRQWR2RSxXQUFNLEdBQUcsQ0FBQyxDQUFDO1FBVW5CLHdGQUF3RjtRQUNoRixnQkFBVyxHQUE4QixFQUFFLENBQUM7UUFJaEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUV6QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcscUJBQXFCLENBQUMsWUFBWSxDQUFDO1FBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixHQUFHLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUV2QyxnRUFBZ0U7UUFDaEUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCw4RUFBOEU7SUFDdkUsNkNBQWEsR0FBcEI7UUFDSSx5RUFBeUU7UUFDekUsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUN6RixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN0RSxDQUFDO0lBRU0saURBQWlCLEdBQXhCO1FBQ0ksT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sMENBQVUsR0FBakIsVUFBa0IsRUFBVTtRQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVNLDBDQUFVLEdBQWpCLFVBQWtCLE9BQWM7UUFBaEMsaUJBcUNDO1FBcENHLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0pBQStKLENBQUMsQ0FBQztZQUM5SyxPQUFPO1NBQ1Y7UUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQy9CLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBRXRDLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFDcEMsUUFBUSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQztRQUNuQyxRQUFRLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7UUFDbEMsUUFBUSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDL0IsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFdEIsSUFBSSxPQUFPLEVBQUU7WUFDVCx5RkFBeUY7WUFDekYseUZBQXlGO1lBQ3pGLGlEQUFpRDtZQUNqRCxRQUFRLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRLElBQUksT0FBQSxLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFJLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUF6RSxDQUF5RSxDQUFDLENBQUM7U0FDakk7YUFBTTtZQUNILFFBQVEsQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQzlCLFFBQVEsQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7U0FDcEM7UUFFRCxJQUFJLE9BQU8sRUFBRTtZQUNULE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxRQUFRLENBQUMsbUJBQW1CLENBQUM7WUFDM0QsT0FBTyxDQUFDLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQztZQUN6RCxPQUFPLENBQUMsc0JBQXNCLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDO1lBQ2pFLE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUM7WUFDdkQsT0FBTyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDO1lBQ2pELE9BQU8sQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztTQUN0RDtJQUNMLENBQUM7SUFFTSw2Q0FBYSxHQUFwQixVQUFxQixXQUErQixFQUFFLFlBQXlEO1FBQzNHLElBQU0sa0JBQWtCLEdBQXVCO1lBQzNDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsTUFBTSxFQUFFLEVBQUU7WUFDVixHQUFHLEVBQUUsRUFBRTtTQUNWLENBQUM7UUFFRixJQUFNLGVBQWUsR0FBYyxFQUFFLENBQUM7UUFFdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUVqRCxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXhELElBQUksWUFBWSxFQUFFO1lBQ2QsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsT0FBTyxrQkFBa0IsQ0FBQztJQUM5QixDQUFDO0lBRU8sK0NBQWUsR0FBdkIsVUFBd0IsZUFBMEIsRUFBRSxNQUFnQztRQUNoRixJQUFNLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELElBQUksZ0JBQWdCLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDO2dCQUNuQyxRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLEVBQUUsZUFBZTtnQkFDdEIscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsTUFBTSxRQUFBO2FBQ1QsQ0FBQyxDQUFDO1NBQ047UUFFRCxzRUFBc0U7UUFDdEUsNEVBQTRFO1FBQzVFLGlGQUFpRjtRQUNqRixnQ0FBZ0M7UUFDaEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtDQUFrQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWpFLElBQUksZ0JBQWdCLEVBQUU7WUFDbEIsSUFBTSxPQUFLLEdBQTZDO2dCQUNwRCxJQUFJLEVBQUUsTUFBTSxDQUFDLHVCQUF1QjtnQkFDcEMsTUFBTSxFQUFFLE1BQU07YUFDakIsQ0FBQztZQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE9BQUssQ0FBQyxDQUFDO1NBQzFDO0lBQ0wsQ0FBQztJQUVPLDBDQUFVLEdBQWxCLFVBQW1CLFdBQStCLEVBQUUsa0JBQXNDO1FBQTFGLGlCQStCQzs7UUE5QlcsSUFBQSxHQUFHLEdBQWUsV0FBVyxJQUExQixFQUFFLFFBQVEsR0FBSyxXQUFXLFNBQWhCLENBQWlCO1FBQ3RDLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV0QywwQ0FBMEM7UUFDMUMsSUFBTSxRQUFRLEdBQWMsR0FBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUksQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsU0FBUyxDQUFDLEVBQXJFLENBQXFFLENBQUMsQ0FBQztRQUVwSCxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO1lBQy9DLDJHQUEyRztZQUMzRywyR0FBMkc7WUFDbkcsSUFBQSxlQUFlLEdBQUssSUFBSSxDQUFDLFFBQVEsZ0JBQWxCLENBQW1CO1lBQzFDLElBQU0sR0FBRyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7WUFDbkMsSUFBSSxrQkFBa0IsR0FBRyxRQUFRLENBQUM7WUFFbEMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtnQkFDL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDMUIsSUFBSSxDQUFBLE1BQUEsZUFBZSxDQUFDLENBQUMsQ0FBQywwQ0FBRSxRQUFRLEtBQUksUUFBUSxHQUFHLENBQUMsRUFBRTt3QkFBRSxrQkFBa0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUFDLE1BQU07cUJBQUU7aUJBQzNGO2FBQ0o7WUFFRCxJQUFNLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDdEUsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLHdEQUFPLGdCQUFnQixXQUFLLFFBQVEsV0FBSyxlQUFlLEVBQUMsQ0FBQztTQUMxRjthQUFNO1lBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLDBDQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxXQUFLLFFBQVEsRUFBQyxDQUFDO1NBQ25GO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7U0FDekU7UUFDRCxpREFBaUQ7UUFDakQsa0JBQWtCLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQztJQUN0QyxDQUFDO0lBRU8sNkNBQWEsR0FBckIsVUFBc0IsV0FBK0IsRUFBRSxrQkFBc0MsRUFBRSxlQUEwQjtRQUF6SCxpQkFrQ0M7UUFqQ1csSUFBQSxNQUFNLEdBQUssV0FBVyxPQUFoQixDQUFpQjtRQUUvQixJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFekMsSUFBTSxhQUFhLEdBQStCLEVBQUUsQ0FBQztRQUVyRCxNQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtZQUNoQixJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQUUsT0FBTzthQUFFO1lBRXpCLHlHQUF5RztZQUN6RyxvR0FBb0c7WUFDcEcsSUFBSSxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3RCLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakM7WUFFRCxnRUFBZ0U7WUFDaEUsT0FBTyxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFFakMseUdBQXlHO1lBQ3pHLDZGQUE2RjtZQUM3RixhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNsQyw2REFBNkQ7WUFDN0QsT0FBTyxLQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFHLENBQUMsQ0FBQztZQUVyQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUcsQ0FBQyxFQUEzQixDQUEyQixDQUFDLENBQUM7UUFDN0csSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUM7U0FDekU7SUFDTCxDQUFDO0lBRU8sNkNBQWEsR0FBckIsVUFBc0IsV0FBK0IsRUFBRSxrQkFBc0MsRUFBRSxlQUEwQjtRQUF6SCxpQkFrQkM7UUFqQlcsSUFBQSxNQUFNLEdBQUssV0FBVyxPQUFoQixDQUFpQjtRQUMvQixJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFekMsTUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7WUFDaEIsSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV6QyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUFFLE9BQU87YUFBRTtZQUV6QixPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDN0MsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztZQUVELEtBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFNUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyw2Q0FBYSxHQUFyQixVQUFzQixJQUFTO1FBQzNCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckUsSUFBSSxPQUE0QixDQUFDO1FBQ2pDLElBQUksWUFBWSxFQUFFO1lBQ2Qsd0JBQXdCO1lBQ3hCLElBQU0sRUFBRSxHQUFXLFlBQVksQ0FBQyxFQUFFLElBQUksTUFBQSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBa0MsRUFBRSwwQ0FBdUMsQ0FBQyxDQUFDO2dCQUMzRixPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7YUFBTTtZQUNILHVDQUF1QztZQUN2QyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQWxCLENBQWtCLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkRBQTJELEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pGLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUVBQWlFLENBQUMsQ0FBQztnQkFDakYsT0FBTyxJQUFJLENBQUM7YUFDZjtTQUNKO1FBRUQsT0FBTyxPQUFPLElBQUksSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFTywwQ0FBVSxHQUFsQixVQUFtQixRQUFhLEVBQUUsTUFBZSxFQUFFLEtBQWE7UUFDNUQsSUFBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEQsSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUU7WUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDeEI7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFcEQsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFHLENBQUMsRUFBRTtZQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUErQixJQUFJLENBQUMsRUFBRSw2RUFBMEUsQ0FBQyxDQUFDO1NBQ2xJO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRWxDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVkLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTywrQ0FBZSxHQUF2QixVQUF3QixPQUFnQixFQUFFLElBQVMsRUFBRSxLQUFhLEVBQUUsV0FBb0I7UUFDcEYsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsT0FBTyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7YUFDNUI7U0FDSjthQUFNO1lBQ0gsZ0RBQWdEO1lBQ2hELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUN4QiwwQ0FBMEM7Z0JBQzFDLGtEQUFrRDtnQkFDbEQsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUN0QixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDakQ7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0I7YUFDSjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1lBRUQsSUFBSSxXQUFXLEVBQUU7Z0JBQ2IsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2dCQUM5RCxJQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV4RSw2REFBNkQ7Z0JBQzdELElBQU0sY0FBYyxHQUFHLEtBQUssR0FBRyxrQkFBa0IsQ0FBQztnQkFFbEQsT0FBTyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDL0U7U0FDSjtJQUNMLENBQUM7SUFFTywwQ0FBVSxHQUFsQixVQUFtQixLQUFVO1FBQ3pCLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUMvRSxJQUFJLGVBQWUsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsT0FBTyxLQUFLLEdBQUcsZUFBZ0IsQ0FBQztJQUNwQyxDQUFDO0lBblVjLCtCQUFTLEdBQUcsQ0FBQyxDQUFDO0lBWWQsa0NBQVksR0FBRyxjQUFjLENBQUM7SUF3VGpELDRCQUFDO0NBQUEsQUF0VUQsSUFzVUM7U0F0VVkscUJBQXFCIn0=