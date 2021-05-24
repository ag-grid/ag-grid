/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var generic_1 = require("../utils/generic");
var SelectableService = /** @class */ (function (_super) {
    __extends(SelectableService, _super);
    function SelectableService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectableService.prototype.init = function () {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
    };
    SelectableService.prototype.updateSelectableAfterGrouping = function (rowNode) {
        if (this.isRowSelectableFunc) {
            var nextChildrenFunc = function (node) { return node.childrenAfterGroup; };
            this.recurseDown(rowNode.childrenAfterGroup, nextChildrenFunc);
        }
    };
    SelectableService.prototype.updateSelectableAfterFiltering = function (rowNode) {
        if (this.isRowSelectableFunc) {
            var nextChildrenFunc = function (node) { return node.childrenAfterFilter; };
            this.recurseDown(rowNode.childrenAfterGroup, nextChildrenFunc);
        }
    };
    SelectableService.prototype.recurseDown = function (children, nextChildrenFunc) {
        var _this = this;
        if (!children) {
            return;
        }
        children.forEach(function (child) {
            if (!child.group) {
                return;
            } // only interested in groups
            if (child.hasChildren()) {
                _this.recurseDown(nextChildrenFunc(child), nextChildrenFunc);
            }
            var rowSelectable;
            if (_this.groupSelectsChildren) {
                // have this group selectable if at least one direct child is selectable
                var firstSelectable = generic_1.find(nextChildrenFunc(child), 'selectable', true);
                rowSelectable = generic_1.exists(firstSelectable);
            }
            else {
                // directly retrieve selectable value from user callback
                rowSelectable = _this.isRowSelectableFunc ? _this.isRowSelectableFunc(child) : false;
            }
            child.setRowSelectable(rowSelectable);
        });
    };
    __decorate([
        context_1.PostConstruct
    ], SelectableService.prototype, "init", null);
    SelectableService = __decorate([
        context_1.Bean('selectableService')
    ], SelectableService);
    return SelectableService;
}(beanStub_1.BeanStub));
exports.SelectableService = SelectableService;

//# sourceMappingURL=selectableService.js.map
