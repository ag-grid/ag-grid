import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { AgCharts } from 'ag-charts-enterprise';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_USER_PRODUCTS } from '../constants';
import type { LicenseDetails, LicensedProducts, Products, ValidLicenseType } from '../types';
import { hasValue } from './hasValue';
import { updateSearchParams } from './updateSearchParams';
import { useLicenseDebug } from './useLicenseDebug';
import { useUpdateDataFromUrl } from './useUpdateDataFromUrl';

type ErrorKey = keyof typeof errorConditions;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    hasLicense: boolean;
    license: string;
    licensedProducts: LicensedProducts;
    userProducts: Products;
    noUserProducts: boolean;

    userLicenseVersion?: string;
    userLicenseExpiry?: string;
    userLicenseIsValid: boolean;
    userLicenseIsTrial: boolean;
    userLicenseIsExpired: boolean;
    userLicenseTrialIsExpired: boolean;
}

const validLicenseMessages = {
    valid: 'Valid license key',
    validTrialLicense: 'Valid trial license key',
    gridEnterprise: 'Includes "AG Grid Enterprise"',
    integratedEnterprise: 'Includes "AG Grid Enterprise", "AG Chart Enterprise", and "Integrated Charts"',
    chartsEnterprise: 'Includes "AG Charts Enterprise"',
};

const errorConditions = {
    chartsNoGridEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            licensedProducts.charts && !licensedProducts.grid && userProducts.gridEnterprise,
        message: `Your license key does not include "AG Grid Enterprise"`,
    },
    noProducts: {
        getIsError: ({ noUserProducts }: ErrorData) => noUserProducts,
        message: `A license key is not required to use AG Grid Community or AG Charts Community`,
    },
    userLicenseError: {
        getIsError: ({ license, userLicenseIsValid }: ErrorData) => {
            return hasValue(license) && !userLicenseIsValid;
        },
        message:
            'License key is not valid. Make sure you are copying the whole license key which was originally provided',
    },
    v2License: {
        getIsError: ({ userLicenseVersion }: ErrorData) => userLicenseVersion === '2',
        message: 'This license key is not valid for v30+',
    },
    gridNoCharts: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            !licensedProducts.charts && licensedProducts.grid && userProducts.chartsEnterprise,
        message: 'Your license key does not include "AG Charts Enterprise"',
    },
    expired: {
        getIsError: ({ license, userLicenseIsExpired }: ErrorData) => {
            return hasValue(license) && userLicenseIsExpired;
        },
        message: 'This license key is expired',
    },
    expiredTrial: {
        getIsError: ({ license, userLicenseTrialIsExpired }: ErrorData) => {
            return hasValue(license) && userLicenseTrialIsExpired;
        },
        message: 'This trial license key is expired',
    },
};

