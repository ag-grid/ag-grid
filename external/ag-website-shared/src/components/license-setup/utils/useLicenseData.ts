import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { AgCharts } from 'ag-charts-enterprise';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LicenseDetails, LicensedProducts } from '../types';
import { hasValue } from './hasValue';
import { updateSearchParams } from './updateSearchParams';
import { useLicenseDebug } from './useLicenseDebug';
import { useUpdateDataFromUrl } from './useUpdateDataFromUrl';

type ErrorKey = keyof typeof errorConditions;
type Errors = Record<ErrorKey, string | undefined>;
interface ErrorData {
    userLicense: string;
    licensedProducts: LicensedProducts;
    isIntegratedCharts: boolean;
    userLicenseVersion?: string;
    userLicenseExpiry?: string;
    userLicenseIsValid: boolean;
    userLicenseIsTrial: boolean;
    userLicenseIsExpired: boolean;
    userLicenseTrialIsExpired: boolean;
}

const errorConditions = {
    chartsNoGridEnterprise: {
        getIsError: ({ licensedProducts }: ErrorData) => licensedProducts.charts && !licensedProducts.grid,
        message: `Your license key does not include AG Grid Enterprise`,
    },
    gridNoCharts: {
        getIsError: ({ licensedProducts, isIntegratedCharts }: ErrorData) =>
            !licensedProducts.charts && licensedProducts.grid && isIntegratedCharts,
        message: `Your license key does not include Integrated Charts`,
    },
    userLicenseError: {
        getIsError: ({ userLicense, userLicenseIsValid }: ErrorData) => {
            return hasValue(userLicense) && !userLicenseIsValid;
        },
        message:
            'License key is not valid. Make sure you are copying the whole license key which was originally provided',
    },
    v2License: {
        getIsError: ({ userLicenseVersion }: ErrorData) => userLicenseVersion === '2',
        message: 'This license key is not valid for AG Grid v30 and later',
    },
    expired: {
        getIsError: ({ userLicense, userLicenseIsExpired }: ErrorData) => {
            return hasValue(userLicense) && userLicenseIsExpired;
        },
        message: 'This license key is expired and cannot be used with the latest version',
    },
    expiredTrial: {
        getIsError: ({ userLicense, userLicenseTrialIsExpired }: ErrorData) => {
            return hasValue(userLicense) && userLicenseTrialIsExpired;
        },
        message: 'This trial license key is expired and can no longer be used',
    },
};

const useErrors = ({
    userLicense,
    licensedProducts,
    isIntegratedCharts,
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
            const isError = getIsError({
                userLicense,
                licensedProducts,
                isIntegratedCharts,
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
        userLicense,
        licensedProducts,
        isIntegratedCharts,
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
    /**
     * User input license
     */
    const [userLicense, setUserLicense] = useState<string>('');
    const [isIntegratedCharts, setIsIntegratedCharts] = useState<boolean>(false);
    const [importType, setImportType] = useState<ImportType>('packages');

    const updateIsIntegratedChartsWithUrlUpdate = useCallback(
        (isIntegrated: boolean) => {
            setIsIntegratedCharts(isIntegrated);
            updateSearchParams({ integratedCharts: isIntegrated, importType });
        },
        [importType]
    );
    const updateImportTypeWithUrlUpdate = useCallback(
        (type: ImportType) => {
            setImportType(type);

            updateSearchParams({ integratedCharts: isIntegratedCharts, importType: type });
        },
        [isIntegratedCharts]
    );

    /**
     * Licensed products from license
     */
    const [licensedProducts, setLicensedProducts] = useState<LicensedProducts>({
        grid: false,
        charts: false,
    });

    const licenseDetails = useMemo<LicenseDetails>(() => LicenseManager.getLicenseDetails(userLicense), [userLicense]);
    const chartsLicenseDetails = useMemo<LicenseDetails>(
        () => (AgCharts.getLicenseDetails(userLicense) as LicenseDetails) || {},
        [userLicense]
    );

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

    const { errors } = useErrors({
        userLicense,
        licensedProducts,
        isIntegratedCharts,
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
    });

    useUpdateDataFromUrl({ setIsIntegratedCharts, setImportType });
    useLicenseDebug({
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
        if (!hasValue(userLicense)) {
            return;
        }

        const { suppliedLicenseType } = licenseDetails;
        const gridEnterprise = suppliedLicenseType === 'GRID' || suppliedLicenseType === 'BOTH';
        const isIntegrated = suppliedLicenseType === 'BOTH';
        const chartsEnterprise = suppliedLicenseType === 'CHARTS' || suppliedLicenseType === 'BOTH';

        setLicensedProducts({
            grid: gridEnterprise,
            charts: chartsEnterprise,
        });

        updateIsIntegratedChartsWithUrlUpdate(isIntegrated);
    }, [licenseDetails]);

    return {
        userLicense,
        setUserLicense,
        importType,
        updateImportTypeWithUrlUpdate,
        licensedProducts,
        isIntegratedCharts,
        updateIsIntegratedChartsWithUrlUpdate,

        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
        errors,
    };
};
