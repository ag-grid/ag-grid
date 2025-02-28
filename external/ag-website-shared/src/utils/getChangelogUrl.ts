import type { Library } from '@ag-grid-types';
import { PRODUCTION_CHARTS_SITE_URL, PRODUCTION_GRID_SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

interface Params {
    site: Library;
    version: string;
}

export function getChangelogUrl({ site, version }: Params) {
    const changelogBaseUrl = `/changelog/?fixVersion=${version}`;

    const baseUrl = site === 'charts' ? PRODUCTION_CHARTS_SITE_URL : PRODUCTION_GRID_SITE_URL;

    return pathJoin(baseUrl, changelogBaseUrl);
}
