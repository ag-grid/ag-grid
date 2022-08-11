import { RowModelType } from "../interfaces/iRowModel";
import { ColumnPinnedType } from "../entities/column";

export class Constants {

    static ROW_BUFFER_SIZE = 10;
    static LAYOUT_INTERVAL = 500;
    static BATCH_WAIT_MILLIS = 50;

    static EXPORT_TYPE_DRAG_COPY: 'dragCopy' = 'dragCopy';
    static EXPORT_TYPE_CLIPBOARD: 'clipboard' = 'clipboard';
    static EXPORT_TYPE_EXCEL: 'excel' = 'excel';
    static EXPORT_TYPE_CSV: 'csv' = 'csv';

    static ROW_MODEL_TYPE_INFINITE: RowModelType = 'infinite';
    static ROW_MODEL_TYPE_VIEWPORT: RowModelType = 'viewport';
    static ROW_MODEL_TYPE_CLIENT_SIDE: RowModelType = 'clientSide';
    static ROW_MODEL_TYPE_SERVER_SIDE: RowModelType = 'serverSide';

    static ALWAYS: 'always' = 'always';
    static ONLY_WHEN_GROUPING: 'onlyWhenGrouping' = 'onlyWhenGrouping';

    static PINNED_TOP: 'top' = 'top';
    static PINNED_BOTTOM: 'bottom' = 'bottom';

    static DOM_LAYOUT_NORMAL: 'normal' = 'normal';
    static DOM_LAYOUT_PRINT: 'print' = 'print';
    static DOM_LAYOUT_AUTO_HEIGHT: 'autoHeight' = 'autoHeight';

    static GROUP_AUTO_COLUMN_ID: 'ag-Grid-AutoColumn' = 'ag-Grid-AutoColumn';

    static SOURCE_PASTE: 'paste' = 'paste';

    static PINNED_RIGHT: ColumnPinnedType = 'right';
    static PINNED_LEFT: ColumnPinnedType = 'left';

    static SORT_ASC: 'asc' = 'asc';
    static SORT_DESC: 'desc' = 'desc';

    static INPUT_SELECTOR = 'input, select, button, textarea';
    static FOCUSABLE_SELECTOR = '[tabindex], input, select, button, textarea';
    static FOCUSABLE_EXCLUDE = '.ag-hidden, .ag-hidden *, [disabled], .ag-disabled, .ag-disabled *';
}
