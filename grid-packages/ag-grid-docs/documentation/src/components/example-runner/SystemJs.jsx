import React from 'react';
import {
    agChartsAngularVersion,
    agChartsReactVersion,
    agChartsVersion,
    agChartsVueVersion,
    agGridAngularVersion,
    agGridReactVersion,
    agGridVersion,
    agGridVue3Version,
    agGridVueVersion,
    agGridEnterpriseVersion,
    localPrefix
} from 'utils/consts';

import { isUsingPublishedPackages } from './helpers';
import isDevelopment from 'utils/is-development';

const localConfiguration = {
    gridMap: {
        "@ag-grid-community/styles": `${localPrefix}/@ag-grid-community/styles`,
        "@ag-grid-community/react": `${localPrefix}/@ag-grid-community/react`,
        "@ag-grid-community/angular": `${localPrefix}/@ag-grid-community/angular`,
        "@ag-grid-community/vue": `${localPrefix}/@ag-grid-community/vue`,
        "@ag-grid-community/vue3": `${localPrefix}/@ag-grid-community/vue3`,
        "ag-charts-react": `${localPrefix}/ag-charts-react`,
        "ag-charts-angular": `${localPrefix}/ag-charts-angular`,
        "ag-charts-vue": `${localPrefix}/ag-charts-vue`,
        "ag-charts-vue3": `${localPrefix}/ag-charts-vue3`,
        "ag-grid-community": `${localPrefix}/ag-grid-community`,
        "ag-grid-enterprise": `${localPrefix}/ag-grid-enterprise`,
        "ag-grid-angular": `${localPrefix}/ag-grid-angular`,
        "ag-grid-react": `${localPrefix}/ag-grid-react`,
        "ag-grid-vue": `${localPrefix}/ag-grid-vue`,
        "ag-grid-vue3": `${localPrefix}/ag-grid-vue3`
    },
    gridCommunityPaths: {
        /* START OF GRID COMMUNITY MODULES PATHS DEV - DO NOT DELETE */
        "@ag-grid-community/client-side-row-model": `${localPrefix}/@ag-grid-community/client-side-row-model/dist/client-side-row-model.cjs.js`,
        "@ag-grid-community/core": `${localPrefix}/@ag-grid-community/core/dist/core.cjs.js`,
        "@ag-grid-community/csv-export": `${localPrefix}/@ag-grid-community/csv-export/dist/csv-export.cjs.js`,
        "@ag-grid-community/infinite-row-model": `${localPrefix}/@ag-grid-community/infinite-row-model/dist/infinite-row-model.cjs.js`,
        /* END OF GRID COMMUNITY MODULES PATHS DEV - DO NOT DELETE */
        "ag-charts-community": `${localPrefix}/ag-charts-community/dist/ag-charts-community.cjs.js`,
    },
    gridEnterprisePaths: {
        /* START OF GRID ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */
        "@ag-grid-community/client-side-row-model": `${localPrefix}/@ag-grid-community/client-side-row-model/dist/client-side-row-model.cjs.js`,
        "@ag-grid-community/core": `${localPrefix}/@ag-grid-community/core/dist/core.cjs.js`,
        "@ag-grid-community/csv-export": `${localPrefix}/@ag-grid-community/csv-export/dist/csv-export.cjs.js`,
        "@ag-grid-community/infinite-row-model": `${localPrefix}/@ag-grid-community/infinite-row-model/dist/infinite-row-model.cjs.js`,
        "@ag-grid-enterprise/charts": `${localPrefix}/@ag-grid-enterprise/charts/dist/charts.cjs.js`,
        "@ag-grid-enterprise/clipboard": `${localPrefix}/@ag-grid-enterprise/clipboard/dist/clipboard.cjs.js`,
        "@ag-grid-enterprise/column-tool-panel": `${localPrefix}/@ag-grid-enterprise/column-tool-panel/dist/column-tool-panel.cjs.js`,
        "@ag-grid-enterprise/core": `${localPrefix}/@ag-grid-enterprise/core/dist/core.cjs.js`,
        "@ag-grid-enterprise/excel-export": `${localPrefix}/@ag-grid-enterprise/excel-export/dist/excel-export.cjs.js`,
        "@ag-grid-enterprise/filter-tool-panel": `${localPrefix}/@ag-grid-enterprise/filter-tool-panel/dist/filter-tool-panel.cjs.js`,
        "@ag-grid-enterprise/master-detail": `${localPrefix}/@ag-grid-enterprise/master-detail/dist/master-detail.cjs.js`,
        "@ag-grid-enterprise/menu": `${localPrefix}/@ag-grid-enterprise/menu/dist/menu.cjs.js`,
        "@ag-grid-enterprise/multi-filter": `${localPrefix}/@ag-grid-enterprise/multi-filter/dist/multi-filter.cjs.js`,
        "@ag-grid-enterprise/range-selection": `${localPrefix}/@ag-grid-enterprise/range-selection/dist/range-selection.cjs.js`,
        "@ag-grid-enterprise/rich-select": `${localPrefix}/@ag-grid-enterprise/rich-select/dist/rich-select.cjs.js`,
        "@ag-grid-enterprise/row-grouping": `${localPrefix}/@ag-grid-enterprise/row-grouping/dist/row-grouping.cjs.js`,
        "@ag-grid-enterprise/server-side-row-model": `${localPrefix}/@ag-grid-enterprise/server-side-row-model/dist/server-side-row-model.cjs.js`,
        "@ag-grid-enterprise/set-filter": `${localPrefix}/@ag-grid-enterprise/set-filter/dist/set-filter.cjs.js`,
        "@ag-grid-enterprise/side-bar": `${localPrefix}/@ag-grid-enterprise/side-bar/dist/side-bar.cjs.js`,
        "@ag-grid-enterprise/sparklines": `${localPrefix}/@ag-grid-enterprise/sparklines/dist/sparklines.cjs.js`,
        "@ag-grid-enterprise/status-bar": `${localPrefix}/@ag-grid-enterprise/status-bar/dist/status-bar.cjs.js`,
        "@ag-grid-enterprise/viewport-row-model": `${localPrefix}/@ag-grid-enterprise/viewport-row-model/dist/viewport-row-model.cjs.js`,
        /* END OF GRID ENTERPRISE MODULES PATHS DEV - DO NOT DELETE */
        "ag-charts-community": `${localPrefix}/ag-charts-community/dist/ag-charts-community.cjs.js`
    },
    chartMap: {
        "ag-charts-react": `${localPrefix}/ag-charts-react`,
        "ag-charts-angular": `${localPrefix}/ag-charts-angular`,
        "ag-charts-vue": `${localPrefix}/ag-charts-vue`,
        "ag-charts-vue3": `${localPrefix}/ag-charts-vue3`
    },
    chartPaths: {
        "ag-charts-community": `${localPrefix}/ag-charts-community/dist/ag-charts-community.cjs.js`,
    }
};

