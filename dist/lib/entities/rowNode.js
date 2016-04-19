/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var RowNode = (function () {
    function RowNode(mainEventService, gridOptionsWrapper, selectionController) {
        this.selected = false;
        this.mainEventService = mainEventService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.selectionController = selectionController;
    }
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
                this.eventService.dispatchEvent(RowNode.EVENT_ROW_SELECTED);
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
    return RowNode;
})();
exports.RowNode = RowNode;
