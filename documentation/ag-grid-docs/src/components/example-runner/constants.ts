export const POST_INIT_MESSAGE_START = '<!-- INIT MESSAGE START -->';
export const POST_INIT_MESSAGE_END = '<!-- INIT MESSAGE END -->';

/**
 * DOM selector to know that the library has loaded. Matches the grid root, or the dev-validation
 * bootstrap panel that renders in its place when grid creation aborts before any grid exists.
 */
export const LIBRARY_INIT_SELECTOR = '.ag-root-wrapper, .ag-overlay-error-bootstrap-panel';
