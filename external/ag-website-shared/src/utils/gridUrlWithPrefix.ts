import type { Framework } from '@ag-grid-types';
import { GRID_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

export const gridUrlWithPrefix = ({
    url = '',
    framework,
    siteBaseUrl = GRID_URL,
}: {
    url: string;
    framework?: Framework;
    siteBaseUrl?: string;
}): string => {
    let path = url;
    if (url.startsWith('./')) {
        const gridFrameworkPath = `${framework}-data-grid`;
        path = pathJoin(siteBaseUrl, gridFrameworkPath, url.slice('./'.length));
    } else if (url.startsWith('/')) {
        path = pathJoin(siteBaseUrl, url);
    }

    return path;
};
