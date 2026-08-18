import type { InternalFramework } from '@ag-grid-types';
import { FILES_BASE_PATH, NPM_CDN, SITE_BASE_URL, agChartsVersion, agGridVersion, agStackVersion } from '@constants';
import { isReactInternalFramework } from '@utils/framework';
import { isUsingPublishedPackages } from '@utils/pages';
import { pathJoin } from '@utils/pathJoin';

export type ImportMap = Record<string, string>;

const DEFAULT_ANGULAR_VERSION = '20.0.0';
const DEFAULT_REACT_VERSION = '19.2.1';
const DEFAULT_VUE_VERSION = '3.5.17';

const RXJS_VERSION = '7.8.1';
const TSLIB_VERSION = '2.3.1';

export const FRAMEWORK_VERSION_PARAM = 'version';

export const FRAMEWORK_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;

export const PROD_PARAM = 'prod';

export interface DevFlags {
    query: string;
    appended: string;
}

export const PRODUCTION_FLAGS: DevFlags = { query: '', appended: '' };
export const DEVELOPMENT_FLAGS: DevFlags = { query: '?dev', appended: '&dev' };

export const FRAMEWORK_VERSION_PLACEHOLDER = '0.0.0-ag-framework-version';

export const DEV_FLAG_PLACEHOLDERS: DevFlags = {
    query: '?ag-dev-query',
    appended: '&ag-dev-appended',
};

const reactImports = (version: string, { query, appended }: DevFlags): ImportMap => ({
    react: `https://esm.sh/react@${version}${query}`,
    'react/': `https://esm.sh/react@${version}${appended}/`,
    'react-dom': `https://esm.sh/react-dom@${version}?external=react${appended}`,
    'react-dom/': `https://esm.sh/react-dom@${version}&external=react${appended}/`,
});

const vueImports = (version: string): ImportMap => ({
    vue: `${NPM_CDN}/vue@${version}/dist/vue.esm-browser.js`,
});

const angularImports = (version: string): ImportMap => {
    const angularPackage = (name: string, entryPoint = name) =>
        `${NPM_CDN}/@angular/${name}@${version}/fesm2022/${entryPoint}.mjs`;

    return {
        '@angular/animations': angularPackage('animations'),
        '@angular/animations/browser': angularPackage('animations', 'browser'),
        '@angular/common': angularPackage('common'),
        '@angular/common/http': angularPackage('common', 'http'),
        '@angular/compiler': angularPackage('compiler'),
        '@angular/core': angularPackage('core'),
        '@angular/core/primitives/di': angularPackage('core', 'primitives/di'),
        '@angular/core/primitives/event-dispatch': angularPackage('core', 'primitives/event-dispatch'),
        '@angular/core/primitives/signals': angularPackage('core', 'primitives/signals'),
        '@angular/forms': angularPackage('forms'),
        '@angular/platform-browser': angularPackage('platform-browser'),
        '@angular/platform-browser/animations': angularPackage('platform-browser', 'animations'),
        '@angular/platform-browser-dynamic': angularPackage('platform-browser-dynamic'),
        rxjs: `https://esm.sh/rxjs@${RXJS_VERSION}`,
        'rxjs/': `https://esm.sh/rxjs@${RXJS_VERSION}&external=rxjs/`,
        tslib: `${NPM_CDN}/tslib@${TSLIB_VERSION}/tslib.es6.js`,
    };
};

export const getDefaultFrameworkVersion = (internalFramework: InternalFramework): string | undefined => {
    if (isReactInternalFramework(internalFramework)) {
        return DEFAULT_REACT_VERSION;
    }
    if (internalFramework === 'angular') {
        return DEFAULT_ANGULAR_VERSION;
    }
    if (internalFramework === 'vue3') {
        return DEFAULT_VUE_VERSION;
    }
    return undefined;
};

const getFrameworkImports = (
    internalFramework: InternalFramework,
    frameworkVersion?: string,
    dev: DevFlags = PRODUCTION_FLAGS
): ImportMap => {
    const version = frameworkVersion ?? getDefaultFrameworkVersion(internalFramework);
    if (!version) {
        return {};
    }
    if (isReactInternalFramework(internalFramework)) {
        return reactImports(version, dev);
    }
    if (internalFramework === 'angular') {
        return angularImports(version);
    }
    if (internalFramework === 'vue3') {
        return vueImports(version);
    }
    return {};
};

const getAgPackageVersion = (packageName: string) => {
    if (packageName.startsWith('ag-charts')) {
        return agChartsVersion;
    }
    return packageName === 'ag-stack' ? agStackVersion : agGridVersion;
};

const getPackageRoot = (packageName: string) =>
    isUsingPublishedPackages()
        ? `${NPM_CDN}/${packageName}@${getAgPackageVersion(packageName)}`
        : pathJoin(import.meta.env?.PUBLIC_SITE_URL, SITE_BASE_URL, FILES_BASE_PATH, packageName);

const esmEntryPoint = (packageName: string, entryPoint = 'dist/package/main.esm.mjs') =>
    `${getPackageRoot(packageName)}/${entryPoint}`;

const stylesPrefix = (packageName: string) => `${getPackageRoot(packageName)}/styles/`;

export const getImportMap = ({
    internalFramework,
    isEnterprise,
    isIntegratedCharts,
    frameworkVersion,
    dev = PRODUCTION_FLAGS,
}: {
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    frameworkVersion?: string;
    dev?: DevFlags;
}): ImportMap => {
    const imports: ImportMap = {
        'ag-stack': esmEntryPoint('ag-stack'),
        'ag-grid-community': esmEntryPoint('ag-grid-community'),
        'ag-grid-community/styles/': stylesPrefix('ag-grid-community'),
        'ag-grid-enterprise': esmEntryPoint('ag-grid-enterprise'),
        'ag-grid-enterprise/styles/': stylesPrefix('ag-grid-enterprise'),
        '@ag-grid-community/locale': esmEntryPoint('@ag-grid-community/locale'),
        ...getFrameworkImports(internalFramework, frameworkVersion, dev),
    };

    if (isEnterprise || isIntegratedCharts) {
        for (const chartsPackage of [
            'ag-charts-types',
            'ag-charts-core',
            'ag-charts-community',
            'ag-charts-enterprise',
        ]) {
            imports[chartsPackage] = esmEntryPoint(chartsPackage);
        }
    }

    if (isReactInternalFramework(internalFramework)) {
        imports['ag-grid-react'] = esmEntryPoint('ag-grid-react', 'dist/package/index.esm.mjs');
    } else if (internalFramework === 'angular') {
        imports['ag-grid-angular'] = esmEntryPoint('ag-grid-angular', 'fesm2022/ag-grid-angular.mjs');
    } else if (internalFramework === 'vue3') {
        imports['ag-grid-vue3'] = esmEntryPoint('ag-grid-vue3', 'dist/main.mjs');
    }

    return Object.fromEntries(Object.entries(imports).sort(([a], [b]) => (a < b ? -1 : 1)));
};
