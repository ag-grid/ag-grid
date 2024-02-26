import isDevelopment from 'utils/is-development';

const IS_SSR = typeof window === "undefined"

export const agGridVersion = require('../../../../../grid-community-modules/core/package.json').version;
export const agGridEnterpriseVersion = require('../../../../../grid-enterprise-modules/core/package.json').version;
export const agGridReactVersion = require('../../../../../grid-community-modules/react/package.json').version;
export const agGridAngularVersion = require('../../../../../grid-community-modules/angular/package.json').version;
export const agGridVueVersion = require('../../../../../grid-community-modules/vue/package.json').version;
export const agGridVue3Version = require('../../../../../grid-community-modules/vue3/package.json').version;

export const agChartsVersion = require('../../../node_modules/ag-charts-community/package.json').version;
export const agChartsReactVersion = require('../../../node_modules/ag-charts-react/package.json').version;
export const agChartsAngularVersion = require('../../../node_modules/ag-charts-angular/package.json').version;
export const agChartsVueVersion = require('../../../node_modules//ag-charts-vue/package.json').version;

export const rootLocalPrefix = `//${isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}`;
export const localPrefix = `//${isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
export const hostPrefix = `https://${isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8000` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}`;

// determines if we're prod or archives - the latter uses dev artefacts and prod doesn't
export const isProductionBuild = () => (!isDevelopment() && process.env.GATSBY_HOST ==='www.ag-grid.com' && !process.env.GATSBY_ROOT_DIRECTORY);
export const isPreProductionBuild = () => (!isDevelopment() && process.env.GATSBY_HOST ==='www.ag-grid.com' && process.env.GATSBY_ROOT_DIRECTORY && process.env.GATSBY_ROOT_DIRECTORY.includes('/archive/'));
export const isBuildServerBuild = () => (!isDevelopment() && process.env.GATSBY_HOST ==='grid-staging.ag-grid.com' && !process.env.GATSBY_ROOT_DIRECTORY);

// used in docs app code to determine if prod type features should be exposed
export const isProductionEnvironment = () => (isProductionBuild() || isPreProductionBuild());

// whether integrated charts includes ag-charts-enterprise or just ag-charts-community
// also need to update grid-packages/ag-grid-docs/src/example-generation/consts.ts if this value is changed
// and grid-packages/ag-grid-docs/example-generator-documentation.js
export const integratedChartsUsesChartsEnterprise = true;

export const CHARTS_URL = isDevelopment()
    ? "https://localhost:4600"
    : isBuildServerBuild ? "https://charts-staging.ag-grid.com"
    : isPreProductionBuild || isProductionBuild ? "https://charts.ag-grid.com"
    : undefined;
