import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { useEffect, useState } from 'react';

import type { LicensedProducts } from '../types';
import { hasValue } from './hasValue';

type ErrorKey = keyof typeof ERRORS;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    hasLicense: boolean;
    license: string;
    userLicensedProducts: LicensedProducts;
    licenseDetails: ReturnType<typeof LicenseManager.getLicenseDetails>;
}

const ERRORS = {
    chartsNoGridEnterprise: `You must have a "Grid Enterprise" license to use "Charts Enterprise" within AG Grid`,
    noLicenseExample: `A license is only required if you use the "Grid Enterprise" product`,
    userLicenseError: 'License is invalid',
};

const updateError = ({ key, condition, setErrors }: { key: ErrorKey; condition: boolean; setErrors: any }) => {
    if (condition) {
        const message = ERRORS[key];
        setErrors((prevErrors: Errors) => {
            return {
                ...prevErrors,
                [key]: message,
            };
        });
    } else {
        setErrors((prevErrors: Errors) => {
            return {
                ...prevErrors,
                [key]: undefined,
            };
        });
    }
};

const useErrors = ({ hasLicense, license, userLicensedProducts, licenseDetails }: ErrorData) => {
    const [errors, setErrors] = useState<Errors>({} as Errors);
    const { valid, suppliedLicenseType, incorrectLicenseType } = licenseDetails;

    useEffect(() => {
        updateError({
            key: 'chartsNoGridEnterprise',
            condition: !userLicensedProducts.grid && userLicensedProducts.charts,
            setErrors,
        });
    }, [userLicensedProducts]);

    useEffect(() => {
        updateError({
            key: 'noLicenseExample',
            condition: !userLicensedProducts.grid,
            setErrors,
        });
    }, [userLicensedProducts]);

    useEffect(() => {
        const licenseIsValid = valid || (suppliedLicenseType === 'CHARTS' && incorrectLicenseType);
        const userLicenseHasError = hasValue(hasLicense) && hasValue(license) && !licenseIsValid;

        updateError({
            key: 'userLicenseError',
            condition: userLicenseHasError,
            setErrors,
        });
    }, [valid, hasLicense, license, suppliedLicenseType, incorrectLicenseType]);

    return {
        errors,
        hasError: Boolean(Object.keys(errors).length),
    };
};

export const useLicenseData = () => {
    const [hasLicense, setHasLicense] = useState<boolean>(true);
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
        suppliedLicenseType,
        version: userLicenseVersion,
        isTrial: userLicenseIsTrial,
        expiry: userLicenseExpiry,
    } = licenseDetails;

    const { errors } = useErrors({ hasLicense, license, userLicensedProducts, licenseDetails });

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
        errors,
    };
};
