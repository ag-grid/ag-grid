export const agGridVersion = require('../../../../../../community-modules/core/package.json').version;
export const agChartsVersion = require('../../../../../../charts-packages/ag-charts-community/package.json').version;
export const getLocalPrefix = host => `//${host}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
export const localPrefix = getLocalPrefix(process.env.GATSBY_HOST);