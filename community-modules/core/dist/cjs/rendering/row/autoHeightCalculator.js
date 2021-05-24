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
var context_1 = require("../../context/context");
var cellComp_1 = require("../cellComp");
var beanStub_1 = require("../../context/beanStub");
var dom_1 = require("../../utils/dom");
var angularRowUtils_1 = require("./angularRowUtils");
var AutoHeightCalculator = /** @class */ (function (_super) {
    __extends(AutoHeightCalculator, _super);
    function AutoHeightCalculator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoHeightCalculator.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) {
            _this.centerRowContainerCon = p.centerRowContainerCon;
        });
    };
    AutoHeightCalculator.prototype.getPreferredHeightForRow = function (rowNode) {
        var _this = this;
        var eDummyContainer = document.createElement('div');
        this.addInRowCssClasses(rowNode, eDummyContainer);
        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        var eBodyContainer = this.centerRowContainerCon.getContainerElement();
        eBodyContainer.appendChild(eDummyContainer);
        var scopeResult = angularRowUtils_1.AngularRowUtils.createChildScopeOrNull(rowNode, this.$scope, this.beans.gridOptionsWrapper);
        var scope = scopeResult ? scopeResult.scope : undefined;
        var scopeDestroyFunc = scopeResult ? scopeResult.scopeDestroyFunc : undefined;
        var cellComps = [];
        var autoRowHeightCols = this.columnController.getAllAutoRowHeightCols();
        var displayedCols = this.columnController.getAllDisplayedColumns();
        var visibleAutoRowHeightCols = autoRowHeightCols.filter(function (col) { return displayedCols.indexOf(col) >= 0; });
        visibleAutoRowHeightCols.forEach(function (col) {
            var cellComp = new cellComp_1.CellComp(scope, _this.beans, col, rowNode, null, true, false, eDummyContainer, false);
            cellComps.push(cellComp);
        });
        cellComps.forEach(function (cellComp) { return eDummyContainer.appendChild(cellComp.getGui()); });
        if (scope) {
            this.$compile(eDummyContainer)(scope);
        }
        // we should be able to just take the height of the row at this point, however
        // the row isn't expanding to cover the cell heights, i don't know why, i couldn't
        // figure it out so instead looking at the individual cells instead
        var maxCellHeight = 0;
        for (var i = 0; i < eDummyContainer.children.length; i++) {
            var child = eDummyContainer.children[i];
            if (child.offsetHeight > maxCellHeight) {
                maxCellHeight = child.offsetHeight;
            }
        }
        // we are finished with the dummy container, so get rid of it
        eBodyContainer.removeChild(eDummyContainer);
        cellComps.forEach(function (cellComp) {
            // dunno why we need to detach first, doing it here to be consistent with code in RowComp
            cellComp.detach();
            cellComp.destroy();
        });
        if (scopeDestroyFunc) {
            scopeDestroyFunc();
        }
        return maxCellHeight;
    };
    AutoHeightCalculator.prototype.addInRowCssClasses = function (rowNode, eDummyContainer) {
        // so any styles on row also get applied in dummy, otherwise
        // the content in dummy may differ to the real
        var rowIndex = rowNode.rowIndex;
        var params = {
            rowNode: rowNode,
            rowIsEven: rowIndex % 2 === 0,
            rowLevel: this.rowCssClassCalculator.calculateRowLevel(rowNode),
            firstRowOnPage: rowIndex === this.beans.paginationProxy.getPageFirstRow(),
            lastRowOnPage: rowIndex === this.beans.paginationProxy.getPageLastRow(),
            printLayout: false,
            expandable: rowNode.isExpandable()
        };
        var classes = this.rowCssClassCalculator.getInitialRowClasses(params);
        dom_1.addCssClass(eDummyContainer, classes.join(' '));
    };
    __decorate([
        context_1.Autowired('beans')
    ], AutoHeightCalculator.prototype, "beans", void 0);
    __decorate([
        context_1.Autowired("$scope")
    ], AutoHeightCalculator.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired("columnController")
    ], AutoHeightCalculator.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired("rowCssClassCalculator")
    ], AutoHeightCalculator.prototype, "rowCssClassCalculator", void 0);
    __decorate([
        context_1.Autowired('$compile')
    ], AutoHeightCalculator.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('controllersService')
    ], AutoHeightCalculator.prototype, "controllersService", void 0);
    __decorate([
        context_1.PostConstruct
    ], AutoHeightCalculator.prototype, "postConstruct", null);
    AutoHeightCalculator = __decorate([
        context_1.Bean('autoHeightCalculator')
    ], AutoHeightCalculator);
    return AutoHeightCalculator;
}(beanStub_1.BeanStub));
exports.AutoHeightCalculator = AutoHeightCalculator;

//# sourceMappingURL=autoHeightCalculator.js.map
