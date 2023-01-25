export class KeyCode {
    static BACKSPACE = 'Backspace';
    static TAB = 'Tab';
    static ENTER = 'Enter';
    static ESCAPE = 'Escape';
    static SPACE = ' ';
    static LEFT = 'ArrowLeft';
    static UP = 'ArrowUp';
    static RIGHT = 'ArrowRight';
    static DOWN = 'ArrowDown';
    static DELETE = 'Delete';

    static F2 = 'F2';

    static PAGE_UP = 'PageUp';
    static PAGE_DOWN = 'PageDown';
    static PAGE_HOME = 'Home';
    static PAGE_END = 'End';

    // these should be used with `event.code` instead of `event.key`
    // as `event.key` changes when non-latin keyboards are used
    static A = 'KeyA';
    static C = 'KeyC';
    static D = 'KeyD';
    static V = 'KeyV';
    static X = 'KeyX';
    static Y = 'KeyY';
    static Z = 'KeyZ';

}
