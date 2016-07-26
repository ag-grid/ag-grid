/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("../context/context");
var utils_1 = require('../utils');
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var eventService_1 = require("../eventService");
var expressionService_1 = require("../expressionService");
var animateSlideCellRenderer_1 = require("./cellRenderers/animateSlideCellRenderer");
var animateShowChangeCellRenderer_1 = require("./cellRenderers/animateShowChangeCellRenderer");
var groupCellRenderer_1 = require("./cellRenderers/groupCellRenderer");
var CellRendererFactory = (function () {
    function CellRendererFactory() {
        this.cellRendererMap = {};
    }
    CellRendererFactory.prototype.init = function () {
        this.cellRendererMap[CellRendererFactory.ANIMATE_SLIDE] = animateSlideCellRenderer_1.AnimateSlideCellRenderer;
        this.cellRendererMap[CellRendererFactory.ANIMATE_SHOW_CHANGE] = animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer;
        this.cellRendererMap[CellRendererFactory.GROUP] = groupCellRenderer_1.GroupCellRenderer;
        // this.registerRenderersFromGridOptions();
    };
    // private registerRenderersFromGridOptions(): void {
    //     var userProvidedCellRenderers = this.gridOptionsWrapper.getCellRenderers();
    //     _.iterateObject(userProvidedCellRenderers, (key: string, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc)=> {
    //         this.addCellRenderer(key, cellRenderer);
    //     });
    // }
    CellRendererFactory.prototype.addCellRenderer = function (key, cellRenderer) {
        this.cellRendererMap[key] = cellRenderer;
    };
    CellRendererFactory.prototype.getCellRenderer = function (key) {
        var result = this.cellRendererMap[key];
        if (utils_1.Utils.missing(result)) {
            console.warn('ag-Grid: unable to find cellRenderer for key ' + key);
            return null;
        }
        return result;
    };
    CellRendererFactory.ANIMATE_SLIDE = 'animateSlide';
    CellRendererFactory.ANIMATE_SHOW_CHANGE = 'animateShowChange';
    CellRendererFactory.GROUP = 'group';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], CellRendererFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'), 
        __metadata('design:type', expressionService_1.ExpressionService)
    ], CellRendererFactory.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], CellRendererFactory.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], CellRendererFactory.prototype, "init", null);
    CellRendererFactory = __decorate([
        context_1.Bean('cellRendererFactory'), 
        __metadata('design:paramtypes', [])
    ], CellRendererFactory);
    return CellRendererFactory;
})();
exports.CellRendererFactory = CellRendererFactory;
