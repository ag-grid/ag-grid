import type { Framework, ImportType, InternalFramework } from './types/ag-grid';

export const FRAMEWORKS: readonly Framework[] = ['react', 'angular', 'vue', 'javascript'] as const;
export const DEFAULT_FRAMEWORK: Framework = FRAMEWORKS[0];

export const INTERNAL_FRAMEWORKS: readonly InternalFramework[] = [
    'vanilla',
    'typescript',
    'reactFunctional',
    'reactFunctionalTs',
    'angular',
    'vue',
    'vue3',
] as const;

export const FRAMEWORK_DISPLAY_TEXT: Record<Framework, string> = {
    javascript: 'JavaScript',
    react: 'React',
    angular: 'Angular',
    vue: 'Vue',
};

export const IMPORT_TYPES: ImportType[] = ['modules', 'packages'];

export const agGridVersion = import.meta.env?.PUBLIC_PACKAGE_VERSION ?? 'unknown';
export const agGridEnterpriseVersion = import.meta.env?.PUBLIC_PACKAGE_VERSION ?? 'unknown';
export const agGridReactVersion = import.meta?.env?.PUBLIC_PACKAGE_VERSION ?? 'unknown';
export const agGridAngularVersion = import.meta.env?.PUBLIC_PACKAGE_VERSION ?? 'unknown';
export const agGridVueVersion = import.meta.env?.PUBLIC_PACKAGE_VERSION ?? 'unknown';
export const agGridVue3Version = import.meta.env?.PUBLIC_PACKAGE_VERSION ?? 'unknown';

export const NPM_CDN = 'https://cdn.jsdelivr.net/npm';
export const PUBLISHED_URLS = {
    'ag-grid-react': `${NPM_CDN}/ag-grid-react@${agGridReactVersion}/`,
    'ag-grid-angular': `${NPM_CDN}/ag-grid-angular@${agGridAngularVersion}/`,
    'ag-grid-vue': `${NPM_CDN}/ag-grid-vue@${agGridVueVersion}/`,
    'ag-grid-vue3': `${NPM_CDN}/ag-grid-vue3@${agGridVueVersion}/`,
    'ag-grid-community': `${NPM_CDN}/ag-grid-community@${agGridVersion}/dist/package/main.cjs.js`,
    'ag-grid-enterprise': `${NPM_CDN}/ag-grid-enterprise@${agGridVersion}/dist/package/main.cjs.js`,
};
export const PUBLISHED_UMD_URLS = {
    'ag-grid-community': `${NPM_CDN}/ag-grid-community@${agGridVersion}/dist/umd/ag-grid-community.js`,
    'ag-grid-enterprise': `${NPM_CDN}/ag-grid-enterprise@${agGridVersion}/dist/umd/ag-grid-enterprise.js`,
};

export const DOCS_TAB_ITEM_ID_PREFIX = 'reference-';

/**
 * Site base URL
 *
 * ie undefined for dev, /ag-charts for staging
 *
 * NOTE: Includes trailing slash (`/`)
 */
export const SITE_BASE_URL =
    // Astro default env var (for build time)
    import.meta.env?.BASE_URL ||
    // `.env.*` override (for client side)
    import.meta.env?.PUBLIC_BASE_URL.replace(/\/?$/, '/');

/*
 * Site URL
 *
 * ie http://localhost:4610 for dev, https://grid-staging.ag-grid.com for staging
 */
export const SITE_URL = import.meta.env?.SITE_URL || import.meta.env?.PUBLIC_SITE_URL;

export const STAGING_SITE_URL = 'https://grid-staging.ag-grid.com';
export const PRODUCTION_SITE_URL = 'https://ag-grid.com';
export const USE_PUBLISHED_PACKAGES = ['1', 'true'].includes(import.meta.env?.PUBLIC_USE_PUBLISHED_PACKAGES);

/**
 * Number of URL segments in `SITE_BASE_URL`
 */
export const SITE_BASE_URL_SEGMENTS = SITE_BASE_URL?.split('/').filter(Boolean).length || 0;

/**
 * URL prefix to serve files
 */
export const FILES_BASE_PATH = '/files';

// TODO: Remove once all docs are implemented
export const getIsImplemented = ({
    internalFramework,
    importType,
}: {
    internalFramework: InternalFramework;
    importType: ImportType;
}) => {
    return internalFramework === 'typescript' && importType === 'modules';
};
