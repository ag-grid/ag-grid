/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var context_1 = require("../context/context");
var columnGroup_1 = require("./columnGroup");
var column_1 = require("./column");
var eventService_1 = require("../eventService");
var columnApi_1 = require("../columnController/columnApi");
var gridApi_1 = require("../gridApi");
var OriginalColumnGroup = /** @class */ (function () {
    function OriginalColumnGroup(colGroupDef, groupId, padding, level) {
        this.localEventService = new eventService_1.EventService();
        this.expandable = false;
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.expanded = colGroupDef && !!colGroupDef.openByDefault;
        this.padding = padding;
        this.level = level;
    }
    OriginalColumnGroup.prototype.setOriginalParent = function (originalParent) {
        this.originalParent = this.originalParent;
    };
    OriginalColumnGroup.prototype.getOriginalParent = function () {
        return this.originalParent;
    };
    OriginalColumnGroup.prototype.getLevel = function () {
        return this.level;
    };
    OriginalColumnGroup.prototype.isVisible = function () {
        // return true if at least one child is visible
        if (this.children) {
            return this.children.some(function (child) { return child.isVisible(); });
        }
        return false;
    };
    OriginalColumnGroup.prototype.isPadding = function () {
        return this.padding;
    };
    OriginalColumnGroup.prototype.setExpanded = function (expanded) {
        this.expanded = expanded === undefined ? false : expanded;
        var event = {
            type: OriginalColumnGroup.EVENT_EXPANDED_CHANGED
        };
        this.localEventService.dispatchEvent(event);
    };
    OriginalColumnGroup.prototype.isExpandable = function () {
        return this.expandable;
    };
    OriginalColumnGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    OriginalColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    OriginalColumnGroup.prototype.getId = function () {
        return this.getGroupId();
    };
    OriginalColumnGroup.prototype.setChildren = function (children) {
        this.children = children;
    };
    OriginalColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    OriginalColumnGroup.prototype.getColGroupDef = function () {
        return this.colGroupDef;
    };
    OriginalColumnGroup.prototype.getLeafColumns = function () {
        var result = [];
        this.addLeafColumns(result);
        return result;
    };
    OriginalColumnGroup.prototype.addLeafColumns = function (leafColumns) {
        if (!this.children) {
            return;
        }
        this.children.forEach(function (child) {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof OriginalColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    };
    OriginalColumnGroup.prototype.getColumnGroupShow = function () {
        if (!this.padding) {
            return this.colGroupDef.columnGroupShow;
        }
        else {
            // if this is padding we have exactly only child. we then
            // take the value from the child and push it up, making
            // this group 'invisible'.
            return this.children[0].getColumnGroupShow();
        }
    };
    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    OriginalColumnGroup.prototype.setupExpandable = function () {
        var _this = this;
        this.setExpandable();
        // note - we should be removing this event listener
        this.getLeafColumns().forEach(function (col) { return col.addEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, _this.onColumnVisibilityChanged.bind(_this)); });
    };
    OriginalColumnGroup.prototype.setExpandable = function () {
        if (this.isPadding()) {
            return;
        }
        // want to make sure the group doesn't disappear when it's open
        var atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        var atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        var atLeastOneChangeable = false;
        var children = this.findChildren();
        for (var i = 0, j = children.length; i < j; i++) {
            var abstractColumn = children[i];
            if (!abstractColumn.isVisible()) {
                continue;
            }
            // if the abstractColumn is a grid generated group, there will be no colDef
            var headerGroupShow = abstractColumn.getColumnGroupShow();
            if (headerGroupShow === columnGroup_1.ColumnGroup.HEADER_GROUP_SHOW_OPEN) {
                atLeastOneShowingWhenOpen = true;
                atLeastOneChangeable = true;
            }
            else if (headerGroupShow === columnGroup_1.ColumnGroup.HEADER_GROUP_SHOW_CLOSED) {
                atLeastOneShowingWhenClosed = true;
                atLeastOneChangeable = true;
            }
            else {
                atLeastOneShowingWhenOpen = true;
                atLeastOneShowingWhenClosed = true;
            }
        }
        var expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
        if (this.expandable !== expandable) {
            this.expandable = expandable;
            var event_1 = {
                type: OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED
            };
            this.localEventService.dispatchEvent(event_1);
        }
    };
    OriginalColumnGroup.prototype.findChildren = function () {
        var children = this.children;
        var firstChild = children[0];
        if (firstChild && (!firstChild.isPadding || !firstChild.isPadding())) {
            return children;
        }
        while (children.length === 1 && children[0] instanceof OriginalColumnGroup) {
            children = children[0].children;
        }
        return children;
    };
    OriginalColumnGroup.prototype.onColumnVisibilityChanged = function () {
        this.setExpandable();
    };
    OriginalColumnGroup.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    OriginalColumnGroup.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    OriginalColumnGroup.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED = 'expandableChanged';
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], OriginalColumnGroup.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], OriginalColumnGroup.prototype, "gridApi", void 0);
    return OriginalColumnGroup;
}());
exports.OriginalColumnGroup = OriginalColumnGroup;
