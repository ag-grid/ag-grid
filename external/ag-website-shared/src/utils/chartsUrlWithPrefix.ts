import type { Framework } from '@ag-grid-types';
import { CHARTS_SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

export const chartsUrlWithPrefix = ({
    url = '',
    framework,
    siteBaseUrl = CHARTS_SITE_URL,
}: {
    url: string;
    framework?: Framework;
    siteBaseUrl?: string;
}): string => {
    let path = url;
    if (url.startsWith('./')) {
        path = pathJoin(siteBaseUrl, framework, url.slice('./'.length));
    } else if (url.startsWith('/')) {
        path = pathJoin(siteBaseUrl, url);
    }

    return path;
};
