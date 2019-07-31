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
var column_1 = require("./column");
var eventService_1 = require("../eventService");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnApi_1 = require("../columnController/columnApi");
var gridApi_1 = require("../gridApi");
var utils_1 = require("../utils");
var ColumnGroup = /** @class */ (function () {
    function ColumnGroup(originalColumnGroup, groupId, instanceId, pinned) {
        // depends on the open/closed state of the group, only displaying columns are stored here
        this.displayedChildren = [];
        this.localEventService = new eventService_1.EventService();
        this.groupId = groupId;
        this.instanceId = instanceId;
        this.originalColumnGroup = originalColumnGroup;
        this.pinned = pinned;
    }
    // this is static, a it is used outside of this class
    ColumnGroup.createUniqueId = function (groupId, instanceId) {
        return groupId + '_' + instanceId;
    };
    // as the user is adding and removing columns, the groups are recalculated.
    // this reset clears out all children, ready for children to be added again
    ColumnGroup.prototype.reset = function () {
        this.parent = null;
        this.children = null;
        this.displayedChildren = null;
    };
    ColumnGroup.prototype.getParent = function () {
        return this.parent;
    };
    ColumnGroup.prototype.setParent = function (parent) {
        this.parent = parent;
    };
    ColumnGroup.prototype.getUniqueId = function () {
        return ColumnGroup.createUniqueId(this.groupId, this.instanceId);
    };
    ColumnGroup.prototype.isEmptyGroup = function () {
        return this.displayedChildren.length === 0;
    };
    ColumnGroup.prototype.isMoving = function () {
        var allLeafColumns = this.getOriginalColumnGroup().getLeafColumns();
        if (!allLeafColumns || allLeafColumns.length === 0) {
            return false;
        }
        var allMoving = true;
        allLeafColumns.forEach(function (col) {
            if (!col.isMoving()) {
                allMoving = false;
            }
        });
        return allMoving;
    };
    ColumnGroup.prototype.checkLeft = function () {
        // first get all children to setLeft, as it impacts our decision below
        this.displayedChildren.forEach(function (child) {
            if (child instanceof ColumnGroup) {
                child.checkLeft();
            }
        });
        // set our left based on first displayed column
        if (this.displayedChildren.length > 0) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                var lastChild = utils_1._.last(this.displayedChildren);
                var lastChildLeft = lastChild.getLeft();
                this.setLeft(lastChildLeft);
            }
            else {
                var firstChildLeft = this.displayedChildren[0].getLeft();
                this.setLeft(firstChildLeft);
            }
        }
        else {
            // this should never happen, as if we have no displayed columns, then
            // this groups should not even exist.
            this.setLeft(null);
        }
    };
    ColumnGroup.prototype.getLeft = function () {
        return this.left;
    };
    ColumnGroup.prototype.getOldLeft = function () {
        return this.oldLeft;
    };
    ColumnGroup.prototype.setLeft = function (left) {
        this.oldLeft = left;
        if (this.left !== left) {
            this.left = left;
            this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_LEFT_CHANGED));
        }
    };
    ColumnGroup.prototype.getPinned = function () {
        return this.pinned;
    };
    ColumnGroup.prototype.createAgEvent = function (type) {
        return {
            type: type,
        };
    };
    ColumnGroup.prototype.addEventListener = function (eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    };
    ColumnGroup.prototype.removeEventListener = function (eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    };
    ColumnGroup.prototype.getGroupId = function () {
        return this.groupId;
    };
    ColumnGroup.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    ColumnGroup.prototype.isChildInThisGroupDeepSearch = function (wantedChild) {
        var result = false;
        this.children.forEach(function (foundChild) {
            if (wantedChild === foundChild) {
                result = true;
            }
            if (foundChild instanceof ColumnGroup) {
                if (foundChild.isChildInThisGroupDeepSearch(wantedChild)) {
                    result = true;
                }
            }
        });
        return result;
    };
    ColumnGroup.prototype.getActualWidth = function () {
        var groupActualWidth = 0;
        if (this.displayedChildren) {
            this.displayedChildren.forEach(function (child) {
                groupActualWidth += child.getActualWidth();
            });
        }
        return groupActualWidth;
    };
    ColumnGroup.prototype.isResizable = function () {
        if (!this.displayedChildren) {
            return false;
        }
        // if at least one child is resizable, then the group is resizable
        var result = false;
        this.displayedChildren.forEach(function (child) {
            if (child.isResizable()) {
                result = true;
            }
        });
        return result;
    };
    ColumnGroup.prototype.getMinWidth = function () {
        var result = 0;
        this.displayedChildren.forEach(function (groupChild) {
            result += groupChild.getMinWidth();
        });
        return result;
    };
    ColumnGroup.prototype.addChild = function (child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    };
    ColumnGroup.prototype.getDisplayedChildren = function () {
        return this.displayedChildren;
    };
    ColumnGroup.prototype.getLeafColumns = function () {
        var result = [];
        this.addLeafColumns(result);
        return result;
    };
    ColumnGroup.prototype.getDisplayedLeafColumns = function () {
        var result = [];
        this.addDisplayedLeafColumns(result);
        return result;
    };
    // why two methods here doing the same thing?
    ColumnGroup.prototype.getDefinition = function () {
        return this.originalColumnGroup.getColGroupDef();
    };
    ColumnGroup.prototype.getColGroupDef = function () {
        return this.originalColumnGroup.getColGroupDef();
    };
    ColumnGroup.prototype.isPadding = function () {
        return this.originalColumnGroup.isPadding();
    };
    ColumnGroup.prototype.isExpandable = function () {
        return this.originalColumnGroup.isExpandable();
    };
    ColumnGroup.prototype.isExpanded = function () {
        return this.originalColumnGroup.isExpanded();
    };
    ColumnGroup.prototype.setExpanded = function (expanded) {
        this.originalColumnGroup.setExpanded(expanded);
    };
    ColumnGroup.prototype.addDisplayedLeafColumns = function (leafColumns) {
        this.displayedChildren.forEach(function (child) {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addDisplayedLeafColumns(leafColumns);
            }
        });
    };
    ColumnGroup.prototype.addLeafColumns = function (leafColumns) {
        this.children.forEach(function (child) {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    };
    ColumnGroup.prototype.getChildren = function () {
        return this.children;
    };
    ColumnGroup.prototype.getColumnGroupShow = function () {
        return this.originalColumnGroup.getColumnGroupShow();
    };
    ColumnGroup.prototype.getOriginalColumnGroup = function () {
        return this.originalColumnGroup;
    };
    ColumnGroup.prototype.calculateDisplayedColumns = function () {
        var _this = this;
        // clear out last time we calculated
        this.displayedChildren = [];
        var topLevelGroup = this;
        // find the column group that is controlling expandable. this is relevant when we have padding (empty)
        // groups, where the expandable is actually the first parent that is not a padding group.
        if (this.isPadding()) {
            while (topLevelGroup.getParent() && topLevelGroup.isPadding()) {
                topLevelGroup = topLevelGroup.getParent();
            }
        }
        var isExpandable = topLevelGroup.originalColumnGroup.isExpandable();
        // it not expandable, everything is visible
        if (!isExpandable) {
            this.displayedChildren = this.children;
        }
        else {
            // Add cols based on columnGroupShow
            // Note - the below also adds padding groups, these are always added because they never have
            // colDef.columnGroupShow set.
            this.children.forEach(function (abstractColumn) {
                var headerGroupShow = abstractColumn.getColumnGroupShow();
                switch (headerGroupShow) {
                    case ColumnGroup.HEADER_GROUP_SHOW_OPEN:
                        // when set to open, only show col if group is open
                        if (topLevelGroup.originalColumnGroup.isExpanded()) {
                            _this.displayedChildren.push(abstractColumn);
                        }
                        break;
                    case ColumnGroup.HEADER_GROUP_SHOW_CLOSED:
                        // when set to open, only show col if group is open
                        if (!topLevelGroup.originalColumnGroup.isExpanded()) {
                            _this.displayedChildren.push(abstractColumn);
                        }
                        break;
                    default:
                        // default is always show the column
                        _this.displayedChildren.push(abstractColumn);
                        break;
                }
            });
        }
        this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED));
    };
    ColumnGroup.HEADER_GROUP_SHOW_OPEN = 'open';
    ColumnGroup.HEADER_GROUP_SHOW_CLOSED = 'closed';
    ColumnGroup.EVENT_LEFT_CHANGED = 'leftChanged';
    ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED = 'displayedChildrenChanged';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ColumnGroup.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], ColumnGroup.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], ColumnGroup.prototype, "gridApi", void 0);
    return ColumnGroup;
}());
exports.ColumnGroup = ColumnGroup;
