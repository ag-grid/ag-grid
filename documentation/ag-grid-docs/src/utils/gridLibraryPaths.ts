import { getIsDev } from '@utils/env';

import { PUBLISHED_UMD_URLS, USE_PUBLISHED_PACKAGES, getEnterprisePackageName } from '../constants';
import { pathJoin } from './pathJoin';

export const getGridScriptPath = (sitePrefix?: string) => {
    if (USE_PUBLISHED_PACKAGES) {
        return PUBLISHED_UMD_URLS['ag-grid-community'];
    }
    const sitePrefixUrl = sitePrefix ? sitePrefix : '';
    return pathJoin(sitePrefixUrl, `/files/ag-grid-community/dist/ag-grid-community${getIsDev() ? '' : '.min'}.js`);
};

export const getGridEnterpriseScriptPath = (sitePrefix?: string) => {
    if (USE_PUBLISHED_PACKAGES) {
        return PUBLISHED_UMD_URLS['ag-grid-enterprise'];
    }
    const sitePrefixUrl = sitePrefix ? sitePrefix : '';
    return pathJoin(
        sitePrefixUrl,
        `/files/${getEnterprisePackageName()}/dist/${getEnterprisePackageName()}${getIsDev() ? '' : '.min'}.js`
    );
};

export const getCacheBustingUrl = (url: string, timestamp: number) => `${url}?t=${timestamp}`;
