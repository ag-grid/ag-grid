import { onFileEnd } from '../fileScope';

let installed = false;
const revealed: Element[] = [];

/**
 * Makes `focus()` without `preventScroll` and `scrollIntoView()` reveal an element as a browser would: the grid
 * viewport scrolls a left-anchored centre cell's inline `left` into view (nearest edge), and the element is recorded
 * ({@link getRevealedElements}). Returns the uninstall.
 */
export function installFocusScroll(): () => void {
    if (installed) {
        throw new Error('focus scroll already installed: the first uninstall would undo both');
    }
    installed = true;
    const proto = HTMLElement.prototype;
    const focus = proto.focus;
    const ownFocus = Object.getOwnPropertyDescriptor(proto, 'focus');
    const ownScrollIntoView = Object.getOwnPropertyDescriptor(proto, 'scrollIntoView');
    proto.focus = function (this: HTMLElement, options?: FocusOptions) {
        const wasFocused = document.activeElement === this;
        focus.call(this, options);
        if (!options?.preventScroll && !wasFocused && document.activeElement === this) {
            reveal(this);
        }
    };
    proto.scrollIntoView = function (this: HTMLElement) {
        reveal(this);
    };
    let uninstalled = false;
    const uninstall = () => {
        if (uninstalled) {
            return;
        }
        uninstalled = true;
        restoreOwnProperty(proto, 'focus', ownFocus);
        restoreOwnProperty(proto, 'scrollIntoView', ownScrollIntoView);
        revealed.length = 0;
        installed = false;
    };
    onFileEnd(uninstall);
    return uninstall;
}

/** The elements a browser would have scrolled into view on the page since {@link installFocusScroll}, oldest first. */
export function getRevealedElements(): readonly Element[] {
    return revealed;
}

function reveal(element: HTMLElement): void {
    revealed.push(element);
    const viewport = element.closest<HTMLElement>('.ag-grid-viewport');
    const left = parseFloat(element.style.left);
    if (!viewport || isNaN(left)) {
        return;
    }
    const right = left + (parseFloat(element.style.width) || 0);
    const scrollLeft = viewport.scrollLeft;
    // the mocked layout sizes rects, not client widths
    const width = viewport.getBoundingClientRect().width;
    if (left < scrollLeft) {
        viewport.scrollLeft = left;
    } else if (right > scrollLeft + width) {
        viewport.scrollLeft = right - width;
    }
}

/** Puts back the own property found before the patch, or removes the patch so the inherited one shows again. */
function restoreOwnProperty(target: object, key: string, descriptor: PropertyDescriptor | undefined): void {
    if (descriptor) {
        Object.defineProperty(target, key, descriptor);
    } else {
        Reflect.deleteProperty(target, key);
    }
}
