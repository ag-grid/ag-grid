import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { useEffect, useMemo, useState } from 'react';

import type { LicensedProducts, Products } from '../types';
import { hasValue } from './hasValue';

type ErrorKey = keyof typeof errorConditions;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    hasLicense: boolean;
    license: string;
    licensedProducts: LicensedProducts;
    userProducts: Products;
    licenseDetails: ReturnType<typeof LicenseManager.getLicenseDetails>;
}

const errorConditions = {
    chartsNoGridEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            licensedProducts.charts &&
            !licensedProducts.grid &&
            userProducts.gridEnterprise &&
            userProducts.chartsEnterprise,
        message: `Your license does not support "Grid Enterprise"`,
    },
    chartsNoIntegratedEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            licensedProducts.charts &&
            !licensedProducts.grid &&
            userProducts.integratedEnterprise &&
            userProducts.chartsEnterprise,
        message: `Your license does not support "Integrated Enterprise"`,
    },
    noProducts: {
        getIsError: ({ userProducts }: ErrorData) =>
            !userProducts.gridEnterprise && !userProducts.integratedEnterprise && !userProducts.chartsEnterprise,
        message: `Please select an enterprise product`,
    },
    userLicenseError: {
        getIsError: ({ hasLicense, license, licenseDetails }: ErrorData) => {
            const { valid, suppliedLicenseType, incorrectLicenseType } = licenseDetails;

            const licenseIsValid =
                valid ||
                // TODO: Check charts license against charts LicenseManager
                (suppliedLicenseType === 'CHARTS' && incorrectLicenseType);
            return hasValue(hasLicense) && hasValue(license) && !licenseIsValid;
        },
        message: 'License is not valid. Make sure you are copying the whole license which was originally provided',
    },
    v2License: {
        getIsError: ({ licenseDetails }: ErrorData) => licenseDetails.version === '2',
        message: 'This license is not valid for v30+',
    },
    gridNoCharts: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            !licensedProducts.charts &&
            licensedProducts.grid &&
            userProducts.gridEnterprise &&
            userProducts.chartsEnterprise,
        message: 'Your license does not support "Charts Enterprise"',
    },
    gridNoIntegratedEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            !licensedProducts.charts && licensedProducts.grid && userProducts.integratedEnterprise,
        message: `Your license does not support "Integrated Enterprise"`,
    },
    expired: {
        getIsError: ({ license, licenseDetails }: ErrorData) => {
            const { expired, trialExpired } = licenseDetails;
            return hasValue(license) && (Boolean(expired) || Boolean(trialExpired));
        },
        message: 'This license is expired',
    },
};

const useErrors = ({ hasLicense, license, licensedProducts, userProducts, licenseDetails }: ErrorData) => {
    const [errors, setErrors] = useState<Errors>({} as Errors);

    useEffect(() => {
        const newErrors = {} as Errors;
        (Object.keys(errorConditions) as ErrorKey[]).forEach((key) => {
            const { getIsError, message } = errorConditions[key];
            const isError = getIsError({ hasLicense, license, licensedProducts, userProducts, licenseDetails });

            if (isError) {
                newErrors[key] = message;
            } else {
                newErrors[key] = undefined;
            }
        });

        setErrors((prevErrors: Errors) => {
            return {
                ...prevErrors,
                ...newErrors,
            };
        });
    }, [hasLicense, license, licensedProducts, userProducts, licenseDetails]);

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
     * User selected products
     */
    const [userProducts, setUserProducts] = useState<Products>({
        gridEnterprise: true,
        integratedEnterprise: false,
        chartsEnterprise: false,
    });
    /**
     * Licensed products from license
     */
    const [licensedProducts, setLicensedProducts] = useState<LicensedProducts>({
        grid: true,
        charts: false,
    });

    const licenseDetails = useMemo(() => LicenseManager.getLicenseDetails(license), [license]);
    const { version: userLicenseVersion, isTrial: userLicenseIsTrial, expiry: userLicenseExpiry } = licenseDetails;

    const { errors } = useErrors({ hasLicense, license, licensedProducts, userProducts, licenseDetails });

    useEffect(() => {
        const { suppliedLicenseType } = licenseDetails;
        const gridEnterprise = suppliedLicenseType === 'GRID' || suppliedLicenseType === 'BOTH';
        const integratedEnterprise = suppliedLicenseType === 'BOTH';
        const chartsEnterprise = suppliedLicenseType === 'CHARTS' || suppliedLicenseType === 'BOTH';

        setLicensedProducts({
            grid: gridEnterprise,
            charts: chartsEnterprise,
        });

        setUserProducts({
            gridEnterprise,
            integratedEnterprise,
            chartsEnterprise,
        });
    }, [licenseDetails]);

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
        userProducts,
        setUserProducts,

        userLicenseVersion,
        userLicenseIsTrial,
        userLicenseExpiry,
        errors,
    };
};
