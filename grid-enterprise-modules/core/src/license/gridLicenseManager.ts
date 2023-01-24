import { _, Autowired, Bean, BeanStub, PreConstruct } from '@ag-grid-community/core';
import {LicenseManager} from "@ag/license";

@Bean('licenseManager')
export class GridLicenseManager extends BeanStub {
    private licenseManager: LicenseManager;

    constructor(template?: string) {
        super();

        this.licenseManager = new LicenseManager(this.gridOptionsService.getDocument())
    }

    @PreConstruct
    public validateLicense(): void {
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
