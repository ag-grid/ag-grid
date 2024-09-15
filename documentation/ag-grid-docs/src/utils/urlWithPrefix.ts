import type { Framework } from '@ag-grid-types';
import { SITE_BASE_URL } from '@constants';
import { getFrameworkPath } from '@features/docs/utils/urlPaths';
import { getIsDev } from '@utils/env';
import { pathJoin } from '@utils/pathJoin';

export const urlWithPrefix = ({
    url = '',
    framework,
    siteBaseUrl = SITE_BASE_URL,
    trailingSlash,
}: {
    url: string;
    framework?: Framework;
    siteBaseUrl?: string;
    trailingSlash?: boolean;
}): string => {
    let path = url;
    if (url.startsWith('./')) {
        const frameworkPath = getFrameworkPath(framework!);
        path = pathJoin('/', siteBaseUrl, frameworkPath, url.slice('./'.length));
    } else if (url.startsWith('/')) {
        path = pathJoin('/', siteBaseUrl, url);
    } else if (!url.startsWith('#') && !url.startsWith('http') && !url.startsWith('mailto')) {
        const errorMessage = `Invalid url: ${url} - use './' for framework urls, '/' for root urls, '#' for anchor links, and http/mailto for external urls`;
        if (getIsDev()) {
            // eslint-disable-next-line no-console
            console.warn(errorMessage);
        } else {
            throw new Error(errorMessage);
        }
    }

    if (trailingSlash && !path.includes('#')) {
        path = path + '/';
    }

    return path;
};
