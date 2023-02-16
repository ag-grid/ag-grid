/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.HeaderFilterCellComp = void 0;
var context_1 = require("../../../context/context");
var dom_1 = require("../../../utils/dom");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var abstractHeaderCellComp_1 = require("../abstractCell/abstractHeaderCellComp");
var HeaderFilterCellComp = /** @class */ (function (_super) {
    __extends(HeaderFilterCellComp, _super);
    function HeaderFilterCellComp(ctrl) {
        return _super.call(this, HeaderFilterCellComp.TEMPLATE, ctrl) || this;
    }
    HeaderFilterCellComp.prototype.postConstruct = function () {
        var _this = this;
        var eGui = this.getGui();
        var compProxy = {
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            addOrRemoveBodyCssClass: function (cssClassName, on) { return _this.eFloatingFilterBody.classList.toggle(cssClassName, on); },
            setButtonWrapperDisplayed: function (displayed) { return dom_1.setDisplayed(_this.eButtonWrapper, displayed); },
            setCompDetails: function (compDetails) { return _this.setCompDetails(compDetails); },
            getFloatingFilterComp: function () { return _this.compPromise; },
            setWidth: function (width) { return eGui.style.width = width; },
            setMenuIcon: function (eIcon) { return _this.eButtonShowMainFilter.appendChild(eIcon); }
        };
        this.ctrl.setComp(compProxy, eGui, this.eButtonShowMainFilter, this.eFloatingFilterBody);
    };
    HeaderFilterCellComp.prototype.setCompDetails = function (compDetails) {
        var _this = this;
        // because we are providing defaultFloatingFilterType, we know it will never be undefined;
        this.compPromise = compDetails.newAgStackInstance();
        this.compPromise.then(function (comp) { return _this.afterCompCreated(comp); });
    };
    HeaderFilterCellComp.prototype.afterCompCreated = function (comp) {
        var _this = this;
        if (!comp) {
            return;
        }
        this.addDestroyFunc(function () { return _this.context.destroyBean(comp); });
        if (!this.isAlive()) {
            return;
        }
        this.eFloatingFilterBody.appendChild(comp.getGui());
        if (comp.afterGuiAttached) {
            comp.afterGuiAttached();
        }
    };
    HeaderFilterCellComp.TEMPLATE = "<div class=\"ag-header-cell ag-floating-filter\" role=\"gridcell\" tabindex=\"-1\">\n            <div ref=\"eFloatingFilterBody\" role=\"presentation\"></div>\n            <div class=\"ag-floating-filter-button ag-hidden\" ref=\"eButtonWrapper\" role=\"presentation\">\n                <button type=\"button\" aria-label=\"Open Filter Menu\" class=\"ag-floating-filter-button-button\" ref=\"eButtonShowMainFilter\" tabindex=\"-1\"></button>\n            </div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eFloatingFilterBody')
    ], HeaderFilterCellComp.prototype, "eFloatingFilterBody", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eButtonWrapper')
    ], HeaderFilterCellComp.prototype, "eButtonWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eButtonShowMainFilter')
    ], HeaderFilterCellComp.prototype, "eButtonShowMainFilter", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeaderFilterCellComp.prototype, "postConstruct", null);
    return HeaderFilterCellComp;
}(abstractHeaderCellComp_1.AbstractHeaderCellComp));
exports.HeaderFilterCellComp = HeaderFilterCellComp;
