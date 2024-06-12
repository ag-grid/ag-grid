import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { AgCharts } from 'ag-charts-enterprise';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LicensedProducts, Products } from '../types';
import { hasValue } from './hasValue';

type ErrorKey = keyof typeof errorConditions;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    hasLicense: boolean;
    license: string;
    licensedProducts: LicensedProducts;
    userProducts: Products;
    noUserProducts: boolean;
    licenseDetails: ReturnType<typeof LicenseManager.getLicenseDetails>;
    chartsLicenseDetails: ReturnType<typeof AgCharts.getLicenseDetails>;
}

const DEFAULT_USER_PRODUCTS: Products = {
    gridEnterprise: true,
    integratedEnterprise: false,
    chartsEnterprise: false,
};

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
        getIsError: ({ noUserProducts }: ErrorData) => noUserProducts,
        message: `A license is not required to use AG Grid community or AG Charts Community`,
    },
    userLicenseError: {
        getIsError: ({ hasLicense, license, licenseDetails, chartsLicenseDetails }: ErrorData) => {
            const licenseIsValid = licenseDetails.valid || chartsLicenseDetails.valid;
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
            const isError = getIsError({
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

const updateSearchParams = ({ products = {}, importType }: { products: Products; importType: ImportType }) => {
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
    const licenseDetails = useMemo(() => LicenseManager.getLicenseDetails(license), [license]);
    const chartsLicenseDetails = useMemo(() => AgCharts.getLicenseDetails(license) || {}, [license]);

    const { version: userLicenseVersion, isTrial: userLicenseIsTrial, expiry: userLicenseExpiry } = licenseDetails;
    const validLicenseText = useMemo<string>(() => {
        let text = '';
        if (
            licenseDetails.suppliedLicenseType !== 'CHARTS' &&
            licenseDetails.valid &&
            !licenseDetails.expired &&
            !licenseDetails.trialExpired
        ) {
            let supportsText = '';
            if (licenseDetails.suppliedLicenseType === 'GRID') {
                supportsText = `Supports "Grid Enterprise"`;
            } else if (licenseDetails.suppliedLicenseType === 'BOTH') {
                supportsText = `Supports "Grid Enterprise", "Integrated Enterprise" and "Chart Enterprise"`;
            }
            text = `Valid license. ${supportsText}`;
        } else if (
            licenseDetails.suppliedLicenseType === 'CHARTS' &&
            chartsLicenseDetails.valid &&
            !chartsLicenseDetails.expired &&
            !chartsLicenseDetails.trialExpired
        ) {
            text = `Valid license. Supports "Chart Enterprise"`;
        }

        return text;
    }, [licenseDetails, chartsLicenseDetails]);

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
        userLicenseExpiry,
        errors,
    };
};
