
module awk.grid {

    export class Constants {
        static STEP_EVERYTHING = 0;
        static STEP_FILTER = 1;
        static STEP_SORT = 2;
        static STEP_MAP = 3;
        static ASC = "asc";
        static DESC = "desc";
        static ROW_BUFFER_SIZE = 20;
        static MIN_COL_WIDTH = 10;

        static SUM = 'sum';
        static MIN = 'min';
        static MAX = 'max';

        static KEY_TAB = 9;
        static KEY_ENTER = 13;
        static KEY_ESCAPE = 27;
        static KEY_SPACE = 32;
        static KEY_DOWN = 40;
        static KEY_UP = 38;
        static KEY_LEFT = 37;
        static KEY_RIGHT = 39;

        static EVENT_MODEL_UPDATED = 'modelUpdated';
        static EVENT_CELL_CLICKED = 'cellClicked';
        static EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
        static EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
        static EVENT_CELL_FOCUSED = 'cellFocused';
        static EVENT_ROW_SELECTED = 'rowSelected';
        static EVENT_SELECTION_CHANGED = 'selectionChanged';
        static EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
        static EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
        static EVENT_FILTER_MODIFIED = 'filterModified';
        static EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
        static EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
        static EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
        static EVENT_ROW_CLICKED = 'rowClicked';
        static EVENT_READY = 'ready';

    }

/*
// taken from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !this.isOpera; // Chrome 1+
    var isIE = /!*@cc_on!@*!/false || !!document.documentMode; // At least IE6

    if (isOpera) {
        constants.BROWSER = 'opera';
    } else if (isFirefox) {
        constants.BROWSER = 'firefox';
    } else if (isSafari) {
        constants.BROWSER = 'safari';
    } else if (isChrome) {
        constants.BROWSER = 'chrome';
    } else if (isIE) {
        constants.BROWSER = 'ie';
    }

    var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
    var isWindows = navigator.platform.toUpperCase().indexOf('WIN')>=0;
    if (isMac) {
        constants.PLATFORM = 'mac';
    } else if (isWindows) {
        constants.PLATFORM = 'win';
    }
*/

}
