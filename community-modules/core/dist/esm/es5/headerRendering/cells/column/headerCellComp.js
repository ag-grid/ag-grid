/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
import { PostConstruct, PreDestroy } from "../../../context/context";
import { removeAriaSort, setAriaDescription, setAriaSort } from "../../../utils/aria";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
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
            setColId: function (id) { return setAttribute('col-id', id); },
            setTitle: function (title) { return setAttribute('title', title); },
            setAriaDescription: function (label) { return setAriaDescription(eGui, label); },
            setAriaSort: function (sort) { return sort ? setAriaSort(eGui, sort) : removeAriaSort(eGui); },
            setUserCompDetails: function (compDetails) { return _this.setUserCompDetails(compDetails); },
            getUserCompInstance: function () { return _this.headerComp; }
        };
        this.ctrl.setComp(compProxy, this.getGui(), this.eResize, this.eHeaderCompWrapper);
        var selectAllGui = this.ctrl.getSelectAllGui();
        this.eResize.insertAdjacentElement('afterend', selectAllGui);
    };
    HeaderCellComp.prototype.destroyHeaderComp = function () {
        if (this.headerComp) {
            this.eHeaderCompWrapper.removeChild(this.headerCompGui);
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
        this.eHeaderCompWrapper.appendChild(this.headerCompGui);
        this.ctrl.setDragSource(this.getGui());
    };
    HeaderCellComp.TEMPLATE = "<div class=\"ag-header-cell\" role=\"columnheader\" tabindex=\"-1\">\n            <div ref=\"eResize\" class=\"ag-header-cell-resize\" role=\"presentation\"></div>\n            <div ref=\"eHeaderCompWrapper\" class=\"ag-header-cell-comp-wrapper\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        RefSelector('eResize')
    ], HeaderCellComp.prototype, "eResize", void 0);
    __decorate([
        RefSelector('eHeaderCompWrapper')
    ], HeaderCellComp.prototype, "eHeaderCompWrapper", void 0);
    __decorate([
        PostConstruct
    ], HeaderCellComp.prototype, "postConstruct", null);
    __decorate([
        PreDestroy
    ], HeaderCellComp.prototype, "destroyHeaderComp", null);
    return HeaderCellComp;
}(AbstractHeaderCellComp));
export { HeaderCellComp };
