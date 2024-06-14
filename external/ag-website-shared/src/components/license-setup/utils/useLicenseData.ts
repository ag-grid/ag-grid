import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { AgCharts } from 'ag-charts-enterprise';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LicensedProducts, Products } from '../types';
import { hasValue } from './hasValue';

type ValidLicenseType = 'gridEnterprise' | 'chartsEnterprise' | 'integratedEnterprise' | 'none';
type LicenseDetails = ReturnType<typeof LicenseManager.getLicenseDetails>;

type ErrorKey = keyof typeof errorConditions;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    hasLicense: boolean;
    license: string;
    licensedProducts: LicensedProducts;
    userProducts: Products;
    noUserProducts: boolean;
    licenseDetails: LicenseDetails;
    chartsLicenseDetails: LicenseDetails;
}

const DEFAULT_USER_PRODUCTS: Products = {
    gridEnterprise: true,
    integratedEnterprise: false,
    chartsEnterprise: false,
};

const validLicenseMessages = {
    valid: 'Valid license key',
    validTrialLicense: 'Valid trial license key',
    gridEnterprise: 'Includes "AG Grid Enterprise"',
    integratedEnterprise: 'Includes "AG Grid Enterprise", "AG Chart Enterprise", and "Integrated Enterprise"',
    chartsEnterprise: 'Includes "AG Charts Enterprise"',
};

const errorConditions = {
    chartsNoGridEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            licensedProducts.charts && !licensedProducts.grid && userProducts.gridEnterprise,
        message: `Your license key does not include "AG Grid Enterprise"`,
    },
    chartsNoIntegratedEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            licensedProducts.charts && !licensedProducts.grid && userProducts.integratedEnterprise,
        message: `Your license key does not include "Integrated Enterprise"`,
    },
    noProducts: {
        getIsError: ({ noUserProducts }: ErrorData) => noUserProducts,
        message: `A license key is not required to use AG Grid Community or AG Charts Community`,
    },
    userLicenseError: {
        getIsError: ({ license, licenseDetails, chartsLicenseDetails }: ErrorData) => {
            const licenseIsValid = licenseDetails.valid || chartsLicenseDetails.valid;
            return hasValue(license) && !licenseIsValid;
        },
        message:
            'License key is not valid. Make sure you are copying the whole license key which was originally provided',
    },
    v2License: {
        getIsError: ({ licenseDetails }: ErrorData) => licenseDetails.version === '2',
        message: 'This license key is not valid for v30+',
    },
    gridNoCharts: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            !licensedProducts.charts && licensedProducts.grid && userProducts.chartsEnterprise,
        message: 'Your license key does not include "AG Charts Enterprise"',
    },
    gridNoIntegratedEnterprise: {
        getIsError: ({ userProducts, licensedProducts }: ErrorData) =>
            !licensedProducts.charts && licensedProducts.grid && userProducts.integratedEnterprise,
        message: `Your license key does not include "Integrated Enterprise"`,
    },
    expired: {
        getIsError: ({ license, licenseDetails }: ErrorData) => {
            const { expired } = licenseDetails;
            return hasValue(license) && Boolean(expired);
        },
        message: 'This license key is expired',
    },
    expiredTrial: {
        getIsError: ({ license, licenseDetails }: ErrorData) => {
            const { trialExpired } = licenseDetails;
            return hasValue(license) && Boolean(trialExpired);
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
    licenseDetails,
    chartsLicenseDetails,
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
                    licenseDetails,
                    chartsLicenseDetails,
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
    }, [hasLicense, license, licensedProducts, userProducts, noUserProducts, licenseDetails, chartsLicenseDetails]);

    return {
        errors,
        hasError: Boolean(Object.keys(errors).length),
    };
};

const updateSearchParams = ({
    products = {} as Products,
    importType,
}: {
    products: Products;
    importType: ImportType;
}) => {
    const url = new URL(window.location);
    const productsParam = url.searchParams.get('products');
    const productsStr = Object.entries(products)
        .map(([key, selectedProduct]) => {
            return selectedProduct ? key : undefined;
        })
        .filter(Boolean)
        .toString();
    const importTypeParam = url.searchParams.get('importType');

    if (productsParam !== productsStr) {
        if (productsStr) {
            url.searchParams.set('products', productsStr);
        } else {
            url.searchParams.delete('products');
        }
    }

    if (importTypeParam !== importType) {
        if (importType) {
            url.searchParams.set('importType', importType);
        } else {
            url.searchParams.delete('importType');
        }
    }

    history.pushState(null, '', url);
};

const useUpdateDataFromUrl = ({
    setUserProducts,
    setImportType,
}: {
    setUserProducts: React.Dispatch<Products>;
    setImportType: React.Dispatch<ImportType>;
}) => {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const productsParam = searchParams.get('products');
        const importTypeParam = searchParams.get('importType');
        const newSearchParams = {} as { products: Products; importType: ImportType };

        if (productsParam) {
            const validProductKeys = Object.keys(DEFAULT_USER_PRODUCTS);
            const productsList = productsParam
                .split(',')
                .map((p) => p.trim())
                .filter((p) => validProductKeys.includes(p));

            if (productsList.length) {
                const productsObj = {} as Products;
                validProductKeys.forEach((key) => {
                    productsObj[key as keyof Products] = productsList.includes(key);
                });
                setUserProducts(productsObj);
                newSearchParams.products = productsObj;
            }
        }

        const importType = importTypeParam?.trim();
        if (['modules', 'packages'].includes(importType as ImportType)) {
            setImportType(importType);
            newSearchParams.importType = importType;
        }

        if (Object.keys(newSearchParams).length) {
            updateSearchParams(newSearchParams);
        }
    }, []);
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

    const {
        version: userLicenseVersion,
        isTrial: userLicenseIsTrial,
        expiry: userLicenseExpiry,
        expired: userLicenseIsExpired,
        trialExpired: userLicenseTrialIsExpired,
    } = licenseDetails;
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
        licenseDetails,
        chartsLicenseDetails,
    });

    useUpdateDataFromUrl({ setUserProducts, setImportType });

    useEffect(() => {
        const url = new URL(window.location);
        const isDebug = url.searchParams.get('debug') === 'true';

        if (isDebug) {
            console.log({
                validLicenseType,
                licenseDetails,
                chartsLicenseDetails,
                errors,
            });
        }
    }, [validLicenseType, licenseDetails, chartsLicenseDetails, errors]);

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
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
        userLicenseExpiry,
        errors,
    };
};
