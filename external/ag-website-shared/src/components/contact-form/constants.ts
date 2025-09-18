import { SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

export type ResultType = 'success' | 'failure';

export const RETURN_URLS: Record<ResultType, string> = {
    success: pathJoin(SITE_URL, urlWithBaseUrl('/contact/success')),
    failure: pathJoin(SITE_URL, urlWithBaseUrl('/contact/failure')),
};