const useErrors = ({
    hasLicense,
    license,
    licensedProducts,
    userProducts,
    noUserProducts,
    userLicenseVersion,
    userLicenseExpiry,
    userLicenseIsValid,
    userLicenseIsTrial,
    userLicenseIsExpired,
    userLicenseTrialIsExpired,
}: ErrorData) => {
    const [errors, setErrors] = useState<Errors>({} as Errors);

    useEffect(() => {
        const newErrors = {} as Errors;
        (Object.keys(errorConditions) as ErrorKey[]).forEach((key) => {
            const { getIsError, message } = errorConditions[key];
            const isError =
                hasLicense &&
                getIsError({
                    hasLicense,
                    license,
                    licensedProducts,
                    userProducts,
                    noUserProducts,
                    userLicenseVersion,
                    userLicenseExpiry,
                    userLicenseIsValid,
                    userLicenseIsTrial,

                    userLicenseIsExpired,
                    userLicenseTrialIsExpired,
                });

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
    }, [
        hasLicense,
        license,
        licensedProducts,
        userProducts,
        noUserProducts,
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
    ]);

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
    const [userProducts, setUserProducts] = useState<Products>(DEFAULT_USER_PRODUCTS);

    const updateUserProductsWithUrlUpdate = useCallback(
        (products: Products) => {
            setUserProducts(products);

            updateSearchParams({ products, importType });
        },
        [importType]
    );
    const updateImportTypeWithUrlUpdate = useCallback(
        (type: ImportType) => {
            setImportType(type);

            updateSearchParams({ products: userProducts, importType: type });
        },
        [userProducts]
    );

    /**
     * Licensed products from license
     */
    const [licensedProducts, setLicensedProducts] = useState<LicensedProducts>({
        grid: false,
        charts: false,
    });

    const noUserProducts = useMemo(() => {
        return !userProducts.gridEnterprise && !userProducts.integratedEnterprise && !userProducts.chartsEnterprise;
    }, [userProducts]);
    const licenseDetails = useMemo<LicenseDetails>(() => LicenseManager.getLicenseDetails(license), [license]);
    const chartsLicenseDetails = useMemo<LicenseDetails>(
        () => (AgCharts.getLicenseDetails(license) as LicenseDetails) || {},
        [license]
    );

    const validLicenseType = useMemo<ValidLicenseType>(() => {
        let type: ValidLicenseType = 'none';
        if (
            licenseDetails.suppliedLicenseType !== 'CHARTS' &&
            licenseDetails.valid &&
            !licenseDetails.expired &&
            !licenseDetails.trialExpired
        ) {
            if (licenseDetails.suppliedLicenseType === 'GRID') {
                type = 'gridEnterprise';
            } else if (licenseDetails.suppliedLicenseType === 'BOTH') {
                type = 'integratedEnterprise';
            }
        } else if (
            licenseDetails.suppliedLicenseType === 'CHARTS' &&
            chartsLicenseDetails.valid &&
            !chartsLicenseDetails.expired &&
            !chartsLicenseDetails.trialExpired
        ) {
            type = 'chartsEnterprise';
        }
        return type;
    }, [licenseDetails, chartsLicenseDetails]);

    const {
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
    } = useMemo(() => {
        const details = licenseDetails.suppliedLicenseType === 'CHARTS' ? chartsLicenseDetails : licenseDetails;

        return {
            userLicenseVersion: details.version || undefined,
            userLicenseExpiry: details.expiry || undefined,
            userLicenseIsValid: Boolean(details.valid),
            userLicenseIsTrial: Boolean(details.isTrial),
            userLicenseIsExpired: Boolean(details.expired),
            userLicenseTrialIsExpired: Boolean(details.trialExpired),
        };
    }, [licenseDetails, chartsLicenseDetails]);

    const validLicenseText = useMemo<string>(() => {
        const validPrefix = userLicenseIsTrial ? validLicenseMessages.validTrialLicense : validLicenseMessages.valid;

        return validLicenseType === 'none' ? '' : `${validPrefix}. ${validLicenseMessages[validLicenseType]}`;
    }, [validLicenseType, userLicenseIsTrial]);

    const { errors } = useErrors({
        hasLicense,
        license,
        licensedProducts,
        userProducts,
        noUserProducts,
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
    });

    useUpdateDataFromUrl({ setUserProducts, setImportType });
    useLicenseDebug({
        validLicenseType,
        licenseDetails,
        chartsLicenseDetails,
        errors,
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
    });

    useEffect(() => {
        if (!hasValue(license)) {
            return;
        }

        const { suppliedLicenseType } = licenseDetails;
        const gridEnterprise = suppliedLicenseType === 'GRID' || suppliedLicenseType === 'BOTH';
        const integratedEnterprise = suppliedLicenseType === 'BOTH';
        const chartsEnterprise = suppliedLicenseType === 'CHARTS' || suppliedLicenseType === 'BOTH';

        setLicensedProducts({
            grid: gridEnterprise,
            charts: chartsEnterprise,
        });

        updateUserProductsWithUrlUpdate({
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
        updateImportTypeWithUrlUpdate,
        licensedProducts,
        userProducts,
        updateUserProductsWithUrlUpdate,
        noUserProducts,

        validLicenseText,
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
        errors,
    };
};
