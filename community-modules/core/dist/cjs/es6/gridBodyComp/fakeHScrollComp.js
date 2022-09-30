/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const component_1 = require("../widgets/component");
const componentAnnotations_1 = require("../widgets/componentAnnotations");
const context_1 = require("../context/context");
const fakeHScrollCtrl_1 = require("./fakeHScrollCtrl");
const dom_1 = require("../utils/dom");
const centerWidthFeature_1 = require("./centerWidthFeature");
class FakeHScrollComp extends component_1.Component {
    constructor() {
        super(FakeHScrollComp.TEMPLATE);
    }
    postConstruct() {
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setHeight: height => dom_1.setFixedHeight(this.getGui(), height),
            setBottom: bottom => this.getGui().style.bottom = `${bottom}px`,
            setContainerHeight: height => dom_1.setFixedHeight(this.eContainer, height),
            setViewportHeight: height => dom_1.setFixedHeight(this.eViewport, height),
            setRightSpacerFixedWidth: width => dom_1.setFixedWidth(this.eRightSpacer, width),
            setLeftSpacerFixedWidth: width => dom_1.setFixedWidth(this.eLeftSpacer, width),
            includeLeftSpacerScrollerCss: (cssClass, include) => this.eLeftSpacer.classList.toggle(cssClass, include),
            includeRightSpacerScrollerCss: (cssClass, include) => this.eRightSpacer.classList.toggle(cssClass, include),
        };
        const ctrl = this.createManagedBean(new fakeHScrollCtrl_1.FakeHScrollCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.eViewport, this.eContainer);
        this.createManagedBean(new centerWidthFeature_1.CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
    }
}
FakeHScrollComp.TEMPLATE = `<div class="ag-body-horizontal-scroll" aria-hidden="true">
            <div class="ag-horizontal-left-spacer" ref="eLeftSpacer"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-horizontal-right-spacer" ref="eRightSpacer"></div>
        </div>`;
__decorate([
    componentAnnotations_1.RefSelector('eLeftSpacer')
], FakeHScrollComp.prototype, "eLeftSpacer", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eRightSpacer')
], FakeHScrollComp.prototype, "eRightSpacer", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eViewport')
], FakeHScrollComp.prototype, "eViewport", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eContainer')
], FakeHScrollComp.prototype, "eContainer", void 0);
__decorate([
    context_1.PostConstruct
], FakeHScrollComp.prototype, "postConstruct", null);
exports.FakeHScrollComp = FakeHScrollComp;
