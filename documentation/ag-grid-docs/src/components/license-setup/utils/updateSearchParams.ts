import { replaceHistoryUrl } from '@ag-website-shared/utils/historyUrl';

export const updateSearchParams = ({ integratedCharts }: { integratedCharts: boolean }) => {
    const url = new URL(window.location);
    const integratedChartsParamValue = url.searchParams.get('integratedCharts') === 'true';

    if (integratedChartsParamValue !== integratedCharts) {
        if (integratedCharts) {
            url.searchParams.set('integratedCharts', 'true');
        } else {
            url.searchParams.delete('integratedCharts');
        }
    }

    // A filter, not a navigation: no page-level popstate handler services these entries, so
    // pushing one leaves back moving the URL with nothing reacting to it.
    replaceHistoryUrl(url);
};
