import { type LicenseManager } from '@ag-grid-enterprise/core';

export interface LicensedProducts {
    grid: boolean;
    charts: boolean;
}

export interface Products {
    gridEnterprise: boolean;
    integratedEnterprise: boolean;
    chartsEnterprise: boolean;
}

export type ValidLicenseType = 'gridEnterprise' | 'chartsEnterprise' | 'integratedEnterprise' | 'none';
export type LicenseDetails = ReturnType<typeof LicenseManager.getLicenseDetails>;
