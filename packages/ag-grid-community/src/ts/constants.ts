export class Constants {

    static STEP_EVERYTHING = 0;
    static STEP_FILTER = 1;
    static STEP_SORT = 2;
    static STEP_MAP = 3;
    static STEP_AGGREGATE = 4;
    static STEP_PIVOT = 5;

    static ROW_BUFFER_SIZE = 10;
    static LAYOUT_INTERVAL = 500;
    static BATCH_WAIT_MILLIS = 50;

    static EXPORT_TYPE_DRAG_COPY:string = 'dragCopy';
    static EXPORT_TYPE_CLIPBOARD:string = 'clipboard';
    static EXPORT_TYPE_EXCEL:string = 'excel';
    static EXPORT_TYPE_CSV:string = 'csv';

    static KEY_BACKSPACE = 8;
    static KEY_TAB = 9;
    static KEY_NEW_LINE = 10;
    static KEY_ENTER = 13;
    static KEY_SHIFT = 16;
    static KEY_ESCAPE = 27;
    static KEY_SPACE = 32;
    static KEY_LEFT = 37;
    static KEY_UP = 38;
    static KEY_RIGHT = 39;
    static KEY_DOWN = 40;
    static KEY_DELETE = 46;
    static KEY_A = 65;
    static KEY_C = 67;
    static KEY_V = 86;
    static KEY_D = 68;

    static KEY_F2 = 113;

    static KEY_PAGE_UP = 33;
    static KEY_PAGE_DOWN = 34;
    static KEY_PAGE_HOME = 36;
    static KEY_PAGE_END = 35;

    static ROW_MODEL_TYPE_INFINITE = 'infinite';
    static ROW_MODEL_TYPE_VIEWPORT = 'viewport';
    static ROW_MODEL_TYPE_CLIENT_SIDE = 'clientSide';
    static ROW_MODEL_TYPE_SERVER_SIDE = 'serverSide';

    static DEPRECATED_ROW_MODEL_TYPE_NORMAL = 'normal';

    static ALWAYS = 'always';
    static ONLY_WHEN_GROUPING = 'onlyWhenGrouping';

    static PINNED_TOP = 'top';
    static PINNED_BOTTOM = 'bottom';

    static DOM_LAYOUT_NORMAL = 'normal';
    static DOM_LAYOUT_PRINT = 'print';
    static DOM_LAYOUT_AUTO_HEIGHT = 'autoHeight';

    static GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
}
