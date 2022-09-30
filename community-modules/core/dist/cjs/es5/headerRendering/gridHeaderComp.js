/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
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
var component_1 = require("../widgets/component");
var gridHeaderCtrl_1 = require("./gridHeaderCtrl");
var headerRowContainerComp_1 = require("./rowContainer/headerRowContainerComp");
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
        var ctrl = this.createManagedBean(new gridHeaderCtrl_1.GridHeaderCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.getFocusableElement());
        var addContainer = function (container) {
            _this.createManagedBean(container);
            _this.appendChild(container);
        };
        addContainer(new headerRowContainerComp_1.HeaderRowContainerComp(constants_1.Constants.PINNED_LEFT));
        addContainer(new headerRowContainerComp_1.HeaderRowContainerComp(null));
        addContainer(new headerRowContainerComp_1.HeaderRowContainerComp(constants_1.Constants.PINNED_RIGHT));
    };
    GridHeaderComp.TEMPLATE = "<div class=\"ag-header\" role=\"presentation\"/>";
    __decorate([
        context_1.PostConstruct
    ], GridHeaderComp.prototype, "postConstruct", null);
    return GridHeaderComp;
}(component_1.Component));
exports.GridHeaderComp = GridHeaderComp;
