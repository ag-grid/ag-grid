/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.LayoutFeature = exports.LayoutCssClasses = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var function_1 = require("../utils/function");
var LayoutCssClasses;
(function (LayoutCssClasses) {
    LayoutCssClasses["AUTO_HEIGHT"] = "ag-layout-auto-height";
    LayoutCssClasses["NORMAL"] = "ag-layout-normal";
    LayoutCssClasses["PRINT"] = "ag-layout-print";
})(LayoutCssClasses = exports.LayoutCssClasses || (exports.LayoutCssClasses = {}));
var LayoutFeature = /** @class */ (function (_super) {
    __extends(LayoutFeature, _super);
    function LayoutFeature(view) {
        var _this = _super.call(this) || this;
        _this.view = view;
        return _this;
    }
    LayoutFeature.prototype.postConstruct = function () {
        this.addManagedPropertyListener('domLayout', this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    };
    LayoutFeature.prototype.updateLayoutClasses = function () {
        var domLayout = this.getDomLayout();
        var params = {
            autoHeight: domLayout === 'autoHeight',
            normal: domLayout === 'normal',
            print: domLayout === 'print'
        };
        var cssClass = params.autoHeight ? LayoutCssClasses.AUTO_HEIGHT :
            params.print ? LayoutCssClasses.PRINT : LayoutCssClasses.NORMAL;
        this.view.updateLayoutClasses(cssClass, params);
    };
    // returns either 'print', 'autoHeight' or 'normal' (normal is the default)
    LayoutFeature.prototype.getDomLayout = function () {
        var _a;
        var domLayout = (_a = this.gridOptionsService.get('domLayout')) !== null && _a !== void 0 ? _a : 'normal';
        var validLayouts = ['normal', 'print', 'autoHeight'];
        if (validLayouts.indexOf(domLayout) === -1) {
            function_1.doOnce(function () {
                return console.warn("AG Grid: " + domLayout + " is not valid for DOM Layout, valid values are 'normal', 'autoHeight', 'print'.");
            }, 'warn about dom layout values');
            return 'normal';
        }
        return domLayout;
    };
    __decorate([
        context_1.PostConstruct
    ], LayoutFeature.prototype, "postConstruct", null);
    return LayoutFeature;
}(beanStub_1.BeanStub));
exports.LayoutFeature = LayoutFeature;
