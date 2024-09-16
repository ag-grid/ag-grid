import { isExternalLink } from './isExternalLink';

export function addTrailingSlash(url: string) {
    const hasTrailingSlash = url.endsWith('/');
    const hasAnchor = url.includes('#');
    const externalLink = isExternalLink(url);

    return hasAnchor || hasTrailingSlash || externalLink ? url : url + '/';
}
