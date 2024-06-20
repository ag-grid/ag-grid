import type { ImportType } from '@ag-grid-types';
import { useEffect } from 'react';

import { updateSearchParams } from './updateSearchParams';

export const useUpdateDataFromUrl = ({
    setIsIntegratedCharts,
    setImportType,
}: {
    setIsIntegratedCharts: React.Dispatch<boolean>;
    setImportType: React.Dispatch<ImportType>;
}) => {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const integratedChartsParam = searchParams.get('integratedCharts');
        const importTypeParam = searchParams.get('importType');
        const newSearchParams = {} as { integratedCharts: boolean; importType: ImportType };

        if (integratedChartsParam) {
            if (integratedChartsParam === 'true') {
                setIsIntegratedCharts(true);
                newSearchParams.integratedCharts = true;
            } else {
                setIsIntegratedCharts(false);
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
