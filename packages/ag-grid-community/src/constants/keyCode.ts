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
