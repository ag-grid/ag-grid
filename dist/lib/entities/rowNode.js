/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.1.3
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
var RowNode = (function () {
    function RowNode() {
        this.selected = false;
    }
    RowNode.prototype.setData = function (data) {
        var oldData = this.data;
        this.data = data;
        var event = { oldData: oldData, newData: data };
        this.dispatchLocalEvent(RowNode.EVENT_DATA_CHANGED, event);
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
        var column = this.columnController.getColumn(colKey);
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
        if (this.children) {
            this.children.forEach(function (child) { return child.deptFirstSearch(callback); });
        }
        callback(this);
    };
    // + rowController.updateGroupsInSelection()
    RowNode.prototype.calculateSelectedFromChildren = function () {
        var atLeastOneSelected = false;
        var atLeastOneDeSelected = false;
        var atLeastOneMixed = false;
        var newSelectedValue;
        if (this.children) {
            for (var i = 0; i < this.children.length; i++) {
                var childState = this.children[i].isSelected();
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
            this.parent.calculateSelectedFromChildren();
        }
    };
    RowNode.prototype.setSelectedInitialValue = function (selected) {
        this.selected = selected;
    };
    /** Returns true if this row is selected */
    RowNode.prototype.setSelected = function (newValue, clearSelection, tailingNodeInSequence) {
        if (clearSelection === void 0) { clearSelection = false; }
        if (tailingNodeInSequence === void 0) { tailingNodeInSequence = false; }
        if (this.floating) {
            console.log('ag-Grid: cannot select floating rows');
            return;
        }
        // if we are a footer, we don't do selection, just pass the info
        // to the sibling (the parent of the group)
        if (this.footer) {
            this.sibling.setSelected(newValue, clearSelection, tailingNodeInSequence);
            return;
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
        }
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
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].setSelected(newValue, false, true);
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
    RowNode.EVENT_ROW_SELECTED = 'rowSelected';
    RowNode.EVENT_DATA_CHANGED = 'dataChanged';
    RowNode.EVENT_CELL_CHANGED = 'cellChanged';
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
    return RowNode;
})();
exports.RowNode = RowNode;
