/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { PostConstruct } from "../context/context";
import { FakeHScrollCtrl } from "./fakeHScrollCtrl";
import { setFixedHeight, setFixedWidth } from "../utils/dom";
import { CenterWidthFeature } from "./centerWidthFeature";
export class FakeHScrollComp extends Component {
    constructor() {
        super(FakeHScrollComp.TEMPLATE);
    }
    postConstruct() {
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setHeight: height => setFixedHeight(this.getGui(), height),
            setBottom: bottom => this.getGui().style.bottom = `${bottom}px`,
            setContainerHeight: height => setFixedHeight(this.eContainer, height),
            setViewportHeight: height => setFixedHeight(this.eViewport, height),
            setRightSpacerFixedWidth: width => setFixedWidth(this.eRightSpacer, width),
            setLeftSpacerFixedWidth: width => setFixedWidth(this.eLeftSpacer, width),
            includeLeftSpacerScrollerCss: (cssClass, include) => this.eLeftSpacer.classList.toggle(cssClass, include),
            includeRightSpacerScrollerCss: (cssClass, include) => this.eRightSpacer.classList.toggle(cssClass, include),
        };
        const ctrl = this.createManagedBean(new FakeHScrollCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.eViewport, this.eContainer);
        this.createManagedBean(new CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
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
    RefSelector('eLeftSpacer')
], FakeHScrollComp.prototype, "eLeftSpacer", void 0);
__decorate([
    RefSelector('eRightSpacer')
], FakeHScrollComp.prototype, "eRightSpacer", void 0);
__decorate([
    RefSelector('eViewport')
], FakeHScrollComp.prototype, "eViewport", void 0);
__decorate([
    RefSelector('eContainer')
], FakeHScrollComp.prototype, "eContainer", void 0);
__decorate([
    PostConstruct
], FakeHScrollComp.prototype, "postConstruct", null);
