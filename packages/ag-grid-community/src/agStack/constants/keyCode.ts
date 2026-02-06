export const KeyCode = {
    BACKSPACE: 'Backspace',
    TAB: 'Tab',
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    SPACE: ' ',
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
    DELETE: 'Delete',

    F2: 'F2',

    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
    PAGE_HOME: 'Home',
    PAGE_END: 'End',

    // these should be used with `event.code` instead of `event.key`
    // as `event.key` changes when non-latin keyboards are used
    A: 'KeyA',
    C: 'KeyC',
    D: 'KeyD',
    V: 'KeyV',
    X: 'KeyX',
    Y: 'KeyY',
    Z: 'KeyZ',
} as const;

const A_KEYCODE = 65;
const C_KEYCODE = 67;
const V_KEYCODE = 86;
const D_KEYCODE = 68;
const Z_KEYCODE = 90;
const Y_KEYCODE = 89;

export function _normaliseQwertyAzerty(keyboardEvent: KeyboardEvent): string {
    const { keyCode } = keyboardEvent;
    let code: string;

    switch (keyCode) {
        case A_KEYCODE:
            code = KeyCode.A;
            break;
        case C_KEYCODE:
            code = KeyCode.C;
            break;
        case V_KEYCODE:
            code = KeyCode.V;
            break;
        case D_KEYCODE:
            code = KeyCode.D;
            break;
        case Z_KEYCODE:
            code = KeyCode.Z;
            break;
        case Y_KEYCODE:
            code = KeyCode.Y;
            break;
        default:
            code = keyboardEvent.code;
    }

    return code;
}
