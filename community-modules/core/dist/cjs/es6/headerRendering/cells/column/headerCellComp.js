/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../../../context/context");
const aria_1 = require("../../../utils/aria");
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const abstractHeaderCellComp_1 = require("../abstractCell/abstractHeaderCellComp");
class HeaderCellComp extends abstractHeaderCellComp_1.AbstractHeaderCellComp {
    constructor(ctrl) {
        super(HeaderCellComp.TEMPLATE, ctrl);
        this.headerCompVersion = 0;
        this.column = ctrl.getColumnGroupChild();
        this.pinned = ctrl.getPinned();
    }
    postConstruct() {
        const eGui = this.getGui();
        const setAttribute = (name, value, element) => {
            const actualElement = element ? element : eGui;
            if (value != null && value != '') {
                actualElement.setAttribute(name, value);
            }
            else {
                actualElement.removeAttribute(name);
            }
        };
        const compProxy = {
            setWidth: width => eGui.style.width = width,
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setAriaSort: sort => sort ? aria_1.setAriaSort(eGui, sort) : aria_1.removeAriaSort(eGui),
            setColId: id => setAttribute('col-id', id),
            setTitle: title => setAttribute('title', title),
            setAriaDescribedBy: value => aria_1.setAriaDescribedBy(eGui, value),
            setUserCompDetails: compDetails => this.setUserCompDetails(compDetails),
            getUserCompInstance: () => this.headerComp
        };
        this.ctrl.setComp(compProxy, this.getGui(), this.eResize);
        const selectAllGui = this.ctrl.getSelectAllGui();
        this.eResize.insertAdjacentElement('afterend', selectAllGui);
    }
    destroyHeaderComp() {
        if (this.headerComp) {
            this.getGui().removeChild(this.headerCompGui);
            this.headerComp = this.destroyBean(this.headerComp);
            this.headerCompGui = undefined;
        }
    }
    setUserCompDetails(compDetails) {
        this.headerCompVersion++;
        const versionCopy = this.headerCompVersion;
        compDetails.newAgStackInstance().then(comp => this.afterCompCreated(versionCopy, comp));
    }
    afterCompCreated(version, headerComp) {
        if (version != this.headerCompVersion || !this.isAlive()) {
            this.destroyBean(headerComp);
            return;
        }
        this.destroyHeaderComp();
        this.headerComp = headerComp;
        this.headerCompGui = headerComp.getGui();
        this.getGui().appendChild(this.headerCompGui);
        this.ctrl.setDragSource(this.headerCompGui);
    }
}
HeaderCellComp.TEMPLATE = `<div class="ag-header-cell" role="columnheader" tabindex="-1">
            <div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>
        </div>`;
__decorate([
    componentAnnotations_1.RefSelector('eResize')
], HeaderCellComp.prototype, "eResize", void 0);
__decorate([
    context_1.PostConstruct
], HeaderCellComp.prototype, "postConstruct", null);
__decorate([
    context_1.PreDestroy
], HeaderCellComp.prototype, "destroyHeaderComp", null);
exports.HeaderCellComp = HeaderCellComp;

//# sourceMappingURL=headerCellComp.js.map
