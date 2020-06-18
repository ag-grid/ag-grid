/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, PostConstruct, Autowired } from "../context/context";
import { AnimateSlideCellRenderer } from "./cellRenderers/animateSlideCellRenderer";
import { AnimateShowChangeCellRenderer } from "./cellRenderers/animateShowChangeCellRenderer";
import { GroupCellRenderer } from "./cellRenderers/groupCellRenderer";
import { _ } from '../utils';
var CellRendererFactory = /** @class */ (function () {
    function CellRendererFactory() {
        this.cellRendererMap = {};
    }
    CellRendererFactory_1 = CellRendererFactory;
    CellRendererFactory.prototype.init = function () {
        this.cellRendererMap[CellRendererFactory_1.ANIMATE_SLIDE] = AnimateSlideCellRenderer;
        this.cellRendererMap[CellRendererFactory_1.ANIMATE_SHOW_CHANGE] = AnimateShowChangeCellRenderer;
        this.cellRendererMap[CellRendererFactory_1.GROUP] = GroupCellRenderer;
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
        if (_.missing(result)) {
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
        Autowired('gridOptionsWrapper')
    ], CellRendererFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('expressionService')
    ], CellRendererFactory.prototype, "expressionService", void 0);
    __decorate([
        Autowired('eventService')
    ], CellRendererFactory.prototype, "eventService", void 0);
    __decorate([
        PostConstruct
    ], CellRendererFactory.prototype, "init", null);
    CellRendererFactory = CellRendererFactory_1 = __decorate([
        Bean('cellRendererFactory')
    ], CellRendererFactory);
    return CellRendererFactory;
}());
export { CellRendererFactory };
