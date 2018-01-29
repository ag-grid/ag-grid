// ag-grid-enterprise v16.0.1
export declare class LicenseManager {
    private static RELEASE_INFORMATION;
    private static licenseKey;
    private md5;
    validateLicense(): void;
    private static extractExpiry(license);
    private static extractLicenseComponents(licenseKey);
    getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        expiry: string;
    };
    private static outputMessage(header, message);
    private static formatDate(date);
    private static getGridReleaseDate();
    private static decode(input);
    private static utf8_decode(input);
    static setLicenseKey(licenseKey: string): void;
}
