"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class WatermarkComp extends core_1.Component {
    constructor() {
        super(`<div class="ag-watermark">
                    <div ref="eLicenseTextRef" class="ag-watermark-text"></div>
               </div>`);
    }
    postConstruct() {
        const show = this.shouldDisplayWatermark();
        this.addOrRemoveCssClass('ag-hidden', !show);
        if (show) {
            this.eLicenseTextRef.innerText = this.licenseManager.getWatermarkMessage();
            window.setTimeout(() => this.addCssClass('ag-opacity-zero'), 0);
            window.setTimeout(() => this.addCssClass('ag-hidden'), 5000);
        }
    }
    shouldDisplayWatermark() {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const win = (eDocument.defaultView || window);
        const loc = win.location;
        const { hostname = '', pathname } = loc;
        const isDisplayWatermark = this.licenseManager.isDisplayWatermark();
        const isWhiteListURL = hostname.match('^(?:127\.0\.0\.1|localhost|(?:\w+\.)?ag-grid\.com)$') != null;
        const isForceWatermark = pathname ? pathname.indexOf('forceWatermark') !== -1 : false;
        return isForceWatermark || (isDisplayWatermark && !isWhiteListURL);
    }
}
__decorate([
    core_1.Autowired('licenseManager')
], WatermarkComp.prototype, "licenseManager", void 0);
__decorate([
    core_1.RefSelector('eLicenseTextRef')
], WatermarkComp.prototype, "eLicenseTextRef", void 0);
__decorate([
    core_1.PostConstruct
], WatermarkComp.prototype, "postConstruct", null);
exports.WatermarkComp = WatermarkComp;
