export class KeyCode {
    static BACKSPACE = 'Backspace' as const;
    static TAB = 'Tab' as const;
    static ENTER = 'Enter' as const;
    static ESCAPE = 'Escape' as const;
    static SPACE = ' ' as const;
    static LEFT = 'ArrowLeft' as const;
    static UP = 'ArrowUp' as const;
    static RIGHT = 'ArrowRight' as const;
    static DOWN = 'ArrowDown' as const;
    static DELETE = 'Delete' as const;

    static F2 = 'F2' as const;

    static PAGE_UP = 'PageUp' as const;
    static PAGE_DOWN = 'PageDown' as const;
    static PAGE_HOME = 'Home' as const;
    static PAGE_END = 'End' as const;

    // these should be used with `event.code` instead of `event.key`
    // as `event.key` changes when non-latin keyboards are used
    static A = 'KeyA' as const;
    static C = 'KeyC' as const;
    static D = 'KeyD' as const;
    static V = 'KeyV' as const;
    static X = 'KeyX' as const;
    static Y = 'KeyY' as const;
    static Z = 'KeyZ' as const;

}
