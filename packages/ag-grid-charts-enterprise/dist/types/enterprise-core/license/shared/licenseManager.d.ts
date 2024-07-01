export interface ILicenseManager {
    setLicenseKey: (key?: string, gridContext?: boolean) => void;
}
export declare class LicenseManager {
    private static RELEASE_INFORMATION;
    private static licenseKey;
    private static chartsLicenseManager?;
    private watermarkMessage;
    private md5;
    private document;
    private totalMessageLength;
    constructor(document: Document);
    validateLicense(): void;
    private static extractExpiry;
    private static extractLicenseComponents;
    getLicenseDetails(licenseKey: string): {
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
    private getHostname;
    private isForceWatermark;
    private isWebsiteUrl;
    private isLocalhost;
    private static formatDate;
    private static getGridReleaseDate;
    private static decode;
    private static utf8_decode;
    static setChartsLicenseManager(dependantLicenseManager: ILicenseManager): void;
    static setLicenseKey(licenseKey: string): void;
    private static extractBracketedInformation;
    private centerPadAndOutput;
    private padAndOutput;
    private outputInvalidLicenseKey;
    private outputExpiredTrialKey;
    private outputMissingLicenseKey;
    private outputExpiredKey;
}
