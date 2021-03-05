import isDevelopment from 'utils/is-development';

export const agGridVersion = require('../../../../../community-modules/core/package.json').version;
export const agChartsVersion = require('../../../../../charts-packages/ag-charts-community/package.json').version;
export const localPrefix = `//${isDevelopment() && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
