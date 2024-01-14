import { BeanStub } from '@ag-grid-community/core';
export declare class GridLicenseManager extends BeanStub {
    private licenseManager;
    validateLicense(): void;
    static getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        missing: boolean;
        incorrectLicenseType?: undefined;
        licenseType?: undefined;
        expiry?: undefined;
        expired?: undefined;
        version?: undefined;
        isTrial?: undefined;
        trialExpired?: undefined;
    } | {
        licenseKey: string;
        valid: false;
        incorrectLicenseType: boolean | undefined;
        licenseType: string | undefined;
        missing?: undefined;
        expiry?: undefined;
        expired?: undefined;
        version?: undefined;
        isTrial?: undefined;
        trialExpired?: undefined;
    } | {
        licenseKey: string;
        valid: true;
        expiry: string;
        expired: boolean | undefined;
        version: string | null;
        isTrial: boolean | null;
        trialExpired: undefined;
        missing?: undefined;
        incorrectLicenseType?: undefined;
        licenseType?: undefined;
    };
    isDisplayWatermark(): boolean;
    getWatermarkMessage(): string;
    static setLicenseKey(licenseKey: string): void;
}
