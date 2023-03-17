/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.LayoutFeature = exports.LayoutCssClasses = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const function_1 = require("../utils/function");
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
        this.addManagedPropertyListener('domLayout', this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    }
    updateLayoutClasses() {
        const domLayout = this.getDomLayout();
        const params = {
            autoHeight: domLayout === 'autoHeight',
            normal: domLayout === 'normal',
            print: domLayout === 'print'
        };
        const cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    }
    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    getDomLayout() {
        var _a;
        const domLayout = (_a = this.gridOptionsService.get('domLayout')) !== null && _a !== void 0 ? _a : 'normal';
        const validLayouts = ['normal', 'print', 'autoHeight'];
        if (validLayouts.indexOf(domLayout) === -1) {
            function_1.doOnce(() => console.warn(`AG Grid: ${domLayout} is not valid for DOM Layout, valid values are 'normal', 'autoHeight', 'print'.`), 'warn about dom layout values');
            return 'normal';
        }
        return domLayout;
    }
}
__decorate([
    context_1.PostConstruct
], LayoutFeature.prototype, "postConstruct", null);
exports.LayoutFeature = LayoutFeature;
