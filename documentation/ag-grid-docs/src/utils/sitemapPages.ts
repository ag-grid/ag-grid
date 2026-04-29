import { FRAMEWORK_REDIRECT_PATH } from '@constants';

import { urlWithBaseUrl } from './urlWithBaseUrl';

function addTrailingSlash(path: string) {
    return path.slice(-1) === '/' ? path : `${path}/`;
}

export async function getSitemapIgnorePaths() {
    const ignorePaths = [
        urlWithBaseUrl('/debug'),
        urlWithBaseUrl('/examples'),
        urlWithBaseUrl('/archive'),
        urlWithBaseUrl('/campaigns'),
        // Redirects
        urlWithBaseUrl(`/${FRAMEWORK_REDIRECT_PATH}`),

        // Test pages
        urlWithBaseUrl('/*-data-grid/*-test'),
    ];
    const folderPaths = ignorePaths.map(addTrailingSlash);

    return folderPaths.concat(urlWithBaseUrl('/404'));
}

export async function getSitemapAllowPaths() {
    const allowPaths = [urlWithBaseUrl('/campaigns/beyond-the-prompt')];

    return allowPaths.map(addTrailingSlash);
}
