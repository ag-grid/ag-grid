/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var Constants = /** @class */ (function () {
    function Constants() {
    }
    Constants.ROW_BUFFER_SIZE = 10;
    Constants.LAYOUT_INTERVAL = 500;
    Constants.BATCH_WAIT_MILLIS = 50;
    Constants.EXPORT_TYPE_DRAG_COPY = 'dragCopy';
    Constants.EXPORT_TYPE_CLIPBOARD = 'clipboard';
    Constants.EXPORT_TYPE_EXCEL = 'excel';
    Constants.EXPORT_TYPE_CSV = 'csv';
    Constants.ROW_MODEL_TYPE_INFINITE = 'infinite';
    Constants.ROW_MODEL_TYPE_VIEWPORT = 'viewport';
    Constants.ROW_MODEL_TYPE_CLIENT_SIDE = 'clientSide';
    Constants.ROW_MODEL_TYPE_SERVER_SIDE = 'serverSide';
    Constants.ALWAYS = 'always';
    Constants.ONLY_WHEN_GROUPING = 'onlyWhenGrouping';
    Constants.PINNED_TOP = 'top';
    Constants.PINNED_BOTTOM = 'bottom';
    Constants.DOM_LAYOUT_NORMAL = 'normal';
    Constants.DOM_LAYOUT_PRINT = 'print';
    Constants.DOM_LAYOUT_AUTO_HEIGHT = 'autoHeight';
    Constants.GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
    Constants.SOURCE_PASTE = 'paste';
    Constants.PINNED_RIGHT = 'right';
    Constants.PINNED_LEFT = 'left';
    Constants.SORT_ASC = 'asc';
    Constants.SORT_DESC = 'desc';
    Constants.INPUT_SELECTOR = 'input, select, button, textarea';
    Constants.FOCUSABLE_SELECTOR = '[tabindex], input, select, button, textarea';
    Constants.FOCUSABLE_EXCLUDE = '.ag-hidden, .ag-hidden *, [disabled], .ag-disabled, .ag-disabled *';
    return Constants;
}());
export { Constants };
