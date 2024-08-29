import { urlWithBaseUrl } from './urlWithBaseUrl';

function addTrailingSlash(path: string) {
    return path.slice(-1) === '/' ? path : `${path}/`;
}

export async function getSitemapIgnorePaths() {
    const folderPaths = [
        urlWithBaseUrl('/debug'),
        urlWithBaseUrl('/examples'),
        urlWithBaseUrl('/archive'),
        urlWithBaseUrl('/charts/archive'),
    ].map(addTrailingSlash);

    return folderPaths.concat(urlWithBaseUrl('/404'));
}
