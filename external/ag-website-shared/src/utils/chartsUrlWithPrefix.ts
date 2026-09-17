import type { Framework } from '@ag-grid-types';
import { addTrailingSlashToPath } from '@ag-website-shared/utils/addTrailingSlash';
import { CHARTS_SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

import { addTrailingSlashToPath } from './addTrailingSlash';

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
        // `pathJoin` strips the trailing slash, so put it back - the charts site is trailing-slash
        // canonical and would otherwise 301 every one of these cross-site links.
        path = addTrailingSlashToPath(pathJoin(siteBaseUrl, framework, url.slice('./'.length)));
    } else if (url.startsWith('/')) {
        path = addTrailingSlashToPath(pathJoin(siteBaseUrl, url));
    }

    // Site pages are directory indexes, so the slash-less form only reaches them via a redirect, and
    // `pathJoin` drops any trailing slash the caller passed in. Anything that was neither `./` nor `/`
    // is a url we did not build, and is returned as it came in.
    return path === url ? path : addTrailingSlashToPath(path);
};
