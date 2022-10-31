/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
const constants_1 = require("../constants/constants");
const context_1 = require("../context/context");
const gridOptionsWrapper_1 = require("../gridOptionsWrapper");
const beanStub_1 = require("../context/beanStub");
var LayoutCssClasses;
(function (LayoutCssClasses) {
    LayoutCssClasses["AUTO_HEIGHT"] = "ag-layout-auto-height";
    LayoutCssClasses["NORMAL"] = "ag-layout-normal";
    LayoutCssClasses["PRINT"] = "ag-layout-print";
})(LayoutCssClasses = exports.LayoutCssClasses || (exports.LayoutCssClasses = {}));
class LayoutFeature extends beanStub_1.BeanStub {
    constructor(view) {
        super();
        this.view = view;
    }
    postConstruct() {
        this.addManagedListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }
    updateLayoutClasses() {
        const domLayout = this.gridOptionsWrapper.getDomLayout();
        const params = {
            autoHeight: domLayout === constants_1.Constants.DOM_LAYOUT_AUTO_HEIGHT,
            normal: domLayout === constants_1.Constants.DOM_LAYOUT_NORMAL,
            print: domLayout === constants_1.Constants.DOM_LAYOUT_PRINT
        };
        const cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }
}
__decorate([
    context_1.Autowired('gridOptionsWrapper')
], LayoutFeature.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.PostConstruct
], LayoutFeature.prototype, "postConstruct", null);
exports.LayoutFeature = LayoutFeature;
