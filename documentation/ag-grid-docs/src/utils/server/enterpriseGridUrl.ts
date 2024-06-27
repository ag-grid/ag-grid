import { PUBLISHED_URLS, USE_PUBLISHED_PACKAGES } from '@constants';
import { getExtraFileUrl } from '@utils/extraFileUrl';
import { pathJoin } from '@utils/pathJoin';

export const enterpriseGridUrl = USE_PUBLISHED_PACKAGES
    ? pathJoin(PUBLISHED_URLS['ag-grid-charts-enterprise'], 'dist/ag-grid-charts-enterprise.min.js')
    : getExtraFileUrl({ filePath: 'ag-grid-charts-enterprise/dist/ag-grid-charts-enterprise.js' });
