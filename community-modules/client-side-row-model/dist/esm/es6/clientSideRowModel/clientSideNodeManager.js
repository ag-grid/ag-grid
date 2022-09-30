import { Events, RowNode, _ } from "@ag-grid-community/core";
export class ClientSideNodeManager {
    constructor(rootNode, gridOptionsWrapper, eventService, columnModel, selectionService, beans) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.rootNode = rootNode;
        this.gridOptionsWrapper = gridOptionsWrapper;
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
    postConstruct() {
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        this.isRowMasterFunc = this.gridOptionsWrapper.getIsRowMasterFunc();
        this.doingTreeData = this.gridOptionsWrapper.isTreeData();
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
    }
    getCopyOfNodesMap() {
        return _.cloneObject(this.allNodesMap);
    }
    getRowNode(id) {
        return this.allNodesMap[id];
    }
    setRowData(rowData) {
        if (typeof rowData === 'string') {
            console.warn('AG Grid: rowData must be an array, however you passed in a string. If you are loading JSON, make sure you convert the JSON string to JavaScript objects first');
            return;
        }
        const rootNode = this.rootNode;
        const sibling = this.rootNode.sibling;
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
            rootNode.allLeafChildren = rowData.map(dataItem => this.createNode(dataItem, this.rootNode, ClientSideNodeManager.TOP_LEVEL));
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
    }
    updateRowData(rowDataTran, rowNodeOrder) {
        const rowNodeTransaction = {
            remove: [],
            update: [],
            add: []
        };
        const nodesToUnselect = [];
        this.executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect);
        this.executeAdd(rowDataTran, rowNodeTransaction);
        this.updateSelection(nodesToUnselect);
        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    }
    updateSelection(nodesToUnselect) {
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            nodesToUnselect.forEach(rowNode => {
                rowNode.setSelected(false, false, true);
            });
        }
        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        this.selectionService.updateGroupsFromChildrenSelections();
        if (selectionChanged) {
            const event = {
                type: Events.EVENT_SELECTION_CHANGED
            };
            this.eventService.dispatchEvent(event);
        }
    }
    executeAdd(rowDataTran, rowNodeTransaction) {
        const { add, addIndex } = rowDataTran;
        if (_.missingOrEmpty(add)) {
            return;
        }
        // create new row nodes for each data item
        const newNodes = add.map(item => this.createNode(item, this.rootNode, ClientSideNodeManager.TOP_LEVEL));
        // add new row nodes to the root nodes 'allLeafChildren'
        const useIndex = typeof addIndex === 'number' && addIndex >= 0;
        let nodesBeforeIndex;
        let nodesAfterIndex;
        if (useIndex) {
            // new rows are inserted in one go by concatenating them in between the existing rows at the desired index.
            // this is much faster than splicing them individually into 'allLeafChildren' when there are large inserts.
            // allLeafChildren can be out of order, so we loop over all the Nodes to find the correct index that
            // represents the position `addIndex` intended to be.
            const { allLeafChildren } = this.rootNode;
            // if addIndex is 0, it should always be added at the start of the array
            // there is no need to verify the order of node by nodeIndex.
            const normalizedAddIndex = addIndex === 0 ? 0 : (allLeafChildren.reduce((prevIdx, currNode, currIdx) => {
                var _a;
                const { rowIndex } = currNode;
                const prevValueAtIndex = (_a = allLeafChildren[prevIdx]) === null || _a === void 0 ? void 0 : _a.rowIndex;
                const shouldUpdateIndex = rowIndex != null && prevValueAtIndex != null && rowIndex < addIndex && rowIndex > prevValueAtIndex;
                return shouldUpdateIndex ? currIdx : prevIdx;
            }, 0) + 1);
            nodesBeforeIndex = allLeafChildren.slice(0, normalizedAddIndex);
            nodesAfterIndex = allLeafChildren.slice(normalizedAddIndex, allLeafChildren.length);
        }
        else {
            nodesBeforeIndex = this.rootNode.allLeafChildren;
            nodesAfterIndex = [];
        }
        this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
        // add new row nodes to the transaction add items
        rowNodeTransaction.add = newNodes;
    }
    executeRemove(rowDataTran, rowNodeTransaction, nodesToUnselect) {
        const { remove } = rowDataTran;
        if (_.missingOrEmpty(remove)) {
            return;
        }
        const rowIdsRemoved = {};
        remove.forEach(item => {
            const rowNode = this.lookupRowNode(item);
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
            delete this.allNodesMap[rowNode.id];
            rowNodeTransaction.remove.push(rowNode);
        });
        this.rootNode.allLeafChildren = this.rootNode.allLeafChildren.filter(rowNode => !rowIdsRemoved[rowNode.id]);
        if (this.rootNode.sibling) {
            this.rootNode.sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    }
    executeUpdate(rowDataTran, rowNodeTransaction, nodesToUnselect) {
        const { update } = rowDataTran;
        if (_.missingOrEmpty(update)) {
            return;
        }
        update.forEach(item => {
            const rowNode = this.lookupRowNode(item);
            if (!rowNode) {
                return;
            }
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            this.setMasterForRow(rowNode, item, ClientSideNodeManager.TOP_LEVEL, false);
            rowNodeTransaction.update.push(rowNode);
        });
    }
    lookupRowNode(data) {
        const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
        let rowNode;
        if (getRowIdFunc) {
            // find rowNode using id
            const id = getRowIdFunc({ data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                console.error(`AG Grid: could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        }
        else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren.find(node => node.data === data);
            if (!rowNode) {
                console.error(`AG Grid: could not find data item as object was not found`, data);
                console.error(`Consider using getRowId to help the Grid find matching row data`);
                return null;
            }
        }
        return rowNode || null;
    }
    createNode(dataItem, parent, level) {
        const node = new RowNode(this.beans);
        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);
        if (parent && !this.suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        if (this.allNodesMap[node.id]) {
            console.warn(`AG Grid: duplicate node id '${node.id}' detected from getRowId callback, this could cause issues in your grid.`);
        }
        this.allNodesMap[node.id] = node;
        this.nextId++;
        return node;
    }
    setMasterForRow(rowNode, data, level, setExpanded) {
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
                const rowGroupColumns = this.columnModel.getRowGroupColumns();
                const numRowGroupColumns = rowGroupColumns ? rowGroupColumns.length : 0;
                // need to take row group into account when determining level
                const masterRowLevel = level + numRowGroupColumns;
                rowNode.expanded = rowNode.master ? this.isExpanded(masterRowLevel) : false;
            }
        }
    }
    isExpanded(level) {
        const expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    }
}
ClientSideNodeManager.TOP_LEVEL = 0;
ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
