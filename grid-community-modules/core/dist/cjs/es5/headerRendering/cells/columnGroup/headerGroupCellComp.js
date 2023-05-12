/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
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
exports.HeaderGroupCellComp = void 0;
var context_1 = require("../../../context/context");
var dom_1 = require("../../../utils/dom");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var abstractHeaderCellComp_1 = require("../abstractCell/abstractHeaderCellComp");
var HeaderGroupCellComp = /** @class */ (function (_super) {
    __extends(HeaderGroupCellComp, _super);
    function HeaderGroupCellComp(ctrl) {
        return _super.call(this, HeaderGroupCellComp.TEMPLATE, ctrl) || this;
    }
    HeaderGroupCellComp.prototype.postConstruct = function () {
        var _this = this;
        var eGui = this.getGui();
        var setAttribute = function (key, value) {
            return value != undefined ? eGui.setAttribute(key, value) : eGui.removeAttribute(key);
        };
        var compProxy = {
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            setResizableDisplayed: function (displayed) { return dom_1.setDisplayed(_this.eResize, displayed); },
            setWidth: function (width) { return eGui.style.width = width; },
            setColId: function (id) { return eGui.setAttribute("col-id", id); },
            setAriaExpanded: function (expanded) { return setAttribute('aria-expanded', expanded); },
            setTitle: function (title) { return setAttribute("title", title); },
            setUserCompDetails: function (details) { return _this.setUserCompDetails(details); }
        };
        this.ctrl.setComp(compProxy, eGui, this.eResize);
    };
    HeaderGroupCellComp.prototype.setUserCompDetails = function (details) {
        var _this = this;
        details.newAgStackInstance().then(function (comp) { return _this.afterHeaderCompCreated(comp); });
    };
    HeaderGroupCellComp.prototype.afterHeaderCompCreated = function (headerGroupComp) {
        var _this = this;
        var destroyFunc = function () { return _this.destroyBean(headerGroupComp); };
        if (!this.isAlive()) {
            destroyFunc();
            return;
        }
        this.getGui().appendChild(headerGroupComp.getGui());
        this.addDestroyFunc(destroyFunc);
        this.ctrl.setDragSource(headerGroupComp.getGui());
    };
    HeaderGroupCellComp.TEMPLATE = "<div class=\"ag-header-group-cell\" role=\"columnheader\" tabindex=\"-1\">\n            <div ref=\"eResize\" class=\"ag-header-cell-resize\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], HeaderGroupCellComp.prototype, "userComponentFactory", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eResize')
    ], HeaderGroupCellComp.prototype, "eResize", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeaderGroupCellComp.prototype, "postConstruct", null);
    return HeaderGroupCellComp;
}(abstractHeaderCellComp_1.AbstractHeaderCellComp));
exports.HeaderGroupCellComp = HeaderGroupCellComp;
