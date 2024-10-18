import type { InternalFramework } from '@ag-grid-types';
import { FILES_BASE_PATH, NPM_CDN, PUBLISHED_URLS, SITE_BASE_URL, agGridVersion } from '@constants';
import { isUsingPublishedPackages } from '@utils/pages';
import { pathJoin } from '@utils/pathJoin';

import agChartsAngular from '../../../../../../../node_modules/ag-charts-angular/package.json';
import agChartsCommunity from '../../../../../../../node_modules/ag-charts-community/package.json';
import agChartsEnterprise from '../../../../../../../node_modules/ag-charts-enterprise/package.json';
import agChartsReact from '../../../../../../../node_modules/ag-charts-react/package.json';
import agChartsVue3 from '../../../../../../../node_modules/ag-charts-vue3/package.json';

interface Props {
    boilerplatePath: string;
    appLocation: string;
    startFile: string;
    internalFramework: InternalFramework;
    isEnterprise: boolean;
    isDev: boolean;
}

type Paths = Record<string, string>;
interface Configuration {
    gridMap: Paths;
    gridCommunityPaths: Paths;
    gridEnterprisePaths: Paths;
}

const localPrefix = pathJoin(import.meta.env?.PUBLIC_SITE_URL, SITE_BASE_URL, FILES_BASE_PATH);

const localBuildAndArchiveConfiguration: Configuration = {
    gridMap: {
        '@ag-grid-community/styles': `${localPrefix}/@ag-grid-community/styles`,
        '@ag-grid-community/react': `${localPrefix}/@ag-grid-community/react`,
        '@ag-grid-community/angular': `${localPrefix}/@ag-grid-community/angular`,
        '@ag-grid-community/vue3': `${localPrefix}/@ag-grid-community/vue3`,
        'ag-grid-community': `${localPrefix}/ag-grid-community`,
        'ag-grid-enterprise': `${localPrefix}/ag-grid-enterprise`,
        'ag-grid-charts-enterprise': `${localPrefix}/ag-grid-charts-enterprise`,
        'ag-grid-angular': `${localPrefix}/ag-grid-angular`,
        'ag-grid-react': `${localPrefix}/ag-grid-react`,
        'ag-grid-vue3': `${localPrefix}/ag-grid-vue3`,
    },
    gridCommunityPaths: {
        'ag-grid-community': `${localPrefix}/ag-grid-community`,
        '@ag-grid-community/core': `${localPrefix}/@ag-grid-community/core/dist/package/main.cjs.js`,
        '@ag-grid-community/client-side-row-model': `${localPrefix}/@ag-grid-community/client-side-row-model/dist/package/main.cjs.js`,
        '@ag-grid-community/csv-export': `${localPrefix}/@ag-grid-community/csv-export/dist/package/main.cjs.js`,
        '@ag-grid-community/infinite-row-model': `${localPrefix}/@ag-grid-community/infinite-row-model/dist/package/main.cjs.js`,
        '@ag-grid-community/locale': `${localPrefix}/@ag-grid-community/locale/dist/package/main.cjs.js`,
        '@ag-grid-community/theming': `${localPrefix}/@ag-grid-community/theming/dist/package/main.cjs.js`,
    },
    gridEnterprisePaths: {
        '@ag-grid-community/client-side-row-model': `${localPrefix}/@ag-grid-community/client-side-row-model/dist/package/main.cjs.js`,
        '@ag-grid-community/core': `${localPrefix}/@ag-grid-community/core/dist/package/main.cjs.js`,
        '@ag-grid-community/csv-export': `${localPrefix}/@ag-grid-community/csv-export/dist/package/main.cjs.js`,
        '@ag-grid-community/infinite-row-model': `${localPrefix}/@ag-grid-community/infinite-row-model/dist/package/main.cjs.js`,
        '@ag-grid-community/locale': `${localPrefix}/@ag-grid-community/locale/dist/package/main.cjs.js`,
        '@ag-grid-community/theming': `${localPrefix}/@ag-grid-community/theming/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/advanced-filter': `${localPrefix}/@ag-grid-enterprise/advanced-filter/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/charts': `${localPrefix}/@ag-grid-enterprise/charts/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/charts-enterprise': `${localPrefix}/@ag-grid-enterprise/charts-enterprise/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/clipboard': `${localPrefix}/@ag-grid-enterprise/clipboard/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/column-tool-panel': `${localPrefix}/@ag-grid-enterprise/column-tool-panel/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/core': `${localPrefix}/@ag-grid-enterprise/core/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/excel-export': `${localPrefix}/@ag-grid-enterprise/excel-export/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/filter-tool-panel': `${localPrefix}/@ag-grid-enterprise/filter-tool-panel/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/master-detail': `${localPrefix}/@ag-grid-enterprise/master-detail/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/menu': `${localPrefix}/@ag-grid-enterprise/menu/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/multi-filter': `${localPrefix}/@ag-grid-enterprise/multi-filter/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/range-selection': `${localPrefix}/@ag-grid-enterprise/range-selection/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/rich-select': `${localPrefix}/@ag-grid-enterprise/rich-select/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/row-grouping': `${localPrefix}/@ag-grid-enterprise/row-grouping/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/server-side-row-model': `${localPrefix}/@ag-grid-enterprise/server-side-row-model/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/set-filter': `${localPrefix}/@ag-grid-enterprise/set-filter/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/side-bar': `${localPrefix}/@ag-grid-enterprise/side-bar/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/sparklines': `${localPrefix}/@ag-grid-enterprise/sparklines/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/status-bar': `${localPrefix}/@ag-grid-enterprise/status-bar/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/viewport-row-model': `${localPrefix}/@ag-grid-enterprise/viewport-row-model/dist/package/main.cjs.js`,
        'ag-charts-community': `${localPrefix}/ag-charts-community/dist/package/main.cjs.js`,
        'ag-charts-enterprise': `${localPrefix}/ag-charts-enterprise/dist/package/main.cjs.js`,
    },
};

