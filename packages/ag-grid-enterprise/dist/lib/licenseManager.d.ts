// ag-grid-enterprise v20.2.0
export declare class LicenseManager {
    private static RELEASE_INFORMATION;
    private static licenseKey;
    private displayWatermark;
    private md5;
    validateLicense(): void;
    private static extractExpiry;
    private static extractLicenseComponents;
    getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        expiry: string | null;
    };
    isDisplayWatermark(): boolean;
    private static outputMessage;
    private static formatDate;
    private static getGridReleaseDate;
    private static decode;
    private static utf8_decode;
    static setLicenseKey(licenseKey: string): void;
}
