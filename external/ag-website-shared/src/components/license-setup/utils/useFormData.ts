import type { ImportType } from '@ag-grid-types';
import { useState } from 'react';

import type { LicensedProducts } from '../types';

export const useFormData = () => {
    const [hasLicense, setHasLicense] = useState<boolean>(false);
    const [license, setLicense] = useState<string>('');
    const [importType, setImportType] = useState<ImportType>('packages');
    const [licensedProducts, setLicensedProducts] = useState<LicensedProducts>({
        grid: true,
        charts: false,
    });
    const [useStandaloneCharts, setUseStandaloneCharts] = useState<boolean>(false);

    return {
        hasLicense,
        setHasLicense,
        license,
        setLicense,
        importType,
        setImportType,
        licensedProducts,
        setLicensedProducts,
        useStandaloneCharts,
        setUseStandaloneCharts,
    };
};
