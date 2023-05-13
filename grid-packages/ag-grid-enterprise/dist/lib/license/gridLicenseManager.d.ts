import { BeanStub } from 'ag-grid-community';
export declare class GridLicenseManager extends BeanStub {
    private licenseManager;
    validateLicense(): void;
    static getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        expiry: string | null;
        version: string;
        isTrial: boolean | null;
        trialExpired: boolean | null;
    };
    isDisplayWatermark(): boolean;
    getWatermarkMessage(): string;
    static setLicenseKey(licenseKey: string): void;
}
