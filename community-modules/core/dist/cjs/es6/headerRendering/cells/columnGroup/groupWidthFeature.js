/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.GroupWidthFeature = void 0;
const beanStub_1 = require("../../../context/beanStub");
const context_1 = require("../../../context/context");
const columnGroup_1 = require("../../../entities/columnGroup");
class GroupWidthFeature extends beanStub_1.BeanStub {
    constructor(comp, columnGroup) {
        super();
        // the children can change, we keep destroy functions related to listening to the children here
        this.removeChildListenersFuncs = [];
        this.columnGroup = columnGroup;
        this.comp = comp;
    }
    postConstruct() {
        // we need to listen to changes in child columns, as they impact our width
        this.addListenersToChildrenColumns();
        // the children belonging to this group can change, so we need to add and remove listeners as they change
        this.addManagedListener(this.columnGroup, columnGroup_1.ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));
        this.onWidthChanged();
        // the child listeners are not tied to this components life-cycle, as children can get added and removed
        // to the group - hence they are on a different life-cycle. so we must make sure the existing children
        // listeners are removed when we finally get destroyed
        this.addDestroyFunc(this.removeListenersOnChildrenColumns.bind(this));
    }
    addListenersToChildrenColumns() {
        // first destroy any old listeners
        this.removeListenersOnChildrenColumns();
        // now add new listeners to the new set of children
        const widthChangedListener = this.onWidthChanged.bind(this);
        this.columnGroup.getLeafColumns().forEach(column => {
            column.addEventListener('widthChanged', widthChangedListener);
            column.addEventListener('visibleChanged', widthChangedListener);
            this.removeChildListenersFuncs.push(() => {
                column.removeEventListener('widthChanged', widthChangedListener);
                column.removeEventListener('visibleChanged', widthChangedListener);
            });
        });
    }
    removeListenersOnChildrenColumns() {
        this.removeChildListenersFuncs.forEach(func => func());
        this.removeChildListenersFuncs = [];
    }
    onDisplayedChildrenChanged() {
        this.addListenersToChildrenColumns();
        this.onWidthChanged();
    }
    onWidthChanged() {
        const columnWidth = this.columnGroup.getActualWidth();
        this.comp.setWidth(`${columnWidth}px`);
        this.comp.addOrRemoveCssClass('ag-hidden', columnWidth === 0);
    }
}
__decorate([
    context_1.PostConstruct
], GroupWidthFeature.prototype, "postConstruct", null);
exports.GroupWidthFeature = GroupWidthFeature;
