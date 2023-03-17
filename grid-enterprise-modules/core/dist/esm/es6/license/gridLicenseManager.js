var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, BeanStub, PreConstruct } from '@ag-grid-community/core';
import { LicenseManager } from "./shared/licenseManager";
let GridLicenseManager = class GridLicenseManager extends BeanStub {
    validateLicense() {
        this.licenseManager = new LicenseManager(this.gridOptionsService.getDocument());
        this.licenseManager.validateLicense();
    }
    getLicenseDetails(licenseKey) {
        this.licenseManager.getLicenseDetails(licenseKey);
    }
    isDisplayWatermark() {
        return this.licenseManager.isDisplayWatermark();
    }
    getWatermarkMessage() {
        return this.licenseManager.getWatermarkMessage();
    }
    static setLicenseKey(licenseKey) {
        LicenseManager.setLicenseKey(licenseKey);
    }
};
__decorate([
    PreConstruct
], GridLicenseManager.prototype, "validateLicense", null);
GridLicenseManager = __decorate([
    Bean('licenseManager')
], GridLicenseManager);
export { GridLicenseManager };
