export declare class LicenseManager {
    private static RELEASE_INFORMATION;
    private static licenseKey;
    private watermarkMessage;
    private md5;
    private document;
    constructor(document: Document);
    validateLicense(): void;
    private static extractExpiry;
    private static extractLicenseComponents;
    getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        expiry: string | null;
        version: string;
        isTrial: boolean | null;
    };
    isDisplayWatermark(): boolean;
    getWatermarkMessage(): string;
    private getHostname;
    private isWebsiteUrl;
    private isLocalhost;
    private static formatDate;
    private static getGridReleaseDate;
    private static decode;
    private static utf8_decode;
    static setLicenseKey(licenseKey: string): void;
    private static extractBracketedInformation;
    private validateLicenseKeyForVersion;
    private validateLegacyKey;
    private validateForTrial;
    private outputInvalidLicenseKey;
    private outputExpiredTrialKey;
    private outputMissingLicenseKey;
    private outputIncompatibleVersion;
}
