/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, PostConstruct } from "../context/context";
import { _ } from "../utils";
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
                var firstSelectable = _.find(nextChildrenFunc(child), 'selectable', true);
                rowSelectable = _.exists(firstSelectable);
            }
            else {
                // directly retrieve selectable value from user callback
                rowSelectable = _this.isRowSelectableFunc ? _this.isRowSelectableFunc(child) : false;
            }
            child.setRowSelectable(rowSelectable);
        });
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], SelectableService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], SelectableService.prototype, "init", null);
    SelectableService = __decorate([
        Bean('selectableService')
    ], SelectableService);
    return SelectableService;
}());
export { SelectableService };
