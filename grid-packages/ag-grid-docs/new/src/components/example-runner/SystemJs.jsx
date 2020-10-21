import React from 'react';

const agGridVersion = '24.1.0';
const agChartsVersion = '24.1.0';

const gridPackagesMap = {
    /* START OF GRID CSS PROD - DO NOT DELETE */
    "@ag-grid-community/all-modules/dist/styles/ag-grid.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-grid.css`,
    "@ag-grid-community/core/dist/styles/ag-grid.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-grid.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine-dark.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-alpine-dark.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-alpine-dark.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-alpine-dark.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-alpine.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-alpine.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-alpine.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-alpine.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-balham-dark.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-balham-dark.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-balham-dark.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-balham-dark.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-balham.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-balham.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-balham.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-balham.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-blue.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-blue.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-blue.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-blue.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-bootstrap.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-bootstrap.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-dark.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-dark.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-dark.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-dark.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-fresh.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-fresh.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-fresh.css`,
    "@ag-grid-community/all-modules/dist/styles/ag-theme-material.css": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/styles/ag-theme-material.css`,
    "@ag-grid-community/core/dist/styles/ag-theme-material.css": `https://unpkg.com/@ag-grid-community/core@${agGridVersion}/dist/styles/ag-theme-material.css`,
    /* END OF GRID CSS PROD - DO NOT DELETE */
    "@ag-grid-community/react": `https://unpkg.com/@ag-grid-community/react@${agGridVersion}/`,
    "@ag-grid-community/angular": `https://unpkg.com/@ag-grid-community/angular@${agGridVersion}/`,
    "@ag-grid-community/vue": `https://unpkg.com/@ag-grid-community/vue@${agGridVersion}/`,
    "ag-charts-community": `https://unpkg.com/ag-charts-community@${agChartsVersion}/dist/ag-charts-community.cjs.js`,
    "ag-grid-community": `https://unpkg.com/ag-grid-community@${agGridVersion}/`,
    "ag-grid-enterprise": `https://unpkg.com/ag-grid-enterprise@${agGridVersion}/`,
    "ag-grid-angular": `https://unpkg.com/ag-grid-angular@${agGridVersion}/`,
    "ag-grid-react": `https://unpkg.com/ag-grid-react@${agGridVersion}/`,
    "ag-grid-vue": `https://unpkg.com/ag-grid-vue@${agGridVersion}/`
};

const gridCommunityModulesMap = {
    /* START OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
    "@ag-grid-community/all-modules": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.cjs.js`,
    "@ag-grid-community/client-side-row-model": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.cjs.js`,
    "@ag-grid-community/core": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.cjs.js`,
    "@ag-grid-community/csv-export": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.cjs.js`,
    "@ag-grid-community/infinite-row-model": `https://unpkg.com/@ag-grid-community/all-modules@${agGridVersion}/dist/ag-grid-community.cjs.js`,
    /* END OF GRID COMMUNITY MODULES PATHS PROD - DO NOT DELETE */
};

const gridEnterpriseModulesMap = {
    /* START OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
    "@ag-grid-community/all-modules": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-community/client-side-row-model": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-community/core": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-community/csv-export": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-community/infinite-row-model": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/all-modules": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/charts": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/clipboard": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/column-tool-panel": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/core": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/date-time-cell-editor": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/excel-export": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/filter-tool-panel": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/master-detail": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/menu": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/multi-filter": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/range-selection": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/rich-select": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/row-grouping": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/server-side-row-model": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/set-filter": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/side-bar": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/status-bar": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    "@ag-grid-enterprise/viewport-row-model": `https://unpkg.com/@ag-grid-enterprise/all-modules@${agGridVersion}/dist/ag-grid-enterprise.cjs.js`,
    /* END OF GRID ENTERPRISE MODULES PATHS PROD - DO NOT DELETE */
};

const SystemJs = ({ boilerplatePath, appLocation, options }) => {
    const { enterprise: isEnterprise } = options;
    const systemJsPath = `${boilerplatePath}systemjs.prod.config.js`;

    return <>
        <script dangerouslySetInnerHTML={{
            __html: `var appLocation = '${appLocation}';
        var boilerplatePath = '${boilerplatePath}';
        var systemJsMap = ${JSON.stringify(gridPackagesMap, null, 2)};
        var systemJsPaths = ${JSON.stringify(isEnterprise ? gridEnterpriseModulesMap : gridCommunityModulesMap, null, 2)};`
        }}></script>

        <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
        <script src={systemJsPath}></script>
    </>;
};

export default SystemJs;