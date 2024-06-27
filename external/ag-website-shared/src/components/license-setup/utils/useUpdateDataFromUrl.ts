import type { ImportType, Library } from '@ag-grid-types';
import { useEffect } from 'react';

import { updateSearchParams } from './updateSearchParams';

export const useUpdateDataFromUrl = ({
    library,
    setIsIntegratedCharts,
    setImportType,
}: {
    library: Library;
    setIsIntegratedCharts: React.Dispatch<boolean>;
    setImportType: React.Dispatch<ImportType>;
}) => {
    useEffect(() => {
        const newSearchParams = {} as { integratedCharts: boolean; importType: ImportType };

        if (library === 'grid') {
            const searchParams = new URLSearchParams(window.location.search);
            const integratedChartsParam = searchParams.get('integratedCharts');
            const importTypeParam = searchParams.get('importType');

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
        } else {
            newSearchParams.integratedCharts = false;
            newSearchParams.importType = undefined;
        }

        if (Object.keys(newSearchParams).length) {
            updateSearchParams(newSearchParams);
        }
    }, [library]);
};
