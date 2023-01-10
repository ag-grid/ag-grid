/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
var CenterWidthFeature = /** @class */ (function (_super) {
    __extends(CenterWidthFeature, _super);
    function CenterWidthFeature(callback) {
        var _this = _super.call(this) || this;
        _this.callback = callback;
        return _this;
    }
    CenterWidthFeature.prototype.postConstruct = function () {
        var listener = this.setWidth.bind(this);
        this.addManagedPropertyListener('domLayout', listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);
        this.setWidth();
    };
    CenterWidthFeature.prototype.setWidth = function () {
        var columnModel = this.columnModel;
        var printLayout = this.gridOptionsService.isDomLayout('print');
        var centerWidth = columnModel.getBodyContainerWidth();
        var leftWidth = columnModel.getDisplayedColumnsLeftWidth();
        var rightWidth = columnModel.getDisplayedColumnsRightWidth();
        var totalWidth = printLayout ? centerWidth + leftWidth + rightWidth : centerWidth;
        this.callback(totalWidth);
    };
    __decorate([
        Autowired('columnModel')
    ], CenterWidthFeature.prototype, "columnModel", void 0);
    __decorate([
        PostConstruct
    ], CenterWidthFeature.prototype, "postConstruct", null);
    return CenterWidthFeature;
}(BeanStub));
export { CenterWidthFeature };
