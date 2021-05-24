/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var constants_1 = require("../constants/constants");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var beanStub_1 = require("../context/beanStub");
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
        this.addManagedListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    };
    LayoutFeature.prototype.updateLayoutClasses = function () {
        var domLayout = this.gridOptionsWrapper.getDomLayout();
        this.view.updateLayoutClasses({
            autoHeight: domLayout === constants_1.Constants.DOM_LAYOUT_AUTO_HEIGHT,
            normal: domLayout === constants_1.Constants.DOM_LAYOUT_NORMAL,
            print: domLayout === constants_1.Constants.DOM_LAYOUT_PRINT
        });
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], LayoutFeature.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct
    ], LayoutFeature.prototype, "postConstruct", null);
    return LayoutFeature;
}(beanStub_1.BeanStub));
exports.LayoutFeature = LayoutFeature;

//# sourceMappingURL=layoutFeature.js.map
