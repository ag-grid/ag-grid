/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Constants } from "../constants/constants";
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { BeanStub } from "../context/beanStub";
export var LayoutCssClasses;
(function (LayoutCssClasses) {
    LayoutCssClasses["AUTO_HEIGHT"] = "ag-layout-auto-height";
    LayoutCssClasses["NORMAL"] = "ag-layout-normal";
    LayoutCssClasses["PRINT"] = "ag-layout-print";
})(LayoutCssClasses || (LayoutCssClasses = {}));
export class LayoutFeature extends BeanStub {
    constructor(view) {
        super();
        this.view = view;
    }
    postConstruct() {
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }
    updateLayoutClasses() {
        const domLayout = this.gridOptionsWrapper.getDomLayout();
        const params = {
            autoHeight: domLayout === Constants.DOM_LAYOUT_AUTO_HEIGHT,
            normal: domLayout === Constants.DOM_LAYOUT_NORMAL,
            print: domLayout === Constants.DOM_LAYOUT_PRINT
        };
        const cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }
}
__decorate([
    Autowired('gridOptionsWrapper')
], LayoutFeature.prototype, "gridOptionsWrapper", void 0);
__decorate([
    PostConstruct
], LayoutFeature.prototype, "postConstruct", null);
