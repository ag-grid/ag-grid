var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from '@ag-grid-community/core';
export class WatermarkComp extends Component {
    constructor() {
        super(`<div class="ag-watermark">
                    <div ref="eLicenseTextRef" class="ag-watermark-text"></div>
               </div>`);
    }
    postConstruct() {
        const show = this.shouldDisplayWatermark();
        this.setDisplayed(show);
        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();
            window.setTimeout(() => this.addCssClass('ag-opacity-zero'), 0);
            window.setTimeout(() => this.setDisplayed(false), 5000);
        }
    }
    shouldDisplayWatermark() {
        const eDocument = this.gridOptionsService.getDocument();
        const win = (eDocument.defaultView || window);
        const loc = win.location;
        const { pathname } = loc;
        const isDisplayWatermark = this.licenseManager.isDisplayWatermark();
        const isForceWatermark = pathname ? pathname.indexOf('forceWatermark') !== -1 : false;
        return isForceWatermark || isDisplayWatermark;
    }
}
__decorate([
    Autowired('licenseManager')
], WatermarkComp.prototype, "licenseManager", void 0);
__decorate([
    RefSelector('eLicenseTextRef')
], WatermarkComp.prototype, "eLicenseTextRef", void 0);
__decorate([
    PostConstruct
], WatermarkComp.prototype, "postConstruct", null);
