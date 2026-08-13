import type { InternalFramework } from '@ag-grid-types';
import { FILES_BASE_PATH, NPM_CDN, SITE_BASE_URL, agChartsVersion, agGridVersion, agStackVersion } from '@constants';
import { isReactInternalFramework } from '@utils/framework';
import { isUsingPublishedPackages } from '@utils/pages';
import { pathJoin } from '@utils/pathJoin';

/**
 * Module resolution for examples: every bare specifier an example (or a package it loads)
 * imports needs an entry here, pointing at a browser-ready ES module.
 *
 * AG Grid packages resolve to the local build, or to the published CDN build when the site
 * is built against published packages. Third-party frameworks always come from a CDN.
 */

export type ImportMap = Record<string, string>;

/**
 * The framework versions examples run against by default, deliberately independent of the
 * versions the docs site itself is built with. Overridable per page load with the
 * `?version=` URL parameter (see `injectImportMap`).
 */
const DEFAULT_ANGULAR_VERSION = '20.0.0';
const DEFAULT_REACT_VERSION = '19.2.1';
const DEFAULT_VUE_VERSION = '3.5.17';

/**
 * Companion packages, pinned rather than overridable: they are not the framework whose
 * version an example is being tried against.
 */
const RXJS_VERSION = '7.8.1';
const TSLIB_VERSION = '2.3.1';

/** The URL parameter that overrides the framework version an example runs against */
export const FRAMEWORK_VERSION_PARAM = 'version';

/** `major.minor.patch`, optionally with a pre-release or build suffix */
export const FRAMEWORK_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:[-+][\w.-]+)*$/;

/**
 * React and React DOM have no ES module build on npm, so they resolve through esm.sh.
 * `external=react` keeps React DOM from bundling a second copy of React, which would give
 * the page two renderers and break hooks.
 */
const reactImports = (version: string): ImportMap => ({
    react: `https://esm.sh/react@${version}`,
    'react/': `https://esm.sh/react@${version}/`,
    'react-dom': `https://esm.sh/react-dom@${version}?external=react`,
    'react-dom/': `https://esm.sh/react-dom@${version}&external=react/`,
});

/** `esm-browser` is the build that ships Vue's runtime template compiler */
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
        // rxjs' own ESM build imports its internals without file extensions, which native
        // resolution cannot follow, so it comes from esm.sh with those specifiers resolved
        rxjs: `https://esm.sh/rxjs@${RXJS_VERSION}`,
        'rxjs/': `https://esm.sh/rxjs@${RXJS_VERSION}&external=rxjs/`,
        tslib: `${NPM_CDN}/tslib@${TSLIB_VERSION}/tslib.es6.js`,
    };
};

/** The pinned version an example runs against, or undefined for the frameworkless examples */
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

const getFrameworkImports = (internalFramework: InternalFramework, frameworkVersion?: string): ImportMap => {
    const version = frameworkVersion ?? getDefaultFrameworkVersion(internalFramework);
    if (!version) {
        return {};
    }
    if (isReactInternalFramework(internalFramework)) {
        return reactImports(version);
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

/** Package root for AG packages: either the locally served build or the published CDN build */
const getPackageRoot = (packageName: string) =>
    isUsingPublishedPackages()
        ? `${NPM_CDN}/${packageName}@${getAgPackageVersion(packageName)}`
        : pathJoin(import.meta.env?.PUBLIC_SITE_URL, SITE_BASE_URL, FILES_BASE_PATH, packageName);

const esmEntryPoint = (packageName: string, entryPoint = 'dist/package/main.esm.mjs') =>
    `${getPackageRoot(packageName)}/${entryPoint}`;

/**
 * Trailing-slash prefix so stylesheet specifiers resolve too:
 * `import 'ag-grid-community/styles/ag-grid.css'` becomes an `import.meta.resolve` call,
 * which goes through this map (see transformExampleModule).
 */
const stylesPrefix = (packageName: string) => `${getPackageRoot(packageName)}/styles/`;

export const getImportMap = ({
    internalFramework,
    isEnterprise,
    isIntegratedCharts,
    frameworkVersion,
}: {
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    /** Framework version to resolve against; the pinned default when omitted */
    frameworkVersion?: string;
}): ImportMap => {
    const imports: ImportMap = {
        'ag-stack': esmEntryPoint('ag-stack'),
        'ag-grid-community': esmEntryPoint('ag-grid-community'),
        'ag-grid-community/styles/': stylesPrefix('ag-grid-community'),
        // Every example resolves enterprise, not just the enterprise ones: the generator's
        // test-id block imports it to look up module names given by `?modules=`
        'ag-grid-enterprise': esmEntryPoint('ag-grid-enterprise'),
        'ag-grid-enterprise/styles/': stylesPrefix('ag-grid-enterprise'),
        '@ag-grid-community/locale': esmEntryPoint('@ag-grid-community/locale'),
        ...getFrameworkImports(internalFramework, frameworkVersion),
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
