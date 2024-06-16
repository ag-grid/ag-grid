import { useEffect } from 'react';

import type { LicenseDetails, ValidLicenseType } from '../types';

interface Params {
    validLicenseType: ValidLicenseType;
    licenseDetails: LicenseDetails;
    chartsLicenseDetails: LicenseDetails;
    errors: any;
    userLicenseVersion?: string;
    userLicenseExpiry?: string;
    userLicenseIsValid: boolean;
    userLicenseIsTrial: boolean;
    userLicenseIsExpired: boolean;
    userLicenseTrialIsExpired: boolean;
}

export const useLicenseDebug = ({
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
}: Params) => {
    useEffect(() => {
        const url = new URL(window.location);
        const isDebug = url.searchParams.get('debug') === 'true';

        if (isDebug) {
            console.log({
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
        }
    }, [
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
    ]);
};
