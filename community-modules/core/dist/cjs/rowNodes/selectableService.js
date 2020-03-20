/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var SelectableService = /** @class */ (function () {
    function SelectableService() {
    }
    SelectableService.prototype.init = function () {
        this.groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
        this.isRowSelectableFunc = this.gridOptionsWrapper.getIsRowSelectableFunc();
    };
    SelectableService.prototype.updateSelectableAfterGrouping = function (rowNode) {
        if (this.isRowSelectableFunc) {
            var nextChildrenFunc = function (rowNode) { return rowNode.childrenAfterGroup; };
            this.recurseDown(rowNode.childrenAfterGroup, nextChildrenFunc);
        }
    };
    SelectableService.prototype.updateSelectableAfterFiltering = function (rowNode) {
        if (this.isRowSelectableFunc) {
            var nextChildrenFunc = function (rowNode) { return rowNode.childrenAfterFilter; };
            this.recurseDown(rowNode.childrenAfterGroup, nextChildrenFunc);
        }
    };
    SelectableService.prototype.recurseDown = function (children, nextChildrenFunc) {
        var _this = this;
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
                var firstSelectable = utils_1._.find(nextChildrenFunc(child), 'selectable', true);
                rowSelectable = utils_1._.exists(firstSelectable);
            }
            else {
                // directly retrieve selectable value from user callback
                rowSelectable = _this.isRowSelectableFunc ? _this.isRowSelectableFunc(child) : false;
            }
            child.setRowSelectable(rowSelectable);
        });
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], SelectableService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct
    ], SelectableService.prototype, "init", null);
    SelectableService = __decorate([
        context_1.Bean('selectableService')
    ], SelectableService);
    return SelectableService;
}());
exports.SelectableService = SelectableService;

//# sourceMappingURL=selectableService.js.map
