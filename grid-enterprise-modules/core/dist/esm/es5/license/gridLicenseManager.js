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
import { Bean, BeanStub, PreConstruct } from '@ag-grid-community/core';
import { LicenseManager } from "./shared/licenseManager";
var GridLicenseManager = /** @class */ (function (_super) {
    __extends(GridLicenseManager, _super);
    function GridLicenseManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridLicenseManager.prototype.validateLicense = function () {
        this.licenseManager = new LicenseManager(this.gridOptionsService.getDocument());
        this.licenseManager.validateLicense();
    };
    GridLicenseManager.prototype.getLicenseDetails = function (licenseKey) {
        this.licenseManager.getLicenseDetails(licenseKey);
    };
    GridLicenseManager.prototype.isDisplayWatermark = function () {
        return this.licenseManager.isDisplayWatermark();
    };
    GridLicenseManager.prototype.getWatermarkMessage = function () {
        return this.licenseManager.getWatermarkMessage();
    };
    GridLicenseManager.setLicenseKey = function (licenseKey) {
        LicenseManager.setLicenseKey(licenseKey);
    };
    __decorate([
        PreConstruct
    ], GridLicenseManager.prototype, "validateLicense", null);
    GridLicenseManager = __decorate([
        Bean('licenseManager')
    ], GridLicenseManager);
    return GridLicenseManager;
}(BeanStub));
export { GridLicenseManager };
