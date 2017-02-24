// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class Constants {
    static STEP_EVERYTHING: number;
    static STEP_FILTER: number;
    static STEP_SORT: number;
    static STEP_MAP: number;
    static STEP_AGGREGATE: number;
    static STEP_PIVOT: number;
    static ROW_BUFFER_SIZE: number;
    static LAYOUT_INTERVAL: number;
    static KEY_BACKSPACE: number;
    static KEY_TAB: number;
    static KEY_ENTER: number;
    static KEY_SHIFT: number;
    static KEY_ESCAPE: number;
    static KEY_SPACE: number;
    static KEY_LEFT: number;
    static KEY_UP: number;
    static KEY_RIGHT: number;
    static KEY_DOWN: number;
    static KEY_DELETE: number;
    static KEY_A: number;
    static KEY_C: number;
    static KEY_V: number;
    static KEY_D: number;
    static KEY_F2: number;
    static KEY_PAGE_UP: number;
    static KEY_PAGE_DOWN: number;
    static KEY_PAGE_HOME: number;
    static KEY_PAGE_END: number;
    static KEY_PAGE_UP_NAME: string;
    static KEY_PAGE_DOWN_NAME: string;
    static KEY_PAGE_HOME_NAME: string;
    static KEY_PAGE_END_NAME: string;
    static KEY_CTRL_UP_NAME: string;
    static KEY_CTRL_LEFT_NAME: string;
    static KEY_CTRL_RIGHT_NAME: string;
    static KEY_CTRL_DOWN_NAME: string;
    static ROW_MODEL_TYPE_PAGINATION: string;
    static ROW_MODEL_TYPE_VIRTUAL: string;
    static ROW_MODEL_TYPE_VIEWPORT: string;
    static ROW_MODEL_TYPE_NORMAL: string;
    static ALWAYS: string;
    static ONLY_WHEN_GROUPING: string;
    static FLOATING_TOP: string;
    static FLOATING_BOTTOM: string;
    static VERTICAL_SCROLL_KEYS_ID: string;
    static HORIZONTAL_SCROLL_KEYS_ID: string;
    static DIAGONAL_SCROLL_KEYS_ID: string;
    static VERTICAL_SCROLL_KEYS: KeyboardBindingGroup;
    static HORIZONTAL_SCROLL_KEYS: KeyboardBindingGroup;
    static DIAGONAL_SCROLL_KEYS: KeyboardBindingGroup;
}
export interface KeyboardBinding {
    id: string;
    ctlRequired: boolean;
    altRequired: boolean;
    keyCode: number;
}
export interface KeyboardBindingGroup {
    id: string;
    bindings: KeyboardBinding[];
}
