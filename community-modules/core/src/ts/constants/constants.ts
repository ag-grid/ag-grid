export class Constants {

    static ROW_BUFFER_SIZE = 10;
    static LAYOUT_INTERVAL = 500;
    static BATCH_WAIT_MILLIS = 50;

    static EXPORT_TYPE_DRAG_COPY = 'dragCopy';
    static EXPORT_TYPE_CLIPBOARD = 'clipboard';
    static EXPORT_TYPE_EXCEL = 'excel';
    static EXPORT_TYPE_CSV = 'csv';

    static ROW_MODEL_TYPE_INFINITE = 'infinite';
    static ROW_MODEL_TYPE_VIEWPORT = 'viewport';
    static ROW_MODEL_TYPE_CLIENT_SIDE = 'clientSide';
    static ROW_MODEL_TYPE_SERVER_SIDE = 'serverSide';

    static ALWAYS = 'always';
    static ONLY_WHEN_GROUPING = 'onlyWhenGrouping';

    static PINNED_TOP = 'top';
    static PINNED_BOTTOM = 'bottom';

    static DOM_LAYOUT_NORMAL = 'normal';
    static DOM_LAYOUT_PRINT = 'print';
    static DOM_LAYOUT_AUTO_HEIGHT = 'autoHeight';

    static GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';

    static SOURCE_PASTE = 'paste';

    static PINNED_RIGHT: 'right' = 'right';
    static PINNED_LEFT: 'left' = 'left';

    static SORT_ASC: 'asc' = 'asc';
    static SORT_DESC: 'desc' = 'desc';

    static INPUT_SELECTOR = 'input, select, button, textarea';
    static FOCUSABLE_SELECTOR = '[tabindex], input, select, button, textarea';
    static FOCUSABLE_EXCLUDE = '.ag-hidden, .ag-hidden *, [disabled], .ag-disabled, .ag-disabled *';
}
