export class KeyCode {
    static BACKSPACE: 'Backspace' = 'Backspace';
    static TAB: 'Tab' = 'Tab';
    static ENTER: 'Enter' = 'Enter';
    static ESCAPE: 'Escape' = 'Escape';
    static SPACE: ' ' = ' ';
    static LEFT: 'ArrowLeft' = 'ArrowLeft';
    static UP: 'ArrowUp' = 'ArrowUp';
    static RIGHT: 'ArrowRight' = 'ArrowRight';
    static DOWN: 'ArrowDown' = 'ArrowDown';
    static DELETE: 'Delete' = 'Delete';

    static F2: 'F2' = 'F2';

    static PAGE_UP: 'PageUp' = 'PageUp';
    static PAGE_DOWN: 'PageDown' = 'PageDown';
    static PAGE_HOME: 'Home' = 'Home';
    static PAGE_END: 'End' = 'End';

    // these should be used with `event.code` instead of `event.key`
    // as `event.key` changes when non-latin keyboards are used
    static A: 'KeyA' = 'KeyA';
    static C: 'KeyC' = 'KeyC';
    static D: 'KeyD' = 'KeyD';
    static V: 'KeyV' = 'KeyV';
    static X: 'KeyX' = 'KeyX';
    static Y: 'KeyY' = 'KeyY';
    static Z: 'KeyZ' = 'KeyZ';

}
