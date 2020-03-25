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
import { Autowired, Bean } from "../context/context";
import { CellComp } from "./cellComp";
import { _ } from "../utils";
var AutoHeightCalculator = /** @class */ (function () {
    function AutoHeightCalculator() {
    }
    AutoHeightCalculator.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    AutoHeightCalculator.prototype.getPreferredHeightForRow = function (rowNode) {
        var _this = this;
        if (!this.eDummyContainer) {
            this.eDummyContainer = document.createElement('div');
            // so any styles on row also get applied in dummy, otherwise
            // the content in dummy may differ to the real
            _.addCssClass(this.eDummyContainer, 'ag-row ag-row-no-focus');
        }
        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        var eBodyContainer = this.gridPanel.getCenterContainer();
        eBodyContainer.appendChild(this.eDummyContainer);
        var cellComps = [];
        var autoRowHeightCols = this.columnController.getAllAutoRowHeightCols();
        var visibleAutoRowHeightCols = autoRowHeightCols.filter(function (col) { return col.isVisible(); });
        visibleAutoRowHeightCols.forEach(function (col) {
            var cellComp = new CellComp(_this.$scope, _this.beans, col, rowNode, null, true, false);
            cellComp.setParentRow(_this.eDummyContainer);
            cellComps.push(cellComp);
        });
        var template = cellComps.map(function (cellComp) { return cellComp.getCreateTemplate(); }).join(' ');
        this.eDummyContainer.innerHTML = template;
        // this gets any cellComps that are using components to put the components in
        cellComps.forEach(function (cellComp) { return cellComp.afterAttached(); });
        // we should be able to just take the height of the row at this point, however
        // the row isn't expanding to cover the cell heights, i don't know why, i couldn't
        // figure it out so instead looking at the individual cells instead
        var maxCellHeight = 0;
        for (var i = 0; i < this.eDummyContainer.children.length; i++) {
            var child = this.eDummyContainer.children[i];
            if (child.offsetHeight > maxCellHeight) {
                maxCellHeight = child.offsetHeight;
            }
        }
        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(this.eDummyContainer);
        cellComps.forEach(function (cellComp) {
            // dunno why we need to detach first, doing it here to be consistent with code in RowComp
            cellComp.detach();
            cellComp.destroy();
        });
        // in case anything left over from last time
        _.clearElement(this.eDummyContainer);
        return maxCellHeight;
    };
    __decorate([
        Autowired('beans')
    ], AutoHeightCalculator.prototype, "beans", void 0);
    __decorate([
        Autowired("$scope")
    ], AutoHeightCalculator.prototype, "$scope", void 0);
    __decorate([
        Autowired("columnController")
    ], AutoHeightCalculator.prototype, "columnController", void 0);
    AutoHeightCalculator = __decorate([
        Bean('autoHeightCalculator')
    ], AutoHeightCalculator);
    return AutoHeightCalculator;
}());
export { AutoHeightCalculator };
