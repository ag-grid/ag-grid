export class Constants {

    static STEP_EVERYTHING = 0;
    static STEP_FILTER = 1;
    static STEP_SORT = 2;
    static STEP_MAP = 3;
    static STEP_AGGREGATE = 4;
    static STEP_PIVOT = 5;

    static ROW_BUFFER_SIZE = 10;
    static LAYOUT_INTERVAL = 500;

    static KEY_BACKSPACE = 8;
    static KEY_TAB = 9;
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

    static KEY_PAGE_UP_NAME = 'pageUp';
    static KEY_PAGE_DOWN_NAME = 'pageDown';
    static KEY_PAGE_HOME_NAME = 'home';
    static KEY_PAGE_END_NAME = 'end';
    static KEY_CTRL_UP_NAME = 'ctrlUp';
    static KEY_CTRL_LEFT_NAME = 'ctrlLeft';
    static KEY_CTRL_RIGHT_NAME = 'ctrlRight';
    static KEY_CTRL_DOWN_NAME = 'ctrlDown';

    static ROW_MODEL_TYPE_PAGINATION = 'pagination';
    static ROW_MODEL_TYPE_VIRTUAL = 'virtual';
    static ROW_MODEL_TYPE_VIEWPORT = 'viewport';
    static ROW_MODEL_TYPE_NORMAL = 'normal';

    static ALWAYS = 'always';
    static ONLY_WHEN_GROUPING = 'onlyWhenGrouping';

    static FLOATING_TOP = 'top';
    static FLOATING_BOTTOM = 'bottom';
    
    static VERTICAL_SCROLL_KEYS_ID = 'verticalScrollKeys';
    static HORIZONTAL_SCROLL_KEYS_ID = 'horizontalScrollKeys';
    static DIAGONAL_SCROLL_KEYS_ID = 'diagonalScrollKeys';

    static VERTICAL_SCROLL_KEYS: KeyboardBindingGroup = {
        id: Constants.VERTICAL_SCROLL_KEYS_ID,
        bindings: [{
            id: Constants.KEY_PAGE_UP_NAME,
            ctlRequired: false,
            altRequired: false,
            keyCode: Constants.KEY_PAGE_UP
        },{
            id: Constants.KEY_PAGE_DOWN_NAME,
            ctlRequired: false,
            altRequired: false,
            keyCode: Constants.KEY_PAGE_DOWN
        },{
            id: Constants.KEY_CTRL_UP_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_UP
        },{
            id: Constants.KEY_CTRL_DOWN_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_DOWN
        }]
    };

    static HORIZONTAL_SCROLL_KEYS: KeyboardBindingGroup = {
        id: Constants.HORIZONTAL_SCROLL_KEYS_ID,
        bindings: [{
            id: Constants.KEY_CTRL_LEFT_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_LEFT
        },{
            id: Constants.KEY_CTRL_RIGHT_NAME,
            ctlRequired: true,
            altRequired: false,
            keyCode: Constants.KEY_RIGHT
        }]
    };

    static DIAGONAL_SCROLL_KEYS: KeyboardBindingGroup = {
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
    }
}


export interface KeyboardBinding {
    id:string;
    ctlRequired:boolean;
    altRequired:boolean;
    keyCode:number;
}

export interface KeyboardBindingGroup {
    id:string;
    bindings:KeyboardBinding[]
}


