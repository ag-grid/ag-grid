import { SITE_BASE_URL } from '../constants';
import { pathJoin } from './pathJoin';

export const urlWithBaseUrl = (url: string = '', siteBaseUrl: string = SITE_BASE_URL) => {
    let path = url;
    if (url.startsWith('./')) {
        path = pathJoin('/', siteBaseUrl, url.slice('./'.length));
    } else if (url.startsWith('/')) {
        path = pathJoin('/', siteBaseUrl, url);
    } else if (!url.startsWith('http')) {
        path = pathJoin('/', siteBaseUrl, url);
    }

    return path;
};
