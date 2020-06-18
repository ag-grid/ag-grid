/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
var animateSlideCellRenderer_1 = require("./cellRenderers/animateSlideCellRenderer");
var animateShowChangeCellRenderer_1 = require("./cellRenderers/animateShowChangeCellRenderer");
var groupCellRenderer_1 = require("./cellRenderers/groupCellRenderer");
var utils_1 = require("../utils");
var CellRendererFactory = /** @class */ (function () {
    function CellRendererFactory() {
        this.cellRendererMap = {};
    }
    CellRendererFactory_1 = CellRendererFactory;
    CellRendererFactory.prototype.init = function () {
        this.cellRendererMap[CellRendererFactory_1.ANIMATE_SLIDE] = animateSlideCellRenderer_1.AnimateSlideCellRenderer;
        this.cellRendererMap[CellRendererFactory_1.ANIMATE_SHOW_CHANGE] = animateShowChangeCellRenderer_1.AnimateShowChangeCellRenderer;
        this.cellRendererMap[CellRendererFactory_1.GROUP] = groupCellRenderer_1.GroupCellRenderer;
        // this.registerRenderersFromGridOptions();
    };
    // private registerRenderersFromGridOptions(): void {
    //     let userProvidedCellRenderers = this.gridOptionsWrapper.getCellRenderers();
    //     _.iterateObject(userProvidedCellRenderers, (key: string, cellRenderer: {new(): ICellRenderer} | ICellRendererFunc)=> {
    //         this.addCellRenderer(key, cellRenderer);
    //     });
    // }
    CellRendererFactory.prototype.addCellRenderer = function (key, cellRenderer) {
        this.cellRendererMap[key] = cellRenderer;
    };
    CellRendererFactory.prototype.getCellRenderer = function (key) {
        var result = this.cellRendererMap[key];
        if (utils_1._.missing(result)) {
            console.warn('ag-Grid: unable to find cellRenderer for key ' + key);
            return null;
        }
        return result;
    };
    var CellRendererFactory_1;
    CellRendererFactory.ANIMATE_SLIDE = 'animateSlide';
    CellRendererFactory.ANIMATE_SHOW_CHANGE = 'animateShowChange';
    CellRendererFactory.GROUP = 'group';
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], CellRendererFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService')
    ], CellRendererFactory.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('eventService')
    ], CellRendererFactory.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct
    ], CellRendererFactory.prototype, "init", null);
    CellRendererFactory = CellRendererFactory_1 = __decorate([
        context_1.Bean('cellRendererFactory')
    ], CellRendererFactory);
    return CellRendererFactory;
}());
exports.CellRendererFactory = CellRendererFactory;

//# sourceMappingURL=cellRendererFactory.js.map
