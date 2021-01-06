export const agGridVersion = "24.0.0";
export const agChartsVersion = "2.0.0";
export const getLocalPrefix = host => `//${host}${process.env.GATSBY_ROOT_DIRECTORY || ''}/dev`;
export const localPrefix = getLocalPrefix(process.env.GATSBY_HOST);
