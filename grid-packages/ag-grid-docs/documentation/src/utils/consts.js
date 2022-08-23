import isDevelopment from 'utils/is-development';

export const agGridVersion = require('../../../../../community-modules/core/package.json').version;
export const agGridEnterpriseVersion = require('../../../../../grid-packages/ag-grid-enterprise/package.json').version;
export const agGridReactVersion = require('../../../../../community-modules/react/package.json').version;
export const agGridAngularVersion = require('../../../../../community-modules/angular/package.json').version;
export const agGridVueVersion = require('../../../../../community-modules/vue/package.json').version;
export const agGridVue3Version = require('../../../../../community-modules/vue3/package.json').version;

export const agChartsVersion = require('../../../../../charts-packages/ag-charts-community/package.json').version;
export const agChartsReactVersion = require('../../../../../charts-packages/ag-charts-react/package.json').version;
export const agChartsAngularVersion = require('../../../../../charts-packages/ag-charts-angular/package.json').version;
export const agChartsVueVersion = require('../../../../../charts-packages/ag-charts-vue/package.json').version;

export const rootLocalPrefix = `//${isDevelopment() && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}`;
export const localPrefix = `//${isDevelopment() && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
export const hostPrefix = `https://${isDevelopment() && window.location ? `${window.location.hostname}:8000` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}`;

