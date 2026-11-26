import { SITE_BASE_URL, SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

export type ResultType = 'success' | 'failure';

/** Offered instead of the form when reCAPTCHA cannot load, e.g. where Google is blocked */
export const CONTACT_EMAIL = 'info@ag-grid.com';

const BASE_URL = pathJoin(SITE_URL, SITE_BASE_URL);

export const RETURN_URLS: Record<ResultType, string> = {
    // NOTE: Need to add trailing slash to avoid 302 redirect on S3
    success: pathJoin(BASE_URL, '/contact/success') + '/',
    failure: pathJoin(BASE_URL, '/contact/failure') + '/',
};
