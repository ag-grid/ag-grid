import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { useEffect, useMemo, useState } from 'react';

import type { LicensedProducts } from '../types';
import { hasValue } from './hasValue';

type ErrorKey = keyof typeof errorConditions;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    hasLicense: boolean;
    license: string;
    userLicensedProducts: LicensedProducts;
    licenseDetails: ReturnType<typeof LicenseManager.getLicenseDetails>;
}

const errorConditions = {
    chartsNoGridEnterprise: {
        getIsError: ({ userLicensedProducts }: ErrorData) => !userLicensedProducts.grid && userLicensedProducts.charts,
        message: `You must have a "Grid Enterprise" license to use "Charts Enterprise" within AG Grid`,
    },
    noLicenseExample: {
        getIsError: ({ userLicensedProducts }: ErrorData) => !userLicensedProducts.grid,
        message: `A license is only required if you use the "Grid Enterprise" product`,
    },
    userLicenseError: {
        getIsError: ({ hasLicense, license, licenseDetails }: ErrorData) => {
            const { valid, suppliedLicenseType, incorrectLicenseType } = licenseDetails;
            const licenseIsValid = valid || (suppliedLicenseType === 'CHARTS' && incorrectLicenseType);
            return hasValue(hasLicense) && hasValue(license) && !licenseIsValid;
        },
        message: 'License is not valid. Make sure you are copying the whole license which was originally provided',
    },
    v2License: {
        getIsError: ({ licenseDetails }: ErrorData) => licenseDetails.version === '2',
        message: 'This license is not valid for v30+',
    },
    chartsSupported: {
        getIsError: ({ license, userLicensedProducts, licenseDetails }: ErrorData) =>
            hasValue(license) &&
            userLicensedProducts.charts &&
            !(licenseDetails.suppliedLicenseType === 'CHARTS' || licenseDetails.suppliedLicenseType === 'BOTH'),

        message: 'Enterprise Charts is not supported on this license',
    },
    expired: {
        getIsError: ({ license, licenseDetails }: ErrorData) => {
            const { expired, trialExpired } = licenseDetails;
            return hasValue(license) && (Boolean(expired) || Boolean(trialExpired));
        },
        message: 'This license is expired',
    },
};

const useErrors = ({ hasLicense, license, userLicensedProducts, licenseDetails }: ErrorData) => {
    const [errors, setErrors] = useState<Errors>({} as Errors);

    useEffect(() => {
        (Object.keys(errorConditions) as ErrorKey[]).forEach((key) => {
            const { getIsError, message } = errorConditions[key];
            const isError = getIsError({ hasLicense, license, userLicensedProducts, licenseDetails });

            if (isError) {
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
        });
    }, [hasLicense, license, userLicensedProducts, licenseDetails]);

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

    const licenseDetails = useMemo(() => LicenseManager.getLicenseDetails(license), [license]);
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

        setUserLicensedProducts({
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
