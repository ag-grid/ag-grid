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
    static getLicenseDetails(licenseKey) {
        return new LicenseManager(null).getLicenseDetails(licenseKey);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZExpY2Vuc2VNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpY2Vuc2UvZ3JpZExpY2Vuc2VNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBZ0IsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFHdkQsSUFBYSxrQkFBa0IsR0FBL0IsTUFBYSxrQkFBbUIsU0FBUSxRQUFRO0lBSXJDLGVBQWU7UUFDbEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUMvRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsVUFBa0I7UUFDdkMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFXLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3BELENBQUM7SUFFTSxtQkFBbUI7UUFDdEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBa0I7UUFDbkMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0osQ0FBQTtBQXBCRztJQURDLFlBQVk7eURBSVo7QUFQUSxrQkFBa0I7SUFEOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0dBQ1Ysa0JBQWtCLENBd0I5QjtTQXhCWSxrQkFBa0IifQ==