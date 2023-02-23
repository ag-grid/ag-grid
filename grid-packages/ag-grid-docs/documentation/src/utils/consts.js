import isDevelopment from 'utils/is-development';

const IS_SSR = typeof window === "undefined"

export const agGridVersion = require('../../../../../grid-community-modules/core/package.json').version;
export const agGridEnterpriseVersion = require('../../../../../grid-enterprise-modules/core/package.json').version;
export const agGridReactVersion = require('../../../../../grid-community-modules/react/package.json').version;
export const agGridAngularVersion = require('../../../../../grid-community-modules/angular/package.json').version;
export const agGridVueVersion = require('../../../../../grid-community-modules/vue/package.json').version;
export const agGridVue3Version = require('../../../../../grid-community-modules/vue3/package.json').version;

export const agChartsVersion = require('../../../../../charts-community-modules/ag-charts-community/package.json').version;
export const agChartsReactVersion = require('../../../../../charts-community-modules/ag-charts-react/package.json').version;
export const agChartsAngularVersion = require('../../../../../charts-community-modules/ag-charts-angular/package.json').version;
export const agChartsVueVersion = require('../../../../../charts-community-modules/ag-charts-vue/package.json').version;

export const rootLocalPrefix = `//${isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}`;
export const localPrefix = `//${isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
export const hostPrefix = `https://${isDevelopment() && !IS_SSR && window.location ? `${window.location.hostname}:8000` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}`;

export const isProductionBuild = () => (!isDevelopment() && process.env.GATSBY_HOST ==='www.ag-grid.com' && !process.env.GATSBY_ROOT_DIRECTORY);
