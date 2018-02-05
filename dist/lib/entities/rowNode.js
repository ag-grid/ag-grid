/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var selectionController_1 = require("../selectionController");
var valueService_1 = require("../valueService/valueService");
var columnController_1 = require("../columnController/columnController");
var columnApi_1 = require("../columnController/columnApi");
var context_1 = require("../context/context");
var constants_1 = require("../constants");
var utils_1 = require("../utils");
var valueCache_1 = require("../valueService/valueCache");
var gridApi_1 = require("../gridApi");
var RowNode = (function () {
    function RowNode() {
        /** Children mapped by the pivot columns */
        this.childrenMapped = {};
        this.selected = false;
    }
    RowNode.prototype.setData = function (data) {
        var oldData = this.data;
        this.data = data;
        this.valueCache.onDataChanged();
        var event = this.createDataChangedEvent(data, oldData, false);
        this.dispatchLocalEvent(event);
    };
    RowNode.prototype.createDataChangedEvent = function (newData, oldData, update) {
        return {
            type: RowNode.EVENT_DATA_CHANGED,
            node: this,
            oldData: oldData,
            newData: newData,
            update: update
        };
    };
    RowNode.prototype.createLocalRowEvent = function (type) {
        return {
            type: type,
            node: this
        };
    };
    // similar to setRowData, however it is expected that the data is the same data item. this
    // is intended to be used with Redux type stores, where the whole data can be changed. we are
    // guaranteed that the data is the same entity (so grid doesn't need to worry about the id of the
    // underlying data changing, hence doesn't need to worry about selection). the grid, upon receiving
    // dataChanged event, will refresh the cells rather than rip them all out (so user can show transitions).
    RowNode.prototype.updateData = function (data) {
        var oldData = this.data;
        this.data = data;
        var event = this.createDataChangedEvent(data, oldData, true);
        this.dispatchLocalEvent(event);
    };
    RowNode.prototype.getRowIndexString = function () {
        if (this.rowPinned === constants_1.Constants.PINNED_TOP) {
            return 't-' + this.rowIndex;
        }
        else if (this.rowPinned === constants_1.Constants.PINNED_BOTTOM) {
            return 'b-' + this.rowIndex;
        }
        else {
            return this.rowIndex.toString();
        }
    };
    RowNode.prototype.createDaemonNode = function () {
        var oldNode = new RowNode();
        this.context.wireBean(oldNode);
        // just copy the id and data, this is enough for the node to be used
        // in the selection controller (the selection controller is the only
        // place where daemon nodes can live).
        oldNode.id = this.id;
        oldNode.data = this.data;
        oldNode.daemon = true;
        oldNode.selected = this.selected;
        oldNode.level = this.level;
        return oldNode;
    };
    RowNode.prototype.setDataAndId = function (data, id) {
        var oldNode = utils_1.Utils.exists(this.id) ? this.createDaemonNode() : null;
        var oldData = this.data;
        this.data = data;
        this.setId(id);
        this.selectionController.syncInRowNode(this, oldNode);
        var event = this.createDataChangedEvent(data, oldData, false);
        this.dispatchLocalEvent(event);
    };
    RowNode.prototype.setId = function (id) {
        // see if user is providing the id's
        var getRowNodeId = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (getRowNodeId) {
            // if user is providing the id's, then we set the id only after the data has been set.
            // this is important for virtual pagination and viewport, where empty rows exist.
            if (this.data) {
                this.id = getRowNodeId(this.data);
            }
            else {
                // this can happen if user has set blank into the rowNode after the row previously
                // having data. this happens in virtual page row model, when data is delete and
                // the page is refreshed.
                this.id = undefined;
            }
        }
        else {
            this.id = id;
        }
    };
    RowNode.prototype.isPixelInRange = function (pixel) {
        return pixel >= this.rowTop && pixel < (this.rowTop + this.rowHeight);
    };
    RowNode.prototype.clearRowTop = function () {
        this.oldRowTop = this.rowTop;
        this.setRowTop(null);
    };
    RowNode.prototype.setFirstChild = function (firstChild) {
        if (this.firstChild === firstChild) {
            return;
        }
        this.firstChild = firstChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_FIRST_CHILD_CHANGED));
        }
    };
    RowNode.prototype.setLastChild = function (lastChild) {
        if (this.lastChild === lastChild) {
            return;
        }
        this.lastChild = lastChild;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_LAST_CHILD_CHANGED));
        }
    };
    RowNode.prototype.setChildIndex = function (childIndex) {
        if (this.childIndex === childIndex) {
            return;
        }
        this.childIndex = childIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_CHILD_INDEX_CHANGED));
        }
    };
    RowNode.prototype.setRowTop = function (rowTop) {
        if (this.rowTop === rowTop) {
            return;
        }
        this.rowTop = rowTop;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_TOP_CHANGED));
        }
    };
    RowNode.prototype.setDragging = function (dragging) {
        if (this.dragging === dragging) {
            return;
        }
        this.dragging = dragging;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_DRAGGING_CHANGED));
        }
    };
    RowNode.prototype.setAllChildrenCount = function (allChildrenCount) {
        if (this.allChildrenCount === allChildrenCount) {
            return;
        }
        this.allChildrenCount = allChildrenCount;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED));
        }
    };
    RowNode.prototype.setRowHeight = function (rowHeight) {
        this.rowHeight = rowHeight;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_HEIGHT_CHANGED));
        }
    };
    RowNode.prototype.setRowIndex = function (rowIndex) {
        this.rowIndex = rowIndex;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_INDEX_CHANGED));
        }
    };
    RowNode.prototype.setUiLevel = function (uiLevel) {
        if (this.uiLevel === uiLevel) {
            return;
        }
        this.uiLevel = uiLevel;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_UI_LEVEL_CHANGED));
        }
    };
    RowNode.prototype.setExpanded = function (expanded) {
        if (this.expanded === expanded) {
            return;
        }
        this.expanded = expanded;
        if (this.eventService) {
            this.eventService.dispatchEvent(this.createLocalRowEvent(RowNode.EVENT_EXPANDED_CHANGED));
        }
        var event = this.createGlobalRowEvent(events_1.Events.EVENT_ROW_GROUP_OPENED);
        this.mainEventService.dispatchEvent(event);
    };
    RowNode.prototype.createGlobalRowEvent = function (type) {
        var event = {
            type: type,
            node: this,
            data: this.data,
            rowIndex: this.rowIndex,
            rowPinned: this.rowPinned,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi()
        };
        return event;
    };
    RowNode.prototype.dispatchLocalEvent = function (event) {
        if (this.eventService) {
            this.eventService.dispatchEvent(event);
        }
    };
    // we also allow editing the value via the editors. when it is done via
    // the editors, no 'cell changed' event gets fired, as it's assumed that
    // the cell knows about the change given it's in charge of the editing.
    // this method is for the client to call, so the cell listens for the change
    // event, and also flashes the cell when the change occurs.
    RowNode.prototype.setDataValue = function (colKey, newValue) {
        var column = this.columnController.getPrimaryColumn(colKey);
        this.valueService.setValue(this, column, newValue);
        this.dispatchCellChangedEvent(column, newValue);
    };
    RowNode.prototype.setGroupValue = function (colKey, newValue) {
        var column = this.columnController.getGridColumn(colKey);
        if (utils_1.Utils.missing(this.groupData)) {
            this.groupData = {};
        }
        this.groupData[column.getColId()] = newValue;
        this.dispatchCellChangedEvent(column, newValue);
    };
    // sets the data for an aggregation
    RowNode.prototype.setAggData = function (newAggData) {
        var _this = this;
        // find out all keys that could potentially change
        var colIds = utils_1.Utils.getAllKeysInObjects([this.aggData, newAggData]);
        this.aggData = newAggData;
        // if no event service, nobody has registered for events, so no need fire event
        if (this.eventService) {
            colIds.forEach(function (colId) {
                var column = _this.columnController.getGridColumn(colId);
                var value = _this.aggData ? _this.aggData[colId] : undefined;
                _this.dispatchCellChangedEvent(column, value);
            });
        }
    };
    RowNode.prototype.hasChildren = function () {
        // we need to return true when this.group=true, as this is used by enterprise row model
        // (as children are lazy loaded and stored in a cache anyway). otherwise we return true
        // if children exist.
        return this.group || (this.childrenAfterGroup && this.childrenAfterGroup.length > 0);
    };
    RowNode.prototype.isEmptyFillerNode = function () {
        return this.group && utils_1.Utils.missingOrEmpty(this.childrenAfterGroup);
    };
    RowNode.prototype.dispatchCellChangedEvent = function (column, newValue) {
        var cellChangedEvent = {
            type: RowNode.EVENT_CELL_CHANGED,
            node: this,
            column: column,
            newValue: newValue
        };
        this.dispatchLocalEvent(cellChangedEvent);
    };
    RowNode.prototype.resetQuickFilterAggregateText = function () {
        this.quickFilterAggregateText = null;
    };
    RowNode.prototype.isExpandable = function () {
        return this.hasChildren() || this.master;
    };
    RowNode.prototype.isSelected = function () {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }
        return this.selected;
    };
    RowNode.prototype.depthFirstSearch = function (callback) {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach(function (child) { return child.depthFirstSearch(callback); });
        }
        callback(this);
    };
    // + rowController.updateGroupsInSelection()
    RowNode.prototype.calculateSelectedFromChildren = function () {
        var atLeastOneSelected = false;
        var atLeastOneDeSelected = false;
        var atLeastOneMixed = false;
        var newSelectedValue;
        if (this.childrenAfterGroup) {
            for (var i = 0; i < this.childrenAfterGroup.length; i++) {
                var childState = this.childrenAfterGroup[i].isSelected();
                switch (childState) {
                    case true:
                        atLeastOneSelected = true;
                        break;
                    case false:
                        atLeastOneDeSelected = true;
                        break;
                    default:
                        atLeastOneMixed = true;
                        break;
                }
            }
        }
        if (atLeastOneMixed) {
            newSelectedValue = undefined;
        }
        else if (atLeastOneSelected && !atLeastOneDeSelected) {
            newSelectedValue = true;
        }
        else if (!atLeastOneSelected && atLeastOneDeSelected) {
            newSelectedValue = false;
        }
        else {
            newSelectedValue = undefined;
        }
        this.selectThisNode(newSelectedValue);
    };
    RowNode.prototype.calculateSelectedFromChildrenBubbleUp = function () {
        this.calculateSelectedFromChildren();
        if (this.parent) {
            this.parent.calculateSelectedFromChildrenBubbleUp();
        }
    };
    RowNode.prototype.setSelectedInitialValue = function (selected) {
        this.selected = selected;
    };
    RowNode.prototype.setSelected = function (newValue, clearSelection, tailingNodeInSequence) {
        if (clearSelection === void 0) { clearSelection = false; }
        if (tailingNodeInSequence === void 0) { tailingNodeInSequence = false; }
        this.setSelectedParams({
            newValue: newValue,
            clearSelection: clearSelection,
            tailingNodeInSequence: tailingNodeInSequence,
            rangeSelect: false
        });
    };
    RowNode.prototype.isRowPinned = function () {
        return this.rowPinned === constants_1.Constants.PINNED_TOP || this.rowPinned === constants_1.Constants.PINNED_BOTTOM;
    };
    // to make calling code more readable, this is the same method as setSelected except it takes names parameters
    RowNode.prototype.setSelectedParams = function (params) {
        var groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        var newValue = params.newValue === true;
        var clearSelection = params.clearSelection === true;
        var tailingNodeInSequence = params.tailingNodeInSequence === true;
        var rangeSelect = params.rangeSelect === true;
        // groupSelectsFiltered only makes sense when group selects children
        var groupSelectsFiltered = groupSelectsChildren && (params.groupSelectsFiltered === true);
        if (this.id === undefined) {
            console.warn('ag-Grid: cannot select node until id for node is known');
            return 0;
        }
        if (this.rowPinned) {
            console.log('ag-Grid: cannot select pinned rows');
            return 0;
        }
        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            var count = this.sibling.setSelectedParams(params);
            return count;
        }
        if (rangeSelect) {
            var newRowClicked = this.selectionController.getLastSelectedNode() !== this;
            var allowMultiSelect = this.gridOptionsWrapper.isRowSelectionMulti();
            if (newRowClicked && allowMultiSelect) {
                return this.doRowRangeSelection();
            }
        }
        var updatedCount = 0;
        // when groupSelectsFiltered, then this node may end up intermediate despite
        // trying to set it to true / false. this group will be calculated further on
        // down when we call calculatedSelectedForAllGroupNodes(). we need to skip it
        // here, otherwise the updatedCount would include it.
        var skipThisNode = groupSelectsFiltered && this.group;
        if (!skipThisNode) {
            var thisNodeWasSelected = this.selectThisNode(newValue);
            if (thisNodeWasSelected) {
                updatedCount++;
            }
        }
        if (groupSelectsChildren && this.group) {
            updatedCount += this.selectChildNodes(newValue, groupSelectsFiltered);
        }
        // clear other nodes if not doing multi select
        var actionWasOnThisNode = !tailingNodeInSequence;
        if (actionWasOnThisNode) {
            if (newValue && (clearSelection || !this.gridOptionsWrapper.isRowSelectionMulti())) {
                updatedCount += this.selectionController.clearOtherNodes(this);
            }
            // only if we selected something, then update groups and fire events
            if (updatedCount > 0) {
                // update groups
                if (groupSelectsFiltered) {
                    // if the group was selecting filtered, then all nodes above and or below
                    // this node could have check, unchecked or intermediate, so easiest is to
                    // recalculate selected state for all group nodes
                    this.calculatedSelectedForAllGroupNodes();
                }
                else {
                    // if no selecting filtered, then everything below the group node was either
                    // selected or not selected, no intermediate, so no need to check items below
                    // this one, just the parents all the way up to the root
                    if (groupSelectsChildren && this.parent) {
                        this.parent.calculateSelectedFromChildrenBubbleUp();
                    }
                }
                // fire events
                // this is the very end of the 'action node', so we are finished all the updates,
                // include any parent / child changes that this method caused
                var event_1 = {
                    type: events_1.Events.EVENT_SELECTION_CHANGED,
                    api: this.gridApi,
                    columnApi: this.columnApi
                };
                this.mainEventService.dispatchEvent(event_1);
            }
            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.selectionController.setLastSelectedNode(this);
            }
        }
        return updatedCount;
    };
    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    RowNode.prototype.doRowRangeSelection = function () {
        var updatedCount = 0;
        var groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        var lastSelectedNode = this.selectionController.getLastSelectedNode();
        var nodesToSelect = this.rowModel.getNodesInRangeForSelection(lastSelectedNode, this);
        nodesToSelect.forEach(function (rowNode) {
            if (rowNode.group && groupsSelectChildren) {
                return;
            }
            var nodeWasSelected = rowNode.selectThisNode(true);
            if (nodeWasSelected) {
                updatedCount++;
            }
        });
        if (groupsSelectChildren) {
            this.calculatedSelectedForAllGroupNodes();
        }
        var event = {
            type: events_1.Events.EVENT_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.mainEventService.dispatchEvent(event);
        return updatedCount;
    };
    RowNode.prototype.isParentOfNode = function (potentialParent) {
        var parentNode = this.parent;
        while (parentNode) {
            if (parentNode === potentialParent) {
                return true;
            }
            parentNode = parentNode.parent;
        }
        return false;
    };
    RowNode.prototype.calculatedSelectedForAllGroupNodes = function () {
        // we have to make sure we do this dept first, as parent nodes
        // will have dependencies on the children having correct values
        var inMemoryRowModel = this.rowModel;
        inMemoryRowModel.getTopLevelNodes().forEach(function (topLevelNode) {
            if (topLevelNode.group) {
                topLevelNode.depthFirstSearch(function (childNode) {
                    if (childNode.group) {
                        childNode.calculateSelectedFromChildren();
                    }
                });
                topLevelNode.calculateSelectedFromChildren();
            }
        });
    };
    RowNode.prototype.selectThisNode = function (newValue) {
        if (this.selected === newValue) {
            return false;
        }
        this.selected = newValue;
        if (this.eventService) {
            this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_ROW_SELECTED));
        }
        var event = this.createGlobalRowEvent(events_1.Events.EVENT_ROW_SELECTED);
        this.mainEventService.dispatchEvent(event);
        return true;
    };
    RowNode.prototype.selectChildNodes = function (newValue, groupSelectsFiltered) {
        var children = groupSelectsFiltered ? this.childrenAfterFilter : this.childrenAfterGroup;
        var updatedCount = 0;
        if (utils_1.Utils.missing(children)) {
            return;
        }
        for (var i = 0; i < children.length; i++) {
            updatedCount += children[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                tailingNodeInSequence: true
            });
        }
        return updatedCount;
    };
    RowNode.prototype.addEventListener = function (eventType, listener) {
        if (!this.eventService) {
            this.eventService = new eventService_1.EventService();
        }
        this.eventService.addEventListener(eventType, listener);
    };
    RowNode.prototype.removeEventListener = function (eventType, listener) {
        this.eventService.removeEventListener(eventType, listener);
    };
    RowNode.prototype.onMouseEnter = function () {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_ENTER));
    };
    RowNode.prototype.onMouseLeave = function () {
        this.dispatchLocalEvent(this.createLocalRowEvent(RowNode.EVENT_MOUSE_LEAVE));
    };
    RowNode.prototype.getFirstChildOfFirstChild = function (rowGroupColumn) {
        var currentRowNode = this;
        // if we are hiding groups, then if we are the first child, of the first child,
        // all the way up to the column we are interested in, then we show the group cell.
        var isCandidate = true;
        var foundFirstChildPath = false;
        var nodeToSwapIn;
        while (isCandidate && !foundFirstChildPath) {
            var parentRowNode = currentRowNode.parent;
            var firstChild = utils_1.Utils.exists(parentRowNode) && currentRowNode.firstChild;
            if (firstChild) {
                if (parentRowNode.rowGroupColumn === rowGroupColumn) {
                    foundFirstChildPath = true;
                    nodeToSwapIn = parentRowNode;
                }
            }
            else {
                isCandidate = false;
            }
            currentRowNode = parentRowNode;
        }
        return foundFirstChildPath ? nodeToSwapIn : null;
    };
    RowNode.EVENT_ROW_SELECTED = 'rowSelected';
    RowNode.EVENT_DATA_CHANGED = 'dataChanged';
    RowNode.EVENT_CELL_CHANGED = 'cellChanged';
    RowNode.EVENT_ALL_CHILDREN_COUNT_CHANGED = 'allChildrenCountChanged';
    RowNode.EVENT_MOUSE_ENTER = 'mouseEnter';
    RowNode.EVENT_MOUSE_LEAVE = 'mouseLeave';
    RowNode.EVENT_HEIGHT_CHANGED = 'heightChanged';
    RowNode.EVENT_TOP_CHANGED = 'topChanged';
    RowNode.EVENT_FIRST_CHILD_CHANGED = 'firstChildChanged';
    RowNode.EVENT_LAST_CHILD_CHANGED = 'lastChildChanged';
    RowNode.EVENT_CHILD_INDEX_CHANGED = 'childIndexChanged';
    RowNode.EVENT_ROW_INDEX_CHANGED = 'rowIndexChanged';
    RowNode.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    RowNode.EVENT_UI_LEVEL_CHANGED = 'uiLevelChanged';
    RowNode.EVENT_DRAGGING_CHANGED = 'draggingChanged';
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], RowNode.prototype, "mainEventService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowNode.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], RowNode.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], RowNode.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], RowNode.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], RowNode.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], RowNode.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('valueCache'),
        __metadata("design:type", valueCache_1.ValueCache)
    ], RowNode.prototype, "valueCache", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], RowNode.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], RowNode.prototype, "gridApi", void 0);
    return RowNode;
}());
exports.RowNode = RowNode;
