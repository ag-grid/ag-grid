"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayWrapperComponent = void 0;
const context_1 = require("../../context/context");
const component_1 = require("../../widgets/component");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const dom_1 = require("../../utils/dom");
const layoutFeature_1 = require("../../styling/layoutFeature");
class OverlayWrapperComponent extends component_1.Component {
    constructor() {
        super(OverlayWrapperComponent.TEMPLATE);
        this.inProgress = false;
        this.destroyRequested = false;
    }
    updateLayoutClasses(cssClass, params) {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
        overlayWrapperClassList.toggle(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
    }
    postConstruct() {
        this.createManagedBean(new layoutFeature_1.LayoutFeature(this));
        this.setDisplayed(false, { skipAriaHidden: true });
        this.overlayService.registerOverlayWrapperComp(this);
    }
    setWrapperTypeClass(overlayWrapperCssClass) {
        const overlayWrapperClassList = this.eOverlayWrapper.classList;
        if (this.activeOverlayWrapperCssClass) {
            overlayWrapperClassList.toggle(this.activeOverlayWrapperCssClass, false);
        }
        this.activeOverlayWrapperCssClass = overlayWrapperCssClass;
        overlayWrapperClassList.toggle(overlayWrapperCssClass, true);
    }
    showOverlay(overlayComp, overlayWrapperCssClass) {
        if (this.inProgress) {
            return;
        }
        this.setWrapperTypeClass(overlayWrapperCssClass);
        this.destroyActiveOverlay();
        this.inProgress = true;
        if (overlayComp) {
            overlayComp.then(comp => {
                this.inProgress = false;
                this.eOverlayWrapper.appendChild(comp.getGui());
                this.activeOverlay = comp;
                if (this.destroyRequested) {
                    this.destroyRequested = false;
                    this.destroyActiveOverlay();
                }
            });
        }
        this.setDisplayed(true, { skipAriaHidden: true });
    }
    destroyActiveOverlay() {
        if (this.inProgress) {
            this.destroyRequested = true;
            return;
        }
        if (!this.activeOverlay) {
            return;
        }
        this.activeOverlay = this.getContext().destroyBean(this.activeOverlay);
        (0, dom_1.clearElement)(this.eOverlayWrapper);
    }
    hideOverlay() {
        this.destroyActiveOverlay();
        this.setDisplayed(false, { skipAriaHidden: true });
    }
    destroy() {
        this.destroyActiveOverlay();
        super.destroy();
    }
}
// wrapping in outer div, and wrapper, is needed to center the loading icon
OverlayWrapperComponent.TEMPLATE = `
        <div class="ag-overlay" aria-hidden="true">
            <div class="ag-overlay-panel">
                <div class="ag-overlay-wrapper" ref="eOverlayWrapper"></div>
            </div>
        </div>`;
__decorate([
    (0, context_1.Autowired)('overlayService')
], OverlayWrapperComponent.prototype, "overlayService", void 0);
__decorate([
    (0, componentAnnotations_1.RefSelector)('eOverlayWrapper')
], OverlayWrapperComponent.prototype, "eOverlayWrapper", void 0);
__decorate([
    context_1.PostConstruct
], OverlayWrapperComponent.prototype, "postConstruct", null);
exports.OverlayWrapperComponent = OverlayWrapperComponent;
