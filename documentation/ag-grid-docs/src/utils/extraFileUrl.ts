import { FILES_BASE_PATH, SITE_BASE_URL } from '@constants';

import { pathJoin } from './pathJoin';

export const getExtraFileUrl = ({ filePath }: { filePath: string }) => {
    return pathJoin(SITE_BASE_URL, FILES_BASE_PATH, filePath);
};
