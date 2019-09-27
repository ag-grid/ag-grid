/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var columnApi_1 = require("../columnController/columnApi");
var columnController_1 = require("../columnController/columnController");
var gridApi_1 = require("../gridApi");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var expressionService_1 = require("../valueService/expressionService");
var rowRenderer_1 = require("./rowRenderer");
var templateService_1 = require("../templateService");
var valueService_1 = require("../valueService/valueService");
var eventService_1 = require("../eventService");
var columnAnimationService_1 = require("./columnAnimationService");
var focusedCellController_1 = require("../focusedCellController");
var cellRendererFactory_1 = require("./cellRendererFactory");
var popupService_1 = require("../widgets/popupService");
var valueFormatterService_1 = require("./valueFormatterService");
var stylingService_1 = require("../styling/stylingService");
var columnHoverService_1 = require("./columnHoverService");
var paginationProxy_1 = require("../rowModels/paginationProxy");
var animationFrameService_1 = require("../misc/animationFrameService");
var userComponentFactory_1 = require("../components/framework/userComponentFactory");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var sortController_1 = require("../sortController");
var filterManager_1 = require("../filter/filterManager");
var maxDivHeightScaler_1 = require("./maxDivHeightScaler");
var tooltipManager_1 = require("../widgets/tooltipManager");
var detailRowCompCache_1 = require("./detailRowCompCache");
var cellPosition_1 = require("../entities/cellPosition");
var rowPosition_1 = require("../entities/rowPosition");
/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
var Beans = /** @class */ (function () {
    function Beans() {
    }
    Beans.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    Beans.prototype.postConstruct = function () {
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
    };
    __decorate([
        context_1.Autowired('paginationProxy'),
        __metadata("design:type", paginationProxy_1.PaginationProxy)
    ], Beans.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], Beans.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], Beans.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], Beans.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], Beans.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'),
        __metadata("design:type", expressionService_1.ExpressionService)
    ], Beans.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('rowRenderer'),
        __metadata("design:type", rowRenderer_1.RowRenderer)
    ], Beans.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('$compile'),
        __metadata("design:type", Object)
    ], Beans.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('templateService'),
        __metadata("design:type", templateService_1.TemplateService)
    ], Beans.prototype, "templateService", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], Beans.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], Beans.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], Beans.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService'),
        __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
    ], Beans.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Optional('rangeController'),
        __metadata("design:type", Object)
    ], Beans.prototype, "rangeController", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], Beans.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Optional('contextMenuFactory'),
        __metadata("design:type", Object)
    ], Beans.prototype, "contextMenuFactory", void 0);
    __decorate([
        context_1.Autowired('cellRendererFactory'),
        __metadata("design:type", cellRendererFactory_1.CellRendererFactory)
    ], Beans.prototype, "cellRendererFactory", void 0);
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], Beans.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService'),
        __metadata("design:type", valueFormatterService_1.ValueFormatterService)
    ], Beans.prototype, "valueFormatterService", void 0);
    __decorate([
        context_1.Autowired('stylingService'),
        __metadata("design:type", stylingService_1.StylingService)
    ], Beans.prototype, "stylingService", void 0);
    __decorate([
        context_1.Autowired('columnHoverService'),
        __metadata("design:type", columnHoverService_1.ColumnHoverService)
    ], Beans.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('enterprise'),
        __metadata("design:type", Boolean)
    ], Beans.prototype, "enterprise", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory'),
        __metadata("design:type", userComponentFactory_1.UserComponentFactory)
    ], Beans.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('animationFrameService'),
        __metadata("design:type", animationFrameService_1.AnimationFrameService)
    ], Beans.prototype, "taskQueue", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], Beans.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('sortController'),
        __metadata("design:type", sortController_1.SortController)
    ], Beans.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], Beans.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('maxDivHeightScaler'),
        __metadata("design:type", maxDivHeightScaler_1.MaxDivHeightScaler)
    ], Beans.prototype, "maxDivHeightScaler", void 0);
    __decorate([
        context_1.Autowired('tooltipManager'),
        __metadata("design:type", tooltipManager_1.TooltipManager)
    ], Beans.prototype, "tooltipManager", void 0);
    __decorate([
        context_1.Autowired('frameworkOverrides'),
        __metadata("design:type", Object)
    ], Beans.prototype, "frameworkOverrides", void 0);
    __decorate([
        context_1.Autowired('detailRowCompCache'),
        __metadata("design:type", detailRowCompCache_1.DetailRowCompCache)
    ], Beans.prototype, "detailRowCompCache", void 0);
    __decorate([
        context_1.Autowired('cellPositionUtils'),
        __metadata("design:type", cellPosition_1.CellPositionUtils)
    ], Beans.prototype, "cellPositionUtils", void 0);
    __decorate([
        context_1.Autowired('rowPositionUtils'),
        __metadata("design:type", rowPosition_1.RowPositionUtils)
    ], Beans.prototype, "rowPositionUtils", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], Beans.prototype, "postConstruct", null);
    Beans = __decorate([
        context_1.Bean('beans')
    ], Beans);
    return Beans;
}());
exports.Beans = Beans;
