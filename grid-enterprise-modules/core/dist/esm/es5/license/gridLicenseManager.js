var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
    GridLicenseManager.getLicenseDetails = function (licenseKey) {
        return new LicenseManager(null).getLicenseDetails(licenseKey);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZExpY2Vuc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpY2Vuc2UvZ3JpZExpY2Vuc2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBZ0IsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFHdkQ7SUFBd0Msc0NBQVE7SUFBaEQ7O0lBd0JBLENBQUM7SUFwQlUsNENBQWUsR0FBdEI7UUFDSSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO1FBQy9FLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVNLG9DQUFpQixHQUF4QixVQUF5QixVQUFrQjtRQUN2QyxPQUFPLElBQUksY0FBYyxDQUFDLElBQVcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFTSwrQ0FBa0IsR0FBekI7UUFDSSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNwRCxDQUFDO0lBRU0sZ0RBQW1CLEdBQTFCO1FBQ0ksT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDckQsQ0FBQztJQUVNLGdDQUFhLEdBQXBCLFVBQXFCLFVBQWtCO1FBQ25DLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQW5CRDtRQURDLFlBQVk7NkRBSVo7SUFQUSxrQkFBa0I7UUFEOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDO09BQ1Ysa0JBQWtCLENBd0I5QjtJQUFELHlCQUFDO0NBQUEsQUF4QkQsQ0FBd0MsUUFBUSxHQXdCL0M7U0F4Qlksa0JBQWtCIn0=