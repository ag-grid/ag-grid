import { BeanStub } from 'ag-grid-community';
export declare class GridLicenseManager extends BeanStub {
    private licenseManager;
    validateLicense(): void;
    getLicenseDetails(licenseKey: string): void;
    isDisplayWatermark(): boolean;
    getWatermarkMessage(): string;
    static setLicenseKey(licenseKey: string): void;
}
