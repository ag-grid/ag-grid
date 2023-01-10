/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
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
exports.HeaderFilterCellComp = void 0;
const context_1 = require("../../../context/context");
const dom_1 = require("../../../utils/dom");
const componentAnnotations_1 = require("../../../widgets/componentAnnotations");
const abstractHeaderCellComp_1 = require("../abstractCell/abstractHeaderCellComp");
class HeaderFilterCellComp extends abstractHeaderCellComp_1.AbstractHeaderCellComp {
    constructor(ctrl) {
        super(HeaderFilterCellComp.TEMPLATE, ctrl);
    }
    postConstruct() {
        const eGui = this.getGui();
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveBodyCssClass: (cssClassName, on) => this.eFloatingFilterBody.classList.toggle(cssClassName, on),
            setButtonWrapperDisplayed: (displayed) => dom_1.setDisplayed(this.eButtonWrapper, displayed),
            setCompDetails: compDetails => this.setCompDetails(compDetails),
            getFloatingFilterComp: () => this.compPromise,
            setWidth: width => eGui.style.width = width,
            setMenuIcon: eIcon => this.eButtonShowMainFilter.appendChild(eIcon)
        };
        this.ctrl.setComp(compProxy, eGui, this.eButtonShowMainFilter, this.eFloatingFilterBody);
    }
    setCompDetails(compDetails) {
        // because we are providing defaultFloatingFilterType, we know it will never be undefined;
        this.compPromise = compDetails.newAgStackInstance();
        this.compPromise.then(comp => this.afterCompCreated(comp));
    }
    afterCompCreated(comp) {
        if (!comp) {
            return;
        }
        this.addDestroyFunc(() => this.context.destroyBean(comp));
        if (!this.isAlive()) {
            return;
        }
        this.eFloatingFilterBody.appendChild(comp.getGui());
        if (comp.afterGuiAttached) {
            comp.afterGuiAttached();
        }
    }
}
HeaderFilterCellComp.TEMPLATE = `<div class="ag-header-cell ag-floating-filter" role="gridcell" tabindex="-1">
            <div ref="eFloatingFilterBody" role="presentation"></div>
            <div class="ag-floating-filter-button ag-hidden" ref="eButtonWrapper" role="presentation">
                <button type="button" aria-label="Open Filter Menu" class="ag-floating-filter-button-button" ref="eButtonShowMainFilter" tabindex="-1"></button>
            </div>
        </div>`;
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
exports.HeaderFilterCellComp = HeaderFilterCellComp;