const publishedConfiguration: Configuration = {
    gridMap: PUBLISHED_URLS,
    gridCommunityPaths: {
        'ag-charts-react': `${NPM_CDN}/ag-charts-react@${agChartsReact.version}/`,
        'ag-charts-angular': `${NPM_CDN}/ag-charts-angular@${agChartsAngular.version}/`,
        'ag-charts-vue3': `${NPM_CDN}/ag-charts-vue3@${agChartsVue3.version}/`,
        'ag-charts-community': `${NPM_CDN}/ag-charts-community@${agChartsCommunity.version}/`,
        '@ag-grid-community/client-side-row-model': `https://cdn.jsdelivr.net/npm/@ag-grid-community/client-side-row-model@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/core': `https://cdn.jsdelivr.net/npm/@ag-grid-community/core@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/csv-export': `https://cdn.jsdelivr.net/npm/@ag-grid-community/csv-export@${agGridVersion}/dist/package/main.cjs.min.js`,
        '@ag-grid-community/infinite-row-model': `https://cdn.jsdelivr.net/npm/@ag-grid-community/infinite-row-model@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/locale': `https://cdn.jsdelivr.net/npm/@ag-grid-community/locale@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/theming': `https://cdn.jsdelivr.net/npm/@ag-grid-community/theming@${agGridVersion}/dist/package/main.cjs.js`,
    },
    gridEnterprisePaths: {
        'ag-charts-react': `${NPM_CDN}/ag-charts-react@${agChartsReact.version}/`,
        'ag-charts-angular': `${NPM_CDN}/ag-charts-angular@${agChartsAngular.version}/`,
        'ag-charts-vue3': `${NPM_CDN}/ag-charts-vue3@${agChartsVue3.version}/`,
        'ag-charts-community': `${NPM_CDN}/ag-charts-community@${agChartsCommunity.version}/dist/package/main.cjs.js`,
        'ag-charts-enterprise': `${NPM_CDN}/ag-charts-enterprise@${agChartsEnterprise.version}/dist/package/main.cjs.js`,
        '@ag-grid-community/client-side-row-model': `https://cdn.jsdelivr.net/npm/@ag-grid-community/client-side-row-model@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/core': `https://cdn.jsdelivr.net/npm/@ag-grid-community/core@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/csv-export': `https://cdn.jsdelivr.net/npm/@ag-grid-community/csv-export@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/infinite-row-model': `https://cdn.jsdelivr.net/npm/@ag-grid-community/infinite-row-model@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/locale': `https://cdn.jsdelivr.net/npm/@ag-grid-community/locale@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-community/theming': `https://cdn.jsdelivr.net/npm/@ag-grid-community/theming@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/advanced-filter': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/advanced-filter@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/charts': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/charts@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/charts-enterprise': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/charts-enterprise@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/clipboard': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/clipboard@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/column-tool-panel': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/column-tool-panel@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/core': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/core@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/excel-export': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/excel-export@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/filter-tool-panel': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/filter-tool-panel@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/master-detail': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/master-detail@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/menu': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/menu@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/multi-filter': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/multi-filter@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/range-selection': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/range-selection@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/rich-select': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/rich-select@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/row-grouping': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/row-grouping@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/server-side-row-model': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/server-side-row-model@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/set-filter': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/set-filter@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/side-bar': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/side-bar@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/sparklines': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/sparklines@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/status-bar': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/status-bar@${agGridVersion}/dist/package/main.cjs.js`,
        '@ag-grid-enterprise/viewport-row-model': `https://cdn.jsdelivr.net/npm/@ag-grid-enterprise/viewport-row-model@${agGridVersion}/dist/package/main.cjs.js`,
    },
};

