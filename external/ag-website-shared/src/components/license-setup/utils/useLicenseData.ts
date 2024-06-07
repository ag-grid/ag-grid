import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { useEffect, useState } from 'react';

import type { LicensedProducts } from '../types';
import { hasValue } from './hasValue';

export const useLicenseData = () => {
    const [hasLicense, setHasLicense] = useState<boolean>(false);
    /**
     * User input license
     */
    const [userLicense, setUserLicense] = useState<string>('');
    /**
     * License if `hasLicense` is true
     */
    const [license, setLicense] = useState<string>('');
    const [importType, setImportType] = useState<ImportType>('packages');
    /**
     * User input licensed products
     */
    const [userLicensedProducts, setUserLicensedProducts] = useState<LicensedProducts>({
        grid: true,
        charts: false,
    });
    /**
     * Licensed products from license
     */
    const [licensedProducts, setLicensedProducts] = useState<LicensedProducts>({
        grid: true,
        charts: false,
    });
    const [useStandaloneCharts, setUseStandaloneCharts] = useState<boolean>(false);

    const licenseDetails = LicenseManager.getLicenseDetails(license);
    const {
        valid,
        suppliedLicenseType,
        version: userLicenseVersion,
        isTrial: userLicenseIsTrial,
        expiry: userLicenseExpiry,
        incorrectLicenseType,
    } = licenseDetails;

    const licenseIsValid = valid || (suppliedLicenseType === 'CHARTS' && incorrectLicenseType);
    const userLicenseHasError = hasValue(hasLicense) && hasValue(license) && !licenseIsValid;

    useEffect(() => {
        const licensedForGrid =
            suppliedLicenseType === undefined ? true : suppliedLicenseType === 'GRID' || suppliedLicenseType === 'BOTH';
        const licensedForCharts = suppliedLicenseType === 'CHARTS' || suppliedLicenseType === 'BOTH';

        setLicensedProducts({
            grid: licensedForGrid,
            charts: licensedForCharts,
        });
    }, [suppliedLicenseType]);

    useEffect(() => {
        if (hasLicense) {
            setLicense(userLicense);
        } else {
            setLicense('');
        }
    }, [hasLicense, userLicense]);

    return {
        hasLicense,
        setHasLicense,
        license,
        userLicense,
        setUserLicense,
        importType,
        setImportType,
        licensedProducts,
        setLicensedProducts,
        userLicensedProducts,
        setUserLicensedProducts,
        useStandaloneCharts,
        setUseStandaloneCharts,

        userLicenseVersion,
        userLicenseIsTrial,
        userLicenseExpiry,
        userLicenseHasError,
    };
};
