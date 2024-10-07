export const KeyCode = Object.freeze({
    BACKSPACE: 'Backspace' as const,
    TAB: 'Tab' as const,
    ENTER: 'Enter' as const,
    ESCAPE: 'Escape' as const,
    SPACE: ' ' as const,
    LEFT: 'ArrowLeft' as const,
    UP: 'ArrowUp' as const,
    RIGHT: 'ArrowRight' as const,
    DOWN: 'ArrowDown' as const,
    DELETE: 'Delete' as const,

    F2: 'F2' as const,

    PAGE_UP: 'PageUp' as const,
    PAGE_DOWN: 'PageDown' as const,
    PAGE_HOME: 'Home' as const,
    PAGE_END: 'End' as const,

    // these should be used with `event.code` instead of `event.key`
    // as `event.key` changes when non-latin keyboards are used
    A: 'KeyA' as const,
    C: 'KeyC' as const,
    D: 'KeyD' as const,
    V: 'KeyV' as const,
    X: 'KeyX' as const,
    Y: 'KeyY' as const,
    Z: 'KeyZ' as const,
});
