/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Column, getNextColInstanceId } from "./column";
import { EventService } from "../eventService";
import { PreDestroy } from "../context/context";
export class ProvidedColumnGroup {
    constructor(colGroupDef, groupId, padding, level) {
        this.localEventService = new EventService();
        this.expandable = false;
        // used by React (and possibly other frameworks) as key for rendering. also used to
        // identify old vs new columns for destroying cols when no longer used.
        this.instanceId = getNextColInstanceId();
        this.expandableListenerRemoveCallback = null;
        this.colGroupDef = colGroupDef;
        this.groupId = groupId;
        this.expanded = !!colGroupDef && !!colGroupDef.openByDefault;
        this.padding = padding;
        this.level = level;
    }
    destroy() {
        if (this.expandableListenerRemoveCallback) {
            this.reset(null, undefined);
        }
    }
    reset(colGroupDef, level) {
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
    }
    getInstanceId() {
        return this.instanceId;
    }
    setOriginalParent(originalParent) {
        this.originalParent = originalParent;
    }
    getOriginalParent() {
        return this.originalParent;
    }
    getLevel() {
        return this.level;
    }
    isVisible() {
        // return true if at least one child is visible
        if (this.children) {
            return this.children.some(child => child.isVisible());
        }
        return false;
    }
    isPadding() {
        return this.padding;
    }
    setExpanded(expanded) {
        this.expanded = expanded === undefined ? false : expanded;
        const event = {
            type: ProvidedColumnGroup.EVENT_EXPANDED_CHANGED
        };
        this.localEventService.dispatchEvent(event);
    }
    isExpandable() {
        return this.expandable;
    }
    isExpanded() {
        return this.expanded;
    }
    getGroupId() {
        return this.groupId;
    }
    getId() {
        return this.getGroupId();
    }
    setChildren(children) {
        this.children = children;
    }
    getChildren() {
        return this.children;
    }
    getColGroupDef() {
        return this.colGroupDef;
    }
    getLeafColumns() {
        const result = [];
        this.addLeafColumns(result);
        return result;
    }
    addLeafColumns(leafColumns) {
        if (!this.children) {
            return;
        }
        this.children.forEach((child) => {
            if (child instanceof Column) {
                leafColumns.push(child);
            }
            else if (child instanceof ProvidedColumnGroup) {
                child.addLeafColumns(leafColumns);
            }
        });
    }
    getColumnGroupShow() {
        const colGroupDef = this.colGroupDef;
        if (!colGroupDef) {
            return;
        }
        return colGroupDef.columnGroupShow;
    }
    // need to check that this group has at least one col showing when both expanded and contracted.
    // if not, then we don't allow expanding and contracting on this group
    setupExpandable() {
        this.setExpandable();
        if (this.expandableListenerRemoveCallback) {
            this.expandableListenerRemoveCallback();
        }
        const listener = this.onColumnVisibilityChanged.bind(this);
        this.getLeafColumns().forEach(col => col.addEventListener('visibleChanged', listener));
        this.expandableListenerRemoveCallback = () => {
            this.getLeafColumns().forEach(col => col.removeEventListener('visibleChanged', listener));
            this.expandableListenerRemoveCallback = null;
        };
    }
    setExpandable() {
        if (this.isPadding()) {
            return;
        }
        // want to make sure the group doesn't disappear when it's open
        let atLeastOneShowingWhenOpen = false;
        // want to make sure the group doesn't disappear when it's closed
        let atLeastOneShowingWhenClosed = false;
        // want to make sure the group has something to show / hide
        let atLeastOneChangeable = false;
        const children = this.findChildrenRemovingPadding();
        for (let i = 0, j = children.length; i < j; i++) {
            const abstractColumn = children[i];
            if (!abstractColumn.isVisible()) {
                continue;
            }
            // if the abstractColumn is a grid generated group, there will be no colDef
            const headerGroupShow = abstractColumn.getColumnGroupShow();
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
        const expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
        if (this.expandable !== expandable) {
            this.expandable = expandable;
            const event = {
                type: ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED
            };
            this.localEventService.dispatchEvent(event);
        }
    }
    findChildrenRemovingPadding() {
        const res = [];
        const process = (items) => {
            items.forEach(item => {
                // if padding, we add this children instead of the padding
                const skipBecausePadding = item instanceof ProvidedColumnGroup && item.isPadding();
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
    }
    onColumnVisibilityChanged() {
        this.setExpandable();
    }
    addEventListener(eventType, listener) {
        this.localEventService.addEventListener(eventType, listener);
    }
    removeEventListener(eventType, listener) {
        this.localEventService.removeEventListener(eventType, listener);
    }
}
ProvidedColumnGroup.EVENT_EXPANDED_CHANGED = 'expandedChanged';
ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED = 'expandableChanged';
__decorate([
    PreDestroy
], ProvidedColumnGroup.prototype, "destroy", null);
