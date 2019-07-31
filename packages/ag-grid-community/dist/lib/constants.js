/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = /** @class */ (function () {
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
    Constants.BATCH_WAIT_MILLIS = 50;
    Constants.EXPORT_TYPE_DRAG_COPY = 'dragCopy';
    Constants.EXPORT_TYPE_CLIPBOARD = 'clipboard';
    Constants.EXPORT_TYPE_EXCEL = 'excel';
    Constants.EXPORT_TYPE_CSV = 'csv';
    Constants.KEY_BACKSPACE = 8;
    Constants.KEY_TAB = 9;
    Constants.KEY_NEW_LINE = 10;
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
    Constants.KEY_PAGE_UP = 33;
    Constants.KEY_PAGE_DOWN = 34;
    Constants.KEY_PAGE_HOME = 36;
    Constants.KEY_PAGE_END = 35;
    Constants.ROW_MODEL_TYPE_INFINITE = 'infinite';
    Constants.ROW_MODEL_TYPE_VIEWPORT = 'viewport';
    Constants.ROW_MODEL_TYPE_CLIENT_SIDE = 'clientSide';
    Constants.ROW_MODEL_TYPE_SERVER_SIDE = 'serverSide';
    Constants.DEPRECATED_ROW_MODEL_TYPE_NORMAL = 'normal';
    Constants.ALWAYS = 'always';
    Constants.ONLY_WHEN_GROUPING = 'onlyWhenGrouping';
    Constants.PINNED_TOP = 'top';
    Constants.PINNED_BOTTOM = 'bottom';
    Constants.DOM_LAYOUT_NORMAL = 'normal';
    Constants.DOM_LAYOUT_PRINT = 'print';
    Constants.DOM_LAYOUT_AUTO_HEIGHT = 'autoHeight';
    Constants.GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
    return Constants;
}());
exports.Constants = Constants;
