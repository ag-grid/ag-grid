export const agGridVersion = require('../../../../../../community-modules/core/package.json').version;
export const agChartsVersion = require('../../../../../../charts-packages/ag-charts-community/package.json').version;
export const getDevLibraryPrefix = host => `//${host}/dev`;
export const localPrefix = getDevLibraryPrefix(process.env.GATSBY_HOST);