function getRelevantConfig(configuration: Configuration, framework: InternalFramework) {
    const filterByFramework = ([k]: string[]) => {
        const inverseFrameworks: Record<string, string[]> = {
            reactFunctional: ['angular', 'vue3'],
            reactFunctionalTs: ['angular', 'vue3'],
            angular: ['react', 'vue3'],
            vue3: ['angular', 'react'],
            typescript: ['angular', 'react', 'vue3'],
        };
        return !inverseFrameworks[framework].some((f) => k.endsWith(f));
    };

    const filterOutChartWrapper = ([k]: string[]) => {
        // integrated does not need the charts framework wrapper
        if (k.includes('ag-charts')) {
            return k !== `ag-charts-${framework}`;
        }
        return true;
    };

    const buildCopy = (config: Paths) => {
        const valid = {} as Paths;
        Object.entries(config)
            .filter(filterOutChartWrapper)
            .filter(filterByFramework)
            .sort(([k1], [k2]) => (k1 < k2 ? -1 : 1))
            .forEach(([k, v]) => {
                valid[k] = v;
            });
        return valid;
    };

    return {
        gridMap: buildCopy(configuration.gridMap),
        gridCommunityPaths: buildCopy(configuration.gridCommunityPaths),
        gridEnterprisePaths: buildCopy(configuration.gridEnterprisePaths),
    };
}

/**
 * Our framework examples use SystemJS to load the various dependencies. This component is used to insert the required
 * code to load SystemJS and the relevant modules depending on the framework.
 */
