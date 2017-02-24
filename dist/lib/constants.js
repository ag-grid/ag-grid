/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var Constants = (function () {
    function Constants() {
    }
    return Constants;
}());
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
Constants.KEY_PAGE_UP = 33;
Constants.KEY_PAGE_DOWN = 34;
Constants.KEY_PAGE_HOME = 36;
Constants.KEY_PAGE_END = 35;
Constants.KEY_PAGE_UP_NAME = 'pageUp';
Constants.KEY_PAGE_DOWN_NAME = 'pageDown';
Constants.KEY_PAGE_HOME_NAME = 'home';
Constants.KEY_PAGE_END_NAME = 'end';
Constants.KEY_CTRL_UP_NAME = 'ctrlUp';
Constants.KEY_CTRL_LEFT_NAME = 'ctrlLeft';
Constants.KEY_CTRL_RIGHT_NAME = 'ctrlRight';
Constants.KEY_CTRL_DOWN_NAME = 'ctrlDown';
Constants.ROW_MODEL_TYPE_PAGINATION = 'pagination';
Constants.ROW_MODEL_TYPE_VIRTUAL = 'virtual';
Constants.ROW_MODEL_TYPE_VIEWPORT = 'viewport';
Constants.ROW_MODEL_TYPE_NORMAL = 'normal';
Constants.ALWAYS = 'always';
Constants.ONLY_WHEN_GROUPING = 'onlyWhenGrouping';
Constants.FLOATING_TOP = 'top';
Constants.FLOATING_BOTTOM = 'bottom';
Constants.VERTICAL_SCROLL_KEYS_ID = 'verticalScrollKeys';
Constants.HORIZONTAL_SCROLL_KEYS_ID = 'horizontalScrollKeys';
Constants.DIAGONAL_SCROLL_KEYS_ID = 'diagonalScrollKeys';
Constants.VERTICAL_SCROLL_KEYS = {
    id: Constants.VERTICAL_SCROLL_KEYS_ID,
    bindings: [{
            id: Constants.KEY_PAGE_UP_NAME,
            ctlRequired: false,
            altRequired: false,
            keyCode: Constants.KEY_PAGE_UP
        }, {
            id: Constants.KEY_PAGE_DOWN_NAME,
            ctlRequired: false,
            altRequired: false,
            keyCode: Constants.KEY_PAGE_DOWN
        }, {
            id: Constants.KEY_CTRL_UP_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_UP
        }, {
            id: Constants.KEY_CTRL_DOWN_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_DOWN
        }]
};
Constants.HORIZONTAL_SCROLL_KEYS = {
    id: Constants.HORIZONTAL_SCROLL_KEYS_ID,
    bindings: [{
            id: Constants.KEY_CTRL_LEFT_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_LEFT
        }, {
            id: Constants.KEY_CTRL_RIGHT_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_RIGHT
        }]
};
Constants.DIAGONAL_SCROLL_KEYS = {
    id: Constants.DIAGONAL_SCROLL_KEYS_ID,
    bindings: [{
            id: Constants.KEY_PAGE_HOME_NAME,
            ctlRequired: false,
            altRequired: false,
            keyCode: Constants.KEY_PAGE_HOME
        }, {
            id: Constants.KEY_PAGE_END_NAME,
            ctlRequired: false,
            altRequired: false,
            keyCode: Constants.KEY_PAGE_END
        }]
};
exports.Constants = Constants;
