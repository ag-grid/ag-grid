import type { AgChartOptions } from '../options/chart/chartBuilderOptions';
export interface LicenseManager {
    setLicenseKey: (key?: string, gridContext?: boolean) => void;
    validateLicense: () => void;
    isDisplayWatermark: () => boolean;
    getWatermarkMessage: () => string;
    getLicenseDetails: (licenseKey: string) => {};
}
interface EnterpriseModuleOptions {
    isEnterprise: boolean;
    licenseManager?: (options: AgChartOptions) => LicenseManager;
    injectWatermark?: (document: Document, parentElement: HTMLElement, text: string) => void;
}
export declare const enterpriseModule: EnterpriseModuleOptions;
export {};
