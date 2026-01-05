import { GRID_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

export type ResultType = 'success' | 'failure';

export const RETURN_URLS: Record<ResultType, string> = {
    // NOTE: Need to add trailing slash to avoid 302 redirect on S3
    success: pathJoin(GRID_URL, '/contact/success') + '/',
    failure: pathJoin(GRID_URL, '/contact/failure') + '/',
};
