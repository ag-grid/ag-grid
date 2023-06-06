/**
          * @ag-grid-community/client-side-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license MIT
          */
import { _, Events, RowNode, Autowired, Optional, PostConstruct, Bean, BeanStub, ClientSideRowModelSteps, RowHighlightPosition, ChangedPath, ModuleNames } from '@ag-grid-community/core';

class ClientSideNodeManager {
    constructor(rootNode, gridOptionsService, eventService, columnModel, selectionService, beans) {
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
    postConstruct() {
        // func below doesn't have 'this' pointer, so need to pull out these bits
        this.suppressParentsInRowNodes = this.gridOptionsService.is('suppressParentsInRowNodes');
        this.isRowMasterFunc = this.gridOptionsService.get('isRowMaster');
        this.doingTreeData = this.gridOptionsService.isTreeData();
        this.doingMasterDetail = this.gridOptionsService.isMasterDetail();
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
        this.updateSelection(nodesToUnselect, 'rowDataChanged');
        if (rowNodeOrder) {
            _.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    }
    updateSelection(nodesToUnselect, source) {
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            this.selectionService.setNodesSelected({
                newValue: false,
                nodes: nodesToUnselect,
                suppressFinishActions: true,
                source,
            });
        }
        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        this.selectionService.updateGroupsFromChildrenSelections(source);
        if (selectionChanged) {
            const event = {
                type: Events.EVENT_SELECTION_CHANGED,
                source: source
            };
            this.eventService.dispatchEvent(event);
        }
    }
    executeAdd(rowDataTran, rowNodeTransaction) {
        var _a;
        const { add, addIndex } = rowDataTran;
        if (_.missingOrEmpty(add)) {
            return;
        }
        // create new row nodes for each data item
        const newNodes = add.map(item => this.createNode(item, this.rootNode, ClientSideNodeManager.TOP_LEVEL));
        if (typeof addIndex === 'number' && addIndex >= 0) {
            // new rows are inserted in one go by concatenating them in between the existing rows at the desired index.
            // this is much faster than splicing them individually into 'allLeafChildren' when there are large inserts.
            const { allLeafChildren } = this.rootNode;
            const len = allLeafChildren.length;
            let normalisedAddIndex = addIndex;
            if (this.doingTreeData && addIndex > 0 && len > 0) {
                for (let i = 0; i < len; i++) {
                    if (((_a = allLeafChildren[i]) === null || _a === void 0 ? void 0 : _a.rowIndex) == addIndex - 1) {
                        normalisedAddIndex = i + 1;
                        break;
                    }
                }
            }
            const nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
            const nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
            this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];
        }
        else {
            this.rootNode.allLeafChildren = [...this.rootNode.allLeafChildren, ...newNodes];
        }
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
        const getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
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
        const expandByDefault = this.gridOptionsService.getNum('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    }
}
ClientSideNodeManager.TOP_LEVEL = 0;
ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RecursionType;
(function (RecursionType) {
    RecursionType[RecursionType["Normal"] = 0] = "Normal";
    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
    RecursionType[RecursionType["PivotNodes"] = 3] = "PivotNodes";
})(RecursionType || (RecursionType = {}));
let ClientSideRowModel = class ClientSideRowModel extends BeanStub {
    constructor() {
        super(...arguments);
        this.onRowHeightChanged_debounced = _.debounce(this.onRowHeightChanged.bind(this), 100);
        this.rowsToDisplay = []; // the rows mapped to rows to display
    }
    init() {
        const refreshEverythingFunc = this.refreshModel.bind(this, { step: ClientSideRowModelSteps.EVERYTHING });
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        const refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.EVERYTHING,
            afterColumnsChanged: true,
            keepRenderedRows: true,
            animate
        });
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: ClientSideRowModelSteps.PIVOT }));
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, Events.EVENT_GRID_STYLES_CHANGED, this.onGridStylesChanges.bind(this));
        const refreshMapListener = this.refreshModel.bind(this, {
            step: ClientSideRowModelSteps.MAP,
            keepRenderedRows: true,
            animate
        });
        this.addManagedPropertyListener('groupRemoveSingleChildren', refreshMapListener);
        this.addManagedPropertyListener('groupRemoveLowestSingleChildren', refreshMapListener);
        this.rootNode = new RowNode(this.beans);
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsService, this.eventService, this.columnModel, this.selectionService, this.beans);
    }
    start() {
        const rowData = this.gridOptionsService.get('rowData');
        if (rowData) {
            this.setRowData(rowData);
        }
    }
    ensureRowHeightsValid(startPixel, endPixel, startLimitIndex, endLimitIndex) {
        let atLeastOneChange;
        let res = false;
        // we do this multiple times as changing the row heights can also change the first and last rows,
        // so the first pass can make lots of rows smaller, which means the second pass we end up changing
        // more rows.
        do {
            atLeastOneChange = false;
            const rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
            const rowAtEndPixel = this.getRowIndexAtPixel(endPixel);
            // keep check to current page if doing pagination
            const firstRow = Math.max(rowAtStartPixel, startLimitIndex);
            const lastRow = Math.min(rowAtEndPixel, endLimitIndex);
            for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                const rowNode = this.getRow(rowIndex);
                if (rowNode.rowHeightEstimated) {
                    const rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode);
                    rowNode.setRowHeight(rowHeight.height);
                    atLeastOneChange = true;
                    res = true;
                }
            }
            if (atLeastOneChange) {
                this.setRowTopAndRowIndex();
            }
        } while (atLeastOneChange);
        return res;
    }
    setRowTopAndRowIndex() {
        const defaultRowHeight = this.environment.getDefaultRowHeight();
        let nextRowTop = 0;
        // mapping displayed rows is not needed for this method, however it's used in
        // clearRowTopAndRowIndex(), and given we are looping through this.rowsToDisplay here,
        // we create the map here for performance reasons, so we don't loop a second time
        // in clearRowTopAndRowIndex()
        const displayedRowsMapped = new Set();
        // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
        // with these two layouts.
        const allowEstimate = this.gridOptionsService.isDomLayout('normal');
        for (let i = 0; i < this.rowsToDisplay.length; i++) {
            const rowNode = this.rowsToDisplay[i];
            if (rowNode.id != null) {
                displayedRowsMapped.add(rowNode.id);
            }
            if (rowNode.rowHeight == null) {
                const rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }
            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
        return displayedRowsMapped;
    }
    clearRowTopAndRowIndex(changedPath, displayedRowsMapped) {
        const changedPathActive = changedPath.isActive();
        const clearIfNotDisplayed = (rowNode) => {
            if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
                rowNode.clearRowTopAndRowIndex();
            }
        };
        const recurse = (rowNode) => {
            clearIfNotDisplayed(rowNode);
            clearIfNotDisplayed(rowNode.detailNode);
            clearIfNotDisplayed(rowNode.sibling);
            if (rowNode.hasChildren()) {
                if (rowNode.childrenAfterGroup) {
                    // if a changedPath is active, it means we are here because of a transaction update or
                    // a change detection. neither of these impacts the open/closed state of groups. so if
                    // a group is not open this time, it was not open last time. so we know all closed groups
                    // already have their top positions cleared. so there is no need to traverse all the way
                    // when changedPath is active and the rowNode is not expanded.
                    const isRootNode = rowNode.level == -1; // we need to give special consideration for root node,
                    // as expanded=undefined for root node
                    const skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
                    if (!skipChildren) {
                        rowNode.childrenAfterGroup.forEach(recurse);
                    }
                }
            }
        };
        recurse(this.rootNode);
    }
    // returns false if row was moved, otherwise true
    ensureRowsAtPixel(rowNodes, pixel, increment = 0) {
        const indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        const rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        if (rowNodeAtPixelNow === rowNodes[0]) {
            return false;
        }
        rowNodes.forEach(rowNode => {
            _.removeFromArray(this.rootNode.allLeafChildren, rowNode);
        });
        rowNodes.forEach((rowNode, idx) => {
            _.insertIntoArray(this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
        });
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        });
        return true;
    }
    highlightRowAtPixel(rowNode, pixel) {
        const indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
        const rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;
        if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
            if (this.lastHighlightedRow) {
                this.lastHighlightedRow.setHighlighted(null);
                this.lastHighlightedRow = null;
            }
            return;
        }
        const highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);
        if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
            this.lastHighlightedRow.setHighlighted(null);
            this.lastHighlightedRow = null;
        }
        rowNodeAtPixelNow.setHighlighted(highlight);
        this.lastHighlightedRow = rowNodeAtPixelNow;
    }
    getHighlightPosition(pixel, rowNode) {
        if (!rowNode) {
            const index = this.getRowIndexAtPixel(pixel);
            rowNode = this.getRow(index || 0);
            if (!rowNode) {
                return RowHighlightPosition.Below;
            }
        }
        const { rowTop, rowHeight } = rowNode;
        return pixel - rowTop < rowHeight / 2 ? RowHighlightPosition.Above : RowHighlightPosition.Below;
    }
    getLastHighlightedRowNode() {
        return this.lastHighlightedRow;
    }
    isLastRowIndexKnown() {
        return true;
    }
    getRowCount() {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        return 0;
    }
    getTopLevelRowCount() {
        const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return 1;
        }
        const filteredChildren = this.rootNode.childrenAfterAggFilter;
        return filteredChildren ? filteredChildren.length : 0;
    }
    getTopLevelRowDisplayedIndex(topLevelIndex) {
        const showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return topLevelIndex;
        }
        let rowNode = this.rootNode.childrenAfterSort[topLevelIndex];
        if (this.gridOptionsService.is('groupHideOpenParents')) {
            // if hideOpenParents, and this row open, then this row is now displayed at this index, first child is
            while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
                rowNode = rowNode.childrenAfterSort[0];
            }
        }
        return rowNode.rowIndex;
    }
    getRowBounds(index) {
        if (_.missing(this.rowsToDisplay)) {
            return null;
        }
        const rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            };
        }
        return null;
    }
    onRowGroupOpened() {
        const animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate: animate });
    }
    onFilterChanged(event) {
        if (event.afterDataChange) {
            return;
        }
        const animate = this.gridOptionsService.isAnimateRows();
        const primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some(col => col.isPrimary());
        const step = primaryOrQuickFilterChanged ? ClientSideRowModelSteps.FILTER : ClientSideRowModelSteps.FILTER_AGGREGATES;
        this.refreshModel({ step: step, keepRenderedRows: true, animate: animate });
    }
    onSortChanged() {
        const animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    }
    getType() {
        return 'clientSide';
    }
    onValueChanged() {
        if (this.columnModel.isPivotActive()) {
            this.refreshModel({ step: ClientSideRowModelSteps.PIVOT });
        }
        else {
            this.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
        }
    }
    createChangePath(rowNodeTransactions) {
        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueService twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.
        const noTransactions = _.missingOrEmpty(rowNodeTransactions);
        const changedPath = new ChangedPath(false, this.rootNode);
        if (noTransactions || this.gridOptionsService.isTreeData()) {
            changedPath.setInactive();
        }
        return changedPath;
    }
    isSuppressModelUpdateAfterUpdateTransaction(params) {
        if (!this.gridOptionsService.is('suppressModelUpdateAfterUpdateTransaction')) {
            return false;
        }
        // return true if we are only doing update transactions
        if (params.rowNodeTransactions == null) {
            return false;
        }
        const transWithAddsOrDeletes = params.rowNodeTransactions.filter(tx => (tx.add != null && tx.add.length > 0) || (tx.remove != null && tx.remove.length > 0));
        const transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
        return transactionsContainUpdatesOnly;
    }
    buildRefreshModelParams(step) {
        let paramsStep = ClientSideRowModelSteps.EVERYTHING;
        const stepsMapped = {
            everything: ClientSideRowModelSteps.EVERYTHING,
            group: ClientSideRowModelSteps.EVERYTHING,
            filter: ClientSideRowModelSteps.FILTER,
            map: ClientSideRowModelSteps.MAP,
            aggregate: ClientSideRowModelSteps.AGGREGATE,
            sort: ClientSideRowModelSteps.SORT,
            pivot: ClientSideRowModelSteps.PIVOT
        };
        if (_.exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (_.missing(paramsStep)) {
            console.error(`AG Grid: invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}`);
            return undefined;
        }
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        const modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        };
        return modelParams;
    }
    refreshModel(paramsOrStep) {
        let params = typeof paramsOrStep === 'object' && "step" in paramsOrStep ? paramsOrStep : this.buildRefreshModelParams(paramsOrStep);
        if (!params) {
            return;
        }
        if (this.isSuppressModelUpdateAfterUpdateTransaction(params)) {
            return;
        }
        // this goes through the pipeline of stages. what's in my head is similar
        // to the diagram on this page:
        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
        // however we want to keep the results of each stage, hence we manually call
        // each step rather than have them chain each other.
        // fallthrough in below switch is on purpose,
        // eg if STEP_FILTER, then all steps below this
        // step get done
        // let start: number;
        // console.log('======= start =======');
        const changedPath = this.createChangePath(params.rowNodeTransactions);
        switch (params.step) {
            case ClientSideRowModelSteps.EVERYTHING:
                this.doRowGrouping(params.groupState, params.rowNodeTransactions, params.rowNodeOrder, changedPath, !!params.afterColumnsChanged);
            case ClientSideRowModelSteps.FILTER:
                this.doFilter(changedPath);
            case ClientSideRowModelSteps.PIVOT:
                this.doPivot(changedPath);
            case ClientSideRowModelSteps.AGGREGATE: // depends on agg fields
                this.doAggregate(changedPath);
            case ClientSideRowModelSteps.FILTER_AGGREGATES:
                this.doFilterAggregates(changedPath);
            case ClientSideRowModelSteps.SORT:
                this.doSort(params.rowNodeTransactions, changedPath);
            case ClientSideRowModelSteps.MAP:
                this.doRowsToDisplay();
        }
        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        const displayedNodesMapped = this.setRowTopAndRowIndex();
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);
        const event = {
            type: Events.EVENT_MODEL_UPDATED,
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false,
            keepUndoRedoStack: params.keepUndoRedoStack
        };
        this.eventService.dispatchEvent(event);
    }
    isEmpty() {
        const rowsMissing = _.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        return _.missing(this.rootNode) || rowsMissing || !this.columnModel.isReady();
    }
    isRowsToRender() {
        return _.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    }
    getNodesInRangeForSelection(firstInRange, lastInRange) {
        // if lastSelectedNode is missing, we start at the first row
        let started = !lastInRange;
        let finished = false;
        const result = [];
        const groupsSelectChildren = this.gridOptionsService.is('groupSelectsChildren');
        this.forEachNodeAfterFilterAndSort(rowNode => {
            // range has been closed, skip till end
            if (finished) {
                return;
            }
            if (started) {
                if (rowNode === lastInRange || rowNode === firstInRange) {
                    // check if this is the last node we're going to be adding
                    finished = true;
                    // if the final node was a group node, and we're doing groupSelectsChildren
                    // make the exception to select all of it's descendants too
                    if (rowNode.group && groupsSelectChildren) {
                        result.push(...rowNode.allLeafChildren);
                        return;
                    }
                }
            }
            if (!started) {
                if (rowNode !== lastInRange && rowNode !== firstInRange) {
                    // still haven't hit a boundary node, keep searching
                    return;
                }
                started = true;
            }
            // only select leaf nodes if groupsSelectChildren
            const includeThisNode = !rowNode.group || !groupsSelectChildren;
            if (includeThisNode) {
                result.push(rowNode);
                return;
            }
        });
        return result;
    }
    setDatasource(datasource) {
        console.error('AG Grid: should never call setDatasource on clientSideRowController');
    }
    getTopLevelNodes() {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    }
    getRootNode() {
        return this.rootNode;
    }
    getRow(index) {
        return this.rowsToDisplay[index];
    }
    isRowPresent(rowNode) {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    }
    getRowIndexAtPixel(pixelToMatch) {
        if (this.isEmpty() || this.rowsToDisplay.length === 0) {
            return -1;
        }
        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        let bottomPointer = 0;
        let topPointer = this.rowsToDisplay.length - 1;
        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch <= 0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        const lastNode = _.last(this.rowsToDisplay);
        if (lastNode.rowTop <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }
        let oldBottomPointer = -1;
        let oldTopPointer = -1;
        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = this.rowsToDisplay[midPointer];
            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
                return midPointer;
            }
            if (currentRowNode.rowTop < pixelToMatch) {
                bottomPointer = midPointer + 1;
            }
            else if (currentRowNode.rowTop > pixelToMatch) {
                topPointer = midPointer - 1;
            }
            // infinite loops happen when there is space between rows. this can happen
            // when Auto Height is active, cos we re-calculate row tops asyncronously
            // when row heights change, which can temporarly result in gaps between rows.
            const caughtInInfiniteLoop = oldBottomPointer === bottomPointer
                && oldTopPointer === topPointer;
            if (caughtInInfiniteLoop) {
                return midPointer;
            }
            oldBottomPointer = bottomPointer;
            oldTopPointer = topPointer;
        }
    }
    isRowInPixel(rowNode, pixelToMatch) {
        const topPixel = rowNode.rowTop;
        const bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        const pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    }
    forEachLeafNode(callback) {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach((rowNode, index) => callback(rowNode, index));
        }
    }
    forEachNode(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [...(this.rootNode.childrenAfterGroup || [])],
            callback,
            recursionType: RecursionType.Normal,
            index: 0,
            includeFooterNodes
        });
    }
    forEachNodeAfterFilter(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [...(this.rootNode.childrenAfterAggFilter || [])],
            callback,
            recursionType: RecursionType.AfterFilter,
            index: 0,
            includeFooterNodes
        });
    }
    forEachNodeAfterFilterAndSort(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [...(this.rootNode.childrenAfterSort || [])],
            callback,
            recursionType: RecursionType.AfterFilterAndSort,
            index: 0,
            includeFooterNodes
        });
    }
    forEachPivotNode(callback, includeFooterNodes = false) {
        this.recursivelyWalkNodesAndCallback({
            nodes: [this.rootNode],
            callback,
            recursionType: RecursionType.PivotNodes,
            index: 0,
            includeFooterNodes
        });
    }
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    recursivelyWalkNodesAndCallback(params) {
        var _a;
        const { nodes, callback, recursionType, includeFooterNodes } = params;
        let { index } = params;
        const firstNode = nodes[0];
        if (includeFooterNodes && ((_a = firstNode === null || firstNode === void 0 ? void 0 : firstNode.parent) === null || _a === void 0 ? void 0 : _a.sibling)) {
            nodes.push(firstNode.parent.sibling);
        }
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            callback(node, index++);
            // go to the next level if it is a group
            if (node.hasChildren() && !node.footer) {
                // depending on the recursion type, we pick a difference set of children
                let nodeChildren = null;
                switch (recursionType) {
                    case RecursionType.Normal:
                        nodeChildren = node.childrenAfterGroup;
                        break;
                    case RecursionType.AfterFilter:
                        nodeChildren = node.childrenAfterAggFilter;
                        break;
                    case RecursionType.AfterFilterAndSort:
                        nodeChildren = node.childrenAfterSort;
                        break;
                    case RecursionType.PivotNodes:
                        // for pivot, we don't go below leafGroup levels
                        nodeChildren = !node.leafGroup ? node.childrenAfterSort : null;
                        break;
                }
                if (nodeChildren) {
                    index = this.recursivelyWalkNodesAndCallback({
                        nodes: [...nodeChildren],
                        callback,
                        recursionType,
                        index,
                        includeFooterNodes
                    });
                }
            }
        }
        return index;
    }
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    doAggregate(changedPath) {
        if (this.aggregationStage) {
            this.aggregationStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    }
    doFilterAggregates(changedPath) {
        if (this.filterAggregatesStage) {
            this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
        else {
            // If filterAggregatesStage is undefined, then so is the grouping stage, so all children should be on the rootNode.
            this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
        }
    }
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    expandOrCollapseAll(expand) {
        const usingTreeData = this.gridOptionsService.isTreeData();
        const usingPivotMode = this.columnModel.isPivotActive();
        const recursiveExpandOrCollapse = (rowNodes) => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(rowNode => {
                const actionRow = () => {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };
                if (usingTreeData) {
                    const hasChildren = _.exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }
                if (usingPivotMode) {
                    const notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }
                const isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        };
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }
        this.refreshModel({ step: ClientSideRowModelSteps.MAP });
        const eventSource = expand ? 'expandAll' : 'collapseAll';
        const event = {
            type: Events.EVENT_EXPAND_COLLAPSE_ALL,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    }
    doSort(rowNodeTransactions, changedPath) {
        this.sortStage.execute({
            rowNode: this.rootNode,
            rowNodeTransactions: rowNodeTransactions,
            changedPath: changedPath
        });
    }
    doRowGrouping(groupState, rowNodeTransactions, rowNodeOrder, changedPath, afterColumnsChanged) {
        if (this.groupStage) {
            if (rowNodeTransactions) {
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    rowNodeTransactions: rowNodeTransactions,
                    rowNodeOrder: rowNodeOrder,
                    changedPath: changedPath
                });
            }
            else {
                this.groupStage.execute({
                    rowNode: this.rootNode,
                    changedPath: changedPath,
                    afterColumnsChanged: afterColumnsChanged
                });
                // set open/closed state on groups
                this.restoreGroupState(groupState);
            }
            if (this.gridOptionsService.is('groupSelectsChildren')) {
                const selectionChanged = this.selectionService.updateGroupsFromChildrenSelections('rowGroupChanged', changedPath);
                if (selectionChanged) {
                    const event = {
                        type: Events.EVENT_SELECTION_CHANGED,
                        source: 'rowGroupChanged'
                    };
                    this.eventService.dispatchEvent(event);
                }
            }
        }
        else {
            this.rootNode.childrenAfterGroup = this.rootNode.allLeafChildren;
            if (this.rootNode.sibling) {
                this.rootNode.sibling.childrenAfterGroup = this.rootNode.childrenAfterGroup;
            }
            this.rootNode.updateHasChildren();
        }
    }
    restoreGroupState(groupState) {
        if (!groupState) {
            return;
        }
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node, key) => {
            // if the group was open last time, then open it this time. however
            // if was not open last time, then don't touch the group, so the 'groupDefaultExpanded'
            // setting will take effect.
            if (typeof groupState[key] === 'boolean') {
                node.expanded = groupState[key];
            }
        });
    }
    doFilter(changedPath) {
        this.filterStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
    }
    doPivot(changedPath) {
        if (this.pivotStage) {
            this.pivotStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    }
    getGroupState() {
        if (!this.rootNode.childrenAfterGroup || !this.gridOptionsService.is('rememberGroupStateWhenNewData')) {
            return null;
        }
        const result = {};
        _.traverseNodesWithKey(this.rootNode.childrenAfterGroup, (node, key) => result[key] = node.expanded);
        return result;
    }
    getCopyOfNodesMap() {
        return this.nodeManager.getCopyOfNodesMap();
    }
    getRowNode(id) {
        // although id is typed a string, this could be called by the user, and they could have passed a number
        const idIsGroup = typeof id == 'string' && id.indexOf(RowNode.ID_PREFIX_ROW_GROUP) == 0;
        if (idIsGroup) {
            // only one users complained about getRowNode not working for groups, after years of
            // this working for normal rows. so have done quick implementation. if users complain
            // about performance, then GroupStage should store / manage created groups in a map,
            // which is a chunk of work.
            let res = undefined;
            this.forEachNode(node => {
                if (node.id === id) {
                    res = node;
                }
            });
            return res;
        }
        return this.nodeManager.getRowNode(id);
    }
    // rows: the rows to put into the model
    setRowData(rowData) {
        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.
        // remember group state, so we can expand groups that should be expanded
        const groupState = this.getGroupState();
        this.nodeManager.setRowData(rowData);
        // - clears selection
        this.selectionService.reset();
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');
        // this event kicks off:
        // - shows 'no rows' overlay if needed
        const rowDataUpdatedEvent = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataUpdatedEvent);
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            groupState: groupState,
            newData: true
        });
    }
    batchUpdateRowData(rowDataTransaction, callback) {
        if (this.applyAsyncTransactionsTimeout == null) {
            this.rowDataTransactionBatch = [];
            const waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
            this.applyAsyncTransactionsTimeout = window.setTimeout(() => {
                this.executeBatchUpdateRowData();
            }, waitMillis);
        }
        this.rowDataTransactionBatch.push({ rowDataTransaction: rowDataTransaction, callback: callback });
    }
    flushAsyncTransactions() {
        if (this.applyAsyncTransactionsTimeout != null) {
            clearTimeout(this.applyAsyncTransactionsTimeout);
            this.executeBatchUpdateRowData();
        }
    }
    executeBatchUpdateRowData() {
        this.valueCache.onDataChanged();
        const callbackFuncsBound = [];
        const rowNodeTrans = [];
        // The rowGroup stage uses rowNodeOrder if order was provided. if we didn't pass 'true' to
        // commonUpdateRowData, using addIndex would have no effect when grouping.
        let forceRowNodeOrder = false;
        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(tranItem => {
                const rowNodeTran = this.nodeManager.updateRowData(tranItem.rowDataTransaction, undefined);
                rowNodeTrans.push(rowNodeTran);
                if (tranItem.callback) {
                    callbackFuncsBound.push(tranItem.callback.bind(null, rowNodeTran));
                }
                if (typeof tranItem.rowDataTransaction.addIndex === 'number') {
                    forceRowNodeOrder = true;
                }
            });
        }
        this.commonUpdateRowData(rowNodeTrans, undefined, forceRowNodeOrder);
        // do callbacks in next VM turn so it's async
        if (callbackFuncsBound.length > 0) {
            window.setTimeout(() => {
                callbackFuncsBound.forEach(func => func());
            }, 0);
        }
        if (rowNodeTrans.length > 0) {
            const event = {
                type: Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: rowNodeTrans
            };
            this.eventService.dispatchEvent(event);
        }
        this.rowDataTransactionBatch = null;
        this.applyAsyncTransactionsTimeout = undefined;
    }
    updateRowData(rowDataTran, rowNodeOrder) {
        this.valueCache.onDataChanged();
        const rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
        // if doing immutableData, addIndex is never present. however if doing standard transaction, and user
        // provided addIndex, then this is used in updateRowData. However if doing Enterprise, then the rowGroup
        // stage also uses the
        const forceRowNodeOrder = typeof rowDataTran.addIndex === 'number';
        this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);
        return rowNodeTran;
    }
    createRowNodeOrder() {
        const suppressSortOrder = this.gridOptionsService.is('suppressMaintainUnsortedOrder');
        if (suppressSortOrder) {
            return;
        }
        const orderMap = {};
        if (this.rootNode && this.rootNode.allLeafChildren) {
            for (let index = 0; index < this.rootNode.allLeafChildren.length; index++) {
                const node = this.rootNode.allLeafChildren[index];
                orderMap[node.id] = index;
            }
        }
        return orderMap;
    }
    // common to updateRowData and batchUpdateRowData
    commonUpdateRowData(rowNodeTrans, rowNodeOrder, forceRowNodeOrder) {
        const animate = !this.gridOptionsService.is('suppressAnimationFrame');
        if (forceRowNodeOrder) {
            rowNodeOrder = this.createRowNodeOrder();
        }
        this.refreshModel({
            step: ClientSideRowModelSteps.EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        });
        // - updates filters
        this.filterManager.onNewRowsLoaded('rowDataUpdated');
        const event = {
            type: Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(event);
    }
    doRowsToDisplay() {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    }
    onRowHeightChanged() {
        this.refreshModel({ step: ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true, keepUndoRedoStack: true });
    }
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    onRowHeightChangedDebounced() {
        this.onRowHeightChanged_debounced();
    }
    resetRowHeights() {
        const atLeastOne = this.resetRowHeightsForAllRowNodes();
        this.rootNode.setRowHeight(this.rootNode.rowHeight, true);
        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    }
    resetRowHeightsForAllRowNodes() {
        let atLeastOne = false;
        this.forEachNode(rowNode => {
            rowNode.setRowHeight(rowNode.rowHeight, true);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            const detailNode = rowNode.detailNode;
            if (detailNode) {
                detailNode.setRowHeight(detailNode.rowHeight, true);
            }
            atLeastOne = true;
        });
        return atLeastOne;
    }
    onGridStylesChanges() {
        if (this.columnModel.isAutoRowHeightActive()) {
            return;
        }
        this.resetRowHeights();
    }
};
__decorate$6([
    Autowired('columnModel')
], ClientSideRowModel.prototype, "columnModel", void 0);
__decorate$6([
    Autowired('selectionService')
], ClientSideRowModel.prototype, "selectionService", void 0);
__decorate$6([
    Autowired('filterManager')
], ClientSideRowModel.prototype, "filterManager", void 0);
__decorate$6([
    Autowired('valueCache')
], ClientSideRowModel.prototype, "valueCache", void 0);
__decorate$6([
    Autowired('beans')
], ClientSideRowModel.prototype, "beans", void 0);
__decorate$6([
    Autowired('filterStage')
], ClientSideRowModel.prototype, "filterStage", void 0);
__decorate$6([
    Autowired('sortStage')
], ClientSideRowModel.prototype, "sortStage", void 0);
__decorate$6([
    Autowired('flattenStage')
], ClientSideRowModel.prototype, "flattenStage", void 0);
__decorate$6([
    Optional('groupStage')
], ClientSideRowModel.prototype, "groupStage", void 0);
__decorate$6([
    Optional('aggregationStage')
], ClientSideRowModel.prototype, "aggregationStage", void 0);
__decorate$6([
    Optional('pivotStage')
], ClientSideRowModel.prototype, "pivotStage", void 0);
__decorate$6([
    Optional('filterAggregatesStage')
], ClientSideRowModel.prototype, "filterAggregatesStage", void 0);
__decorate$6([
    PostConstruct
], ClientSideRowModel.prototype, "init", null);
ClientSideRowModel = __decorate$6([
    Bean('rowModel')
], ClientSideRowModel);

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FilterStage = class FilterStage extends BeanStub {
    execute(params) {
        const { changedPath } = params;
        this.filterService.filter(changedPath);
    }
};
__decorate$5([
    Autowired('filterService')
], FilterStage.prototype, "filterService", void 0);
FilterStage = __decorate$5([
    Bean('filterStage')
], FilterStage);

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SortStage = class SortStage extends BeanStub {
    execute(params) {
        const sortOptions = this.sortController.getSortOptions();
        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsService.is('deltaSort');
        const sortContainsGroupColumns = sortOptions.some(opt => !!this.columnModel.getGroupDisplayColumnForGroup(opt.column.getId()));
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    }
};
__decorate$4([
    Autowired('sortService')
], SortStage.prototype, "sortService", void 0);
__decorate$4([
    Autowired('sortController')
], SortStage.prototype, "sortController", void 0);
__decorate$4([
    Autowired('columnModel')
], SortStage.prototype, "columnModel", void 0);
SortStage = __decorate$4([
    Bean('sortStage')
], SortStage);

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FlattenStage = class FlattenStage extends BeanStub {
    execute(params) {
        const rootNode = params.rowNode;
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        const result = [];
        // putting value into a wrapper so it's passed by reference
        const nextRowTop = { value: 0 };
        const skipLeafNodes = this.columnModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        const showRootNode = skipLeafNodes && rootNode.leafGroup;
        const topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        this.recursivelyAddToRowsToDisplay(topList, result, nextRowTop, skipLeafNodes, 0);
        // we do not want the footer total if the gris is empty
        const atLeastOneRowPresent = result.length > 0;
        const includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && this.gridOptionsService.is('groupIncludeTotalFooter');
        if (includeGroupTotalFooter) {
            rootNode.createFooter();
            this.addRowNodeToRowsToDisplay(rootNode.sibling, result, nextRowTop, 0);
        }
        return result;
    }
    recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop, skipLeafNodes, uiLevel) {
        if (_.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        const hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        // these two are mutually exclusive, so if first set, we don't set the second
        const groupRemoveSingleChildren = this.gridOptionsService.is('groupRemoveSingleChildren');
        const groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsService.is('groupRemoveLowestSingleChildren');
        for (let i = 0; i < rowsToFlatten.length; i++) {
            const rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            const isParent = rowNode.hasChildren();
            const isSkippedLeafNode = skipLeafNodes && !isParent;
            const isRemovedSingleChildrenGroup = groupRemoveSingleChildren &&
                isParent &&
                rowNode.childrenAfterGroup.length === 1;
            const isRemovedLowestSingleChildrenGroup = groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all row groups')
            const neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            const isHiddenOpenParent = hideOpenParents && rowNode.expanded && !rowNode.master && (!neverAllowToExpand);
            const thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel);
            }
            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) {
                continue;
            }
            if (isParent) {
                const excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {
                    // if the parent was excluded, then ui level is that of the parent
                    const uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    if (this.gridOptionsService.is('groupIncludeFooter')) {
                        this.addRowNodeToRowsToDisplay(rowNode.sibling, result, nextRowTop, uiLevelForChildren);
                    }
                }
            }
            else if (rowNode.master && rowNode.expanded) {
                const detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(detailNode, result, nextRowTop, uiLevel);
            }
        }
    }
    // duplicated method, it's also in floatingRowModel
    addRowNodeToRowsToDisplay(rowNode, result, nextRowTop, uiLevel) {
        const isGroupMultiAutoColumn = this.gridOptionsService.isGroupMultiAutoColumn();
        result.push(rowNode);
        rowNode.setUiLevel(isGroupMultiAutoColumn ? 0 : uiLevel);
    }
    createDetailNode(masterNode) {
        if (_.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        const detailNode = new RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (_.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        masterNode.detailNode = detailNode;
        return detailNode;
    }
};
__decorate$3([
    Autowired('columnModel')
], FlattenStage.prototype, "columnModel", void 0);
__decorate$3([
    Autowired('beans')
], FlattenStage.prototype, "beans", void 0);
FlattenStage = __decorate$3([
    Bean('flattenStage')
], FlattenStage);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SortService = class SortService extends BeanStub {
    init() {
        this.postSortFunc = this.gridOptionsService.getCallback('postSortRows');
    }
    sort(sortOptions, sortActive, useDeltaSort, rowNodeTransactions, changedPath, sortContainsGroupColumns) {
        const groupMaintainOrder = this.gridOptionsService.is('groupMaintainOrder');
        const groupColumnsPresent = this.columnModel.getAllGridColumns().some(c => c.isRowGroupActive());
        let allDirtyNodes = {};
        if (useDeltaSort && rowNodeTransactions) {
            allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
        }
        const isPivotMode = this.columnModel.isPivotMode();
        const callback = (rowNode) => {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
            // It's pointless to sort rows which aren't being displayed. in pivot mode we don't need to sort the leaf group children.
            const skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            let skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
            if (skipSortingGroups) {
                const childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
                if (rowNode.childrenAfterSort) {
                    const indexedOrders = {};
                    rowNode.childrenAfterSort.forEach((node, idx) => {
                        indexedOrders[node.id] = idx;
                    });
                    childrenToBeSorted.sort((row1, row2) => { var _a, _b; return ((_a = indexedOrders[row1.id]) !== null && _a !== void 0 ? _a : 0) - ((_b = indexedOrders[row2.id]) !== null && _b !== void 0 ? _b : 0); });
                }
                rowNode.childrenAfterSort = childrenToBeSorted;
            }
            else if (!sortActive || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
                rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter.slice(0);
            }
            else if (useDeltaSort) {
                rowNode.childrenAfterSort = this.doDeltaSort(rowNode, allDirtyNodes, changedPath, sortOptions);
            }
            else {
                rowNode.childrenAfterSort = this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
            }
            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
            }
            this.updateChildIndexes(rowNode);
            if (this.postSortFunc) {
                const params = { nodes: rowNode.childrenAfterSort };
                this.postSortFunc(params);
            }
        };
        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }
        this.updateGroupDataForHideOpenParents(changedPath);
    }
    calculateDirtyNodes(rowNodeTransactions) {
        const dirtyNodes = {};
        const addNodesFunc = (rowNodes) => {
            if (rowNodes) {
                rowNodes.forEach(rowNode => dirtyNodes[rowNode.id] = true);
            }
        };
        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(tran => {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }
        return dirtyNodes;
    }
    doDeltaSort(rowNode, allTouchedNodes, changedPath, sortOptions) {
        const unsortedRows = rowNode.childrenAfterAggFilter;
        const oldSortedRows = rowNode.childrenAfterSort;
        if (!oldSortedRows) {
            return this.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
        }
        const untouchedRowsMap = {};
        const touchedRows = [];
        unsortedRows.forEach(row => {
            if (allTouchedNodes[row.id] || !changedPath.canSkip(row)) {
                touchedRows.push(row);
            }
            else {
                untouchedRowsMap[row.id] = true;
            }
        });
        const sortedUntouchedRows = oldSortedRows.filter(child => untouchedRowsMap[child.id]);
        const mapNodeToSortedNode = (rowNode, pos) => ({ currentPos: pos, rowNode: rowNode });
        const sortedChangedRows = touchedRows
            .map(mapNodeToSortedNode)
            .sort((a, b) => this.rowNodeSorter.compareRowNodes(sortOptions, a, b));
        return this.mergeSortedArrays(sortOptions, sortedChangedRows, sortedUntouchedRows.map(mapNodeToSortedNode)).map(({ rowNode }) => rowNode);
    }
    // Merge two sorted arrays into each other
    mergeSortedArrays(sortOptions, arr1, arr2) {
        const res = [];
        let i = 0;
        let j = 0;
        // Traverse both array, adding them in order
        while (i < arr1.length && j < arr2.length) {
            // Check if current element of first
            // array is smaller than current element
            // of second array. If yes, store first
            // array element and increment first array
            // index. Otherwise do same with second array
            const compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
            if (compareResult < 0) {
                res.push(arr1[i++]);
            }
            else {
                res.push(arr2[j++]);
            }
        }
        // add remaining from arr1
        while (i < arr1.length) {
            res.push(arr1[i++]);
        }
        // add remaining from arr2
        while (j < arr2.length) {
            res.push(arr2[j++]);
        }
        return res;
    }
    updateChildIndexes(rowNode) {
        if (_.missing(rowNode.childrenAfterSort)) {
            return;
        }
        const listToSort = rowNode.childrenAfterSort;
        for (let i = 0; i < listToSort.length; i++) {
            const child = listToSort[i];
            const firstChild = i === 0;
            const lastChild = i === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(i);
        }
    }
    updateGroupDataForHideOpenParents(changedPath) {
        if (!this.gridOptionsService.is('groupHideOpenParents')) {
            return;
        }
        if (this.gridOptionsService.isTreeData()) {
            const msg = `AG Grid: The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them (as opposed to Row Grouping, which only has Aggregated Values at the group level).`;
            _.doOnce(() => console.warn(msg), 'sortService.hideOpenParentsWithTreeData');
            return false;
        }
        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        const callback = (rowNode) => {
            this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort.forEach(child => {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };
        if (changedPath) {
            changedPath.executeFromRootNode(rowNode => callback(rowNode));
        }
    }
    pullDownGroupDataForHideOpenParents(rowNodes, clearOperation) {
        if (!this.gridOptionsService.is('groupHideOpenParents') || _.missing(rowNodes)) {
            return;
        }
        rowNodes.forEach(childRowNode => {
            const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
            groupDisplayCols.forEach(groupDisplayCol => {
                const showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                const displayingGroupKey = showRowGroup;
                const rowGroupColumn = this.columnModel.getPrimaryColumn(displayingGroupKey);
                const thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) {
                    return;
                }
                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), undefined);
                }
                else {
                    // if doing a set operation, we set only where the pull down is to occur
                    const parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
    }
};
__decorate$2([
    Autowired('columnModel')
], SortService.prototype, "columnModel", void 0);
__decorate$2([
    Autowired('rowNodeSorter')
], SortService.prototype, "rowNodeSorter", void 0);
__decorate$2([
    PostConstruct
], SortService.prototype, "init", null);
SortService = __decorate$2([
    Bean('sortService')
], SortService);

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let FilterService = class FilterService extends BeanStub {
    filter(changedPath) {
        const filterActive = this.filterManager.isColumnFilterPresent()
            || this.filterManager.isQuickFilterPresent()
            || this.filterManager.isExternalFilterPresent();
        this.filterNodes(filterActive, changedPath);
    }
    filterNodes(filterActive, changedPath) {
        const filterCallback = (rowNode, includeChildNodes) => {
            // recursively get all children that are groups to also filter
            if (rowNode.hasChildren()) {
                // result of filter for this node. when filtering tree data, includeChildNodes = true when parent passes
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(childNode => {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        const passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        const passBecauseDataPasses = childNode.data
                            && this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        // note - tree data nodes pass either if a) they pass themselves or b) any children of that node pass
                        return passBecauseChildren || passBecauseDataPasses;
                    });
                }
                else {
                    // if not filtering, the result is the original list
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
                }
            }
            else {
                rowNode.childrenAfterFilter = rowNode.childrenAfterGroup;
            }
            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterFilter = rowNode.childrenAfterFilter;
            }
        };
        if (this.doingTreeDataFiltering()) {
            const treeDataDepthFirstFilter = (rowNode, alreadyFoundInParent) => {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.
                if (rowNode.childrenAfterGroup) {
                    for (let i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        const childNode = rowNode.childrenAfterGroup[i];
                        // first check if current node passes filter before invoking child nodes
                        const foundInParent = alreadyFoundInParent
                            || this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter(rowNode.childrenAfterGroup[i], foundInParent);
                        }
                        else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };
            const treeDataFilterCallback = (rowNode) => treeDataDepthFirstFilter(rowNode, false);
            changedPath.executeFromRootNode(treeDataFilterCallback);
        }
        else {
            const defaultFilterCallback = (rowNode) => filterCallback(rowNode, false);
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    }
    doingTreeDataFiltering() {
        return this.gridOptionsService.isTreeData() && !this.gridOptionsService.is('excludeChildrenWhenTreeDataFiltering');
    }
};
__decorate$1([
    Autowired('filterManager')
], FilterService.prototype, "filterManager", void 0);
FilterService = __decorate$1([
    Bean("filterService")
], FilterService);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let ImmutableService = class ImmutableService extends BeanStub {
    postConstruct() {
        if (this.rowModel.getType() === 'clientSide') {
            this.clientSideRowModel = this.rowModel;
        }
    }
    isActive() {
        const getRowIdProvided = this.gridOptionsService.exists('getRowId');
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row ID's but NOT Immutable Data.
        const resetRowDataOnUpdate = this.gridOptionsService.is('resetRowDataOnUpdate');
        if (resetRowDataOnUpdate) {
            return false;
        }
        return getRowIdProvided;
    }
    setRowData(rowData) {
        const transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) {
            return;
        }
        const [transaction, orderIdMap] = transactionAndMap;
        this.clientSideRowModel.updateRowData(transaction, orderIdMap);
    }
    // converts the setRowData() command to a transaction
    createTransactionForRowData(rowData) {
        if (_.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        const getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        if (getRowIdFunc == null) {
            console.error('AG Grid: ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return;
        }
        // convert the data into a transaction object by working out adds, removes and updates
        const transaction = {
            remove: [],
            update: [],
            add: []
        };
        const existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
        const suppressSortOrder = this.gridOptionsService.is('suppressMaintainUnsortedOrder');
        const orderMap = suppressSortOrder ? undefined : {};
        if (_.exists(rowData)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            rowData.forEach((data, index) => {
                const id = getRowIdFunc({ data, level: 0 });
                const existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    const dataHasChanged = existingNode.data !== data;
                    if (dataHasChanged) {
                        transaction.update.push(data);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta
                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                }
                else {
                    transaction.add.push(data);
                }
            });
        }
        // at this point, all rows that are left, should be removed
        _.iterateObject(existingNodesMap, (id, rowNode) => {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    }
};
__decorate([
    Autowired('rowModel')
], ImmutableService.prototype, "rowModel", void 0);
__decorate([
    Autowired('rowRenderer')
], ImmutableService.prototype, "rowRenderer", void 0);
__decorate([
    PostConstruct
], ImmutableService.prototype, "postConstruct", null);
ImmutableService = __decorate([
    Bean('immutableService')
], ImmutableService);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const ClientSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
};

export { ClientSideRowModelModule };
