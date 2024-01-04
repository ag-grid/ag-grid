import {
    agGridAngularVersion,
    agGridEnterpriseVersion,
    agGridReactVersion,
    agGridStylesVersion,
    agGridVersion,
    agGridVue3Version,
    agGridVueVersion,
    IS_SSR,
    NPM_CDN,
} from 'utils/consts';
import React from 'react';

import isDevelopment from 'utils/is-development';
import { isUsingPublishedPackages } from './helpers';

// prettier-ignore
const REGISTRY_PACKAGES = {
    'ag-grid-systemjs-plugin': { version: agGridVersion, main: 'index.js' },
    'ag-charts-react': { version: null, main: 'dist/index.mjs' },
    'ag-charts-angular': { version: null, main: 'esm2020/ag-charts-angular.mjs' },
    'ag-charts-vue': { version: null, main: 'dist/ag-charts-vue.umd.js' },
    'ag-grid-community': { version: agGridVersion, main: 'dist/ag-grid-community.umd.js' },
    'ag-grid-enterprise': { version: agGridEnterpriseVersion, main: 'dist/ag-grid-enterprise.umd.js' },
    'ag-grid-angular': { version: agGridAngularVersion, main: 'dist/esm2020/ag-grid-angular.mjs' },
    'ag-grid-react': { version: agGridReactVersion, main: 'bundles/ag-grid-react.min.js' },
    'ag-grid-vue': { version: agGridVueVersion, main: 'dist/ag-grid-vue.umd.js' },
    'ag-grid-vue3': { version: agGridVue3Version, main: 'dist/ag-grid-vue3.umd.js' },
    'ag-grid-community/styles': { version: agGridStylesVersion, main: '/' },
    '@ag-grid-community/styles': { version: agGridStylesVersion, main: '/' },
    '@ag-grid-community/angular': { version: agGridAngularVersion, main: 'dist/ag-grid-angular/fesm2020/ag-grid-community-angular.mjs' },
    '@ag-grid-community/react': { version: agGridReactVersion, main: 'lib/main.mjs' },
    '@ag-grid-community/vue': { version: agGridVueVersion, main: 'dist/@ag-grid-community/vue.umd.js' },
    '@ag-grid-community/vue3': { version: agGridVue3Version, main: 'dist/vue3.umd.js' },
    '@ag-grid-community/all-modules': { version: agGridVersion, main: './dist/esm/es6/main.mjs'},
    '@ag-grid-community/core': { version: agGridVersion, main: './dist/esm/es6/main.mjs' },
    '@ag-grid-community/client-side-row-model': { version: agGridVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-community/csv-export': { version: agGridVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-community/infinite-row-model': { version: agGridVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/all-modules': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs'},
    '@ag-grid-enterprise/advanced-filter': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/charts': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/clipboard': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/column-tool-panel': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/core': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/excel-export': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/filter-tool-panel': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/master-detail': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/menu': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/multi-filter': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/range-selection': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/rich-select': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/row-grouping': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/server-side-row-model': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/set-filter': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/side-bar': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/sparklines': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/status-bar': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
    '@ag-grid-enterprise/viewport-row-model': { version: agGridEnterpriseVersion, main: 'dist/esm/es6/main.mjs' },
};

const IMPORT_ALIASES = {
    // ag-grid-community AMD dependency is renamed in ag-grid-react build process and ag-grid-vue configuration
    agGrid: 'ag-grid-community',
};

function getPackageUrl(name, version) {
    if (isUsingPublishedPackages()) return `${NPM_CDN}/${name}@${version}`;
    const host =
        isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST;
    return `//${host}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev/${name}`;
}

const getModulePathMappings = () => {
    const registryMappings = Object.fromEntries(
        Object.entries(REGISTRY_PACKAGES).map(([packageName, { version, main }]) => [
            main === '/' ? `${packageName}/` : packageName,
            `${getPackageUrl(packageName, version)}${main === '/' ? main : `/${main}`}`,
        ])
    );
    const aliasMappings = Object.fromEntries(
        Object.entries(IMPORT_ALIASES).map(([key, value]) => [key, registryMappings[value]])
    );
    return {
        ...registryMappings,
        ...aliasMappings,
    };
};

/**
 * Our framework examples use SystemJS to load the various dependencies. This component is used to insert the required
 * code to load SystemJS and the relevant modules depending on the framework.
 */
const SystemJs = ({ library, boilerplatePath, appLocation, startFile, options, framework }) => {
    const systemJsPath = `${boilerplatePath}systemjs.config.js`;

    const packageMappings = getModulePathMappings();

    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            var appLocation = '${appLocation}';
            var boilerplatePath = '${boilerplatePath}';
            var NPM_REGISTRY = '${NPM_CDN}';
            var systemJsMap = ${JSON.stringify(packageMappings, null, 4).replace(
                /\n/g,
                `
            `
            )};
            var systemjs = {
                babel: {
                    shouldTransform(url, extension, contentType) {
                        if (extension === '.css') return false;
                        if (extension === '.js') {
                            if (/@ag-grid-(community|enterprise)\\//.test(url)) return true;
                            if (url.includes('.esm-browser.js') || url.includes('.esm-browser.prod.js')) return true;
                            if (
                                url.startsWith(window.location.href) ||
                                (new URL(url).host === window.location.host && new URL(url).pathname.startsWith('/examples/'))
                            ) return true;
                            return false;
                        }
                        return true;
                    },
                },
            };
        `,
                }}
            />
            <script src={`${NPM_CDN}/systemjs@6.14.2/dist/s.js`} />
            <script src={`${NPM_CDN}/systemjs@6.14.2/dist/extras/amd.js`}></script>
            <script src={`${NPM_CDN}/systemjs@6.14.2/dist/extras/named-register.js`}></script>
            <script src={packageMappings['ag-grid-systemjs-plugin']} />
            <script src={systemJsPath} />
            <script type="systemjs-module" src={startFile} />
        </>
    );
};

export default SystemJs;
