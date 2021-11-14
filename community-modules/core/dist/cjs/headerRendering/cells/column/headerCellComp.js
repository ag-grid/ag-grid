/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.2.0
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
var context_1 = require("../../../context/context");
var aria_1 = require("../../../utils/aria");
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var abstractHeaderCellComp_1 = require("../abstractCell/abstractHeaderCellComp");
var HeaderCellComp = /** @class */ (function (_super) {
    __extends(HeaderCellComp, _super);
    function HeaderCellComp(ctrl) {
        var _this = _super.call(this, HeaderCellComp.TEMPLATE, ctrl) || this;
        _this.headerCompVersion = 0;
        _this.column = ctrl.getColumnGroupChild();
        _this.pinned = ctrl.getPinned();
        return _this;
    }
    HeaderCellComp.prototype.postConstruct = function () {
        var _this = this;
        var eGui = this.getGui();
        var setAttribute = function (name, value, element) {
            var actualElement = element ? element : eGui;
            if (value != null && value != '') {
                actualElement.setAttribute(name, value);
            }
            else {
                actualElement.removeAttribute(name);
            }
        };
        var compProxy = {
            setWidth: function (width) { return eGui.style.width = width; },
            addOrRemoveCssClass: function (cssClassName, on) { return _this.addOrRemoveCssClass(cssClassName, on); },
            setAriaSort: function (sort) { return sort ? aria_1.setAriaSort(eGui, sort) : aria_1.removeAriaSort(eGui); },
            setColId: function (id) { return setAttribute('col-id', id); },
            setTitle: function (title) { return setAttribute('title', title); },
            setAriaDescribedBy: function (value) { return aria_1.setAriaDescribedBy(eGui, value); },
            setUserCompDetails: function (compDetails) { return _this.setUserCompDetails(compDetails); },
            getUserCompInstance: function () { return _this.headerComp; }
        };
        this.ctrl.setComp(compProxy, this.getGui(), this.eResize);
        var selectAllGui = this.ctrl.getSelectAllGui();
        this.eResize.insertAdjacentElement('afterend', selectAllGui);
    };
    HeaderCellComp.prototype.destroyHeaderComp = function () {
        if (this.headerComp) {
            this.getGui().removeChild(this.headerCompGui);
            this.headerComp = this.destroyBean(this.headerComp);
            this.headerCompGui = undefined;
        }
    };
    HeaderCellComp.prototype.setUserCompDetails = function (compDetails) {
        var _this = this;
        this.headerCompVersion++;
        var versionCopy = this.headerCompVersion;
        compDetails.newAgStackInstance().then(function (comp) { return _this.afterCompCreated(versionCopy, comp); });
    };
    HeaderCellComp.prototype.afterCompCreated = function (version, headerComp) {
        if (version != this.headerCompVersion || !this.isAlive()) {
            this.destroyBean(headerComp);
            return;
        }
        this.destroyHeaderComp();
        this.headerComp = headerComp;
        this.headerCompGui = headerComp.getGui();
        this.getGui().appendChild(this.headerCompGui);
        this.ctrl.setDragSource(this.headerCompGui);
    };
    HeaderCellComp.TEMPLATE = "<div class=\"ag-header-cell\" role=\"columnheader\" unselectable=\"on\" tabindex=\"-1\">\n            <div ref=\"eResize\" class=\"ag-header-cell-resize\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        componentAnnotations_1.RefSelector('eResize')
    ], HeaderCellComp.prototype, "eResize", void 0);
    __decorate([
        context_1.PostConstruct
    ], HeaderCellComp.prototype, "postConstruct", null);
    __decorate([
        context_1.PreDestroy
    ], HeaderCellComp.prototype, "destroyHeaderComp", null);
    return HeaderCellComp;
}(abstractHeaderCellComp_1.AbstractHeaderCellComp));
exports.HeaderCellComp = HeaderCellComp;

//# sourceMappingURL=headerCellComp.js.map
