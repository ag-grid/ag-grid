/**
          * @ag-grid-community/client-side-row-model - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v31.0.0
          * @link https://www.ag-grid.com/
          * @license MIT
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');

var __read$2 = (undefined && undefined.__read) || function (o, n) {
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
var __spreadArray$1 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ClientSideNodeManager = /** @class */ (function () {
    function ClientSideNodeManager(rootNode, gridOptionsService, eventService, columnModel, selectionService, beans) {
        this.nextId = 0;
        // when user is provide the id's, we also keep a map of ids to row nodes for convenience
        this.allNodesMap = {};
        this.dataLoaded = false;
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
    }
    ClientSideNodeManager.prototype.getCopyOfNodesMap = function () {
        return core._.cloneObject(this.allNodesMap);
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
        this.dataLoaded = true;
        this.dispatchRowDataUpdateStartedEvent(rowData);
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
        this.dataLoaded = true;
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);
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
            core._.sortRowNodesByOrder(this.rootNode.allLeafChildren, rowNodeOrder);
        }
        return rowNodeTransaction;
    };
    ClientSideNodeManager.prototype.hasData = function () {
        return this.dataLoaded;
    };
    ClientSideNodeManager.prototype.dispatchRowDataUpdateStartedEvent = function (rowData) {
        var event = {
            type: core.Events.EVENT_ROW_DATA_UPDATE_STARTED,
            firstRowData: (rowData === null || rowData === void 0 ? void 0 : rowData.length) ? rowData[0] : null
        };
        this.eventService.dispatchEvent(event);
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
                type: core.Events.EVENT_SELECTION_CHANGED,
                source: source
            };
            this.eventService.dispatchEvent(event_1);
        }
    };
    ClientSideNodeManager.prototype.executeAdd = function (rowDataTran, rowNodeTransaction) {
        var _this = this;
        var _a;
        var add = rowDataTran.add, addIndex = rowDataTran.addIndex;
        if (core._.missingOrEmpty(add)) {
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
            var isTreeData = this.gridOptionsService.get('treeData');
            if (isTreeData && addIndex > 0 && len > 0) {
                for (var i = 0; i < len; i++) {
                    if (((_a = allLeafChildren[i]) === null || _a === void 0 ? void 0 : _a.rowIndex) == addIndex - 1) {
                        normalisedAddIndex = i + 1;
                        break;
                    }
                }
            }
            var nodesBeforeIndex = allLeafChildren.slice(0, normalisedAddIndex);
            var nodesAfterIndex = allLeafChildren.slice(normalisedAddIndex, allLeafChildren.length);
            this.rootNode.allLeafChildren = __spreadArray$1(__spreadArray$1(__spreadArray$1([], __read$2(nodesBeforeIndex), false), __read$2(newNodes), false), __read$2(nodesAfterIndex), false);
        }
        else {
            this.rootNode.allLeafChildren = __spreadArray$1(__spreadArray$1([], __read$2(this.rootNode.allLeafChildren), false), __read$2(newNodes), false);
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
        if (core._.missingOrEmpty(remove)) {
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
        if (core._.missingOrEmpty(update)) {
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
                console.error("AG Grid: could not find row id=".concat(id, ", data item was not found for this id"));
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
        var node = new core.RowNode(this.beans);
        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);
        var suppressParentsInRowNodes = this.gridOptionsService.get('suppressParentsInRowNodes');
        if (parent && !suppressParentsInRowNodes) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());
        if (this.allNodesMap[node.id]) {
            console.warn("AG Grid: duplicate node id '".concat(node.id, "' detected from getRowId callback, this could cause issues in your grid."));
        }
        this.allNodesMap[node.id] = node;
        this.nextId++;
        return node;
    };
    ClientSideNodeManager.prototype.setMasterForRow = function (rowNode, data, level, setExpanded) {
        var isTreeData = this.gridOptionsService.get('treeData');
        if (isTreeData) {
            rowNode.setMaster(false);
            if (setExpanded) {
                rowNode.expanded = false;
            }
        }
        else {
            var masterDetail = this.gridOptionsService.get('masterDetail');
            // this is the default, for when doing grid data
            if (masterDetail) {
                // if we are doing master detail, then the
                // default is that everything can be a Master Row.
                var isRowMasterFunc = this.gridOptionsService.get('isRowMaster');
                if (isRowMasterFunc) {
                    rowNode.setMaster(isRowMasterFunc(data));
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
        var expandByDefault = this.gridOptionsService.get('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    };
    ClientSideNodeManager.TOP_LEVEL = 0;
    ClientSideNodeManager.ROOT_NODE_ID = 'ROOT_NODE_ID';
    return ClientSideNodeManager;
}());

var __extends$6 = (undefined && undefined.__extends) || (function () {
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
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$1 = (undefined && undefined.__read) || function (o, n) {
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
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var RecursionType;
(function (RecursionType) {
    RecursionType[RecursionType["Normal"] = 0] = "Normal";
    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
    RecursionType[RecursionType["PivotNodes"] = 3] = "PivotNodes";
})(RecursionType || (RecursionType = {}));
var ClientSideRowModel = /** @class */ (function (_super) {
    __extends$6(ClientSideRowModel, _super);
    function ClientSideRowModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRowHeightChanged_debounced = core._.debounce(_this.onRowHeightChanged.bind(_this), 100);
        _this.rowsToDisplay = []; // the rows mapped to rows to display
        /** Has the start method been called */
        _this.hasStarted = false;
        /** E.g. data has been set into the node manager already */
        _this.shouldSkipSettingDataOnStart = false;
        return _this;
    }
    ClientSideRowModel.prototype.init = function () {
        var _this = this;
        var refreshEverythingFunc = this.refreshModel.bind(this, { step: core.ClientSideRowModelSteps.EVERYTHING });
        var animate = !this.gridOptionsService.get('suppressAnimationFrame');
        var refreshEverythingAfterColsChangedFunc = this.refreshModel.bind(this, {
            step: core.ClientSideRowModelSteps.EVERYTHING,
            afterColumnsChanged: true,
            keepRenderedRows: true,
            animate: animate
        });
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, refreshEverythingAfterColsChangedFunc);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_VALUE_CHANGED, this.onValueChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_CHANGED, this.refreshModel.bind(this, { step: core.ClientSideRowModelSteps.PIVOT }));
        this.addManagedListener(this.eventService, core.Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, refreshEverythingFunc);
        this.addManagedListener(this.eventService, core.Events.EVENT_GRID_STYLES_CHANGED, this.onGridStylesChanges.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_GRID_READY, function () { return _this.onGridReady(); });
        // doesn't need done if doing full reset
        // Property listeners which call `refreshModel` at different stages
        this.addPropertyListeners();
        this.rootNode = new core.RowNode(this.beans);
        this.nodeManager = new ClientSideNodeManager(this.rootNode, this.gridOptionsService, this.eventService, this.columnModel, this.selectionService, this.beans);
    };
    ClientSideRowModel.prototype.addPropertyListeners = function () {
        // Omitted Properties
        //
        // We do not act reactively on all functional properties, as it's possible the application is React and
        // has not memoised the property and it's getting set every render.
        //
        // ** LIST OF NON REACTIVE, NO ARGUMENT
        //
        // getDataPath, getRowId, isRowMaster -- these are called once for each Node when the Node is created.
        //                                    -- these are immutable Node properties (ie a Node ID cannot be changed)
        // 
        // getRowHeight - this is called once when Node is created, if a new getRowHeight function is provided,
        //              - we do not revisit the heights of each node.
        //
        // pivotDefaultExpanded - relevant for initial pivot column creation, no impact on existing pivot columns. 
        //
        // deltaSort - this changes the type of algorithm used only, it doesn't change the sort order. so no point
        //           - in doing the sort again as the same result will be got. the new Prop will be used next time we sort.
        // 
        // ** LIST OF NON REACTIVE, SOME ARGUMENT
        // ** For these, they could be reactive, but not convinced the business argument is strong enough,
        // ** so leaving as non-reactive for now, and see if anyone complains.
        //
        // processPivotResultColDef, processPivotResultColGroupDef
        //                       - there is an argument for having these reactive, that if the application changes
        //                       - these props, we should re-create the Pivot Columns, however it's highly unlikely
        //                       - the application would change these functions, far more likely the functions were
        //                       - non memoised correctly.
        var _this = this;
        var resetProps = new Set([
            'treeData', 'masterDetail',
        ]);
        var groupStageRefreshProps = new Set([
            'suppressParentsInRowNodes', 'groupDefaultExpanded',
            'groupAllowUnbalanced', 'initialGroupOrderComparator',
            'groupHideOpenParents', 'groupDisplayType',
        ]);
        var filterStageRefreshProps = new Set([
            'excludeChildrenWhenTreeDataFiltering',
        ]);
        var pivotStageRefreshProps = new Set([
            'removePivotHeaderRowWhenSingleValueColumn', 'pivotRowTotals', 'pivotColumnGroupTotals', 'suppressExpandablePivotGroups',
        ]);
        var aggregateStageRefreshProps = new Set([
            'getGroupRowAgg', 'alwaysAggregateAtRootLevel', 'groupIncludeTotalFooter', 'suppressAggFilteredOnly',
        ]);
        var sortStageRefreshProps = new Set([
            'postSortRows', 'groupDisplayType', 'accentedSort',
        ]);
        var filterAggStageRefreshProps = new Set([]);
        var flattenStageRefreshProps = new Set([
            'groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren', 'groupIncludeFooter',
        ]);
        var allProps = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read$1(resetProps), false), __read$1(groupStageRefreshProps), false), __read$1(filterStageRefreshProps), false), __read$1(pivotStageRefreshProps), false), __read$1(pivotStageRefreshProps), false), __read$1(aggregateStageRefreshProps), false), __read$1(sortStageRefreshProps), false), __read$1(filterAggStageRefreshProps), false), __read$1(flattenStageRefreshProps), false);
        this.addManagedPropertyListeners(allProps, function (params) {
            var _a;
            var properties = (_a = params.changeSet) === null || _a === void 0 ? void 0 : _a.properties;
            if (!properties) {
                return;
            }
            var arePropertiesImpacted = function (propSet) { return (properties.some(function (prop) { return propSet.has(prop); })); };
            if (arePropertiesImpacted(resetProps)) {
                _this.setRowData(_this.rootNode.allLeafChildren.map(function (child) { return child.data; }));
                return;
            }
            if (arePropertiesImpacted(groupStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.EVERYTHING });
                return;
            }
            if (arePropertiesImpacted(filterStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.FILTER });
                return;
            }
            if (arePropertiesImpacted(pivotStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.PIVOT });
                return;
            }
            if (arePropertiesImpacted(aggregateStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.AGGREGATE });
                return;
            }
            if (arePropertiesImpacted(sortStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.SORT });
                return;
            }
            if (arePropertiesImpacted(filterAggStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.FILTER_AGGREGATES });
                return;
            }
            if (arePropertiesImpacted(flattenStageRefreshProps)) {
                _this.refreshModel({ step: core.ClientSideRowModelSteps.MAP });
            }
        });
        this.addManagedPropertyListener('rowHeight', function () { return _this.resetRowHeights(); });
    };
    ClientSideRowModel.prototype.start = function () {
        this.hasStarted = true;
        if (this.shouldSkipSettingDataOnStart) {
            this.dispatchUpdateEventsAndRefresh();
        }
        else {
            this.setInitialData();
        }
    };
    ClientSideRowModel.prototype.setInitialData = function () {
        var rowData = this.gridOptionsService.get('rowData');
        if (rowData) {
            this.shouldSkipSettingDataOnStart = true;
            this.setRowData(rowData);
        }
    };
    ClientSideRowModel.prototype.ensureRowHeightsValid = function (startPixel, endPixel, startLimitIndex, endLimitIndex) {
        var atLeastOneChange;
        var res = false;
        // we do this multiple times as changing the row heights can also change the first and last rows,
        // so the first pass can make lots of rows smaller, which means the second pass we end up changing
        // more rows.
        do {
            atLeastOneChange = false;
            var rowAtStartPixel = this.getRowIndexAtPixel(startPixel);
            var rowAtEndPixel = this.getRowIndexAtPixel(endPixel);
            // keep check to current page if doing pagination
            var firstRow = Math.max(rowAtStartPixel, startLimitIndex);
            var lastRow = Math.min(rowAtEndPixel, endLimitIndex);
            for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                var rowNode = this.getRow(rowIndex);
                if (rowNode.rowHeightEstimated) {
                    var rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode);
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
    };
    ClientSideRowModel.prototype.setRowTopAndRowIndex = function () {
        var defaultRowHeight = this.environment.getDefaultRowHeight();
        var nextRowTop = 0;
        // mapping displayed rows is not needed for this method, however it's used in
        // clearRowTopAndRowIndex(), and given we are looping through this.rowsToDisplay here,
        // we create the map here for performance reasons, so we don't loop a second time
        // in clearRowTopAndRowIndex()
        var displayedRowsMapped = new Set();
        // we don't estimate if doing fullHeight or autoHeight, as all rows get rendered all the time
        // with these two layouts.
        var allowEstimate = this.gridOptionsService.isDomLayout('normal');
        for (var i = 0; i < this.rowsToDisplay.length; i++) {
            var rowNode = this.rowsToDisplay[i];
            if (rowNode.id != null) {
                displayedRowsMapped.add(rowNode.id);
            }
            if (rowNode.rowHeight == null) {
                var rowHeight = this.gridOptionsService.getRowHeightForNode(rowNode, allowEstimate, defaultRowHeight);
                rowNode.setRowHeight(rowHeight.height, rowHeight.estimated);
            }
            rowNode.setRowTop(nextRowTop);
            rowNode.setRowIndex(i);
            nextRowTop += rowNode.rowHeight;
        }
        return displayedRowsMapped;
    };
    ClientSideRowModel.prototype.clearRowTopAndRowIndex = function (changedPath, displayedRowsMapped) {
        var changedPathActive = changedPath.isActive();
        var clearIfNotDisplayed = function (rowNode) {
            if (rowNode && rowNode.id != null && !displayedRowsMapped.has(rowNode.id)) {
                rowNode.clearRowTopAndRowIndex();
            }
        };
        var recurse = function (rowNode) {
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
                    var isRootNode = rowNode.level == -1; // we need to give special consideration for root node,
                    // as expanded=undefined for root node
                    var skipChildren = changedPathActive && !isRootNode && !rowNode.expanded;
                    if (!skipChildren) {
                        rowNode.childrenAfterGroup.forEach(recurse);
                    }
                }
            }
        };
        recurse(this.rootNode);
    };
    // returns false if row was moved, otherwise true
    ClientSideRowModel.prototype.ensureRowsAtPixel = function (rowNodes, pixel, increment) {
        var _this = this;
        if (increment === void 0) { increment = 0; }
        var indexAtPixelNow = this.getRowIndexAtPixel(pixel);
        var rowNodeAtPixelNow = this.getRow(indexAtPixelNow);
        var animate = !this.gridOptionsService.get('suppressAnimationFrame');
        if (rowNodeAtPixelNow === rowNodes[0]) {
            return false;
        }
        rowNodes.forEach(function (rowNode) {
            core._.removeFromArray(_this.rootNode.allLeafChildren, rowNode);
        });
        rowNodes.forEach(function (rowNode, idx) {
            core._.insertIntoArray(_this.rootNode.allLeafChildren, rowNode, Math.max(indexAtPixelNow + increment, 0) + idx);
        });
        this.refreshModel({
            step: core.ClientSideRowModelSteps.EVERYTHING,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate: animate
        });
        return true;
    };
    ClientSideRowModel.prototype.highlightRowAtPixel = function (rowNode, pixel) {
        var indexAtPixelNow = pixel != null ? this.getRowIndexAtPixel(pixel) : null;
        var rowNodeAtPixelNow = indexAtPixelNow != null ? this.getRow(indexAtPixelNow) : null;
        if (!rowNodeAtPixelNow || !rowNode || rowNodeAtPixelNow === rowNode || pixel == null) {
            if (this.lastHighlightedRow) {
                this.lastHighlightedRow.setHighlighted(null);
                this.lastHighlightedRow = null;
            }
            return;
        }
        var highlight = this.getHighlightPosition(pixel, rowNodeAtPixelNow);
        if (this.lastHighlightedRow && this.lastHighlightedRow !== rowNodeAtPixelNow) {
            this.lastHighlightedRow.setHighlighted(null);
            this.lastHighlightedRow = null;
        }
        rowNodeAtPixelNow.setHighlighted(highlight);
        this.lastHighlightedRow = rowNodeAtPixelNow;
    };
    ClientSideRowModel.prototype.getHighlightPosition = function (pixel, rowNode) {
        if (!rowNode) {
            var index = this.getRowIndexAtPixel(pixel);
            rowNode = this.getRow(index || 0);
            if (!rowNode) {
                return core.RowHighlightPosition.Below;
            }
        }
        var rowTop = rowNode.rowTop, rowHeight = rowNode.rowHeight;
        return pixel - rowTop < rowHeight / 2 ? core.RowHighlightPosition.Above : core.RowHighlightPosition.Below;
    };
    ClientSideRowModel.prototype.getLastHighlightedRowNode = function () {
        return this.lastHighlightedRow;
    };
    ClientSideRowModel.prototype.isLastRowIndexKnown = function () {
        return true;
    };
    ClientSideRowModel.prototype.getRowCount = function () {
        if (this.rowsToDisplay) {
            return this.rowsToDisplay.length;
        }
        return 0;
    };
    ClientSideRowModel.prototype.getTopLevelRowCount = function () {
        var showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return 1;
        }
        var filteredChildren = this.rootNode.childrenAfterAggFilter;
        return filteredChildren ? filteredChildren.length : 0;
    };
    ClientSideRowModel.prototype.getTopLevelRowDisplayedIndex = function (topLevelIndex) {
        var showingRootNode = this.rowsToDisplay && this.rowsToDisplay[0] === this.rootNode;
        if (showingRootNode) {
            return topLevelIndex;
        }
        var rowNode = this.rootNode.childrenAfterSort[topLevelIndex];
        if (this.gridOptionsService.get('groupHideOpenParents')) {
            // if hideOpenParents, and this row open, then this row is now displayed at this index, first child is
            while (rowNode.expanded && rowNode.childrenAfterSort && rowNode.childrenAfterSort.length > 0) {
                rowNode = rowNode.childrenAfterSort[0];
            }
        }
        return rowNode.rowIndex;
    };
    ClientSideRowModel.prototype.getRowBounds = function (index) {
        if (core._.missing(this.rowsToDisplay)) {
            return null;
        }
        var rowNode = this.rowsToDisplay[index];
        if (rowNode) {
            return {
                rowTop: rowNode.rowTop,
                rowHeight: rowNode.rowHeight
            };
        }
        return null;
    };
    ClientSideRowModel.prototype.onRowGroupOpened = function () {
        var animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: core.ClientSideRowModelSteps.MAP, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onFilterChanged = function (event) {
        if (event.afterDataChange) {
            return;
        }
        var animate = this.gridOptionsService.isAnimateRows();
        var primaryOrQuickFilterChanged = event.columns.length === 0 || event.columns.some(function (col) { return col.isPrimary(); });
        var step = primaryOrQuickFilterChanged ? core.ClientSideRowModelSteps.FILTER : core.ClientSideRowModelSteps.FILTER_AGGREGATES;
        this.refreshModel({ step: step, keepRenderedRows: true, animate: animate });
    };
    ClientSideRowModel.prototype.onSortChanged = function () {
        var animate = this.gridOptionsService.isAnimateRows();
        this.refreshModel({ step: core.ClientSideRowModelSteps.SORT, keepRenderedRows: true, animate: animate, keepEditingRows: true });
    };
    ClientSideRowModel.prototype.getType = function () {
        return 'clientSide';
    };
    ClientSideRowModel.prototype.onValueChanged = function () {
        if (this.columnModel.isPivotActive()) {
            this.refreshModel({ step: core.ClientSideRowModelSteps.PIVOT });
        }
        else {
            this.refreshModel({ step: core.ClientSideRowModelSteps.AGGREGATE });
        }
    };
    ClientSideRowModel.prototype.createChangePath = function (rowNodeTransactions) {
        // for updates, if the row is updated at all, then we re-calc all the values
        // in that row. we could compare each value to each old value, however if we
        // did this, we would be calling the valueService twice, once on the old value
        // and once on the new value. so it's less valueGetter calls if we just assume
        // each column is different. that way the changedPath is used so that only
        // the impacted parent rows are recalculated, parents who's children have
        // not changed are not impacted.
        var noTransactions = core._.missingOrEmpty(rowNodeTransactions);
        var changedPath = new core.ChangedPath(false, this.rootNode);
        if (noTransactions || this.gridOptionsService.get('treeData')) {
            changedPath.setInactive();
        }
        return changedPath;
    };
    ClientSideRowModel.prototype.isSuppressModelUpdateAfterUpdateTransaction = function (params) {
        if (!this.gridOptionsService.get('suppressModelUpdateAfterUpdateTransaction')) {
            return false;
        }
        // return true if we are only doing update transactions
        if (params.rowNodeTransactions == null) {
            return false;
        }
        var transWithAddsOrDeletes = params.rowNodeTransactions.filter(function (tx) {
            return (tx.add != null && tx.add.length > 0) || (tx.remove != null && tx.remove.length > 0);
        });
        var transactionsContainUpdatesOnly = transWithAddsOrDeletes == null || transWithAddsOrDeletes.length == 0;
        return transactionsContainUpdatesOnly;
    };
    ClientSideRowModel.prototype.buildRefreshModelParams = function (step) {
        var paramsStep = core.ClientSideRowModelSteps.EVERYTHING;
        var stepsMapped = {
            everything: core.ClientSideRowModelSteps.EVERYTHING,
            group: core.ClientSideRowModelSteps.EVERYTHING,
            filter: core.ClientSideRowModelSteps.FILTER,
            map: core.ClientSideRowModelSteps.MAP,
            aggregate: core.ClientSideRowModelSteps.AGGREGATE,
            sort: core.ClientSideRowModelSteps.SORT,
            pivot: core.ClientSideRowModelSteps.PIVOT
        };
        if (core._.exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (core._.missing(paramsStep)) {
            console.error("AG Grid: invalid step ".concat(step, ", available steps are ").concat(Object.keys(stepsMapped).join(', ')));
            return undefined;
        }
        var animate = !this.gridOptionsService.get('suppressAnimationFrame');
        var modelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate: animate
        };
        return modelParams;
    };
    ClientSideRowModel.prototype.refreshModel = function (paramsOrStep) {
        if (!this.hasStarted) {
            return;
        }
        var params = typeof paramsOrStep === 'object' && "step" in paramsOrStep ? paramsOrStep : this.buildRefreshModelParams(paramsOrStep);
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
        var changedPath = this.createChangePath(params.rowNodeTransactions);
        switch (params.step) {
            case core.ClientSideRowModelSteps.EVERYTHING:
                this.doRowGrouping(params.rowNodeTransactions, params.rowNodeOrder, changedPath, !!params.afterColumnsChanged);
            case core.ClientSideRowModelSteps.FILTER:
                this.doFilter(changedPath);
            case core.ClientSideRowModelSteps.PIVOT:
                this.doPivot(changedPath);
            case core.ClientSideRowModelSteps.AGGREGATE: // depends on agg fields
                this.doAggregate(changedPath);
            case core.ClientSideRowModelSteps.FILTER_AGGREGATES:
                this.doFilterAggregates(changedPath);
            case core.ClientSideRowModelSteps.SORT:
                this.doSort(params.rowNodeTransactions, changedPath);
            case core.ClientSideRowModelSteps.MAP:
                this.doRowsToDisplay();
        }
        // set all row tops to null, then set row tops on all visible rows. if we don't
        // do this, then the algorithm below only sets row tops, old row tops from old rows
        // will still lie around
        var displayedNodesMapped = this.setRowTopAndRowIndex();
        this.clearRowTopAndRowIndex(changedPath, displayedNodesMapped);
        var event = {
            type: core.Events.EVENT_MODEL_UPDATED,
            animate: params.animate,
            keepRenderedRows: params.keepRenderedRows,
            newData: params.newData,
            newPage: false,
            keepUndoRedoStack: params.keepUndoRedoStack
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideRowModel.prototype.isEmpty = function () {
        var rowsMissing = core._.missing(this.rootNode.allLeafChildren) || this.rootNode.allLeafChildren.length === 0;
        return core._.missing(this.rootNode) || rowsMissing || !this.columnModel.isReady();
    };
    ClientSideRowModel.prototype.isRowsToRender = function () {
        return core._.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
    };
    ClientSideRowModel.prototype.getNodesInRangeForSelection = function (firstInRange, lastInRange) {
        // if lastSelectedNode is missing, we start at the first row
        var started = !lastInRange;
        var finished = false;
        var result = [];
        var groupsSelectChildren = this.gridOptionsService.get('groupSelectsChildren');
        this.forEachNodeAfterFilterAndSort(function (rowNode) {
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
                        result.push.apply(result, __spreadArray([], __read$1(rowNode.allLeafChildren), false));
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
            var includeThisNode = !rowNode.group || !groupsSelectChildren;
            if (includeThisNode) {
                result.push(rowNode);
                return;
            }
        });
        return result;
    };
    ClientSideRowModel.prototype.setDatasource = function (datasource) {
        console.error('AG Grid: should never call setDatasource on clientSideRowController');
    };
    ClientSideRowModel.prototype.getTopLevelNodes = function () {
        return this.rootNode ? this.rootNode.childrenAfterGroup : null;
    };
    ClientSideRowModel.prototype.getRootNode = function () {
        return this.rootNode;
    };
    ClientSideRowModel.prototype.getRow = function (index) {
        return this.rowsToDisplay[index];
    };
    ClientSideRowModel.prototype.isRowPresent = function (rowNode) {
        return this.rowsToDisplay.indexOf(rowNode) >= 0;
    };
    ClientSideRowModel.prototype.getRowIndexAtPixel = function (pixelToMatch) {
        if (this.isEmpty() || this.rowsToDisplay.length === 0) {
            return -1;
        }
        // do binary search of tree
        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
        var bottomPointer = 0;
        var topPointer = this.rowsToDisplay.length - 1;
        // quick check, if the pixel is out of bounds, then return last row
        if (pixelToMatch <= 0) {
            // if pixel is less than or equal zero, it's always the first row
            return 0;
        }
        var lastNode = core._.last(this.rowsToDisplay);
        if (lastNode.rowTop <= pixelToMatch) {
            return this.rowsToDisplay.length - 1;
        }
        var oldBottomPointer = -1;
        var oldTopPointer = -1;
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = this.rowsToDisplay[midPointer];
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
            var caughtInInfiniteLoop = oldBottomPointer === bottomPointer
                && oldTopPointer === topPointer;
            if (caughtInInfiniteLoop) {
                return midPointer;
            }
            oldBottomPointer = bottomPointer;
            oldTopPointer = topPointer;
        }
    };
    ClientSideRowModel.prototype.isRowInPixel = function (rowNode, pixelToMatch) {
        var topPixel = rowNode.rowTop;
        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
        return pixelInRow;
    };
    ClientSideRowModel.prototype.forEachLeafNode = function (callback) {
        if (this.rootNode.allLeafChildren) {
            this.rootNode.allLeafChildren.forEach(function (rowNode, index) { return callback(rowNode, index); });
        }
    };
    ClientSideRowModel.prototype.forEachNode = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spreadArray([], __read$1((this.rootNode.childrenAfterGroup || [])), false),
            callback: callback,
            recursionType: RecursionType.Normal,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilter = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spreadArray([], __read$1((this.rootNode.childrenAfterAggFilter || [])), false),
            callback: callback,
            recursionType: RecursionType.AfterFilter,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachNodeAfterFilterAndSort = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: __spreadArray([], __read$1((this.rootNode.childrenAfterSort || [])), false),
            callback: callback,
            recursionType: RecursionType.AfterFilterAndSort,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    ClientSideRowModel.prototype.forEachPivotNode = function (callback, includeFooterNodes) {
        if (includeFooterNodes === void 0) { includeFooterNodes = false; }
        this.recursivelyWalkNodesAndCallback({
            nodes: [this.rootNode],
            callback: callback,
            recursionType: RecursionType.PivotNodes,
            index: 0,
            includeFooterNodes: includeFooterNodes
        });
    };
    // iterates through each item in memory, and calls the callback function
    // nodes - the rowNodes to traverse
    // callback - the user provided callback
    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
    // index - works similar to the index in forEach in javascript's array function
    ClientSideRowModel.prototype.recursivelyWalkNodesAndCallback = function (params) {
        var _a;
        var nodes = params.nodes, callback = params.callback, recursionType = params.recursionType, includeFooterNodes = params.includeFooterNodes;
        var index = params.index;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            callback(node, index++);
            // go to the next level if it is a group
            if (node.hasChildren() && !node.footer) {
                // depending on the recursion type, we pick a difference set of children
                var nodeChildren = null;
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
                        nodes: __spreadArray([], __read$1(nodeChildren), false),
                        callback: callback,
                        recursionType: recursionType,
                        index: index,
                        includeFooterNodes: includeFooterNodes
                    });
                }
            }
        }
        var parentNode = (_a = nodes[0]) === null || _a === void 0 ? void 0 : _a.parent;
        if (!includeFooterNodes || !parentNode)
            return index;
        var isRootNode = parentNode === this.rootNode;
        if (isRootNode) {
            var totalFooters = this.gridOptionsService.get('groupIncludeTotalFooter');
            if (!totalFooters)
                return index;
        }
        else {
            var isGroupIncludeFooter = this.gridOptionsService.getGroupIncludeFooter();
            if (!isGroupIncludeFooter({ node: parentNode }))
                return index;
        }
        parentNode.createFooter();
        callback(parentNode.sibling, index++);
        return index;
    };
    // it's possible to recompute the aggregate without doing the other parts
    // + api.refreshClientSideRowModel('aggregate')
    ClientSideRowModel.prototype.doAggregate = function (changedPath) {
        if (this.aggregationStage) {
            this.aggregationStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    };
    ClientSideRowModel.prototype.doFilterAggregates = function (changedPath) {
        if (this.filterAggregatesStage) {
            this.filterAggregatesStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
        else {
            // If filterAggregatesStage is undefined, then so is the grouping stage, so all children should be on the rootNode.
            this.rootNode.childrenAfterAggFilter = this.rootNode.childrenAfterFilter;
        }
    };
    // + gridApi.expandAll()
    // + gridApi.collapseAll()
    ClientSideRowModel.prototype.expandOrCollapseAll = function (expand) {
        var usingTreeData = this.gridOptionsService.get('treeData');
        var usingPivotMode = this.columnModel.isPivotActive();
        var recursiveExpandOrCollapse = function (rowNodes) {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(function (rowNode) {
                var actionRow = function () {
                    rowNode.expanded = expand;
                    recursiveExpandOrCollapse(rowNode.childrenAfterGroup);
                };
                if (usingTreeData) {
                    var hasChildren = core._.exists(rowNode.childrenAfterGroup);
                    if (hasChildren) {
                        actionRow();
                    }
                    return;
                }
                if (usingPivotMode) {
                    var notLeafGroup = !rowNode.leafGroup;
                    if (notLeafGroup) {
                        actionRow();
                    }
                    return;
                }
                var isRowGroup = rowNode.group;
                if (isRowGroup) {
                    actionRow();
                }
            });
        };
        if (this.rootNode) {
            recursiveExpandOrCollapse(this.rootNode.childrenAfterGroup);
        }
        this.refreshModel({ step: core.ClientSideRowModelSteps.MAP });
        var eventSource = expand ? 'expandAll' : 'collapseAll';
        var event = {
            type: core.Events.EVENT_EXPAND_COLLAPSE_ALL,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    };
    ClientSideRowModel.prototype.doSort = function (rowNodeTransactions, changedPath) {
        this.sortStage.execute({
            rowNode: this.rootNode,
            rowNodeTransactions: rowNodeTransactions,
            changedPath: changedPath
        });
    };
    ClientSideRowModel.prototype.doRowGrouping = function (rowNodeTransactions, rowNodeOrder, changedPath, afterColumnsChanged) {
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
            }
            if (this.gridOptionsService.get('groupSelectsChildren')) {
                var selectionChanged = this.selectionService.updateGroupsFromChildrenSelections('rowGroupChanged', changedPath);
                if (selectionChanged) {
                    var event_1 = {
                        type: core.Events.EVENT_SELECTION_CHANGED,
                        source: 'rowGroupChanged'
                    };
                    this.eventService.dispatchEvent(event_1);
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
        this.eventService.dispatchEventOnce({
            type: core.Events.EVENT_ROW_COUNT_READY
        });
    };
    ClientSideRowModel.prototype.doFilter = function (changedPath) {
        this.filterStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
    };
    ClientSideRowModel.prototype.doPivot = function (changedPath) {
        if (this.pivotStage) {
            this.pivotStage.execute({ rowNode: this.rootNode, changedPath: changedPath });
        }
    };
    ClientSideRowModel.prototype.getCopyOfNodesMap = function () {
        return this.nodeManager.getCopyOfNodesMap();
    };
    ClientSideRowModel.prototype.getRowNode = function (id) {
        // although id is typed a string, this could be called by the user, and they could have passed a number
        var idIsGroup = typeof id == 'string' && id.indexOf(core.RowNode.ID_PREFIX_ROW_GROUP) == 0;
        if (idIsGroup) {
            // only one users complained about getRowNode not working for groups, after years of
            // this working for normal rows. so have done quick implementation. if users complain
            // about performance, then GroupStage should store / manage created groups in a map,
            // which is a chunk of work.
            var res_1 = undefined;
            this.forEachNode(function (node) {
                if (node.id === id) {
                    res_1 = node;
                }
            });
            return res_1;
        }
        return this.nodeManager.getRowNode(id);
    };
    // rows: the rows to put into the model
    ClientSideRowModel.prototype.setRowData = function (rowData) {
        // no need to invalidate cache, as the cache is stored on the rowNode,
        // so new rowNodes means the cache is wiped anyway.
        // - clears selection, done before we set row data to ensure it isn't readded via `selectionService.syncInOldRowNode`
        this.selectionService.reset('rowDataChanged');
        this.nodeManager.setRowData(rowData);
        if (this.hasStarted) {
            this.dispatchUpdateEventsAndRefresh();
        }
    };
    ClientSideRowModel.prototype.dispatchUpdateEventsAndRefresh = function () {
        // this event kicks off:
        // - shows 'no rows' overlay if needed
        var rowDataUpdatedEvent = {
            type: core.Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(rowDataUpdatedEvent);
        this.refreshModel({
            step: core.ClientSideRowModelSteps.EVERYTHING,
            newData: true,
        });
    };
    ClientSideRowModel.prototype.batchUpdateRowData = function (rowDataTransaction, callback) {
        var _this = this;
        if (this.applyAsyncTransactionsTimeout == null) {
            this.rowDataTransactionBatch = [];
            var waitMillis = this.gridOptionsService.getAsyncTransactionWaitMillis();
            this.applyAsyncTransactionsTimeout = window.setTimeout(function () {
                _this.executeBatchUpdateRowData();
            }, waitMillis);
        }
        this.rowDataTransactionBatch.push({ rowDataTransaction: rowDataTransaction, callback: callback });
    };
    ClientSideRowModel.prototype.flushAsyncTransactions = function () {
        if (this.applyAsyncTransactionsTimeout != null) {
            clearTimeout(this.applyAsyncTransactionsTimeout);
            this.executeBatchUpdateRowData();
        }
    };
    ClientSideRowModel.prototype.executeBatchUpdateRowData = function () {
        var _this = this;
        this.valueCache.onDataChanged();
        var callbackFuncsBound = [];
        var rowNodeTrans = [];
        // The rowGroup stage uses rowNodeOrder if order was provided. if we didn't pass 'true' to
        // commonUpdateRowData, using addIndex would have no effect when grouping.
        var forceRowNodeOrder = false;
        if (this.rowDataTransactionBatch) {
            this.rowDataTransactionBatch.forEach(function (tranItem) {
                var rowNodeTran = _this.nodeManager.updateRowData(tranItem.rowDataTransaction, undefined);
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
            window.setTimeout(function () {
                callbackFuncsBound.forEach(function (func) { return func(); });
            }, 0);
        }
        if (rowNodeTrans.length > 0) {
            var event_2 = {
                type: core.Events.EVENT_ASYNC_TRANSACTIONS_FLUSHED,
                results: rowNodeTrans
            };
            this.eventService.dispatchEvent(event_2);
        }
        this.rowDataTransactionBatch = null;
        this.applyAsyncTransactionsTimeout = undefined;
    };
    ClientSideRowModel.prototype.updateRowData = function (rowDataTran, rowNodeOrder) {
        this.valueCache.onDataChanged();
        var rowNodeTran = this.nodeManager.updateRowData(rowDataTran, rowNodeOrder);
        // if doing immutableData, addIndex is never present. however if doing standard transaction, and user
        // provided addIndex, then this is used in updateRowData. However if doing Enterprise, then the rowGroup
        // stage also uses the
        var forceRowNodeOrder = typeof rowDataTran.addIndex === 'number';
        this.commonUpdateRowData([rowNodeTran], rowNodeOrder, forceRowNodeOrder);
        return rowNodeTran;
    };
    ClientSideRowModel.prototype.createRowNodeOrder = function () {
        var suppressSortOrder = this.gridOptionsService.get('suppressMaintainUnsortedOrder');
        if (suppressSortOrder) {
            return;
        }
        var orderMap = {};
        if (this.rootNode && this.rootNode.allLeafChildren) {
            for (var index = 0; index < this.rootNode.allLeafChildren.length; index++) {
                var node = this.rootNode.allLeafChildren[index];
                orderMap[node.id] = index;
            }
        }
        return orderMap;
    };
    // common to updateRowData and batchUpdateRowData
    ClientSideRowModel.prototype.commonUpdateRowData = function (rowNodeTrans, rowNodeOrder, forceRowNodeOrder) {
        if (!this.hasStarted) {
            return;
        }
        var animate = !this.gridOptionsService.get('suppressAnimationFrame');
        if (forceRowNodeOrder) {
            rowNodeOrder = this.createRowNodeOrder();
        }
        var event = {
            type: core.Events.EVENT_ROW_DATA_UPDATED
        };
        this.eventService.dispatchEvent(event);
        this.refreshModel({
            step: core.ClientSideRowModelSteps.EVERYTHING,
            rowNodeTransactions: rowNodeTrans,
            rowNodeOrder: rowNodeOrder,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate: animate
        });
    };
    ClientSideRowModel.prototype.doRowsToDisplay = function () {
        this.rowsToDisplay = this.flattenStage.execute({ rowNode: this.rootNode });
    };
    ClientSideRowModel.prototype.onRowHeightChanged = function () {
        this.refreshModel({ step: core.ClientSideRowModelSteps.MAP, keepRenderedRows: true, keepEditingRows: true, keepUndoRedoStack: true });
    };
    /** This method is debounced. It is used for row auto-height. If we don't debounce,
     * then the Row Models will end up recalculating each row position
     * for each row height change and result in the Row Renderer laying out rows.
     * This is particularly bad if using print layout, and showing eg 1,000 rows,
     * each row will change it's height, causing Row Model to update 1,000 times.
     */
    ClientSideRowModel.prototype.onRowHeightChangedDebounced = function () {
        this.onRowHeightChanged_debounced();
    };
    ClientSideRowModel.prototype.resetRowHeights = function () {
        var atLeastOne = this.resetRowHeightsForAllRowNodes();
        this.rootNode.setRowHeight(this.rootNode.rowHeight, true);
        if (this.rootNode.sibling) {
            this.rootNode.sibling.setRowHeight(this.rootNode.sibling.rowHeight, true);
        }
        // when pivotMode but pivot not active, root node is displayed on its own
        // because it's only ever displayed alone, refreshing the model (onRowHeightChanged) is not required
        if (atLeastOne) {
            this.onRowHeightChanged();
        }
    };
    ClientSideRowModel.prototype.resetRowHeightsForAllRowNodes = function () {
        var atLeastOne = false;
        this.forEachNode(function (rowNode) {
            rowNode.setRowHeight(rowNode.rowHeight, true);
            // we keep the height each row is at, however we set estimated=true rather than clear the height.
            // this means the grid will not reset the row heights back to defaults, rather it will re-calc
            // the height for each row as the row is displayed. otherwise the scroll will jump when heights are reset.
            var detailNode = rowNode.detailNode;
            if (detailNode) {
                detailNode.setRowHeight(detailNode.rowHeight, true);
            }
            if (rowNode.sibling) {
                rowNode.sibling.setRowHeight(rowNode.sibling.rowHeight, true);
            }
            atLeastOne = true;
        });
        return atLeastOne;
    };
    ClientSideRowModel.prototype.onGridStylesChanges = function () {
        if (this.columnModel.isAutoRowHeightActive()) {
            return;
        }
        this.resetRowHeights();
    };
    ClientSideRowModel.prototype.onGridReady = function () {
        if (this.hasStarted) {
            return;
        }
        // App can start using API to add transactions, so need to add data into the node manager if not started
        this.setInitialData();
    };
    ClientSideRowModel.prototype.isRowDataLoaded = function () {
        return this.nodeManager.hasData();
    };
    __decorate$6([
        core.Autowired('columnModel')
    ], ClientSideRowModel.prototype, "columnModel", void 0);
    __decorate$6([
        core.Autowired('selectionService')
    ], ClientSideRowModel.prototype, "selectionService", void 0);
    __decorate$6([
        core.Autowired('filterManager')
    ], ClientSideRowModel.prototype, "filterManager", void 0);
    __decorate$6([
        core.Autowired('valueCache')
    ], ClientSideRowModel.prototype, "valueCache", void 0);
    __decorate$6([
        core.Autowired('beans')
    ], ClientSideRowModel.prototype, "beans", void 0);
    __decorate$6([
        core.Autowired('filterStage')
    ], ClientSideRowModel.prototype, "filterStage", void 0);
    __decorate$6([
        core.Autowired('sortStage')
    ], ClientSideRowModel.prototype, "sortStage", void 0);
    __decorate$6([
        core.Autowired('flattenStage')
    ], ClientSideRowModel.prototype, "flattenStage", void 0);
    __decorate$6([
        core.Optional('groupStage')
    ], ClientSideRowModel.prototype, "groupStage", void 0);
    __decorate$6([
        core.Optional('aggregationStage')
    ], ClientSideRowModel.prototype, "aggregationStage", void 0);
    __decorate$6([
        core.Optional('pivotStage')
    ], ClientSideRowModel.prototype, "pivotStage", void 0);
    __decorate$6([
        core.Optional('filterAggregatesStage')
    ], ClientSideRowModel.prototype, "filterAggregatesStage", void 0);
    __decorate$6([
        core.PostConstruct
    ], ClientSideRowModel.prototype, "init", null);
    ClientSideRowModel = __decorate$6([
        core.Bean('rowModel')
    ], ClientSideRowModel);
    return ClientSideRowModel;
}(core.BeanStub));

var __extends$5 = (undefined && undefined.__extends) || (function () {
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
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterStage = /** @class */ (function (_super) {
    __extends$5(FilterStage, _super);
    function FilterStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterStage.prototype.execute = function (params) {
        var changedPath = params.changedPath;
        this.filterService.filter(changedPath);
    };
    __decorate$5([
        core.Autowired('filterService')
    ], FilterStage.prototype, "filterService", void 0);
    FilterStage = __decorate$5([
        core.Bean('filterStage')
    ], FilterStage);
    return FilterStage;
}(core.BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortStage = /** @class */ (function (_super) {
    __extends$4(SortStage, _super);
    function SortStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortStage.prototype.execute = function (params) {
        var _this = this;
        var sortOptions = this.sortController.getSortOptions();
        var sortActive = core._.exists(sortOptions) && sortOptions.length > 0;
        var deltaSort = sortActive
            && core._.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsService.get('deltaSort');
        var sortContainsGroupColumns = sortOptions.some(function (opt) {
            var isSortingCoupled = _this.gridOptionsService.isColumnsSortingCoupledToGroup();
            if (isSortingCoupled) {
                return opt.column.isPrimary() && opt.column.isRowGroupActive();
            }
            return !!opt.column.getColDef().showRowGroup;
        });
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    };
    __decorate$4([
        core.Autowired('sortService')
    ], SortStage.prototype, "sortService", void 0);
    __decorate$4([
        core.Autowired('sortController')
    ], SortStage.prototype, "sortController", void 0);
    SortStage = __decorate$4([
        core.Bean('sortStage')
    ], SortStage);
    return SortStage;
}(core.BeanStub));

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FlattenStage = /** @class */ (function (_super) {
    __extends$3(FlattenStage, _super);
    function FlattenStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FlattenStage.prototype.execute = function (params) {
        var rootNode = params.rowNode;
        // even if not doing grouping, we do the mapping, as the client might
        // of passed in data that already has a grouping in it somewhere
        var result = [];
        var skipLeafNodes = this.columnModel.isPivotMode();
        // if we are reducing, and not grouping, then we want to show the root node, as that
        // is where the pivot values are
        var showRootNode = skipLeafNodes && rootNode.leafGroup;
        var topList = showRootNode ? [rootNode] : rootNode.childrenAfterSort;
        var details = this.getFlattenDetails();
        this.recursivelyAddToRowsToDisplay(details, topList, result, skipLeafNodes, 0);
        // we do not want the footer total if the gris is empty
        var atLeastOneRowPresent = result.length > 0;
        var includeGroupTotalFooter = !showRootNode
            // don't show total footer when showRootNode is true (i.e. in pivot mode and no groups)
            && atLeastOneRowPresent
            && details.groupIncludeTotalFooter;
        if (includeGroupTotalFooter) {
            rootNode.createFooter();
            this.addRowNodeToRowsToDisplay(details, rootNode.sibling, result, 0);
        }
        return result;
    };
    FlattenStage.prototype.getFlattenDetails = function () {
        // these two are mutually exclusive, so if first set, we don't set the second
        var groupRemoveSingleChildren = this.gridOptionsService.get('groupRemoveSingleChildren');
        var groupRemoveLowestSingleChildren = !groupRemoveSingleChildren && this.gridOptionsService.get('groupRemoveLowestSingleChildren');
        return {
            groupRemoveLowestSingleChildren: groupRemoveLowestSingleChildren,
            groupRemoveSingleChildren: groupRemoveSingleChildren,
            isGroupMultiAutoColumn: this.gridOptionsService.isGroupMultiAutoColumn(),
            hideOpenParents: this.gridOptionsService.get('groupHideOpenParents'),
            groupIncludeTotalFooter: this.gridOptionsService.get('groupIncludeTotalFooter'),
            getGroupIncludeFooter: this.gridOptionsService.getGroupIncludeFooter(),
        };
    };
    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (details, rowsToFlatten, result, skipLeafNodes, uiLevel) {
        if (core._.missingOrEmpty(rowsToFlatten)) {
            return;
        }
        for (var i = 0; i < rowsToFlatten.length; i++) {
            var rowNode = rowsToFlatten[i];
            // check all these cases, for working out if this row should be included in the final mapped list
            var isParent = rowNode.hasChildren();
            var isSkippedLeafNode = skipLeafNodes && !isParent;
            var isRemovedSingleChildrenGroup = details.groupRemoveSingleChildren && isParent && rowNode.childrenAfterGroup.length === 1;
            var isRemovedLowestSingleChildrenGroup = details.groupRemoveLowestSingleChildren &&
                isParent &&
                rowNode.leafGroup &&
                rowNode.childrenAfterGroup.length === 1;
            // hide open parents means when group is open, we don't show it. we also need to make sure the
            // group is expandable in the first place (as leaf groups are not expandable if pivot mode is on).
            // the UI will never allow expanding leaf  groups, however the user might via the API (or menu option 'expand all row groups')
            var neverAllowToExpand = skipLeafNodes && rowNode.leafGroup;
            var isHiddenOpenParent = details.hideOpenParents && rowNode.expanded && !rowNode.master && !neverAllowToExpand;
            var thisRowShouldBeRendered = !isSkippedLeafNode && !isHiddenOpenParent &&
                !isRemovedSingleChildrenGroup && !isRemovedLowestSingleChildrenGroup;
            if (thisRowShouldBeRendered) {
                this.addRowNodeToRowsToDisplay(details, rowNode, result, uiLevel);
            }
            // if we are pivoting, we never map below the leaf group
            if (skipLeafNodes && rowNode.leafGroup) {
                continue;
            }
            if (isParent) {
                var excludedParent = isRemovedSingleChildrenGroup || isRemovedLowestSingleChildrenGroup;
                // we traverse the group if it is expended, however we always traverse if the parent node
                // was removed (as the group will never be opened if it is not displayed, we show the children instead)
                if (rowNode.expanded || excludedParent) {
                    // if the parent was excluded, then ui level is that of the parent
                    var uiLevelForChildren = excludedParent ? uiLevel : uiLevel + 1;
                    this.recursivelyAddToRowsToDisplay(details, rowNode.childrenAfterSort, result, skipLeafNodes, uiLevelForChildren);
                    // put a footer in if user is looking for it
                    var doesRowShowFooter = details.getGroupIncludeFooter({ node: rowNode });
                    if (doesRowShowFooter) {
                        // ensure node is available.
                        rowNode.createFooter();
                        this.addRowNodeToRowsToDisplay(details, rowNode.sibling, result, uiLevelForChildren);
                    }
                    else {
                        // remove node if it's unnecessary.
                        rowNode.destroyFooter();
                    }
                }
            }
            else if (rowNode.master && rowNode.expanded) {
                var detailNode = this.createDetailNode(rowNode);
                this.addRowNodeToRowsToDisplay(details, detailNode, result, uiLevel);
            }
        }
    };
    // duplicated method, it's also in floatingRowModel
    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (details, rowNode, result, uiLevel) {
        result.push(rowNode);
        rowNode.setUiLevel(details.isGroupMultiAutoColumn ? 0 : uiLevel);
    };
    FlattenStage.prototype.createDetailNode = function (masterNode) {
        if (core._.exists(masterNode.detailNode)) {
            return masterNode.detailNode;
        }
        var detailNode = new core.RowNode(this.beans);
        detailNode.detail = true;
        detailNode.selectable = false;
        detailNode.parent = masterNode;
        if (core._.exists(masterNode.id)) {
            detailNode.id = 'detail_' + masterNode.id;
        }
        detailNode.data = masterNode.data;
        detailNode.level = masterNode.level + 1;
        masterNode.detailNode = detailNode;
        return detailNode;
    };
    __decorate$3([
        core.Autowired('columnModel')
    ], FlattenStage.prototype, "columnModel", void 0);
    __decorate$3([
        core.Autowired('beans')
    ], FlattenStage.prototype, "beans", void 0);
    FlattenStage = __decorate$3([
        core.Bean('flattenStage')
    ], FlattenStage);
    return FlattenStage;
}(core.BeanStub));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SortService = /** @class */ (function (_super) {
    __extends$2(SortService, _super);
    function SortService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SortService.prototype.sort = function (sortOptions, sortActive, useDeltaSort, rowNodeTransactions, changedPath, sortContainsGroupColumns) {
        var _this = this;
        var groupMaintainOrder = this.gridOptionsService.get('groupMaintainOrder');
        var groupColumnsPresent = this.columnModel.getAllGridColumns().some(function (c) { return c.isRowGroupActive(); });
        var allDirtyNodes = {};
        if (useDeltaSort && rowNodeTransactions) {
            allDirtyNodes = this.calculateDirtyNodes(rowNodeTransactions);
        }
        var isPivotMode = this.columnModel.isPivotMode();
        var postSortFunc = this.gridOptionsService.getCallback('postSortRows');
        var callback = function (rowNode) {
            // we clear out the 'pull down open parents' first, as the values mix up the sorting
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterAggFilter, true);
            // It's pointless to sort rows which aren't being displayed. in pivot mode we don't need to sort the leaf group children.
            var skipSortingPivotLeafs = isPivotMode && rowNode.leafGroup;
            // Javascript sort is non deterministic when all the array items are equals, ie Comparator always returns 0,
            // so to ensure the array keeps its order, add an additional sorting condition manually, in this case we
            // are going to inspect the original array position. This is what sortedRowNodes is for.
            var skipSortingGroups = groupMaintainOrder && groupColumnsPresent && !rowNode.leafGroup && !sortContainsGroupColumns;
            if (skipSortingGroups) {
                var childrenToBeSorted = rowNode.childrenAfterAggFilter.slice(0);
                if (rowNode.childrenAfterSort) {
                    var indexedOrders_1 = {};
                    rowNode.childrenAfterSort.forEach(function (node, idx) {
                        indexedOrders_1[node.id] = idx;
                    });
                    childrenToBeSorted.sort(function (row1, row2) { var _a, _b; return ((_a = indexedOrders_1[row1.id]) !== null && _a !== void 0 ? _a : 0) - ((_b = indexedOrders_1[row2.id]) !== null && _b !== void 0 ? _b : 0); });
                }
                rowNode.childrenAfterSort = childrenToBeSorted;
            }
            else if (!sortActive || skipSortingPivotLeafs) {
                // if there's no sort to make, skip this step
                rowNode.childrenAfterSort = rowNode.childrenAfterAggFilter.slice(0);
            }
            else if (useDeltaSort) {
                rowNode.childrenAfterSort = _this.doDeltaSort(rowNode, allDirtyNodes, changedPath, sortOptions);
            }
            else {
                rowNode.childrenAfterSort = _this.rowNodeSorter.doFullSort(rowNode.childrenAfterAggFilter, sortOptions);
            }
            if (rowNode.sibling) {
                rowNode.sibling.childrenAfterSort = rowNode.childrenAfterSort;
            }
            _this.updateChildIndexes(rowNode);
            if (postSortFunc) {
                var params = { nodes: rowNode.childrenAfterSort };
                postSortFunc(params);
            }
        };
        if (changedPath) {
            changedPath.forEachChangedNodeDepthFirst(callback);
        }
        this.updateGroupDataForHideOpenParents(changedPath);
    };
    SortService.prototype.calculateDirtyNodes = function (rowNodeTransactions) {
        var dirtyNodes = {};
        var addNodesFunc = function (rowNodes) {
            if (rowNodes) {
                rowNodes.forEach(function (rowNode) { return dirtyNodes[rowNode.id] = true; });
            }
        };
        // all leaf level nodes in the transaction were impacted
        if (rowNodeTransactions) {
            rowNodeTransactions.forEach(function (tran) {
                addNodesFunc(tran.add);
                addNodesFunc(tran.update);
                addNodesFunc(tran.remove);
            });
        }
        return dirtyNodes;
    };
    SortService.prototype.doDeltaSort = function (rowNode, allTouchedNodes, changedPath, sortOptions) {
        var _this = this;
        var unsortedRows = rowNode.childrenAfterAggFilter;
        var oldSortedRows = rowNode.childrenAfterSort;
        if (!oldSortedRows) {
            return this.rowNodeSorter.doFullSort(unsortedRows, sortOptions);
        }
        var untouchedRowsMap = {};
        var touchedRows = [];
        unsortedRows.forEach(function (row) {
            if (allTouchedNodes[row.id] || !changedPath.canSkip(row)) {
                touchedRows.push(row);
            }
            else {
                untouchedRowsMap[row.id] = true;
            }
        });
        var sortedUntouchedRows = oldSortedRows.filter(function (child) { return untouchedRowsMap[child.id]; });
        var mapNodeToSortedNode = function (rowNode, pos) { return ({ currentPos: pos, rowNode: rowNode }); };
        var sortedChangedRows = touchedRows
            .map(mapNodeToSortedNode)
            .sort(function (a, b) { return _this.rowNodeSorter.compareRowNodes(sortOptions, a, b); });
        return this.mergeSortedArrays(sortOptions, sortedChangedRows, sortedUntouchedRows.map(mapNodeToSortedNode)).map(function (_a) {
            var rowNode = _a.rowNode;
            return rowNode;
        });
    };
    // Merge two sorted arrays into each other
    SortService.prototype.mergeSortedArrays = function (sortOptions, arr1, arr2) {
        var res = [];
        var i = 0;
        var j = 0;
        // Traverse both array, adding them in order
        while (i < arr1.length && j < arr2.length) {
            // Check if current element of first
            // array is smaller than current element
            // of second array. If yes, store first
            // array element and increment first array
            // index. Otherwise do same with second array
            var compareResult = this.rowNodeSorter.compareRowNodes(sortOptions, arr1[i], arr2[j]);
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
    };
    SortService.prototype.updateChildIndexes = function (rowNode) {
        if (core._.missing(rowNode.childrenAfterSort)) {
            return;
        }
        var listToSort = rowNode.childrenAfterSort;
        for (var i = 0; i < listToSort.length; i++) {
            var child = listToSort[i];
            var firstChild = i === 0;
            var lastChild = i === rowNode.childrenAfterSort.length - 1;
            child.setFirstChild(firstChild);
            child.setLastChild(lastChild);
            child.setChildIndex(i);
        }
    };
    SortService.prototype.updateGroupDataForHideOpenParents = function (changedPath) {
        var _this = this;
        if (!this.gridOptionsService.get('groupHideOpenParents')) {
            return;
        }
        if (this.gridOptionsService.get('treeData')) {
            core._.warnOnce("The property hideOpenParents dose not work with Tree Data. This is because Tree Data has values at the group level, it doesn't make sense to hide them.");
            return false;
        }
        // recurse breadth first over group nodes after sort to 'pull down' group data to child groups
        var callback = function (rowNode) {
            _this.pullDownGroupDataForHideOpenParents(rowNode.childrenAfterSort, false);
            rowNode.childrenAfterSort.forEach(function (child) {
                if (child.hasChildren()) {
                    callback(child);
                }
            });
        };
        if (changedPath) {
            changedPath.executeFromRootNode(function (rowNode) { return callback(rowNode); });
        }
    };
    SortService.prototype.pullDownGroupDataForHideOpenParents = function (rowNodes, clearOperation) {
        var _this = this;
        if (!this.gridOptionsService.get('groupHideOpenParents') || core._.missing(rowNodes)) {
            return;
        }
        rowNodes.forEach(function (childRowNode) {
            var groupDisplayCols = _this.columnModel.getGroupDisplayColumns();
            groupDisplayCols.forEach(function (groupDisplayCol) {
                var showRowGroup = groupDisplayCol.getColDef().showRowGroup;
                if (typeof showRowGroup !== 'string') {
                    console.error('AG Grid: groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup');
                    return;
                }
                var displayingGroupKey = showRowGroup;
                var rowGroupColumn = _this.columnModel.getPrimaryColumn(displayingGroupKey);
                var thisRowNodeMatches = rowGroupColumn === childRowNode.rowGroupColumn;
                if (thisRowNodeMatches) {
                    return;
                }
                if (clearOperation) {
                    // if doing a clear operation, we clear down the value for every possible group column
                    childRowNode.setGroupValue(groupDisplayCol.getId(), undefined);
                }
                else {
                    // if doing a set operation, we set only where the pull down is to occur
                    var parentToStealFrom = childRowNode.getFirstChildOfFirstChild(rowGroupColumn);
                    if (parentToStealFrom) {
                        childRowNode.setGroupValue(groupDisplayCol.getId(), parentToStealFrom.key);
                    }
                }
            });
        });
    };
    __decorate$2([
        core.Autowired('columnModel')
    ], SortService.prototype, "columnModel", void 0);
    __decorate$2([
        core.Autowired('rowNodeSorter')
    ], SortService.prototype, "rowNodeSorter", void 0);
    SortService = __decorate$2([
        core.Bean('sortService')
    ], SortService);
    return SortService;
}(core.BeanStub));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FilterService = /** @class */ (function (_super) {
    __extends$1(FilterService, _super);
    function FilterService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterService.prototype.filter = function (changedPath) {
        var filterActive = this.filterManager.isChildFilterPresent();
        this.filterNodes(filterActive, changedPath);
    };
    FilterService.prototype.filterNodes = function (filterActive, changedPath) {
        var _this = this;
        var filterCallback = function (rowNode, includeChildNodes) {
            // recursively get all children that are groups to also filter
            if (rowNode.hasChildren()) {
                // result of filter for this node. when filtering tree data, includeChildNodes = true when parent passes
                if (filterActive && !includeChildNodes) {
                    rowNode.childrenAfterFilter = rowNode.childrenAfterGroup.filter(function (childNode) {
                        // a group is included in the result if it has any children of it's own.
                        // by this stage, the child groups are already filtered
                        var passBecauseChildren = childNode.childrenAfterFilter && childNode.childrenAfterFilter.length > 0;
                        // both leaf level nodes and tree data nodes have data. these get added if
                        // the data passes the filter
                        var passBecauseDataPasses = childNode.data
                            && _this.filterManager.doesRowPassFilter({ rowNode: childNode });
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
            var treeDataDepthFirstFilter_1 = function (rowNode, alreadyFoundInParent) {
                // tree data filter traverses the hierarchy depth first and includes child nodes if parent passes
                // filter, and parent nodes will be include if any children exist.
                if (rowNode.childrenAfterGroup) {
                    for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                        var childNode = rowNode.childrenAfterGroup[i];
                        // first check if current node passes filter before invoking child nodes
                        var foundInParent = alreadyFoundInParent
                            || _this.filterManager.doesRowPassFilter({ rowNode: childNode });
                        if (childNode.childrenAfterGroup) {
                            treeDataDepthFirstFilter_1(rowNode.childrenAfterGroup[i], foundInParent);
                        }
                        else {
                            filterCallback(childNode, foundInParent);
                        }
                    }
                }
                filterCallback(rowNode, alreadyFoundInParent);
            };
            var treeDataFilterCallback = function (rowNode) { return treeDataDepthFirstFilter_1(rowNode, false); };
            changedPath.executeFromRootNode(treeDataFilterCallback);
        }
        else {
            var defaultFilterCallback = function (rowNode) { return filterCallback(rowNode, false); };
            changedPath.forEachChangedNodeDepthFirst(defaultFilterCallback, true);
        }
    };
    FilterService.prototype.doingTreeDataFiltering = function () {
        return this.gridOptionsService.get('treeData') && !this.gridOptionsService.get('excludeChildrenWhenTreeDataFiltering');
    };
    __decorate$1([
        core.Autowired('filterManager')
    ], FilterService.prototype, "filterManager", void 0);
    FilterService = __decorate$1([
        core.Bean("filterService")
    ], FilterService);
    return FilterService;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (undefined && undefined.__read) || function (o, n) {
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
var ImmutableService = /** @class */ (function (_super) {
    __extends(ImmutableService, _super);
    function ImmutableService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImmutableService.prototype.postConstruct = function () {
        var _this = this;
        if (this.rowModel.getType() === 'clientSide') {
            this.clientSideRowModel = this.rowModel;
            this.addManagedPropertyListener('rowData', function () { return _this.onRowDataUpdated(); });
        }
    };
    ImmutableService.prototype.isActive = function () {
        var getRowIdProvided = this.gridOptionsService.exists('getRowId');
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row ID's but NOT Immutable Data.
        var resetRowDataOnUpdate = this.gridOptionsService.get('resetRowDataOnUpdate');
        if (resetRowDataOnUpdate) {
            return false;
        }
        return getRowIdProvided;
    };
    ImmutableService.prototype.setRowData = function (rowData) {
        var transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) {
            return;
        }
        var _a = __read(transactionAndMap, 2), transaction = _a[0], orderIdMap = _a[1];
        this.clientSideRowModel.updateRowData(transaction, orderIdMap);
    };
    // converts the setRowData() command to a transaction
    ImmutableService.prototype.createTransactionForRowData = function (rowData) {
        if (core._.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        var getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        if (getRowIdFunc == null) {
            console.error('AG Grid: ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return;
        }
        // convert the data into a transaction object by working out adds, removes and updates
        var transaction = {
            remove: [],
            update: [],
            add: []
        };
        var existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
        var suppressSortOrder = this.gridOptionsService.get('suppressMaintainUnsortedOrder');
        var orderMap = suppressSortOrder ? undefined : {};
        if (core._.exists(rowData)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            rowData.forEach(function (data, index) {
                var id = getRowIdFunc({ data: data, level: 0 });
                var existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    var dataHasChanged = existingNode.data !== data;
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
        core._.iterateObject(existingNodesMap, function (id, rowNode) {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    };
    ImmutableService.prototype.onRowDataUpdated = function () {
        var rowData = this.gridOptionsService.get('rowData');
        if (!rowData) {
            return;
        }
        if (this.isActive()) {
            this.setRowData(rowData);
        }
        else {
            this.selectionService.reset('rowDataChanged');
            this.clientSideRowModel.setRowData(rowData);
        }
    };
    __decorate([
        core.Autowired('rowModel')
    ], ImmutableService.prototype, "rowModel", void 0);
    __decorate([
        core.Autowired('rowRenderer')
    ], ImmutableService.prototype, "rowRenderer", void 0);
    __decorate([
        core.Autowired('selectionService')
    ], ImmutableService.prototype, "selectionService", void 0);
    __decorate([
        core.PostConstruct
    ], ImmutableService.prototype, "postConstruct", null);
    ImmutableService = __decorate([
        core.Bean('immutableService')
    ], ImmutableService);
    return ImmutableService;
}(core.BeanStub));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '31.0.0';

var ClientSideRowModelModule = {
    version: VERSION,
    moduleName: core.ModuleNames.ClientSideRowModelModule,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, FilterService, ImmutableService],
};

exports.ClientSideRowModelModule = ClientSideRowModelModule;
