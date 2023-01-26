import { _, Autowired, Bean, BeanStub, PreConstruct } from '@ag-grid-community/core';
import {LicenseManager} from "./licenseManager";

@Bean('licenseManager')
export class GridLicenseManager extends BeanStub {
    private licenseManager: LicenseManager;

    @PreConstruct
    public validateLicense(): void {
        this.licenseManager = new LicenseManager(this.gridOptionsService.getDocument())
        this.licenseManager.validateLicense();
    }

    public getLicenseDetails(licenseKey: string) {
        this.licenseManager.getLicenseDetails(licenseKey);
    }

    public isDisplayWatermark(): boolean {
        return this.licenseManager.isDisplayWatermark();
    }

    public getWatermarkMessage() : string {
        return this.licenseManager.getWatermarkMessage();
    }

    static setLicenseKey(licenseKey: string): void {
        LicenseManager.setLicenseKey(licenseKey);
    }
}
