import { PRODUCTION_SITE_URLS, SITE_BASE_URL, SITE_URL, STAGING_SITE_URL } from '../constants';

export const getIsDev = () => process.env.NODE_ENV === 'development' || import.meta.env?.DEV;
export const getIsStaging = () => SITE_URL === STAGING_SITE_URL;
/**
 * Production environment, including archive
 */
export const getIsProduction = () => PRODUCTION_SITE_URLS.includes(SITE_URL);
export const getIsArchive = () => getIsProduction() && SITE_BASE_URL.includes('archive');
