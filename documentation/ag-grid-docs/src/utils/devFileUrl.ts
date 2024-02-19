import { DEV_FILE_BASE_PATH, SITE_BASE_URL } from '@constants';

import { pathJoin } from './pathJoin';

export const getDevFileUrl = ({ filePath }: { filePath: string }) => {
    return pathJoin(SITE_BASE_URL, DEV_FILE_BASE_PATH, filePath);
};
