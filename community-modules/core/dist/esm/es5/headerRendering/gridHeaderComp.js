/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
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
import { Constants } from '../constants/constants';
import { PostConstruct } from '../context/context';
import { Component } from '../widgets/component';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import { HeaderRowContainerComp } from './rowContainer/headerRowContainerComp';
var GridHeaderComp = /** @class */ (function (_super) {
    __extends(GridHeaderComp, _super);
    function GridHeaderComp() {
        return _super.call(this, GridHeaderComp.TEMPLATE) || this;
    }
    GridHeaderComp.prototype.postConstruct = function () {
        var _this = this;
        var compProxy = {
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            setHeightAndMinHeight: function (height) {
                _this.getGui().style.height = height;
                _this.getGui().style.minHeight = height;
            }
        };
        var ctrl = this.createManagedBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.getFocusableElement());
        var addContainer = function (container) {
            _this.createManagedBean(container);
            _this.appendChild(container);
        };
        addContainer(new HeaderRowContainerComp(Constants.PINNED_LEFT));
        addContainer(new HeaderRowContainerComp(null));
        addContainer(new HeaderRowContainerComp(Constants.PINNED_RIGHT));
    };
    GridHeaderComp.TEMPLATE = "<div class=\"ag-header\" role=\"presentation\"/>";
    __decorate([
        PostConstruct
    ], GridHeaderComp.prototype, "postConstruct", null);
    return GridHeaderComp;
}(Component));
export { GridHeaderComp };
