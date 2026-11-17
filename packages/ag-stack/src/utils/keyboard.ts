import { KeyCode } from '../constants/keyCode';
import type { AgBean } from '../interfaces/agBean';
import { _addManagedElementListeners } from './event';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isEventFromPrintableCharacter(event: KeyboardEvent): boolean {
    // no allowed printable chars have alt or ctrl key combinations
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return false;
    }

    // if key is length 1, eg if it is 'a' for the a key, or '2' for the '2' key.
    // non-printable characters have names, eg 'Enter' or 'Backspace'.
    const printableCharacter = event.key?.length === 1;

    return printableCharacter;
}

/**
 * Defers an action triggered by the Space key from `keydown` to `keyup`, as native buttons and checkboxes do,
 * so that holding Space acts once, on release, rather than repeating.
 *
 * Keydown handlers keep deciding whether Space should act, so every existing way of suppressing it
 * (`preventDefault`, `stopPropagation`, user suppression callbacks) still applies; they `arm` the action
 * instead of running it. The action runs only when Space is released on the element it was pressed on,
 * so a keyup arriving after focus has moved (e.g. an editor committing on Space) does nothing.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class _SpaceKeyAction {
    private pending: { target: EventTarget | null; action: () => void } | null = null;

    /**
     * Call from a Space `keydown` handler in place of acting. Always prevents the default, which stops the page
     * scrolling and any native control toggling as well; held-key repeats only do that.
     */
    public arm(keydown: KeyboardEvent, action: () => void): void {
        keydown.preventDefault();
        if (!keydown.repeat) {
            this.pending = { target: keydown.target, action };
        }
    }

    public onKeyUp(keyup: KeyboardEvent): void {
        // other keys released while Space is held, such as Shift, leave the action armed
        if (keyup.key !== KeyCode.SPACE) {
            return;
        }
        const { pending } = this;
        this.pending = null;
        if (pending?.target === keyup.target) {
            keyup.preventDefault();
            pending.action();
        }
    }

    public disarm(): void {
        this.pending = null;
    }
}

/**
 * Creates a `_SpaceKeyAction` released by `keyup` on `element`, and disarmed when focus leaves it or moves within it.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _addSpaceKeyAction(
    bean: Pick<AgBean<unknown, unknown, unknown, string>, 'addManagedListeners'>,
    element: Element
): _SpaceKeyAction {
    const spaceKeyAction = new _SpaceKeyAction();
    _addManagedElementListeners(bean, element, {
        keyup: (e: KeyboardEvent) => spaceKeyAction.onKeyUp(e),
        focusout: () => spaceKeyAction.disarm(),
    });
    return spaceKeyAction;
}
