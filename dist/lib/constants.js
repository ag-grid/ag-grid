/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.4.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var Constants = (function () {
    function Constants() {
    }
    Constants.STEP_EVERYTHING = 0;
    Constants.STEP_FILTER = 1;
    Constants.STEP_SORT = 2;
    Constants.STEP_MAP = 3;
    Constants.STEP_AGGREGATE = 4;
    Constants.STEP_PIVOT = 5;
    Constants.ROW_BUFFER_SIZE = 10;
    Constants.LAYOUT_INTERVAL = 500;
    Constants.KEY_BACKSPACE = 8;
    Constants.KEY_TAB = 9;
    Constants.KEY_ENTER = 13;
    Constants.KEY_SHIFT = 16;
    Constants.KEY_ESCAPE = 27;
    Constants.KEY_SPACE = 32;
    Constants.KEY_LEFT = 37;
    Constants.KEY_UP = 38;
    Constants.KEY_RIGHT = 39;
    Constants.KEY_DOWN = 40;
    Constants.KEY_DELETE = 46;
    Constants.KEY_A = 65;
    Constants.KEY_C = 67;
    Constants.KEY_V = 86;
    Constants.KEY_D = 68;
    Constants.KEY_F2 = 113;
    Constants.ROW_MODEL_TYPE_PAGINATION = 'pagination';
    Constants.ROW_MODEL_TYPE_VIRTUAL = 'virtual';
    Constants.ROW_MODEL_TYPE_VIEWPORT = 'viewport';
    Constants.ROW_MODEL_TYPE_NORMAL = 'normal';
    Constants.ALWAYS = 'always';
    Constants.ONLY_WHEN_GROUPING = 'onlyWhenGrouping';
    Constants.FLOATING_TOP = 'top';
    Constants.FLOATING_BOTTOM = 'bottom';
    return Constants;
})();
exports.Constants = Constants;
