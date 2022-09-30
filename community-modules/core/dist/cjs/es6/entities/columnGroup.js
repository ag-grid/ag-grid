/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const column_1 = require("./column");
const eventService_1 = require("../eventService");
const context_1 = require("../context/context");
const array_1 = require("../utils/array");
class ColumnGroup {
    constructor(providedColumnGroup, groupId, instanceId, pinned) {
        // depends on the open/closed state of the group, only displaying columns are stored here
        this.displayedChildren = [];
        this.localEventService = new eventService_1.EventService();
        this.groupId = groupId;
        this.instanceId = instanceId;
        this.providedColumnGroup = providedColumnGroup;
        this.pinned = pinned;
    }
    // this is static, a it is used outside of this class
    static createUniqueId(groupId, instanceId) {
        return groupId + '_' + instanceId;
    }
    // as the user is adding and removing columns, the groups are recalculated.
    // this reset clears out all children, ready for children to be added again
    reset() {
        this.parent = null;
        this.children = null;
        this.displayedChildren = null;
    }
    getParent() {
        return this.parent;
    }
    setParent(parent) {
        this.parent = parent;
    }
    getUniqueId() {
        return ColumnGroup.createUniqueId(this.groupId, this.instanceId);
    }
    isEmptyGroup() {
        return this.displayedChildren.length === 0;
    }
    isMoving() {
        const allLeafColumns = this.getProvidedColumnGroup().getLeafColumns();
        if (!allLeafColumns || allLeafColumns.length === 0) {
            return false;
        }
        return allLeafColumns.every(col => col.isMoving());
    }
    checkLeft() {
        // first get all children to setLeft, as it impacts our decision below
        this.displayedChildren.forEach((child) => {
            if (child instanceof ColumnGroup) {
                child.checkLeft();
            }
        });
        // set our left based on first displayed column
        if (this.displayedChildren.length > 0) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                const lastChild = array_1.last(this.displayedChildren);
                const lastChildLeft = lastChild.getLeft();
                this.setLeft(lastChildLeft);
            }
            else {
                const firstChildLeft = this.displayedChildren[0].getLeft();
                this.setLeft(firstChildLeft);
            }
        }
        else {
            // this should never happen, as if we have no displayed columns, then
            // this groups should not even exist.
            this.setLeft(null);
        }
    }
    getLeft() {
        return this.left;
    }
    getOldLeft() {
        return this.oldLeft;
    }
    setLeft(left) {
        this.oldLeft = left;
        if (this.left !== left) {
            this.left = left;
            this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_LEFT_CHANGED));
        }
    }
    getPinned() {
        return this.pinned;
    }
    createAgEvent(type) {
        return { type };
    }
    addEventListener(eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    }
    removeEventListener(eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    }
    getGroupId() {
        return this.groupId;
    }
    getInstanceId() {
        return this.instanceId;
    }
    isChildInThisGroupDeepSearch(wantedChild) {
        let result = false;
        this.children.forEach((foundChild) => {
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
    }
    getActualWidth() {
        let groupActualWidth = 0;
        if (this.displayedChildren) {
            this.displayedChildren.forEach((child) => {
                groupActualWidth += child.getActualWidth();
            });
        }
        return groupActualWidth;
    }
    isResizable() {
        if (!this.displayedChildren) {
            return false;
        }
        // if at least one child is resizable, then the group is resizable
        let result = false;
        this.displayedChildren.forEach((child) => {
            if (child.isResizable()) {
                result = true;
            }
        });
        return result;
    }
    getMinWidth() {
        let result = 0;
        this.displayedChildren.forEach((groupChild) => {
            result += groupChild.getMinWidth() || 0;
        });
        return result;
    }
    addChild(child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }
    getDisplayedChildren() {
        return this.displayedChildren;
    }
    getLeafColumns() {
        const result = [];
        this.addLeafColumns(result);
        return result;
    }
    getDisplayedLeafColumns() {
        const result = [];
        this.addDisplayedLeafColumns(result);
        return result;
    }
    // why two methods here doing the same thing?
    getDefinition() {
        return this.providedColumnGroup.getColGroupDef();
    }
    getColGroupDef() {
        return this.providedColumnGroup.getColGroupDef();
    }
    isPadding() {
        return this.providedColumnGroup.isPadding();
    }
    isExpandable() {
        return this.providedColumnGroup.isExpandable();
    }
    isExpanded() {
        return this.providedColumnGroup.isExpanded();
    }
    setExpanded(expanded) {
        this.providedColumnGroup.setExpanded(expanded);
    }
    addDisplayedLeafColumns(leafColumns) {
        this.displayedChildren.forEach((child) => {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addDisplayedLeafColumns(leafColumns);
            }
        });
    }
    addLeafColumns(leafColumns) {
        this.children.forEach((child) => {
            if (child instanceof column_1.Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    }
    getChildren() {
        return this.children;
    }
    getColumnGroupShow() {
        return this.providedColumnGroup.getColumnGroupShow();
    }
    getProvidedColumnGroup() {
        return this.providedColumnGroup;
    }
    /** @deprecated getOriginalColumnGroup is deprecated, use getOriginalColumnGroup. */
    getOriginalColumnGroup() {
        console.warn('AG Grid: columnGroup.getOriginalColumnGroup() is deprecated due to a method rename, use columnGroup.getProvidedColumnGroup() instead');
        return this.getProvidedColumnGroup();
    }
    getPaddingLevel() {
        const parent = this.getParent();
        if (!this.isPadding() || !parent || !parent.isPadding()) {
            return 0;
        }
        return 1 + parent.getPaddingLevel();
    }
    calculateDisplayedColumns() {
        // clear out last time we calculated
        this.displayedChildren = [];
        // find the column group that is controlling expandable. this is relevant when we have padding (empty)
        // groups, where the expandable is actually the first parent that is not a padding group.
        let parentWithExpansion = this;
        while (parentWithExpansion != null && parentWithExpansion.isPadding()) {
            parentWithExpansion = parentWithExpansion.getParent();
        }
        const isExpandable = parentWithExpansion ? parentWithExpansion.providedColumnGroup.isExpandable() : false;
        // it not expandable, everything is visible
        if (!isExpandable) {
            this.displayedChildren = this.children;
            this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED));
            return;
        }
        // Add cols based on columnGroupShow
        // Note - the below also adds padding groups, these are always added because they never have
        // colDef.columnGroupShow set.
        this.children.forEach(child => {
            // never add empty groups
            const emptyGroup = child instanceof ColumnGroup && (!child.displayedChildren || !child.displayedChildren.length);
            if (emptyGroup) {
                return;
            }
            const headerGroupShow = child.getColumnGroupShow();
            switch (headerGroupShow) {
                case ColumnGroup.HEADER_GROUP_SHOW_OPEN:
                    // when set to open, only show col if group is open
                    if (parentWithExpansion.providedColumnGroup.isExpanded()) {
                        this.displayedChildren.push(child);
                    }
                    break;
                case ColumnGroup.HEADER_GROUP_SHOW_CLOSED:
                    // when set to open, only show col if group is open
                    if (!parentWithExpansion.providedColumnGroup.isExpanded()) {
                        this.displayedChildren.push(child);
                    }
                    break;
                default:
                    this.displayedChildren.push(child);
                    break;
            }
        });
        this.localEventService.dispatchEvent(this.createAgEvent(ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED));
    }
}
ColumnGroup.HEADER_GROUP_SHOW_OPEN = 'open';
ColumnGroup.HEADER_GROUP_SHOW_CLOSED = 'closed';
ColumnGroup.EVENT_LEFT_CHANGED = 'leftChanged';
ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED = 'displayedChildrenChanged';
__decorate([
    context_1.Autowired('gridOptionsWrapper')
], ColumnGroup.prototype, "gridOptionsWrapper", void 0);
exports.ColumnGroup = ColumnGroup;
