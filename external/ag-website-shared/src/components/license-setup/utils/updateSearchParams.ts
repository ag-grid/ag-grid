import type { ImportType } from '@ag-grid-types';

export const updateSearchParams = ({
    integratedCharts,
    importType,
}: {
    integratedCharts: boolean;
    importType: ImportType;
}) => {
    const url = new URL(window.location);
    const integratedChartsParamValue = url.searchParams.get('integratedCharts') === 'true';
    const importTypeParam = url.searchParams.get('importType');

    if (integratedChartsParamValue !== integratedCharts) {
        if (integratedCharts) {
            url.searchParams.set('integratedCharts', 'true');
        } else {
            url.searchParams.delete('integratedCharts');
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
