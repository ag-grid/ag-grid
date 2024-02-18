import { BeanStub } from 'ag-grid-community';
import { ILicenseManager } from "./shared/licenseManager";
export declare class GridLicenseManager extends BeanStub {
    private licenseManager;
    validateLicense(): void;
    static getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        missing: boolean;
        currentLicenseType: string;
        incorrectLicenseType?: undefined;
        suppliedLicenseType?: undefined;
        expiry?: undefined;
        expired?: undefined;
        version?: undefined;
        isTrial?: undefined;
        trialExpired?: undefined;
    } | {
        licenseKey: string;
        valid: false;
        incorrectLicenseType: boolean;
        currentLicenseType: string;
        suppliedLicenseType: string | undefined;
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
        incorrectLicenseType: boolean;
        currentLicenseType: string;
        suppliedLicenseType: string | undefined;
        missing?: undefined;
    };
    isDisplayWatermark(): boolean;
    getWatermarkMessage(): string;
    static setLicenseKey(licenseKey: string): void;
    static setChartsLicenseManager(chartsLicenseManager: ILicenseManager): void;
}