export const SystemJs = ({
    boilerplatePath,
    appLocation,
    startFile,
    internalFramework,
    isEnterprise,
    isDev,
}: Props) => {
    const systemJsPath = pathJoin(boilerplatePath, `systemjs.config${isDev ? '.dev' : ''}.js`);
    let configuration = isUsingPublishedPackages() ? publishedConfiguration : localBuildAndArchiveConfiguration;

    if (isDev) {
        configuration.gridMap = {
            ...configuration.gridMap,
            '@ag-grid-community/client-side-row-model': `${localPrefix}/@ag-grid-community/client-side-row-model`,
            '@ag-grid-community/core': `${localPrefix}/@ag-grid-community/core`,
            '@ag-grid-community/csv-export': `${localPrefix}/@ag-grid-community/csv-export`,
            '@ag-grid-community/infinite-row-model': `${localPrefix}/@ag-grid-community/infinite-row-model`,
            '@ag-grid-community/locale': `${localPrefix}/@ag-grid-community/locale`,
            '@ag-grid-community/theming': `${localPrefix}/@ag-grid-community/theming`,
            '@ag-grid-enterprise/advanced-filter': `${localPrefix}/@ag-grid-enterprise/advanced-filter`,
            '@ag-grid-enterprise/charts': `${localPrefix}/@ag-grid-enterprise/charts`,
            '@ag-grid-enterprise/charts-enterprise': `${localPrefix}/@ag-grid-enterprise/charts-enterprise`,
            '@ag-grid-enterprise/clipboard': `${localPrefix}/@ag-grid-enterprise/clipboard`,
            '@ag-grid-enterprise/column-tool-panel': `${localPrefix}/@ag-grid-enterprise/column-tool-panel`,
            '@ag-grid-enterprise/core': `${localPrefix}/@ag-grid-enterprise/core`,
            '@ag-grid-enterprise/excel-export': `${localPrefix}/@ag-grid-enterprise/excel-export`,
            '@ag-grid-enterprise/filter-tool-panel': `${localPrefix}/@ag-grid-enterprise/filter-tool-panel`,
            '@ag-grid-enterprise/master-detail': `${localPrefix}/@ag-grid-enterprise/master-detail`,
            '@ag-grid-enterprise/menu': `${localPrefix}/@ag-grid-enterprise/menu`,
            '@ag-grid-enterprise/multi-filter': `${localPrefix}/@ag-grid-enterprise/multi-filter`,
            '@ag-grid-enterprise/range-selection': `${localPrefix}/@ag-grid-enterprise/range-selection`,
            '@ag-grid-enterprise/rich-select': `${localPrefix}/@ag-grid-enterprise/rich-select`,
            '@ag-grid-enterprise/row-grouping': `${localPrefix}/@ag-grid-enterprise/row-grouping`,
            '@ag-grid-enterprise/server-side-row-model': `${localPrefix}/@ag-grid-enterprise/server-side-row-model`,
            '@ag-grid-enterprise/set-filter': `${localPrefix}/@ag-grid-enterprise/set-filter`,
            '@ag-grid-enterprise/side-bar': `${localPrefix}/@ag-grid-enterprise/side-bar`,
            '@ag-grid-enterprise/sparklines': `${localPrefix}/@ag-grid-enterprise/sparklines`,
            '@ag-grid-enterprise/status-bar': `${localPrefix}/@ag-grid-enterprise/status-bar`,
            '@ag-grid-enterprise/viewport-row-model': `${localPrefix}/@ag-grid-enterprise/viewport-row-model`,
            'ag-charts-community': `${localPrefix}/ag-charts-community`,
        };
    }
    configuration = getRelevantConfig(configuration, internalFramework);

    const systemJsMap = configuration.gridMap;
    const systemJsPaths = { ...(isEnterprise ? configuration.gridEnterprisePaths : configuration.gridCommunityPaths) };

    let systemJsVersion = `${NPM_CDN}/systemjs@0.19.47/dist/system.js`;
    if (internalFramework === 'angular') {
        // Angular needs a later version to be able to import @esm-bundle/angular__compiler which
        // it requires to correctly renderer dynamic components.
        systemJsVersion = `${NPM_CDN}/systemjs@0.21.6/dist/system.js`;
    }

    return (
        <>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            var appLocation = '${appLocation}';
            var boilerplatePath = '${boilerplatePath}';
            var systemJsMap = ${format(systemJsMap)};
            ${Object.keys(systemJsPaths).length > 0 ? `var systemJsPaths = ${format(systemJsPaths)};` : ''}
        `,
                }}
            />
            <script src={systemJsVersion} />
            <script src={systemJsPath} />
            <script
                dangerouslySetInnerHTML={{
                    __html: `System.import('${startFile}').catch(function(err) { document.body.innerHTML = '<div class="example-error" style="background:#fdb022;padding:1rem;">' + 'Example Error: ' + err + '</div>'; console.error(err); });`,
                }}
            />
        </>
    );
};

const format = (value: object) => JSON.stringify(value, null, 4).replace(/\n/g, '\n            ');
