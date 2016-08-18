/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var selectionController_1 = require("../selectionController");
var valueService_1 = require("../valueService");
var columnController_1 = require("../columnController/columnController");
var context_1 = require("../context/context");
var constants_1 = require("../constants");
var RowNode = (function () {
    function RowNode() {
        /** Children mapped by the pivot columns */
        this.childrenMapped = {};
        this.selected = false;
    }
    RowNode.prototype.setData = function (data) {
        var oldData = this.data;
        this.data = data;
        var event = { oldData: oldData, newData: data };
        this.dispatchLocalEvent(RowNode.EVENT_DATA_CHANGED, event);
    };
    RowNode.prototype.setDataAndId = function (data, id) {
        var oldData = this.data;
        this.data = data;
        this.setId(id);
        this.selectionController.syncInRowNode(this);
        var event = { oldData: oldData, newData: data };
        this.dispatchLocalEvent(RowNode.EVENT_DATA_CHANGED, event);
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
    RowNode.prototype.dispatchLocalEvent = function (eventName, event) {
        if (this.eventService) {
            this.eventService.dispatchEvent(eventName, event);
        }
    };
    // we also allow editing the value via the editors. when it is done via
    // the editors, no 'cell changed' event gets fired, as it's assumed that
    // the cell knows about the change given it's in charge of the editing.
    // this method is for the client to call, so the cell listens for the change
    // event, and also flashes the cell when the change occurs.
    RowNode.prototype.setDataValue = function (colKey, newValue) {
        var column = this.columnController.getGridColumn(colKey);
        this.valueService.setValue(this, column, newValue);
        var event = { column: column, newValue: newValue };
        this.dispatchLocalEvent(RowNode.EVENT_CELL_CHANGED, event);
    };
    RowNode.prototype.resetQuickFilterAggregateText = function () {
        this.quickFilterAggregateText = null;
    };
    RowNode.prototype.isSelected = function () {
        // for footers, we just return what our sibling selected state is, as cannot select a footer
        if (this.footer) {
            return this.sibling.isSelected();
        }
        return this.selected;
    };
    RowNode.prototype.deptFirstSearch = function (callback) {
        if (this.childrenAfterGroup) {
            this.childrenAfterGroup.forEach(function (child) { return child.deptFirstSearch(callback); });
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
    // to make calling code more readable, this is the same method as setSelected except it takes names parameters
    RowNode.prototype.setSelectedParams = function (params) {
        var newValue = params.newValue === true;
        var clearSelection = params.clearSelection === true;
        var tailingNodeInSequence = params.tailingNodeInSequence === true;
        var rangeSelect = params.rangeSelect === true;
        if (this.id === undefined) {
            console.warn('ag-Grid: cannot select node until id for node is known');
            return;
        }
        if (this.floating) {
            console.log('ag-Grid: cannot select floating rows');
            return;
        }
        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            this.sibling.setSelectedParams(params);
            return;
        }
        if (rangeSelect) {
            var rowModelNormal = this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_NORMAL;
            var newRowClicked = this.selectionController.getLastSelectedNode() !== this;
            var allowMultiSelect = this.gridOptionsWrapper.isRowSelectionMulti();
            if (rowModelNormal && newRowClicked && allowMultiSelect) {
                this.doRowRangeSelection();
                return;
            }
        }
        this.selectThisNode(newValue);
        var groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        if (groupSelectsChildren && this.group) {
            this.selectChildNodes(newValue);
        }
        // clear other nodes if not doing multi select
        var actionWasOnThisNode = !tailingNodeInSequence;
        if (actionWasOnThisNode) {
            if (newValue && (clearSelection || !this.gridOptionsWrapper.isRowSelectionMulti())) {
                this.selectionController.clearOtherNodes(this);
            }
            if (groupSelectsChildren && this.parent) {
                this.parent.calculateSelectedFromChildrenBubbleUp();
            }
            // this is the very end of the 'action node', so we are finished all the updates,
            // include any parent / child changes that this method caused
            this.mainEventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
            // so if user next does shift-select, we know where to start the selection from
            if (newValue) {
                this.selectionController.setLastSelectedNode(this);
            }
        }
    };
    // selects all rows between this node and the last selected node (or the top if this is the first selection).
    // not to be mixed up with 'cell range selection' where you drag the mouse, this is row range selection, by
    // holding down 'shift'.
    RowNode.prototype.doRowRangeSelection = function () {
        var _this = this;
        var lastSelectedNode = this.selectionController.getLastSelectedNode();
        // if lastSelectedNode is missing, we start at the first row
        var firstRowHit = !lastSelectedNode;
        var lastRowHit = false;
        var lastRow;
        var groupsSelectChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        var inMemoryRowModel = this.rowModel;
        inMemoryRowModel.forEachNodeAfterFilterAndSort(function (rowNode) {
            var lookingForLastRow = firstRowHit && !lastRowHit;
            // check if we need to flip the select switch
            if (!firstRowHit) {
                if (rowNode === lastSelectedNode || rowNode === _this) {
                    firstRowHit = true;
                }
            }
            var skipThisGroupNode = rowNode.group && groupsSelectChildren;
            if (!skipThisGroupNode) {
                var inRange = firstRowHit && !lastRowHit;
                var childOfLastRow = rowNode.isParentOfNode(lastRow);
                rowNode.selectThisNode(inRange || childOfLastRow);
            }
            if (lookingForLastRow) {
                if (rowNode === lastSelectedNode || rowNode === _this) {
                    lastRowHit = true;
                    if (rowNode === lastSelectedNode) {
                        lastRow = lastSelectedNode;
                    }
                    else {
                        lastRow = _this;
                    }
                }
            }
        });
        if (groupsSelectChildren) {
            this.calculatedSelectedForAllGroupNodes();
        }
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
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
                topLevelNode.deptFirstSearch(function (childNode) {
                    if (childNode.group) {
                        childNode.calculateSelectedFromChildren();
                    }
                });
                topLevelNode.calculateSelectedFromChildren();
            }
        });
    };
    RowNode.prototype.selectThisNode = function (newValue) {
        if (this.selected !== newValue) {
            this.selected = newValue;
            if (this.eventService) {
                this.dispatchLocalEvent(RowNode.EVENT_ROW_SELECTED);
            }
            var event = { node: this };
            this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_SELECTED, event);
        }
    };
    RowNode.prototype.selectChildNodes = function (newValue) {
        for (var i = 0; i < this.childrenAfterGroup.length; i++) {
            this.childrenAfterGroup[i].setSelectedParams({
                newValue: newValue,
                clearSelection: false,
                tailingNodeInSequence: true
            });
        }
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
        this.dispatchLocalEvent(RowNode.EVENT_MOUSE_ENTER);
    };
    RowNode.prototype.onMouseLeave = function () {
        this.dispatchLocalEvent(RowNode.EVENT_MOUSE_LEAVE);
    };
    RowNode.EVENT_ROW_SELECTED = 'rowSelected';
    RowNode.EVENT_DATA_CHANGED = 'dataChanged';
    RowNode.EVENT_CELL_CHANGED = 'cellChanged';
    RowNode.EVENT_MOUSE_ENTER = 'mouseEnter';
    RowNode.EVENT_MOUSE_LEAVE = 'mouseLeave';
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], RowNode.prototype, "mainEventService", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowNode.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('selectionController'), 
        __metadata('design:type', selectionController_1.SelectionController)
    ], RowNode.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RowNode.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('valueService'), 
        __metadata('design:type', valueService_1.ValueService)
    ], RowNode.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], RowNode.prototype, "rowModel", void 0);
    return RowNode;
})();
exports.RowNode = RowNode;
