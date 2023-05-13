/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidedColumnGroup = void 0;
var column_1 = require("./column");
var eventService_1 = require("../eventService");
var context_1 = require("../context/context");
var ProvidedColumnGroup = /** @class */ (function () {
    function ProvidedColumnGroup(colGroupDef, groupId, padding, level) {
        this.localEventService = new eventService_1.EventService();
        this.expandable = false;
        // used by React (and possibly other frameworks) as key for rendering. also used to
        // identify old vs new columns for destroying cols when no longer used.
        this.instanceId = column_1.getNextColInstanceId();
        this.expandableListenerRemoveCallback = null;
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.expanded = !!colGroupDef && !!colGroupDef.openByDefault;
        this.padding = padding;
        this.level = level;
    }
    ProvidedColumnGroup.prototype.destroy = function () {
        if (this.expandableListenerRemoveCallback) {
            this.reset(null, undefined);
        }
    };
    ProvidedColumnGroup.prototype.reset = function (colGroupDef, level) {
        this.colGroupDef = colGroupDef;
        this.level = level;
        this.originalParent = null;
        if (this.expandableListenerRemoveCallback) {
            this.expandableListenerRemoveCallback();
        }
        // we use ! below, as we want to set the object back to the
        // way it was when it was first created
        this.children = undefined;
        this.expandable = undefined;
    };
    ProvidedColumnGroup.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    ProvidedColumnGroup.prototype.setOriginalParent = function (originalParent) {
        this.originalParent = originalParent;
    };
    ProvidedColumnGroup.prototype.getOriginalParent = function () {
        return this.originalParent;
    };
    ProvidedColumnGroup.prototype.getLevel = function () {
        return this.level;
    };
    ProvidedColumnGroup.prototype.isVisible = function () {
        // return true if at least one child is visible
        if (this.children) {
            return this.children.some(function (child) { return child.isVisible(); });
        }
        return false;
    };
    ProvidedColumnGroup.prototype.isPadding = function () {
        return this.padding;
    };
    ProvidedColumnGroup.prototype.setExpanded = function (expanded) {
        this.expanded = expanded === undefined ? false : expanded;
        var event = {
            type: ProvidedColumnGroup.EVENT_EXPANDED_CHANGED
        };
        this.localEventService.dispatchEvent(event);
    };
    ProvidedColumnGroup.prototype.isExpandable = function () {
        return this.expandable;
    };
    ProvidedColumnGroup.prototype.isExpanded = function () {
        return this.expanded;
    };
    ProvidedColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    ProvidedColumnGroup.prototype.getId = function () {
        return this.getGroupId();
    };
    ProvidedColumnGroup.prototype.setChildren = function (children) {
        this.children = children;
    };
    ProvidedColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    ProvidedColumnGroup.prototype.getColGroupDef = function () {
        return this.colGroupDef;
    };
    ProvidedColumnGroup.prototype.getLeafColumns = function () {
        var result = [];
        this.addLeafColumns(result);
        return result;
    };
    ProvidedColumnGroup.prototype.addLeafColumns = function (leafColumns) {
        if (!this.children) {
            return;
        }
        this.children.forEach(function (child) {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ProvidedColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    };
    ProvidedColumnGroup.prototype.getColumnGroupShow = function () {
        var colGroupDef = this.colGroupDef;
        if (!colGroupDef) {
            return;
        }
        return colGroupDef.columnGroupShow;
    };
    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    ProvidedColumnGroup.prototype.setupExpandable = function () {
        var _this = this;
        this.setExpandable();
        if (this.expandableListenerRemoveCallback) {
            this.expandableListenerRemoveCallback();
        }
        var listener = this.onColumnVisibilityChanged.bind(this);
        this.getLeafColumns().forEach(function (col) { return col.addEventListener('visibleChanged', listener); });
        this.expandableListenerRemoveCallback = function () {
            _this.getLeafColumns().forEach(function (col) { return col.removeEventListener('visibleChanged', listener); });
            _this.expandableListenerRemoveCallback = null;
        };
    };
    ProvidedColumnGroup.prototype.setExpandable = function () {
        if (this.isPadding()) {
            return;
        }
        // want to make sure the group doesn't disappear when it's open
        var atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        var atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        var atLeastOneChangeable = false;
        var children = this.findChildrenRemovingPadding();
        for (var i = 0, j = children.length; i < j; i++) {
            var abstractColumn = children[i];
            if (!abstractColumn.isVisible()) {
                continue;
            }
            // if the abstractColumn is a grid generated group, there will be no colDef
            var headerGroupShow = abstractColumn.getColumnGroupShow();
            if (headerGroupShow === 'open') {
                atLeastOneShowingWhenOpen = true;
                atLeastOneChangeable = true;
            }
            else if (headerGroupShow === 'closed') {
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
                type: ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED
            };
            this.localEventService.dispatchEvent(event_1);
        }
    };
    ProvidedColumnGroup.prototype.findChildrenRemovingPadding = function () {
        var res = [];
        var process = function (items) {
            items.forEach(function (item) {
                // if padding, we add this children instead of the padding
                var skipBecausePadding = item instanceof ProvidedColumnGroup && item.isPadding();
                if (skipBecausePadding) {
                    process(item.children);
                }
                else {
                    res.push(item);
                }
            });
        };
        process(this.children);
        return res;
    };
    ProvidedColumnGroup.prototype.onColumnVisibilityChanged = function () {
        this.setExpandable();
    };
    ProvidedColumnGroup.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    ProvidedColumnGroup.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    ProvidedColumnGroup.EVENT_EXPANDED_CHANGED = 'expandedChanged';
    ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED = 'expandableChanged';
    __decorate([
        context_1.PreDestroy
    ], ProvidedColumnGroup.prototype, "destroy", null);
    return ProvidedColumnGroup;
}());
exports.ProvidedColumnGroup = ProvidedColumnGroup;
