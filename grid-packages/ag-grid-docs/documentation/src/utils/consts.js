import isDevelopment from 'utils/is-development';

export const agGridVersion = "26.0.0";
export const agChartsVersion = "26.0.0";
export const localPrefix = `//${isDevelopment() && window.location ? `${window.location.hostname}:8080` : process.env.GATSBY_HOST}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
