/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
var Beans = /** @class */ (function () {
    function Beans() {
    }
    Beans.prototype.registerGridComp = function (gridBodyComp) {
        this.gridBodyComp = gridBodyComp;
    };
    Beans.prototype.postConstruct = function () {
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel;
        }
        if (this.gridOptionsWrapper.isRowModelServerSide()) {
            this.serverSideRowModel = this.rowModel;
        }
    };
    __decorate([
        context_1.Autowired('resizeObserverService')
    ], Beans.prototype, "resizeObserverService", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], Beans.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('context')
    ], Beans.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], Beans.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], Beans.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], Beans.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService')
    ], Beans.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], Beans.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('$compile')
    ], Beans.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('templateService')
    ], Beans.prototype, "templateService", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], Beans.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], Beans.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], Beans.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('headerNavigationService')
    ], Beans.prototype, "headerNavigationService", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService')
    ], Beans.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Optional('rangeController')
    ], Beans.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('focusController')
    ], Beans.prototype, "focusController", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory')
    ], Beans.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Autowired('popupService')
    ], Beans.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService')
    ], Beans.prototype, "valueFormatterService", void 0);
    __decorate([
        context_1.Autowired('stylingService')
    ], Beans.prototype, "stylingService", void 0);
    __decorate([
        context_1.Autowired('columnHoverService')
    ], Beans.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], Beans.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('animationFrameService')
    ], Beans.prototype, "taskQueue", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], Beans.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('sortController')
    ], Beans.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('filterManager')
    ], Beans.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('rowContainerHeightService')
    ], Beans.prototype, "rowContainerHeightService", void 0);
    __decorate([
        context_1.Autowired('frameworkOverrides')
    ], Beans.prototype, "frameworkOverrides", void 0);
    __decorate([
        context_1.Autowired('detailRowCompCache')
    ], Beans.prototype, "detailRowCompCache", void 0);
    __decorate([
        context_1.Autowired('cellPositionUtils')
    ], Beans.prototype, "cellPositionUtils", void 0);
    __decorate([
        context_1.Autowired('rowPositionUtils')
    ], Beans.prototype, "rowPositionUtils", void 0);
    __decorate([
        context_1.Autowired('selectionController')
    ], Beans.prototype, "selectionController", void 0);
    __decorate([
        context_1.Optional('selectionHandleFactory')
    ], Beans.prototype, "selectionHandleFactory", void 0);
    __decorate([
        context_1.Autowired('rowCssClassCalculator')
    ], Beans.prototype, "rowCssClassCalculator", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], Beans.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('controllersService')
    ], Beans.prototype, "controllersService", void 0);
    __decorate([
        context_1.PostConstruct
    ], Beans.prototype, "postConstruct", null);
    Beans = __decorate([
        context_1.Bean('beans')
    ], Beans);
    return Beans;
}());
exports.Beans = Beans;

//# sourceMappingURL=beans.js.map
