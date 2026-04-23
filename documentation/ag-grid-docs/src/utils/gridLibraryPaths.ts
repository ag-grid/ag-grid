import { getIsDev } from '@utils/env';

import { PUBLISHED_UMD_URLS, USE_PUBLISHED_PACKAGES } from '../constants';
import { pathJoin } from './pathJoin';

// Serve the non-minified UMD in dev for easier debugging; every non-dev local environment
// (default build preview, staging, archive) requests the `.min.js` variant, which the UMD build
// emits unconditionally (see packages/ag-grid-community/esbuildBuild.cjs). Real production deploys
// short-circuit to PUBLISHED_UMD_URLS (CDN, pre-minified) via USE_PUBLISHED_PACKAGES.
const minSuffix = () => (getIsDev() ? '' : '.min');

export const getGridScriptPath = (sitePrefix?: string) => {
    if (USE_PUBLISHED_PACKAGES) {
        return PUBLISHED_UMD_URLS['ag-grid-community'];
    }
    const sitePrefixUrl = sitePrefix ? sitePrefix : '';
    return pathJoin(sitePrefixUrl, `/files/ag-grid-community/dist/ag-grid-community${minSuffix()}.js`);
};

export const getGridEnterpriseScriptPath = (sitePrefix?: string) => {
    if (USE_PUBLISHED_PACKAGES) {
        return PUBLISHED_UMD_URLS['ag-grid-enterprise'];
    }
    const sitePrefixUrl = sitePrefix ? sitePrefix : '';
    return pathJoin(sitePrefixUrl, `/files/ag-grid-enterprise/dist/ag-grid-enterprise${minSuffix()}.js`);
};

export const getChartsEnterpriseScriptPath = (sitePrefix?: string) => {
    if (USE_PUBLISHED_PACKAGES) {
        return PUBLISHED_UMD_URLS['ag-charts-enterprise'];
    }
    const sitePrefixUrl = sitePrefix ? sitePrefix : '';
    return pathJoin(sitePrefixUrl, `/files/ag-charts-enterprise/dist/umd/ag-charts-enterprise${minSuffix()}.js`);
};

export const getGridLocaleScriptPath = (sitePrefix?: string) => {
    if (USE_PUBLISHED_PACKAGES) {
        return PUBLISHED_UMD_URLS['@ag-grid-community/locale'];
    }
    const sitePrefixUrl = sitePrefix ? sitePrefix : '';
    return pathJoin(
        sitePrefixUrl,
        `/files/@ag-grid-community/locale/dist/umd/@ag-grid-community/locale${minSuffix()}.js`
    );
};

export const getCacheBustingUrl = (url: string, timestamp: number) => `${url}?t=${timestamp}`;
