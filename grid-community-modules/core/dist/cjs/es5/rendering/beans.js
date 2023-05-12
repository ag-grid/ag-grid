/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
exports.Beans = void 0;
var context_1 = require("../context/context");
/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
var Beans = /** @class */ (function () {
    function Beans() {
    }
    Beans.prototype.postConstruct = function () {
        this.doingMasterDetail = this.gridOptionsService.isMasterDetail();
        if (this.gridOptionsService.isRowModelType('clientSide')) {
            this.clientSideRowModel = this.rowModel;
        }
        if (this.gridOptionsService.isRowModelType('serverSide')) {
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
        context_1.Autowired('gridOptionsService')
    ], Beans.prototype, "gridOptionsService", void 0);
    __decorate([
        context_1.Autowired('expressionService')
    ], Beans.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('environment')
    ], Beans.prototype, "environment", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], Beans.prototype, "rowRenderer", void 0);
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
        context_1.Autowired('columnModel')
    ], Beans.prototype, "columnModel", void 0);
    __decorate([
        context_1.Autowired('headerNavigationService')
    ], Beans.prototype, "headerNavigationService", void 0);
    __decorate([
        context_1.Autowired('navigationService')
    ], Beans.prototype, "navigationService", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService')
    ], Beans.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Optional('rangeService')
    ], Beans.prototype, "rangeService", void 0);
    __decorate([
        context_1.Autowired('focusService')
    ], Beans.prototype, "focusService", void 0);
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
        context_1.Autowired('userComponentRegistry')
    ], Beans.prototype, "userComponentRegistry", void 0);
    __decorate([
        context_1.Autowired('animationFrameService')
    ], Beans.prototype, "animationFrameService", void 0);
    __decorate([
        context_1.Autowired('dragService')
    ], Beans.prototype, "dragService", void 0);
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
        context_1.Autowired('cellPositionUtils')
    ], Beans.prototype, "cellPositionUtils", void 0);
    __decorate([
        context_1.Autowired('rowPositionUtils')
    ], Beans.prototype, "rowPositionUtils", void 0);
    __decorate([
        context_1.Autowired('selectionService')
    ], Beans.prototype, "selectionService", void 0);
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
        context_1.Autowired('ctrlsService')
    ], Beans.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.Autowired('ctrlsFactory')
    ], Beans.prototype, "ctrlsFactory", void 0);
    __decorate([
        context_1.Autowired('agStackComponentsRegistry')
    ], Beans.prototype, "agStackComponentsRegistry", void 0);
    __decorate([
        context_1.Autowired('valueCache')
    ], Beans.prototype, "valueCache", void 0);
    __decorate([
        context_1.Autowired('rowNodeEventThrottle')
    ], Beans.prototype, "rowNodeEventThrottle", void 0);
    __decorate([
        context_1.Autowired('localeService')
    ], Beans.prototype, "localeService", void 0);
    __decorate([
        context_1.PostConstruct
    ], Beans.prototype, "postConstruct", null);
    Beans = __decorate([
        context_1.Bean('beans')
    ], Beans);
    return Beans;
}());
exports.Beans = Beans;
