/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("../../../context/beanStub");
var context_1 = require("../../../context/context");
var column_1 = require("../../../entities/column");
var columnGroup_1 = require("../../../entities/columnGroup");
var GroupWidthFeature = /** @class */ (function (_super) {
    __extends(GroupWidthFeature, _super);
    function GroupWidthFeature(comp, columnGroup) {
        var _this = _super.call(this) || this;
        // the children can change, we keep destroy functions related to listening to the children here
        _this.removeChildListenersFuncs = [];
        _this.columnGroup = columnGroup;
        _this.comp = comp;
        return _this;
    }
    GroupWidthFeature.prototype.postConstruct = function () {
        // we need to listen to changes in child columns, as they impact our width
        this.addListenersToChildrenColumns();
        // the children belonging to this group can change, so we need to add and remove listeners as they change
        this.addManagedListener(this.columnGroup, columnGroup_1.ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));
        this.onWidthChanged();
        // the child listeners are not tied to this components life-cycle, as children can get added and removed
        // to the group - hence they are on a different life-cycle. so we must make sure the existing children
        // listeners are removed when we finally get destroyed
        this.addDestroyFunc(this.removeListenersOnChildrenColumns.bind(this));
    };
    GroupWidthFeature.prototype.addListenersToChildrenColumns = function () {
        var _this = this;
        // first destroy any old listeners
        this.removeListenersOnChildrenColumns();
        // now add new listeners to the new set of children
        var widthChangedListener = this.onWidthChanged.bind(this);
        this.columnGroup.getLeafColumns().forEach(function (column) {
            column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            column.addEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            _this.removeChildListenersFuncs.push(function () {
                column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                column.removeEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            });
        });
    };
    GroupWidthFeature.prototype.removeListenersOnChildrenColumns = function () {
        this.removeChildListenersFuncs.forEach(function (func) { return func(); });
        this.removeChildListenersFuncs = [];
    };
    GroupWidthFeature.prototype.onDisplayedChildrenChanged = function () {
        this.addListenersToChildrenColumns();
        this.onWidthChanged();
    };
    GroupWidthFeature.prototype.onWidthChanged = function () {
        this.comp.setWidth(this.columnGroup.getActualWidth() + 'px');
    };
    __decorate([
        context_1.PostConstruct
    ], GroupWidthFeature.prototype, "postConstruct", null);
    return GroupWidthFeature;
}(beanStub_1.BeanStub));
exports.GroupWidthFeature = GroupWidthFeature;
