import { LicenseManager } from '@ag-grid-enterprise/core';
import type { ImportType } from '@ag-grid-types';
import { AgCharts } from 'ag-charts-enterprise';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { LicenseDetails, LicensedProducts } from '../types';
import { hasValue } from './hasValue';
import { updateSearchParams } from './updateSearchParams';
import { useLicenseDebug } from './useLicenseDebug';
import { useUpdateDataFromUrl } from './useUpdateDataFromUrl';

export type LicenseStateKey = keyof typeof licenseDataState;
type LicenseState = Record<LicenseStateKey, string | undefined>;
interface DataState {
    userLicense: string;
    licensedProducts: LicensedProducts;
    isIntegratedCharts: boolean;
    userLicenseVersion?: string;
    userLicenseExpiry?: string;
    userLicenseIsValid: boolean;
    userLicenseIsTrial: boolean;
    userLicenseIsExpired: boolean;
    userLicenseTrialIsExpired: boolean;
    importType: ImportType;
}

const licenseDataState = {
    validGridLicense: {
        getIsState: ({ userLicense, licensedProducts }: DataState) =>
            hasValue(userLicense) && !licensedProducts.charts && licensedProducts.grid,
        message: `Valid AG Grid Enterprise license key`,
    },
    validChartsLicense: {
        getIsState: ({ userLicense, licensedProducts }: DataState) =>
            hasValue(userLicense) && licensedProducts.charts && !licensedProducts.grid,
        message: `Valid AG Charts Enterprise license key`,
    },
    validIntegratedChartsLicense: {
        getIsState: ({ userLicense, licensedProducts }: DataState) =>
            hasValue(userLicense) && licensedProducts.charts && licensedProducts.grid,
        message: `Valid Enterprise Bundle license key. Includes AG Grid Enterprise and AG Chart Enterprise`,
    },
    minimalModulesInfo: {
        getIsState: ({ licensedProducts, importType }: DataState) => licensedProducts.grid && importType === 'modules',
        message:
            "This is the minimal set of modules needed to render AG Grid Enterprise. You may need to include additional modules to this list of dependencies according to the AG Grid Enterprise feature you're using",
    },
    chartsNoGridEnterpriseError: {
        getIsState: ({ licensedProducts }: DataState) => licensedProducts.charts && !licensedProducts.grid,
        message: `Your license key does not include AG Grid Enterprise`,
    },
    gridNoChartsError: {
        getIsState: ({ licensedProducts, isIntegratedCharts }: DataState) =>
            !licensedProducts.charts && licensedProducts.grid && isIntegratedCharts,
        message: `Your license key does not include Integrated Charts`,
    },
    userLicenseError: {
        getIsState: ({ userLicense, userLicenseIsValid }: DataState) => {
            return hasValue(userLicense) && !userLicenseIsValid;
        },
        message:
            'License key is not valid. Make sure you are copying the whole license key which was originally provided',
    },
    v2LicenseError: {
        getIsState: ({ userLicenseVersion }: DataState) => userLicenseVersion === '2',
        message: 'This license key is not valid for AG Grid v30 and later',
    },
    expiredError: {
        getIsState: ({ userLicense, userLicenseIsExpired }: DataState) => {
            return hasValue(userLicense) && userLicenseIsExpired;
        },
        message: 'This license key has expired and cannot be used with the latest version',
    },
    expiredTrialError: {
        getIsState: ({ userLicense, userLicenseTrialIsExpired }: DataState) => {
            return hasValue(userLicense) && userLicenseTrialIsExpired;
        },
        message: 'This trial license key has expired and can no longer be used',
    },
};

const licenseValidKeys: LicenseStateKey[] = ['validGridLicense', 'validChartsLicense', 'validIntegratedChartsLicense'];
const licenseInvalidKeys: LicenseStateKey[] = [
    'expiredError',
    'expiredTrialError',
    'userLicenseError',
    'v2LicenseError',
];

const useLicenseState = ({
    userLicense,
    licensedProducts,
    isIntegratedCharts,
    userLicenseVersion,
    userLicenseExpiry,
    userLicenseIsValid,
    userLicenseIsTrial,
    userLicenseIsExpired,
    userLicenseTrialIsExpired,
    importType,
}: DataState) => {
    const [licenseState, setLicenseState] = useState<LicenseState>({} as LicenseState);

    useEffect(() => {
        const newLicenseState = {} as LicenseState;
        (Object.keys(licenseDataState) as LicenseStateKey[]).forEach((key) => {
            const { getIsState, message } = licenseDataState[key];
            const isError = getIsState({
                userLicense,
                licensedProducts,
                isIntegratedCharts,
                userLicenseVersion,
                userLicenseExpiry,
                userLicenseIsValid,
                userLicenseIsTrial,
                userLicenseIsExpired,
                userLicenseTrialIsExpired,
                importType,
            });

            if (isError) {
                newLicenseState[key] = message;
            } else {
                newLicenseState[key] = undefined;
            }
        });

        setLicenseState((prevLicenseState: LicenseState) => {
            return {
                ...prevLicenseState,
                ...newLicenseState,
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
        importType,
    ]);

    return {
        licenseState,
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

    const { licenseState } = useLicenseState({
        userLicense,
        licensedProducts,
        isIntegratedCharts,
        userLicenseVersion,
        userLicenseExpiry,
        userLicenseIsValid,
        userLicenseIsTrial,
        userLicenseIsExpired,
        userLicenseTrialIsExpired,
        importType,
    });

    useUpdateDataFromUrl({ setIsIntegratedCharts, setImportType });
    useLicenseDebug({
        licenseDetails,
        chartsLicenseDetails,
        licenseState,
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

    const licenseInvalidErrors = useMemo(() => {
        return Object.entries(licenseState)
            .filter(([key, value]) => hasValue(value) && licenseInvalidKeys.includes(key as LicenseStateKey))
            .map(([, message]) => message);
    }, [licenseState]);
    const licenseValidMessage = useMemo(() => {
        return Object.entries(licenseState)
            .filter(([key, value]) => hasValue(value) && licenseValidKeys.includes(key as LicenseStateKey))
            .map(([, message]) => message);
    }, [licenseState]);

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
        licenseState,
        licenseInvalidErrors,
        licenseValidMessage,
    };
};
