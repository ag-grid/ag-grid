export const WORKING_DIR = '../ag-grid-docs';
export const DOC_SOURCE_DIR = `${WORKING_DIR}/src/content/docs`;
export const API_SOURCE_DIR = `${WORKING_DIR}/src/content/api-documentation`;
export const DIST_DIR = `${WORKING_DIR}/dist`;
export const API_REFERENCE_DIR = `${DIST_DIR}/files/reference`;

export const MENU_FILE_PATH = `${WORKING_DIR}/src/content/docs-nav/docsNav.json`;
export const API_FILE_PATH = `${WORKING_DIR}/src/content/api-nav/apiNav.json`;

export const SUPPORTED_FRAMEWORKS = ['react', 'angular', 'vue', 'javascript'] as const;

export type SupportedFrameworks = (typeof SUPPORTED_FRAMEWORKS)[number];
