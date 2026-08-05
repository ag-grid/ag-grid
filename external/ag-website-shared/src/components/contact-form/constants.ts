import { CHARTS_SITE_URL, GRID_URL, LIBRARY } from '@constants';
import { pathJoin } from '@utils/pathJoin';

export type ResultType = 'success' | 'failure';

const BASE_URL = LIBRARY === 'charts' ? CHARTS_SITE_URL : GRID_URL;

export const RETURN_URLS: Record<ResultType, string> = {
    // NOTE: Need to add trailing slash to avoid 302 redirect on S3
    success: pathJoin(BASE_URL, '/contact/success') + '/',
    failure: pathJoin(BASE_URL, '/contact/failure') + '/',
};