const publishedConfiguration = {
    gridMap: {
        "@ag-grid-community/styles": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles`,
        "@ag-grid-community/react": `https://unpkg.com/@ag-grid-community/react@${agGridReactVersion}/`,
        "@ag-grid-community/angular": `https://unpkg.com/@ag-grid-community/angular@${agGridAngularVersion}/`,
        "@ag-grid-community/vue": `https://unpkg.com/@ag-grid-community/vue@${agGridVueVersion}/`,
        "@ag-grid-community/vue3": `https://unpkg.com/@ag-grid-community/vue3@${agGridVue3Version}/`,
        "ag-grid-community": `https://unpkg.com/ag-grid-community@${agGridVersion}/`,
        "ag-grid-enterprise": `https://unpkg.com/ag-grid-enterprise@${agGridEnterpriseVersion}/`,
        "ag-grid-angular": `https://unpkg.com/ag-grid-angular@${agGridAngularVersion}/`,
        "ag-grid-react": `https://unpkg.com/ag-grid-react@${agGridReactVersion}/`,
        "ag-grid-vue": `https://unpkg.com/ag-grid-vue@${agGridVueVersion}/`,
        "ag-grid-vue3": `https://unpkg.com/ag-grid-vue3@${agGridVue3Version}/`
    },
    gridCommunityPaths: {
        /* START OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
        "@ag-grid-community/client-side-row-model": `https://unpkg.com/@ag-grid-community/client-side-row-model@${agGridVersion}/dist/client-side-row-model.cjs.min.js`,
        "@ag-grid-community/core": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/core.cjs.min.js`,
        "@ag-grid-community/csv-export": `https://unpkg.com/@ag-grid-community/csv-export@${agGridVersion}/dist/csv-export.cjs.min.js`,
        "@ag-grid-community/infinite-row-model": `https://unpkg.com/@ag-grid-community/infinite-row-model@${agGridVersion}/dist/infinite-row-model.cjs.min.js`,
        /* END OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
    },
    gridEnterprisePaths: {
        /* START OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
        "@ag-grid-community/client-side-row-model": `https://unpkg.com/@ag-grid-community/client-side-row-model@${agGridVersion}/dist/client-side-row-model.cjs.min.js`,
        "@ag-grid-community/core": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/core.cjs.min.js`,
        "@ag-grid-community/csv-export": `https://unpkg.com/@ag-grid-community/csv-export@${agGridVersion}/dist/csv-export.cjs.min.js`,
        "@ag-grid-community/infinite-row-model": `https://unpkg.com/@ag-grid-community/infinite-row-model@${agGridVersion}/dist/infinite-row-model.cjs.min.js`,
        "@ag-grid-enterprise/charts": `https://unpkg.com/@ag-grid-enterprise/charts@${agGridVersion}/dist/charts.cjs.min.js`,
        "@ag-grid-enterprise/clipboard": `https://unpkg.com/@ag-grid-enterprise/clipboard@${agGridVersion}/dist/clipboard.cjs.min.js`,
        "@ag-grid-enterprise/column-tool-panel": `https://unpkg.com/@ag-grid-enterprise/column-tool-panel@${agGridVersion}/dist/column-tool-panel.cjs.min.js`,
        "@ag-grid-enterprise/core": `https://unpkg.com/@ag-grid-enterprise/core@${agGridVersion}/dist/core.cjs.min.js`,
        "@ag-grid-enterprise/excel-export": `https://unpkg.com/@ag-grid-enterprise/excel-export@${agGridVersion}/dist/excel-export.cjs.min.js`,
        "@ag-grid-enterprise/filter-tool-panel": `https://unpkg.com/@ag-grid-enterprise/filter-tool-panel@${agGridVersion}/dist/filter-tool-panel.cjs.min.js`,
        "@ag-grid-enterprise/master-detail": `https://unpkg.com/@ag-grid-enterprise/master-detail@${agGridVersion}/dist/master-detail.cjs.min.js`,
        "@ag-grid-enterprise/menu": `https://unpkg.com/@ag-grid-enterprise/menu@${agGridVersion}/dist/menu.cjs.min.js`,
        "@ag-grid-enterprise/multi-filter": `https://unpkg.com/@ag-grid-enterprise/multi-filter@${agGridVersion}/dist/multi-filter.cjs.min.js`,
        "@ag-grid-enterprise/range-selection": `https://unpkg.com/@ag-grid-enterprise/range-selection@${agGridVersion}/dist/range-selection.cjs.min.js`,
        "@ag-grid-enterprise/rich-select": `https://unpkg.com/@ag-grid-enterprise/rich-select@${agGridVersion}/dist/rich-select.cjs.min.js`,
        "@ag-grid-enterprise/row-grouping": `https://unpkg.com/@ag-grid-enterprise/row-grouping@${agGridVersion}/dist/row-grouping.cjs.min.js`,
        "@ag-grid-enterprise/server-side-row-model": `https://unpkg.com/@ag-grid-enterprise/server-side-row-model@${agGridVersion}/dist/server-side-row-model.cjs.min.js`,
        "@ag-grid-enterprise/set-filter": `https://unpkg.com/@ag-grid-enterprise/set-filter@${agGridVersion}/dist/set-filter.cjs.min.js`,
        "@ag-grid-enterprise/side-bar": `https://unpkg.com/@ag-grid-enterprise/side-bar@${agGridVersion}/dist/side-bar.cjs.min.js`,
        "@ag-grid-enterprise/sparklines": `https://unpkg.com/@ag-grid-enterprise/sparklines@${agGridVersion}/dist/sparklines.cjs.min.js`,
        "@ag-grid-enterprise/status-bar": `https://unpkg.com/@ag-grid-enterprise/status-bar@${agGridVersion}/dist/status-bar.cjs.min.js`,
        "@ag-grid-enterprise/viewport-row-model": `https://unpkg.com/@ag-grid-enterprise/viewport-row-model@${agGridVersion}/dist/viewport-row-model.cjs.min.js`,
        /* END OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
    },
    chartMap: {
        "ag-charts-react": `https://unpkg.com/ag-charts-react@${agChartsReactVersion}/`,
        "ag-charts-angular": `https://unpkg.com/ag-charts-angular@${agChartsAngularVersion}/`,
        "ag-charts-vue": `https://unpkg.com/ag-charts-vue@${agChartsVueVersion}/`,
        "ag-charts-vue3": `https://unpkg.com/ag-charts-vue3@${agChartsVueVersion}/`,
        "ag-charts-community": `https://unpkg.com/ag-charts-community@${agChartsVersion}/dist/ag-charts-community.cjs.min.js`,
    },
    chartPaths: {}
};


function getRelevantConfig(configuration, framework) {
    const filterByFramework = ([k, v]) => {
        const inverseFrameworks = {
            react: ['angular', 'vue', 'vue3'],
            angular: ['react', 'vue', 'vue3'],
            vue: ['angular', 'react', 'vue3'],
            vue3: ['angular', 'react', 'vue'],
            typescript: ['angular', 'react', 'vue', 'vue3'],
        }
        return !inverseFrameworks[framework].some(f => k.endsWith(f));
    }


    const filterOutChartWrapper = ([k, v]) => {
        // integrated does not need the charts framework wrapper
        if (k.includes('ag-charts')) {
            return k !== `ag-charts-${framework}`;
        }
        return true;
    }

    const buildCopy = (config) => {
        let valid = {};
        Object.entries(config)
            .filter(filterOutChartWrapper)
            .filter(filterByFramework)
            .sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : 1)
            .forEach(([k, v]) => {
                valid[k] = v;
            })
        return valid;
    }

    const buildChartCopy = (config) => {
        let valid = {};
        Object.entries(config)
            .filter(filterByFramework)
            .sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : 1)
            .forEach(([k, v]) => {
                valid[k] = v;
            })
        return valid;
    }

    return {
        gridMap: buildCopy(configuration.gridMap),
        gridCommunityPaths: buildCopy(configuration.gridCommunityPaths),
        gridEnterprisePaths: buildCopy(configuration.gridEnterprisePaths),
        chartMap: buildChartCopy(configuration.chartMap),
        chartPaths: buildChartCopy(configuration.chartPaths),
    }
}

/**
 * Our framework examples use SystemJS to load the various dependencies. This component is used to insert the required
 * code to load SystemJS and the relevant modules depending on the framework.
 */
const SystemJs = ({ library, boilerplatePath, appLocation, startFile, options, framework }) => {
    const { enterprise: isEnterprise } = options;
    const systemJsPath = `${boilerplatePath}systemjs.config${isDevelopment() ? '.dev' : ''}.js`;
    let configuration = isUsingPublishedPackages() ? publishedConfiguration : localConfiguration;

    if (isDevelopment()) {
        configuration.gridCommunityPaths = {
            ...configuration.gridCommunityPaths,
            "@ag-grid-community/all-modules": `${localPrefix}/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js`
        };
        configuration.gridEnterprisePaths = {
            ...configuration.gridEnterprisePaths,
            "@ag-grid-community/all-modules": `${localPrefix}/@ag-grid-community/all-modules/dist/ag-grid-community.cjs.js`,
            "@ag-grid-enterprise/all-modules": `${localPrefix}/@ag-grid-enterprise/all-modules/dist/ag-grid-enterprise.cjs.js`
        }
        configuration.gridMap = {
            ...configuration.gridMap,
            /* START OF GRID MODULES DEV - DO NOT DELETE */
            "@ag-grid-community/all-modules": `${localPrefix}/@ag-grid-community/all-modules`,
            "@ag-grid-community/client-side-row-model": `${localPrefix}/@ag-grid-community/client-side-row-model`,
            "@ag-grid-community/core": `${localPrefix}/@ag-grid-community/core`,
            "@ag-grid-community/csv-export": `${localPrefix}/@ag-grid-community/csv-export`,
            "@ag-grid-community/infinite-row-model": `${localPrefix}/@ag-grid-community/infinite-row-model`,
            "ag-charts-community": `${localPrefix}/ag-charts-community`,
            "@ag-grid-enterprise/all-modules": `${localPrefix}/@ag-grid-enterprise/all-modules`,
            "@ag-grid-enterprise/charts": `${localPrefix}/@ag-grid-enterprise/charts`,
            "@ag-grid-enterprise/clipboard": `${localPrefix}/@ag-grid-enterprise/clipboard`,
            "@ag-grid-enterprise/column-tool-panel": `${localPrefix}/@ag-grid-enterprise/column-tool-panel`,
            "@ag-grid-enterprise/core": `${localPrefix}/@ag-grid-enterprise/core`,
            "@ag-grid-enterprise/excel-export": `${localPrefix}/@ag-grid-enterprise/excel-export`,
            "@ag-grid-enterprise/filter-tool-panel": `${localPrefix}/@ag-grid-enterprise/filter-tool-panel`,
            "@ag-grid-enterprise/master-detail": `${localPrefix}/@ag-grid-enterprise/master-detail`,
            "@ag-grid-enterprise/menu": `${localPrefix}/@ag-grid-enterprise/menu`,
            "@ag-grid-enterprise/multi-filter": `${localPrefix}/@ag-grid-enterprise/multi-filter`,
            "@ag-grid-enterprise/range-selection": `${localPrefix}/@ag-grid-enterprise/range-selection`,
            "@ag-grid-enterprise/rich-select": `${localPrefix}/@ag-grid-enterprise/rich-select`,
            "@ag-grid-enterprise/row-grouping": `${localPrefix}/@ag-grid-enterprise/row-grouping`,
            "@ag-grid-enterprise/server-side-row-model": `${localPrefix}/@ag-grid-enterprise/server-side-row-model`,
            "@ag-grid-enterprise/set-filter": `${localPrefix}/@ag-grid-enterprise/set-filter`,
            "@ag-grid-enterprise/side-bar": `${localPrefix}/@ag-grid-enterprise/side-bar`,
            "@ag-grid-enterprise/sparklines": `${localPrefix}/@ag-grid-enterprise/sparklines`,
            "@ag-grid-enterprise/status-bar": `${localPrefix}/@ag-grid-enterprise/status-bar`,
            "@ag-grid-enterprise/viewport-row-model": `${localPrefix}/@ag-grid-enterprise/viewport-row-model`,
            /* END OF GRID MODULES DEV - DO NOT DELETE */
        };

        configuration.chartMap = {
            ...configuration.chartMap,
            "ag-charts-community": `${localPrefix}/ag-charts-community`,
        };
    }
    configuration = getRelevantConfig(configuration, framework);

    let systemJsMap;
    let systemJsPaths;
    if (library === 'charts') {
        systemJsMap = configuration.chartMap;
        systemJsPaths = configuration.chartPaths;
    } else {
        systemJsMap = configuration.gridMap;
        systemJsPaths = isEnterprise ? configuration.gridEnterprisePaths : configuration.gridCommunityPaths;
    }

    let systemJsVersion = "https://unpkg.com/systemjs@0.19.47/dist/system.js";
    if (framework === 'angular') {
        // Angular needs a later version to be able to import @esm-bundle/angular__compiler which
        // it requires to correctly renderer dynamic components.
        systemJsVersion = "https://unpkg.com/systemjs@0.21.6/dist/system.js";
    }


    return <>
        <script dangerouslySetInnerHTML={{
            __html: `
            var appLocation = '${appLocation}';
            var boilerplatePath = '${boilerplatePath}';
            var systemJsMap = ${format(systemJsMap)};
            ${Object.keys(systemJsPaths).length > 0 ? `var systemJsPaths = ${format(systemJsPaths)};` : ''}
        `
        }} />
        <script src={systemJsVersion} />
        <script src={systemJsPath} />
        <script dangerouslySetInnerHTML={{ __html: `System.import('${startFile}').catch(function(err) { console.error(err); });` }} />
    </>;
};

const format = value => JSON.stringify(value, null, 4).replace(/\n/g, '\n            ');

export default SystemJs;
