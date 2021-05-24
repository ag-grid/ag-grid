/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var LayoutFeature = /** @class */ (function (_super) {
    __extends(LayoutFeature, _super);
    function LayoutFeature(view) {
        var _this = _super.call(this) || this;
        _this.view = view;
        return _this;
    }
    LayoutFeature.prototype.postConstruct = function () {
        this.addManagedListener(this.gridOptionsWrapper, GridOptionsWrapper.PROP_DOM_LAYOUT, this.updateLayoutClasses.bind(this));
        this.updateLayoutClasses();
    };
    LayoutFeature.prototype.updateLayoutClasses = function () {
        var domLayout = this.gridOptionsWrapper.getDomLayout();
        this.view.updateLayoutClasses({
            autoHeight: domLayout === Constants.DOM_LAYOUT_AUTO_HEIGHT,
            normal: domLayout === Constants.DOM_LAYOUT_NORMAL,
            print: domLayout === Constants.DOM_LAYOUT_PRINT
        });
    };
    __decorate([
        Autowired('gridOptionsWrapper')
    ], LayoutFeature.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        PostConstruct
    ], LayoutFeature.prototype, "postConstruct", null);
    return LayoutFeature;
}(BeanStub));
export { LayoutFeature };
