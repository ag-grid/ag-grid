"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridLicenseManager = void 0;
const core_1 = require("@ag-grid-community/core");
const licenseManager_1 = require("./shared/licenseManager");
let GridLicenseManager = class GridLicenseManager extends core_1.BeanStub {
    validateLicense() {
        this.licenseManager = new licenseManager_1.LicenseManager(this.gridOptionsService.getDocument());
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
        licenseManager_1.LicenseManager.setLicenseKey(licenseKey);
    }
};
__decorate([
    core_1.PreConstruct
], GridLicenseManager.prototype, "validateLicense", null);
GridLicenseManager = __decorate([
    core_1.Bean('licenseManager')
], GridLicenseManager);
exports.GridLicenseManager = GridLicenseManager;
