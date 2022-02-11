import isDevelopment from 'utils/is-development';

export const agGridVersion = require('../../../../../community-modules/core/package.json').version;
export const agGridEnterpriseVersion = require('../../../../../enterprise-modules/core/package.json').version;
export const agGridReactVersion = require('../../../../../community-modules/react/package.json').version;
export const agGridAngularVersion = "27.0.0";
export const agGridVueVersion = "27.0.0";
export const agGridVue3Version = "27.0.0";

export const agChartsVersion = "5.0.0";
export const agChartsReactVersion = "5.0.0";
export const agChartsAngularVersion = "5.0.0";
export const agChartsVueVersion = "5.0.0";

export const localPrefix = `//${isDevelopment() && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
