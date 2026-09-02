import type { Framework } from '@ag-grid-types';
import { addTrailingSlashToPath } from '@ag-website-shared/utils/addTrailingSlashToPath';
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

    // Site pages are directory indexes, so the slash-less form only reaches them via a redirect, and
    // `pathJoin` drops any trailing slash the caller passed in. Anything that was neither `./` nor `/`
    // is a url we did not build, and is returned as it came in.
    return path === url ? path : addTrailingSlashToPath(path);
};
