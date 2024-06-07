import type { ImportType } from '@ag-grid-types';
import { useEffect, useState } from 'react';

import type { LicensedProducts } from '../types';

export const useFormData = () => {
    const [hasLicense, setHasLicense] = useState<boolean>(false);
    const [userLicense, setUserLicense] = useState<string>('');
    const [license, setLicense] = useState<string>('');
    const [importType, setImportType] = useState<ImportType>('packages');
    const [licensedProducts, setLicensedProducts] = useState<LicensedProducts>({
        grid: true,
        charts: false,
    });
    const [useStandaloneCharts, setUseStandaloneCharts] = useState<boolean>(false);

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
        useStandaloneCharts,
        setUseStandaloneCharts,
    };
};
